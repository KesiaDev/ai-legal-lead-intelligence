/**
 * Serviço de Integração com WhatsApp via Z-API
 * 
 * Este serviço gerencia toda comunicação com WhatsApp via Z-API:
 * - Recebe mensagens via webhook
 * - Processa mensagens (texto, áudio, imagem)
 * - Envia mensagens via Z-API
 * - Gerencia conversas com agentes IA
 */

import axios from 'axios';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getOrCreateTenantByClienteId } from '../utils/tenant';
import { AgentService } from './agent.service';
import { ElevenLabsService } from './elevenlabs.service';
import { IntegrationConfigService } from './integrationConfig.service';

export interface ZApiMessage {
  from: string; // Número do remetente
  message: string; // Mensagem de texto
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  timestamp?: string;
  mediaUrl?: string; // URL da mídia (se áudio/imagem)
}

export interface ZApiWebhookData {
  phone: string; // Número do remetente (formato: 5511999999999)
  messageId?: string;
  message?: string; // Mensagem de texto
  type?: 'text' | 'audio' | 'image' | 'video' | 'document';
  mediaUrl?: string;
  timestamp?: number;
  instanceId?: string;
  instanceName?: string;
}

export class ZApiService {
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
   * Verifica se Z-API está configurada para um tenant específico
   * Se tenantId não for fornecido, verifica env vars globais
   */
  async isConfigured(tenantId?: string): Promise<boolean> {
    return await this.integrationConfigService.isConfigured('zapi', tenantId);
  }

  /**
   * Processa webhook do Z-API
   */
  async handleWebhook(webhookData: ZApiWebhookData, clienteId?: string): Promise<void> {
    try {
      this.fastify.log.info({ webhookData }, 'Z-API webhook received');

      // Validar dados obrigatórios
      if (!webhookData.phone || !webhookData.message) {
        this.fastify.log.debug('Webhook sem phone ou message, ignorando');
        return;
      }

      // Normalizar número de telefone
      const from = this.normalizePhone(webhookData.phone);
      const messageText = webhookData.message || '';
      const timestamp = webhookData.timestamp 
        ? new Date(webhookData.timestamp * 1000).toISOString()
        : new Date().toISOString();

      // Processar mensagem
      const message: ZApiMessage = {
        from,
        message: messageText,
        type: webhookData.type || 'text',
        timestamp,
        mediaUrl: webhookData.mediaUrl,
      };

      // Processar mensagem com agente IA
      await this.processMessage(message, clienteId);
    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar webhook Z-API');
      throw error;
    }
  }

  /**
   * Normaliza número de telefone
   */
  private normalizePhone(phone: string): string {
    // Remove caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (Brasil), adiciona
    if (!digits.startsWith('55')) {
      return `55${digits}`;
    }
    
    return digits;
  }

  /**
   * Processa mensagem recebida
   */
  private async processMessage(message: ZApiMessage, clienteId?: string): Promise<void> {
    try {
      // Identificar tenant
      let tenantId: string | undefined;
      
      if (clienteId && typeof clienteId === 'string') {
        tenantId = await getOrCreateTenantByClienteId(clienteId);
        this.fastify.log.info({ clienteId, tenantId }, 'Tenant identificado para Z-API');
      }

      if (!tenantId) {
        // Tentar identificar pelo número de telefone
        const existingLead = await this.prisma.lead.findFirst({
          where: { phone: message.from },
          include: { tenant: true },
        });

        if (existingLead) {
          tenantId = existingLead.tenantId;
        } else {
          // Se não encontrar lead, criar um tenant padrão ou usar o primeiro tenant disponível
          // Para SaaS multi-tenant, precisamos de uma forma de identificar o tenant
          // Por enquanto, vamos criar um tenant temporário ou usar um padrão
          // TODO: Implementar lógica para identificar tenant baseado em configuração
          this.fastify.log.warn({ phone: message.from }, 'Lead não encontrado, tentando criar com tenant padrão');
          
          // Buscar primeiro tenant disponível (para desenvolvimento/teste)
          // Em produção, isso deve ser configurado via webhook ou header
          const firstTenant = await this.prisma.tenant.findFirst();
          if (firstTenant) {
            tenantId = firstTenant.id;
            this.fastify.log.info({ tenantId, phone: message.from }, 'Usando tenant padrão para novo lead');
          } else {
            this.fastify.log.error({ phone: message.from }, 'Nenhum tenant encontrado. Não é possível criar lead.');
            return;
          }
        }
      }

      // Criar ou atualizar lead
      const lead = await this.createOrUpdateLead(message, tenantId);

      // Criar ou obter conversa
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          leadId: lead.id,
          channel: 'whatsapp',
        },
      });

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            leadId: lead.id,
            tenantId,
            channel: 'whatsapp',
            status: 'active',
            assignedType: 'ai',
          },
        });
      }

      // Salvar mensagem recebida
      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          content: message.message,
          senderType: 'lead',
        },
      });

      // Processar com agente IA
      const agentResponse = await this.agentService.processConversation({
        lead_id: lead.id,
        message: message.message,
        conversation_data: undefined,
        clienteId: tenantId,
      });

      // Enviar resposta
      if (agentResponse && agentResponse.response) {
        // Verificar se deve enviar áudio
        const shouldUseAudio = await this.shouldUseAudio(tenantId, message.type, message.message);
        
        if (shouldUseAudio) {
          await this.sendAudioMessage(message.from, agentResponse.response, tenantId!);
        } else {
          await this.sendMessage(message.from, agentResponse.response, tenantId);
        }
      }
    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar mensagem Z-API');
      throw error;
    }
  }

  /**
   * Cria ou atualiza lead
   */
  private async createOrUpdateLead(message: ZApiMessage, tenantId: string) {
    const existingLead = await this.prisma.lead.findFirst({
      where: {
        phone: message.from,
        tenantId,
      },
    });

    if (existingLead) {
      // Atualizar lead existente
      return await this.prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          updatedAt: new Date(),
        },
      });
    }

    // Criar novo lead
    return await this.prisma.lead.create({
      data: {
        tenantId,
        name: message.from, // Nome será atualizado quando o agente coletar
        phone: message.from,
        status: 'novo',
        source: 'whatsapp',
      },
    });
  }

  /**
   * Envia mensagem via Z-API
   * Busca configurações do banco (por tenant) ou env vars como fallback
   */
  async sendMessage(to: string, message: string, tenantId?: string): Promise<void> {
    try {
      // Buscar configurações do Z-API (banco primeiro, depois env vars)
      const config = await this.integrationConfigService.getConfig(tenantId);
      
      if (!config.zapiInstanceId || !config.zapiToken) {
        this.fastify.log.warn({ tenantId, source: config.source }, 'Z-API não configurada. Mensagem não enviada.');
        throw new Error('Z-API não configurada');
      }

      this.fastify.log.info({ tenantId, source: config.details.zapiInstanceId }, 'Usando Z-API para enviar mensagem');

      // Normalizar número
      const normalizedTo = this.normalizePhone(to);

      // URL da API Z-API
      const url = `${config.zapiBaseUrl}/instances/${config.zapiInstanceId}/token/${config.zapiToken}/send-text`;

      // Enviar mensagem
      const response = await axios.post(
        url,
        {
          phone: normalizedTo,
          message: message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.fastify.log.info({ to: normalizedTo, response: response.data, tenantId, source: config.details.zapiInstanceId }, 'Mensagem enviada via Z-API');

      // Verificar se deve enviar áudio (se configurado)
      if (tenantId) {
        const voiceConfig = await this.prisma.voiceConfig.findUnique({
          where: { tenantId },
        });

        if (voiceConfig && voiceConfig.enabled && voiceConfig.elevenlabsApiKey) {
          // Verificar se deve responder em áudio
          const shouldUseAudio = this.elevenlabsService.shouldRespondWithAudio(
            {
              enabled: voiceConfig.enabled,
              audioResponseProbabilityOnText: voiceConfig.audioResponseProbabilityOnText,
              audioResponseProbabilityOnAudio: voiceConfig.audioResponseProbabilityOnAudio,
              audioResponseProbabilityOnMedia: voiceConfig.audioResponseProbabilityOnMedia,
            } as any,
            'text',
            message
          );

          if (shouldUseAudio) {
            await this.sendAudioMessage(normalizedTo, message, tenantId);
            return; // Não enviar texto se enviar áudio
          }
        }
      }
    } catch (error: any) {
      this.fastify.log.error({ error, to, tenantId }, 'Erro ao enviar mensagem via Z-API');
      throw error;
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
   * Envia mensagem de áudio via Z-API
   */
  private async sendAudioMessage(
    to: string,
    text: string,
    tenantId: string
  ): Promise<void> {
    try {
      // Buscar configurações do Z-API (banco primeiro, depois env vars)
      const config = await this.integrationConfigService.getConfig(tenantId);
      
      if (!config.zapiInstanceId || !config.zapiToken) {
        this.fastify.log.warn({ tenantId, source: config.source }, 'Z-API não configurada. Mensagem de áudio não enviada.');
        await this.sendMessage(to, text, tenantId);
        return;
      }

      this.fastify.log.info({ tenantId, source: config.details.zapiInstanceId }, 'Usando Z-API para enviar áudio');

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
        this.fastify.log.warn('Falha ao gerar áudio, enviando texto');
        await this.sendMessage(to, text, tenantId);
        return;
      }

      // Converter buffer para base64
      const audioBase64 = audioResult.audioBuffer.toString('base64');

      // Enviar áudio via Z-API
      const url = `${config.zapiBaseUrl}/instances/${config.zapiInstanceId}/token/${config.zapiToken}/send-audio-base64`;

      await axios.post(
        url,
        {
          phone: to,
          audio: audioBase64,
          fileName: 'audio.mp3',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      this.fastify.log.info({ to, tenantId }, 'Áudio enviado via Z-API');
    } catch (error: any) {
      this.fastify.log.error({ error, tenantId }, 'Erro ao enviar áudio via Z-API');
      // Fallback: enviar como texto
      await this.sendMessage(to, text, tenantId);
    }
  }
}
