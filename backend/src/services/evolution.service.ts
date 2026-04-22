/**
 * Evolution API Service — WhatsApp via Evolution API (open-source)
 *
 * Compatível com Evolution API v2 e Evolution Go (self-hosted).
 * Configuração por tenant via UserIntegration (provider: 'evolution').
 *
 * Endpoints Evolution API:
 *  POST {serverUrl}/message/sendText/{instanceName}    → texto
 *  POST {serverUrl}/message/sendMedia/{instanceName}   → áudio/mídia
 *  Webhook: Evolution envia POST para /api/whatsapp/evolution/webhook
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AgentService } from './agent.service';
import { ElevenLabsService } from './elevenlabs.service';

export interface EvolutionWebhookData {
  event: string;           // 'messages.upsert' | 'connection.update' | etc.
  instance: string;        // nome da instância
  data: {
    key: {
      remoteJid: string;   // '5511999999999@s.whatsapp.net'
      fromMe: boolean;
      id: string;
    };
    message?: {
      conversation?: string;       // texto simples
      extendedTextMessage?: { text: string };
      audioMessage?: { url?: string; mimetype?: string };
      imageMessage?: { caption?: string };
      documentMessage?: { caption?: string };
    };
    messageType?: string;  // 'conversation' | 'audioMessage' | 'imageMessage'
    pushName?: string;     // nome do contato
    status?: string;       // 'DELIVERY_ACK' etc.
  };
}

interface EvolutionConfig {
  serverUrl: string;
  apiKey: string;
  instanceName: string;
}

export class EvolutionService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private agentService: AgentService;
  private elevenlabsService: ElevenLabsService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.agentService = new AgentService(fastify);
    this.elevenlabsService = new ElevenLabsService(fastify);
  }

  // ─── Config ──────────────────────────────────────────────────────────────

  private async getConfig(tenantId: string): Promise<EvolutionConfig | null> {
    try {
      const prisma = this.prisma as any;
      const integration = await prisma.userIntegration.findFirst({
        where: { tenantId, provider: 'evolution', isActive: true },
      });

      if (integration?.config) {
        const c = integration.config as any;
        if (c.serverUrl && c.apiKey && c.instanceName) {
          return { serverUrl: c.serverUrl.replace(/\/$/, ''), apiKey: c.apiKey, instanceName: c.instanceName };
        }
      }

      // Fallback para env vars
      const serverUrl = process.env.EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY;
      const instanceName = process.env.EVOLUTION_INSTANCE || 'sdr-juridico';

      if (serverUrl && apiKey) return { serverUrl: serverUrl.replace(/\/$/, ''), apiKey, instanceName };

      return null;
    } catch {
      return null;
    }
  }

  // ─── Webhook Handler ──────────────────────────────────────────────────────

  async handleWebhook(payload: EvolutionWebhookData, tenantId: string): Promise<void> {
    // Ignorar eventos que não são mensagens recebidas
    if (payload.event !== 'messages.upsert') return;
    if (payload.data?.key?.fromMe) return;         // ignorar mensagens enviadas por nós
    if (!payload.data?.key?.remoteJid) return;

    const jid = payload.data.key.remoteJid;
    // Ignorar grupos (JID de grupo termina com @g.us)
    if (jid.endsWith('@g.us')) return;

    const phone = this.normalizePhone(jid.replace('@s.whatsapp.net', ''));
    const messageType = payload.data.messageType || 'conversation';

    let text = '';
    let mediaUrl: string | undefined;

    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      text = payload.data.message?.conversation
        || payload.data.message?.extendedTextMessage?.text
        || '';
    } else if (messageType === 'audioMessage') {
      text = '[áudio]';
      mediaUrl = payload.data.message?.audioMessage?.url;
    } else if (messageType === 'imageMessage') {
      text = payload.data.message?.imageMessage?.caption || '[imagem]';
    }

    if (!text) return;

    this.fastify.log.info({ phone, text, tenantId, event: payload.event }, 'Evolution webhook recebido');

    await this.processMessage({ phone, text, type: messageType, mediaUrl, pushName: payload.data.pushName }, tenantId);
  }

  // ─── Process Message ──────────────────────────────────────────────────────

  private async processMessage(
    msg: { phone: string; text: string; type: string; mediaUrl?: string; pushName?: string },
    tenantId: string,
  ): Promise<void> {
    // Upsert lead
    const prisma = this.prisma as any;
    let lead = await this.prisma.lead.findFirst({ where: { phone: msg.phone, tenantId } });

    if (!lead) {
      lead = await this.prisma.lead.create({
        data: {
          tenantId,
          name: msg.pushName || msg.phone,
          phone: msg.phone,
          status: 'novo',
        },
      });
    }

    // Upsert conversa
    let conversation = await this.prisma.conversation.findFirst({
      where: { leadId: lead.id, channel: 'whatsapp', status: 'active' },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { leadId: lead.id, tenantId, channel: 'whatsapp', status: 'active', assignedType: 'ai' },
      });
    }

    // Salvar mensagem
    await this.prisma.message.create({
      data: { conversationId: conversation.id, content: msg.text, senderType: 'lead' },
    });

    // Processar com agente IA
    const agentResponse = await this.agentService.processConversation({
      lead_id: lead.id,
      message: msg.text,
      conversation_data: undefined,
      clienteId: tenantId,
    });

    if (!agentResponse?.response) return;

    // Verificar voz
    const isAudioInput = msg.type === 'audioMessage';
    const shouldAudio = await this.shouldSendAudio(tenantId, isAudioInput, msg.text);

    if (shouldAudio) {
      await this.sendAudio(msg.phone, agentResponse.response, tenantId);
    } else {
      await this.sendText(msg.phone, agentResponse.response, tenantId);
    }
  }

  // ─── Send Text ────────────────────────────────────────────────────────────

  async sendText(to: string, text: string, tenantId: string): Promise<void> {
    const config = await this.getConfig(tenantId);

    if (!config) {
      this.fastify.log.warn({ tenantId }, 'Evolution API não configurada — mensagem não enviada');
      return;
    }

    const phone = this.normalizePhone(to);
    const url = `${config.serverUrl}/message/sendText/${config.instanceName}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.apiKey },
      body: JSON.stringify({ number: phone, text }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Evolution sendText error ${res.status}: ${err}`);
      }
      this.fastify.log.info({ to: phone, tenantId }, 'Texto enviado via Evolution API');
    });
  }

  // ─── Send Audio ───────────────────────────────────────────────────────────

  async sendAudio(to: string, text: string, tenantId: string): Promise<void> {
    try {
      const prisma = this.prisma as any;
      const voiceConfig = await prisma.voiceConfig?.findUnique?.({ where: { tenantId } })
        .catch(() => null);

      if (!voiceConfig?.enabled || !voiceConfig?.elevenlabsApiKey) {
        return this.sendText(to, text, tenantId);
      }

      const estimatedSecs = Math.ceil(text.split(/\s+/).length / 2.5);
      if (estimatedSecs > (voiceConfig.maxAudioDuration || 60)) {
        return this.sendText(to, text, tenantId);
      }

      const audioResult = await this.elevenlabsService.generateVoice(
        voiceConfig.elevenlabsApiKey,
        {
          text,
          voiceId: voiceConfig.voiceId,
          settings: {
            stability: voiceConfig.voiceStability,
            similarityBoost: voiceConfig.voiceSimilarityBoost,
            style: voiceConfig.voiceStyle,
            speed: voiceConfig.voiceSpeed,
          },
        },
      );

      if (!audioResult.success || !audioResult.audioBuffer) {
        return this.sendText(to, text, tenantId);
      }

      const config = await this.getConfig(tenantId);
      if (!config) return this.sendText(to, text, tenantId);

      const phone = this.normalizePhone(to);
      const audioBase64 = audioResult.audioBuffer.toString('base64');
      const url = `${config.serverUrl}/message/sendMedia/${config.instanceName}`;

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: config.apiKey },
        body: JSON.stringify({
          number: phone,
          mediatype: 'audio',
          mimetype: 'audio/mpeg',
          media: audioBase64,
          fileName: 'audio.mp3',
          caption: '',
        }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`Evolution sendMedia error ${res.status}`);
        this.fastify.log.info({ to: phone, tenantId }, 'Áudio enviado via Evolution API');
      });
    } catch (err: any) {
      this.fastify.log.error({ err, tenantId }, 'Erro ao enviar áudio, fallback texto');
      await this.sendText(to, text, tenantId);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('55') ? digits : `55${digits}`;
  }

  private async shouldSendAudio(tenantId: string, isAudioInput: boolean, text: string): Promise<boolean> {
    try {
      const prisma = this.prisma as any;
      const vc = await prisma.voiceConfig?.findUnique?.({ where: { tenantId } }).catch(() => null);
      if (!vc?.enabled || !vc?.elevenlabsApiKey) return false;

      return this.elevenlabsService.shouldRespondWithAudio(
        {
          enabled: vc.enabled,
          audioResponseProbabilityOnText: vc.audioResponseProbabilityOnText,
          audioResponseProbabilityOnAudio: vc.audioResponseProbabilityOnAudio,
          audioResponseProbabilityOnMedia: vc.audioResponseProbabilityOnMedia,
          textOnlyKeywords: (vc.textOnlyKeywords as string[]) || [],
        },
        isAudioInput ? 'audio' : 'text',
        text,
      );
    } catch {
      return false;
    }
  }
}
