/**
 * Evolution API Service — WhatsApp via Evolution API (open-source)
 *
 * Suporta:
 *  - Texto e Extended Text
 *  - Áudio (transcrição via OpenAI Whisper)
 *  - Imagem (descrição via GPT-4o Vision / Claude Vision)
 *  - Documento (extração de legenda)
 *
 * Configuração por tenant via UserIntegration (provider: 'evolution').
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AgentService } from './agent.service';
import { ElevenLabsService } from './elevenlabs.service';
import { WhisperService } from './whisper.service';
import { VisionService } from './vision.service';

export interface EvolutionWebhookData {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: { text: string };
      audioMessage?: { url?: string; mimetype?: string };
      imageMessage?: { url?: string; caption?: string; mimetype?: string };
      documentMessage?: { url?: string; caption?: string; fileName?: string };
      videoMessage?: { url?: string; caption?: string };
    };
    messageType?: string;
    pushName?: string;
    status?: string;
  };
}

interface EvolutionConfig {
  serverUrl: string;
  apiKey: string;
  instanceName: string;
}

interface TenantAiKeys {
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
}

export class EvolutionService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private agentService: AgentService;
  private elevenlabsService: ElevenLabsService;
  private whisperService: WhisperService;
  private visionService: VisionService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.agentService = new AgentService(fastify);
    this.elevenlabsService = new ElevenLabsService(fastify);
    this.whisperService = new WhisperService(fastify);
    this.visionService = new VisionService(fastify);
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

      const serverUrl = process.env.EVOLUTION_API_URL;
      const apiKey = process.env.EVOLUTION_API_KEY;
      const instanceName = process.env.EVOLUTION_INSTANCE || 'sdr-juridico';

      if (serverUrl && apiKey) return { serverUrl: serverUrl.replace(/\/$/, ''), apiKey, instanceName };

      return null;
    } catch {
      return null;
    }
  }

  private async getAiKeys(tenantId: string): Promise<TenantAiKeys> {
    try {
      const prisma = this.prisma as any;
      const config = await prisma.integrationConfig.findUnique({
        where: { tenantId },
        select: { openaiApiKey: true, anthropicApiKey: true },
      });
      return {
        openaiApiKey: config?.openaiApiKey || process.env.OPENAI_API_KEY || null,
        anthropicApiKey: config?.anthropicApiKey || process.env.ANTHROPIC_API_KEY || null,
      };
    } catch {
      return {
        openaiApiKey: process.env.OPENAI_API_KEY || null,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
      };
    }
  }

  // ─── Webhook Handler ──────────────────────────────────────────────────────

  async handleWebhook(payload: EvolutionWebhookData, tenantId: string): Promise<void> {
    if (payload.event !== 'messages.upsert') return;
    if (payload.data?.key?.fromMe) return;
    if (!payload.data?.key?.remoteJid) return;

    const jid = payload.data.key.remoteJid;
    if (jid.endsWith('@g.us')) return; // Ignorar grupos

    const phone = this.normalizePhone(jid.replace('@s.whatsapp.net', ''));
    const messageType = payload.data.messageType || 'conversation';

    this.fastify.log.info({ phone, messageType, tenantId }, 'Evolution webhook recebido');

    let text = '';
    let mediaUrl: string | undefined;
    let isAudioInput = false;

    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      text = payload.data.message?.conversation
        || payload.data.message?.extendedTextMessage?.text
        || '';
    } else if (messageType === 'audioMessage') {
      isAudioInput = true;
      mediaUrl = payload.data.message?.audioMessage?.url;
      text = await this.handleAudio(mediaUrl, tenantId) || '[áudio não transcrito]';
    } else if (messageType === 'imageMessage') {
      mediaUrl = payload.data.message?.imageMessage?.url;
      const caption = payload.data.message?.imageMessage?.caption;
      text = await this.handleImage(mediaUrl, caption, tenantId);
    } else if (messageType === 'documentMessage') {
      const caption = payload.data.message?.documentMessage?.caption;
      const fileName = payload.data.message?.documentMessage?.fileName;
      text = caption || `[Documento: ${fileName || 'arquivo'}]`;
    } else if (messageType === 'videoMessage') {
      text = payload.data.message?.videoMessage?.caption || '[vídeo]';
    }

    if (!text) return;

    await this.processMessage(
      { phone, text, type: messageType, mediaUrl, pushName: payload.data.pushName, isAudio: isAudioInput },
      tenantId,
    );
  }

  // ─── Audio Handler ────────────────────────────────────────────────────────

  private async handleAudio(audioUrl: string | undefined, tenantId: string): Promise<string | null> {
    if (!audioUrl) return null;

    const config = await this.getConfig(tenantId);
    const aiKeys = await this.getAiKeys(tenantId);

    if (!config || !aiKeys.openaiApiKey) {
      this.fastify.log.warn({ tenantId }, 'Sem config de Evolution ou OpenAI para transcrição');
      return null;
    }

    const transcribed = await this.whisperService.transcribeFromUrl(
      audioUrl,
      config.apiKey,
      aiKeys.openaiApiKey,
    );

    if (transcribed) {
      this.fastify.log.info({ phone: 'audio', tenantId }, `Áudio transcrito: "${transcribed.substring(0, 60)}..."`);
    }

    return transcribed;
  }

  // ─── Image Handler ────────────────────────────────────────────────────────

  private async handleImage(
    imageUrl: string | undefined,
    caption: string | undefined,
    tenantId: string,
  ): Promise<string> {
    if (!imageUrl) return caption || '[imagem]';

    const config = await this.getConfig(tenantId);
    const aiKeys = await this.getAiKeys(tenantId);

    if (!config || (!aiKeys.openaiApiKey && !aiKeys.anthropicApiKey)) {
      return caption ? `[Imagem: ${caption}]` : '[imagem]';
    }

    const description = await this.visionService.describeImageFromUrl(
      imageUrl,
      config.apiKey,
      aiKeys.openaiApiKey || undefined,
      aiKeys.anthropicApiKey || undefined,
    );

    if (description) {
      return caption
        ? `[Imagem — ${caption}]\n\nDescrição: ${description}`
        : `[Imagem]\n\nDescrição: ${description}`;
    }

    return caption ? `[Imagem: ${caption}]` : '[imagem]';
  }

  // ─── Process Message ──────────────────────────────────────────────────────

  private async processMessage(
    msg: { phone: string; text: string; type: string; mediaUrl?: string; pushName?: string; isAudio?: boolean },
    tenantId: string,
  ): Promise<void> {
    const prisma = this.prisma as any;

    // Upsert lead
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

    // Upsert conversa ativa
    let conversation = await this.prisma.conversation.findFirst({
      where: { leadId: lead.id, channel: 'whatsapp', status: 'active' },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { leadId: lead.id, tenantId, channel: 'whatsapp', status: 'active', assignedType: 'ai' },
      });
    }

    // Se a conversa está em modo humano, não processa com IA
    if (conversation.assignedType === 'human') {
      await this.prisma.message.create({
        data: { conversationId: conversation.id, content: msg.text, senderType: 'lead' },
      });
      this.fastify.log.info({ phone: msg.phone }, 'Conversa em modo humano — mensagem salva sem resposta IA');
      return;
    }

    // Salvar mensagem do lead
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

    // Salvar resposta da IA
    await this.prisma.message.create({
      data: { conversationId: conversation.id, content: agentResponse.response, senderType: 'ai' },
    });

    // Atualizar timestamp da conversa
    await this.prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

    // Enviar resposta (áudio ou texto)
    const shouldAudio = await this.shouldSendAudio(tenantId, !!msg.isAudio, msg.text);

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
    const cleanText = this.cleanForWhatsApp(text);
    const url = `${config.serverUrl}/message/sendText/${config.instanceName}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.apiKey },
      body: JSON.stringify({ number: phone, text: cleanText }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Evolution sendText error ${res.status}: ${err}`);
      }
      this.fastify.log.info({ to: phone, tenantId }, 'Texto enviado via Evolution API');
    });
  }

  // ─── Send Image ───────────────────────────────────────────────────────────

  async sendImage(to: string, imageUrl: string, caption: string, tenantId: string): Promise<void> {
    const config = await this.getConfig(tenantId);
    if (!config) return;

    const phone = this.normalizePhone(to);
    const url = `${config.serverUrl}/message/sendMedia/${config.instanceName}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.apiKey },
      body: JSON.stringify({
        number: phone,
        mediatype: 'image',
        media: imageUrl,
        caption: this.cleanForWhatsApp(caption),
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Evolution sendImage error ${res.status}`);
      this.fastify.log.info({ to: phone, tenantId }, 'Imagem enviada via Evolution API');
    });
  }

  // ─── Send Audio ───────────────────────────────────────────────────────────

  async sendAudio(to: string, text: string, tenantId: string): Promise<void> {
    try {
      const prisma = this.prisma as any;
      const voiceConfig = await prisma.voiceConfig?.findUnique?.({ where: { tenantId } }).catch(() => null);

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

  private cleanForWhatsApp(text: string): string {
    return text
      .replace(/ — /g, ', ')
      .replace(/— /g, ', ')
      .replace(/ —/g, ',')
      .replace(/—/g, ',');
  }

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
