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
import { getOrCreateTenantByClienteId } from '../utils/tenant';
import { AgentService } from './agent.service';

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
  private evolutionApiUrl: string;
  private evolutionApiKey: string;
  private evolutionInstance: string;
  private agentService: AgentService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
    this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
    this.evolutionInstance = process.env.EVOLUTION_INSTANCE || '';
    this.agentService = new AgentService(fastify);

    // Validar configuração
    if (!this.evolutionApiUrl || !this.evolutionApiKey || !this.evolutionInstance) {
      fastify.log.warn('Evolution API não configurada. WhatsApp service desabilitado.');
    }
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
        await this.sendMessage(message.from, agentResponse.response);
      }

    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar mensagem');
      // Enviar mensagem de erro genérica
      await this.sendMessage(
        message.from,
        'Desculpe, ocorreu um erro ao processar sua mensagem. Nossa equipe foi notificada e entrará em contato em breve.'
      );
    }
  }

  /**
   * Cria ou atualiza lead no banco
   */
  private async createOrUpdateLead(
    message: WhatsAppMessage,
    tenantId?: string
  ): Promise<string> {
    const { prisma } = this.fastify;

    // Buscar lead existente pelo telefone
    const existingLead = await prisma.lead.findFirst({
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
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          updatedAt: new Date(),
        },
      });

      // Criar mensagem no histórico
      await prisma.message.create({
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
      const newLead = await prisma.lead.create({
        data: {
          name: message.from, // Nome temporário
          phone: message.from,
          email: null,
          origin: 'whatsapp',
          status: 'novo',
          tenantId: tenantId || null,
        },
      });

      // Criar mensagem inicial
      await prisma.message.create({
        data: {
          leadId: newLead.id,
          content: message.message,
          senderType: 'lead',
          channel: 'whatsapp',
        },
      });

      return newLead.id;
    }
  }

  /**
   * Envia mensagem via Evolution API
   */
  async sendMessage(to: string, message: string): Promise<void> {
    if (!this.evolutionApiUrl || !this.evolutionApiKey || !this.evolutionInstance) {
      this.fastify.log.warn('Evolution API não configurada. Mensagem não enviada.');
      return;
    }

    try {
      // URL encode do nome da instância (pode ter espaços)
      const instanceEncoded = encodeURIComponent(this.evolutionInstance);

      const url = `${this.evolutionApiUrl}/message/sendText/${instanceEncoded}`;

      this.fastify.log.info({ to, url }, 'Enviando mensagem via Evolution API');

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
            apikey: this.evolutionApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 segundos
        }
      );

      this.fastify.log.info({ response: response.data }, 'Mensagem enviada com sucesso');

      // Salvar mensagem no banco
      // TODO: Associar com lead correto

    } catch (error: any) {
      this.fastify.log.error(
        {
          error: error.message,
          response: error.response?.data,
          url,
        },
        'Erro ao enviar mensagem via Evolution API'
      );
      throw error;
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(
      this.evolutionApiUrl &&
      this.evolutionApiKey &&
      this.evolutionInstance
    );
  }
}
