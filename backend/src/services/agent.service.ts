/**
 * Serviço de Agente IA
 * 
 * Este serviço gerencia conversas com agentes IA usando os prompts da plataforma.
 * Integra com OpenAI para gerar respostas seguindo as regras e prompts configurados.
 */

import OpenAI from 'openai';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { PromptService } from './prompt.service';

interface ConversationRequest {
  lead_id: string;
  message: string;
  conversation_data?: any;
  clienteId?: string;
}

interface AgentResponse {
  response: string;
  currentStep: string;
  nextAction: string;
  metadata: {
    urgencyDetected?: string;
    legalAreaSuggested?: string;
    requiresHumanReview?: boolean;
  };
  conversationData: any;
}

export class AgentService {
  private openai: OpenAI | null;
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private promptService: PromptService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.promptService = new PromptService(fastify);

    // Inicializar OpenAI se API key estiver configurada
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.fastify.log.info('OpenAI configurado para agente IA');
    } else {
      this.openai = null;
      this.fastify.log.warn('OpenAI não configurado. Agente IA usará fallback.');
    }
  }

  /**
   * Processa conversa com agente IA
   */
  async processConversation(request: ConversationRequest): Promise<AgentResponse> {
    try {
      // Recuperar histórico de conversa do banco
      const conversationHistory = await this.getConversationHistory(request.lead_id);

      // Verificar se OpenAI está disponível (env ou banco)
      const apiKey = await this.getOpenAIApiKey(request.lead_id, request.clienteId);
      const hasOpenAI = !!apiKey;

      // Se OpenAI estiver configurado, usar IA
      if (hasOpenAI) {
        return await this.processWithOpenAI(request, conversationHistory);
      } else {
        // Fallback para lógica básica
        this.fastify.log.debug('OpenAI não disponível, usando fallback');
        return await this.processWithFallback(request, conversationHistory);
      }
    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar conversa com agente');
      // Em caso de erro, tenta fallback
      try {
        const conversationHistory = await this.getConversationHistory(request.lead_id);
        return await this.processWithFallback(request, conversationHistory);
      } catch (fallbackError) {
        throw error; // Se fallback também falhar, lança erro original
      }
    }
  }

  /**
   * Obtém API key da OpenAI (variável de ambiente ou banco por tenant)
   */
  private async getOpenAIApiKey(leadId?: string, clienteId?: string): Promise<string | null> {
    // Primeiro, tenta variável de ambiente (global)
    if (process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }

    // Tentar obter tenantId do lead ou clienteId
    let tenantId: string | undefined = clienteId;

    // Se não tiver tenantId mas tiver leadId, buscar do lead
    if (!tenantId && leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({
          where: { id: leadId },
          select: { tenantId: true },
        });
        if (lead) {
          tenantId = lead.tenantId;
        }
      } catch (error) {
        this.fastify.log.warn({ error, leadId }, 'Erro ao buscar tenantId do lead');
      }
    }

    // Se tiver tenantId, busca no banco
    if (tenantId) {
      try {
        const config = await this.prisma.integrationConfig.findUnique({
          where: { tenantId },
          select: { openaiApiKey: true },
        });

        if (config?.openaiApiKey) {
          this.fastify.log.info({ tenantId }, 'OpenAI API key encontrada no banco');
          return config.openaiApiKey;
        }
      } catch (error) {
        this.fastify.log.warn({ error, tenantId }, 'Erro ao buscar OpenAI API key do banco');
      }
    }

    return null;
  }

  /**
   * Processa conversa usando OpenAI
   */
  private async processWithOpenAI(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>
  ): Promise<AgentResponse> {
    // Buscar API key (env ou banco)
    const apiKey = await this.getOpenAIApiKey(request.lead_id, request.clienteId);
    
    if (!apiKey) {
      this.fastify.log.warn('OpenAI API key não encontrada, usando fallback');
      return await this.processWithFallback(request, history);
    }

    // Criar cliente OpenAI com a chave encontrada
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Obter prompt do serviço de prompts (tenta banco, depois padrão)
    const promptConfig = await this.promptService.getPrompt('orquestrador', request.clienteId);
    
    if (!promptConfig || !promptConfig.content) {
      throw new Error('Prompt não encontrado');
    }
    
    const systemPrompt = promptConfig.content;
    const model = promptConfig?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const temperature = promptConfig?.temperature ?? 0.4;
    const maxTokens = promptConfig?.maxTokens ?? 500;

    // Construir contexto da conversa
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Adicionar histórico
    for (const msg of history.slice(-10)) { // Últimas 10 mensagens
      messages.push({
        role: msg.role === 'user' ? 'user' : msg.role === 'bot' ? 'assistant' : 'system',
        content: msg.content,
      });
    }

    // Adicionar mensagem atual
    messages.push({
      role: 'user',
      content: request.message,
    });

    // Chamar OpenAI com configurações do prompt
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }

    // Parsear resposta JSON
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      this.fastify.log.warn('Resposta não é JSON válido, usando fallback');
      return await this.processWithFallback(request, history);
    }

    // Salvar mensagens no banco
    await this.saveMessage(request.lead_id, request.message, 'lead');
    await this.saveMessage(request.lead_id, parsed.response, 'bot');

    // Atualizar estado da conversa
    const conversationData = {
      ...request.conversation_data,
      currentStep: parsed.currentStep,
      nextAction: parsed.nextAction,
      metadata: parsed.metadata,
    };

    return {
      response: parsed.response,
      currentStep: parsed.currentStep,
      nextAction: parsed.nextAction,
      metadata: parsed.metadata || {},
      conversationData,
    };
  }

  /**
   * Processa conversa usando fallback (lógica básica)
   */
  private async processWithFallback(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>
  ): Promise<AgentResponse> {
    const conversationData = request.conversation_data || {
      currentStep: 'greeting',
      collectedData: {},
    };

    let response = '';
    let nextStep = conversationData.currentStep;
    const msgLower = request.message.toLowerCase();

    // Lógica básica de fluxo
    switch (conversationData.currentStep) {
      case 'greeting':
        response = 'Olá! Sou o Super SDR Advogados, seu assistente virtual de pré-atendimento jurídico. Estou aqui para ajudá-lo(a) a entender sua demanda e conectá-lo(a) com o advogado mais adequado.\n\nAntes de prosseguirmos, informamos que seus dados serão utilizados exclusivamente para contato e encaminhamento ao advogado responsável, em conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\nVocê concorda em prosseguir com o atendimento?';
        nextStep = 'consent';
        break;

      case 'consent':
        if (msgLower.includes('sim') || msgLower.includes('concordo') || msgLower.includes('aceito')) {
          response = 'Perfeito! Obrigado por seu consentimento. Para que eu possa ajudá-lo(a) da melhor forma, qual é o seu nome completo?';
          nextStep = 'demand';
          conversationData.collectedData.lgpdConsent = true;
        } else {
          response = 'Compreendemos. Sem o consentimento, não podemos prosseguir com o atendimento. Agradecemos o contato.';
          nextStep = 'rejected';
        }
        break;

      case 'demand':
        conversationData.collectedData.name = request.message;
        response = `Olá, ${request.message}! Agora, por favor, me conte qual é a sua demanda jurídica? Descreva brevemente o problema que você está enfrentando.`;
        nextStep = 'qualification';
        break;

      case 'qualification':
        conversationData.collectedData.demand = request.message;
        response = 'Entendi sua demanda. Para que possamos direcioná-lo(a) ao advogado mais adequado, você gostaria de agendar uma consulta?';
        nextStep = 'scheduling';
        break;

      case 'scheduling':
        if (msgLower.includes('sim') || msgLower.includes('agendar')) {
          response = 'Perfeito! Nossa equipe entrará em contato em breve para agendar sua consulta. Obrigado pelo contato!';
          nextStep = 'farewell';
        } else {
          response = 'Sem problemas. Se precisar de mais informações ou quiser agendar uma consulta, estarei à disposição.';
          nextStep = 'farewell';
        }
        break;

      default:
        response = 'Como posso ajudá-lo(a) hoje?';
        nextStep = 'greeting';
    }

    // Salvar mensagens no banco
    await this.saveMessage(request.lead_id, request.message, 'lead');
    await this.saveMessage(request.lead_id, response, 'bot');

    return {
      response,
      currentStep: nextStep,
      nextAction: 'continue',
      metadata: {},
      conversationData: {
        ...conversationData,
        currentStep: nextStep,
      },
    };
  }

  /**
   * Recupera histórico de conversa do banco
   */
  private async getConversationHistory(leadId: string): Promise<Array<{ role: string; content: string }>> {
    // Buscar conversa do lead
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        leadId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 20, // Últimas 20 mensagens
        },
      },
    });

    if (!conversation) {
      return [];
    }

    return conversation.messages.map((msg) => ({
      role: msg.senderType === 'lead' ? 'user' : msg.senderType === 'ai' ? 'assistant' : 'system',
      content: msg.content,
    }));
  }

  /**
   * Salva mensagem no banco
   */
  private async saveMessage(leadId: string, content: string, senderType: 'lead' | 'bot' | 'system'): Promise<void> {
    // Buscar ou criar conversa
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        leadId,
      },
    });

    if (!conversation) {
      // Buscar lead para obter tenantId
      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        this.fastify.log.warn({ leadId }, 'Lead não encontrado ao salvar mensagem');
        return;
      }

      // Criar conversa
      conversation = await this.prisma.conversation.create({
        data: {
          tenantId: lead.tenantId,
          leadId,
          channel: 'whatsapp',
          assignedType: 'ai',
          status: 'active',
        },
      });
    }

    // Salvar mensagem
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        content,
        senderType: senderType === 'bot' ? 'ai' : senderType,
      },
    });
  }
}
