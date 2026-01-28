/**
 * Serviço de Integração com WhatsApp via Evolution API
 * 
 * Este serviço gerencia toda comunicação com WhatsApp:
 * - Recebe mensagens via webhook
 * - Processa mensagens (texto, áudio, imagem)
 * - Envia mensagens via Evolution API
 * - Gerencia conversas com agentes IA
 */

import axios from 'axios';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getOrCreateTenantByClienteId } from '../utils/tenant';
import { AgentService } from './agent.service';
import { ElevenLabsService } from './elevenlabs.service';
import { IntegrationConfigService } from './integrationConfig.service';

export interface WhatsAppMessage {
  from: string; // Número do remetente
  message: string; // Mensagem de texto
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  timestamp?: string;
  mediaUrl?: string; // URL da mídia (se áudio/imagem)
}

export interface WhatsAppWebhookData {
  event: 'messages.upsert';
  instance: string;
  data: {
    key: {
      remoteJid: string; // Número do remetente
      fromMe: boolean;
    };
    message: {
      conversation?: string; // Mensagem de texto
      audioMessage?: {
        url: string;
        mimetype: string;
      };
      imageMessage?: {
        url: string;
        mimetype: string;
      };
      videoMessage?: {
        url: string;
        mimetype: string;
      };
      documentMessage?: {
        url: string;
        mimetype: string;
      };
    };
    messageTimestamp: number;
  };
}

export class WhatsAppService {
  private agentService: AgentService;
  private elevenlabsService: ElevenLabsService;
  private integrationConfigService: IntegrationConfigService;
  private fastify: FastifyInstance;
  private prisma: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.agentService = new AgentService(fastify);
    this.elevenlabsService = new ElevenLabsService(fastify);
    this.integrationConfigService = new IntegrationConfigService(fastify);
  }

  /**
   * Processa webhook do Evolution API
   */
  async handleWebhook(webhookData: WhatsAppWebhookData, clienteId?: string): Promise<void> {
    try {
      this.fastify.log.info({ webhookData }, 'WhatsApp webhook received');

      // Validar evento
      if (webhookData.event !== 'messages.upsert') {
        this.fastify.log.debug('Evento ignorado:', webhookData.event);
        return;
      }

      // Ignorar mensagens enviadas por nós
      if (webhookData.data.key.fromMe) {
        return;
      }

      // Extrair dados da mensagem
      const from = webhookData.data.key.remoteJid.replace('@s.whatsapp.net', '');
      const messageData = webhookData.data.message;
      const timestamp = new Date(webhookData.data.messageTimestamp * 1000).toISOString();

      // Processar mensagem baseado no tipo
      let message: WhatsAppMessage | null = null;

      if (messageData.conversation) {
        // Mensagem de texto
        message = {
          from,
          message: messageData.conversation,
          type: 'text',
          timestamp,
        };
      } else if (messageData.audioMessage) {
        // Mensagem de áudio - precisa transcrever
        message = {
          from,
          message: '[Áudio recebido - transcrevendo...]',
          type: 'audio',
          timestamp,
          mediaUrl: messageData.audioMessage.url,
        };
        // TODO: Integrar transcrição de áudio
      } else if (messageData.imageMessage) {
        // Mensagem de imagem
        message = {
          from,
          message: '[Imagem recebida]',
          type: 'image',
          timestamp,
          mediaUrl: messageData.imageMessage.url,
        };
      } else if (messageData.videoMessage) {
        // Mensagem de vídeo
        message = {
          from,
          message: '[Vídeo recebido]',
          type: 'video',
          timestamp,
          mediaUrl: messageData.videoMessage.url,
        };
      } else if (messageData.documentMessage) {
        // Mensagem de documento
        message = {
          from,
          message: '[Documento recebido]',
          type: 'document',
          timestamp,
          mediaUrl: messageData.documentMessage.url,
        };
      }

      if (!message) {
        this.fastify.log.warn('Tipo de mensagem não suportado:', messageData);
        return;
      }

      // Processar mensagem com agente IA
      await this.processMessage(message, clienteId);

    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar webhook WhatsApp');
      throw error;
    }
  }

  /**
   * Processa mensagem recebida e gera resposta com agente IA
   */
  async processMessage(message: WhatsAppMessage, clienteId?: string): Promise<void> {
    try {
      this.fastify.log.info({ message, clienteId }, 'Processando mensagem WhatsApp');

      // Obter tenantId
      let tenantId: string | undefined;
      if (clienteId && typeof clienteId === 'string') {
        tenantId = await getOrCreateTenantByClienteId(clienteId);
      }

      // Criar ou atualizar lead
      const leadId = await this.createOrUpdateLead(message, tenantId);

      // Processar com agente IA
      const agentResponse = await this.agentService.processConversation({
        lead_id: leadId,
        message: message.message,
        conversation_data: undefined, // Será recuperado do banco se existir
        clienteId: tenantId,
      });

      // Enviar resposta via WhatsApp
      if (agentResponse.response) {
        // Verificar se deve enviar resposta em áudio
        const shouldUseAudio = await this.shouldUseAudio(tenantId, message.type, message.message);
        
        if (shouldUseAudio && tenantId) {
          await this.sendAudioMessage(message.from, agentResponse.response, tenantId);
        } else {
          await this.sendMessage(message.from, agentResponse.response, tenantId);
        }
      }

    } catch (error: any) {
      this.fastify.log.error({ error, tenantId }, 'Erro ao processar mensagem');
      // Enviar mensagem de erro genérica (tentar enviar mesmo sem tenantId)
      try {
        await this.sendMessage(
          message.from,
          'Desculpe, ocorreu um erro ao processar sua mensagem. Nossa equipe foi notificada e entrará em contato em breve.',
          tenantId
        );
      } catch (sendError: any) {
        this.fastify.log.error({ error: sendError }, 'Erro ao enviar mensagem de erro');
      }
    }
  }

  /**
   * Cria ou atualiza lead no banco
   */
  private async createOrUpdateLead(
    message: WhatsAppMessage,
    tenantId?: string
  ): Promise<string> {

    // Buscar lead existente pelo telefone
    const existingLead = await this.prisma.lead.findFirst({
      where: {
        phone: message.from,
        ...(tenantId && { tenantId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (existingLead) {
      // Atualizar lead existente
      await this.prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          updatedAt: new Date(),
        },
      });

      // Criar mensagem no histórico
      await this.prisma.message.create({
        data: {
          leadId: existingLead.id,
          content: message.message,
          senderType: 'lead',
          channel: 'whatsapp',
        },
      });

      return existingLead.id;
    } else {
      // Criar novo lead
      const newLead = await this.prisma.lead.create({
        data: {
          name: message.from, // Nome temporário
          phone: message.from,
          email: null,
          origin: 'whatsapp',
          status: 'novo',
          tenantId: tenantId || null,
        },
      });

      // Criar conversa
      const conversation = await this.prisma.conversation.create({
        data: {
          tenantId: newLead.tenantId,
          leadId: newLead.id,
          channel: 'whatsapp',
          assignedType: 'ai',
          status: 'active',
        },
      });

      // Criar mensagem inicial
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: message.message,
          senderType: 'lead',
        },
      });

      return newLead.id;
    }
  }

  /**
   * Verifica se deve usar áudio baseado na configuração de voz
   */
  private async shouldUseAudio(
    tenantId: string | undefined,
    inputType: 'text' | 'audio' | 'image' | 'video' | 'document',
    messageText: string
  ): Promise<boolean> {
    if (!tenantId) return false;

    try {
      const voiceConfig = await this.prisma.voiceConfig.findUnique({
        where: { tenantId },
      });

      if (!voiceConfig || !voiceConfig.enabled || !voiceConfig.elevenlabsApiKey) {
        return false;
      }

      const mappedInputType: 'text' | 'audio' | 'media' = 
        inputType === 'audio' ? 'audio' : 
        (inputType === 'image' || inputType === 'video' || inputType === 'document') ? 'media' : 
        'text';

      return this.elevenlabsService.shouldRespondWithAudio(
        {
          enabled: voiceConfig.enabled,
          audioResponseProbabilityOnText: voiceConfig.audioResponseProbabilityOnText,
          audioResponseProbabilityOnAudio: voiceConfig.audioResponseProbabilityOnAudio,
          audioResponseProbabilityOnMedia: voiceConfig.audioResponseProbabilityOnMedia,
          textOnlyKeywords: (voiceConfig.textOnlyKeywords as string[]) || [],
        },
        mappedInputType,
        messageText
      );
    } catch (error: any) {
      this.fastify.log.error({ error, tenantId }, 'Erro ao verificar configuração de voz');
      return false;
    }
  }

  /**
   * Envia mensagem de áudio via Evolution API
   */
  async sendAudioMessage(
    to: string,
    text: string,
    tenantId: string
  ): Promise<void> {
    // Buscar configurações do Evolution API (banco primeiro, depois env vars)
    const config = await this.integrationConfigService.getConfig(tenantId);
    
    if (!config.evolutionApiUrl || !config.evolutionApiKey || !config.evolutionInstance) {
      this.fastify.log.warn({ tenantId, source: config.source }, 'Evolution API não configurada. Mensagem de áudio não enviada.');
      return;
    }

    this.fastify.log.info({ tenantId, source: config.details.evolutionApiUrl }, 'Usando Evolution API para enviar áudio');

    try {
      // Buscar configuração de voz
      const voiceConfig = await this.prisma.voiceConfig.findUnique({
        where: { tenantId },
      });

      if (!voiceConfig || !voiceConfig.enabled || !voiceConfig.elevenlabsApiKey) {
        this.fastify.log.warn({ tenantId }, 'Voz não configurada. Enviando texto.');
        await this.sendMessage(to, text, tenantId);
        return;
      }

      // Validar duração máxima
      const estimatedDuration = Math.ceil(text.split(/\s+/).length / 2.5);
      if (estimatedDuration > voiceConfig.maxAudioDuration) {
        this.fastify.log.warn(
          { estimatedDuration, maxDuration: voiceConfig.maxAudioDuration },
          'Texto muito longo para áudio. Enviando texto.'
        );
        await this.sendMessage(to, text, tenantId);
        return;
      }

      // Gerar áudio com ElevenLabs
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
        }
      );

      if (!audioResult.success || !audioResult.audioBuffer) {
        this.fastify.log.warn(
          { error: audioResult.error },
          'Erro ao gerar áudio. Enviando texto.'
        );
        await this.sendMessage(to, text, tenantId);
        return;
      }

      // Converter buffer para base64
      const audioBase64 = audioResult.audioBuffer.toString('base64');

      // Enviar áudio via Evolution API
      const instanceEncoded = encodeURIComponent(config.evolutionInstance!);
      const url = `${config.evolutionApiUrl}/message/sendMedia/${instanceEncoded}`;

      this.fastify.log.info({ to, tenantId, source: config.details.evolutionApiUrl }, 'Enviando mensagem de áudio via Evolution API');

      await axios.post(
        url,
        {
          number: to,
          mediatype: 'audio',
          media: audioBase64,
          fileName: 'audio.mp3',
          mimetype: 'audio/mpeg',
        },
        {
          headers: {
            apikey: config.evolutionApiKey!,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 segundos
        }
      );

      this.fastify.log.info({ to, tenantId }, 'Mensagem de áudio enviada com sucesso');

    } catch (error: any) {
      this.fastify.log.error(
        { error: error.message, response: error.response?.data, tenantId },
        'Erro ao enviar mensagem de áudio. Tentando enviar texto.'
      );
      
      // Fallback: enviar como texto
      try {
        await this.sendMessage(to, text, tenantId);
      } catch (textError: any) {
        this.fastify.log.error({ error: textError, tenantId }, 'Erro ao enviar mensagem de texto como fallback');
      }
    }
  }

  /**
   * Envia mensagem via Evolution API
   * Busca configurações do banco (por tenant) ou env vars como fallback
   */
  async sendMessage(to: string, message: string, tenantId?: string): Promise<void> {
    // Buscar configurações do Evolution API (banco primeiro, depois env vars)
    const config = await this.integrationConfigService.getConfig(tenantId);
    
    if (!config.evolutionApiUrl || !config.evolutionApiKey || !config.evolutionInstance) {
      this.fastify.log.warn({ tenantId, source: config.source }, 'Evolution API não configurada. Mensagem não enviada.');
      return;
    }

    this.fastify.log.info({ tenantId, source: config.details.evolutionApiUrl }, 'Usando Evolution API para enviar mensagem');

    try {
      // URL encode do nome da instância (pode ter espaços)
      const instanceEncoded = encodeURIComponent(config.evolutionInstance);

      const url = `${config.evolutionApiUrl}/message/sendText/${instanceEncoded}`;

      this.fastify.log.info({ to, url, tenantId, source: config.details.evolutionApiUrl }, 'Enviando mensagem via Evolution API');

      const response = await axios.post(
        url,
        {
          number: to,
          textMessage: {
            text: message,
          },
        },
        {
          headers: {
            apikey: config.evolutionApiKey!,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 segundos
        }
      );

      this.fastify.log.info({ response: response.data, tenantId }, 'Mensagem enviada com sucesso');

      // Salvar mensagem no banco
      // TODO: Associar com lead correto

    } catch (error: any) {
      this.fastify.log.error(
        {
          error: error.message,
          response: error.response?.data,
          tenantId,
          source: config.source,
        },
        'Erro ao enviar mensagem via Evolution API'
      );
      throw error;
    }
  }

  /**
   * Verifica se o serviço está configurado para um tenant específico
   * Se tenantId não for fornecido, verifica env vars globais
   */
  async isConfigured(tenantId?: string): Promise<boolean> {
    return await this.integrationConfigService.isConfigured('evolution', tenantId);
  }
}
