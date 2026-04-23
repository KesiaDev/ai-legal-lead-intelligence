/**
 * Serviço de Agente IA — Super SDR Jurídico
 *
 * Suporta:
 *  - Anthropic Claude (claude-sonnet-4-6 / claude-opus-4-7) — PRIORITÁRIO
 *  - OpenAI GPT-4o / gpt-4o-mini — FALLBACK
 *
 * Fluxo:
 *  1. Busca histórico de conversa do banco (últimas 30 mensagens)
 *  2. Busca chave API (Anthropic > OpenAI) e prompt do tenant
 *  3. Chama IA com histórico + mensagem atual
 *  4. Retorna resposta estruturada
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
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
    sendImage?: { url: string; caption: string } | null;
  };
  conversationData: any;
}

interface ApiKeys {
  anthropicApiKey: string | null;
  openaiApiKey: string | null;
  preferredProvider: 'anthropic' | 'openai' | null;
}

export class AgentService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private promptService: PromptService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.promptService = new PromptService(fastify);
  }

  async processConversation(request: ConversationRequest): Promise<AgentResponse> {
    try {
      const history = await this.getConversationHistory(request.lead_id);
      const keys = await this.getApiKeys(request.lead_id, request.clienteId);

      if (keys.preferredProvider === 'anthropic' && keys.anthropicApiKey) {
        return await this.processWithAnthropic(request, history, keys.anthropicApiKey);
      }

      if (keys.openaiApiKey) {
        return await this.processWithOpenAI(request, history, keys.openaiApiKey);
      }

      this.fastify.log.warn({ leadId: request.lead_id }, 'Nenhuma API key configurada, usando fallback');
      return await this.processWithFallback(request, history);
    } catch (error: any) {
      this.fastify.log.error({ error: error.message }, 'Erro no agente IA, usando fallback');
      try {
        const history = await this.getConversationHistory(request.lead_id);
        return await this.processWithFallback(request, history);
      } catch {
        throw error;
      }
    }
  }

  // ─── API Keys ─────────────────────────────────────────────────────────────

  private async getApiKeys(leadId?: string, clienteId?: string): Promise<ApiKeys> {
    let tenantId: string | undefined = clienteId;

    if (!tenantId && leadId) {
      try {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { tenantId: true } });
        if (lead) tenantId = lead.tenantId;
      } catch {}
    }

    let anthropicApiKey: string | null = null;
    let openaiApiKey: string | null = null;

    if (tenantId) {
      try {
        const config = await (this.prisma as any).integrationConfig.findUnique({
          where: { tenantId },
          select: { anthropicApiKey: true, openaiApiKey: true },
        });

        if (config?.anthropicApiKey?.trim()) anthropicApiKey = config.anthropicApiKey;
        if (config?.openaiApiKey?.trim()) openaiApiKey = config.openaiApiKey;
      } catch (err: any) {
        this.fastify.log.warn({ err: err.message, tenantId }, 'Erro ao buscar API keys do banco');
      }
    }

    // Fallback para env vars
    if (!anthropicApiKey && process.env.ANTHROPIC_API_KEY) anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!openaiApiKey && process.env.OPENAI_API_KEY) openaiApiKey = process.env.OPENAI_API_KEY;

    const preferredProvider = anthropicApiKey ? 'anthropic' : openaiApiKey ? 'openai' : null;

    return { anthropicApiKey, openaiApiKey, preferredProvider };
  }

  // ─── Anthropic Claude ────────────────────────────────────────────────────

  private async processWithAnthropic(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>,
    apiKey: string,
  ): Promise<AgentResponse> {
    const promptConfig = await this.promptService.getPrompt('orquestrador', request.clienteId);
    const systemPrompt = promptConfig?.content || this.defaultSystemPrompt();
    const model = (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6') as string;

    const anthropic = new Anthropic({ apiKey });

    // Montar histórico para Anthropic (alternado user/assistant)
    const messages: Anthropic.MessageParam[] = this.buildAnthropicMessages(history, request.message);

    const response = await anthropic.messages.create({
      model,
      max_tokens: 600,
      system: systemPrompt,
      messages,
    });

    const rawText = (response.content[0] as Anthropic.TextBlock).text;
    const parsed = this.parseAIResponse(rawText);

    this.fastify.log.info({ model, provider: 'anthropic' }, 'Resposta gerada pelo agente IA');

    return {
      response: parsed.response,
      currentStep: parsed.currentStep || 'qualifying',
      nextAction: parsed.nextAction || 'continue',
      metadata: parsed.metadata || {},
      conversationData: { ...request.conversation_data, currentStep: parsed.currentStep },
    };
  }

  private buildAnthropicMessages(
    history: Array<{ role: string; content: string }>,
    currentMessage: string,
  ): Anthropic.MessageParam[] {
    const msgs: Anthropic.MessageParam[] = [];

    for (const msg of history.slice(-30)) {
      const role: 'user' | 'assistant' = msg.role === 'user' ? 'user' : 'assistant';

      // Anthropic exige alternância user/assistant — merge se consecutivos
      if (msgs.length > 0 && msgs[msgs.length - 1].role === role) {
        const last = msgs[msgs.length - 1];
        last.content = `${last.content}\n${msg.content}`;
      } else {
        msgs.push({ role, content: msg.content });
      }
    }

    // Garantir que termina com user (a mensagem atual)
    if (msgs.length > 0 && msgs[msgs.length - 1].role === 'user') {
      msgs[msgs.length - 1].content += `\n${currentMessage}`;
    } else {
      msgs.push({ role: 'user', content: currentMessage });
    }

    return msgs;
  }

  // ─── OpenAI ──────────────────────────────────────────────────────────────

  private async processWithOpenAI(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>,
    apiKey: string,
  ): Promise<AgentResponse> {
    const promptConfig = await this.promptService.getPrompt('orquestrador', request.clienteId);
    const systemPrompt = promptConfig?.content || this.defaultSystemPrompt();
    const model = promptConfig?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const temperature = promptConfig?.temperature ?? 0.4;
    const maxTokens = promptConfig?.maxTokens ?? 600;

    const openai = new OpenAI({ apiKey });

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-30).map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: request.message },
    ];

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    });

    const rawText = completion.choices[0].message.content || '';
    const parsed = this.parseAIResponse(rawText);

    this.fastify.log.info({ model, provider: 'openai' }, 'Resposta gerada pelo agente IA');

    return {
      response: parsed.response,
      currentStep: parsed.currentStep || 'qualifying',
      nextAction: parsed.nextAction || 'continue',
      metadata: parsed.metadata || {},
      conversationData: { ...request.conversation_data, currentStep: parsed.currentStep },
    };
  }

  // ─── Fallback ─────────────────────────────────────────────────────────────

  private async processWithFallback(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>,
  ): Promise<AgentResponse> {
    const conversationData = request.conversation_data || { currentStep: 'greeting', collectedData: {} };
    let response = '';
    let nextStep = conversationData.currentStep;
    const msgLower = request.message.toLowerCase();

    switch (conversationData.currentStep) {
      case 'greeting':
        response = 'Olá! Sou Sofia, assistente jurídica de pré-atendimento. Antes de continuar, seus dados serão usados apenas para encaminhamento ao advogado responsável, conforme a LGPD. Você concorda em prosseguir?';
        nextStep = 'consent';
        break;
      case 'consent':
        if (msgLower.includes('sim') || msgLower.includes('concordo') || msgLower.includes('aceito')) {
          response = 'Perfeito! Qual é o seu nome completo?';
          nextStep = 'demand';
          conversationData.collectedData.lgpdConsent = true;
        } else {
          response = 'Sem o consentimento não posso prosseguir. Agradecemos o contato.';
          nextStep = 'rejected';
        }
        break;
      case 'demand':
        conversationData.collectedData.name = request.message;
        response = `Olá, ${request.message}! Me conte brevemente qual é a sua demanda jurídica?`;
        nextStep = 'qualification';
        break;
      case 'qualification':
        conversationData.collectedData.demand = request.message;
        response = 'Entendido. Gostaria de agendar uma consulta com um dos nossos advogados?';
        nextStep = 'scheduling';
        break;
      case 'scheduling':
        response = msgLower.includes('sim') || msgLower.includes('agendar')
          ? 'Perfeito! Nossa equipe entrará em contato para confirmar o horário. Obrigado pela confiança!'
          : 'Sem problemas. Qualquer dúvida é só nos chamar aqui. Até mais!';
        nextStep = 'farewell';
        break;
      default:
        response = 'Como posso ajudar?';
        nextStep = 'greeting';
    }

    return {
      response,
      currentStep: nextStep,
      nextAction: 'continue',
      metadata: {},
      conversationData: { ...conversationData, currentStep: nextStep },
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private parseAIResponse(raw: string): any {
    try {
      // Tentar parsear como JSON (OpenAI com json_object)
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {
      // Anthropic retorna texto livre — montar estrutura
      return {
        response: raw.replace(/^```[\w]*\n?|```$/g, '').trim(),
        currentStep: 'qualifying',
        nextAction: 'continue',
        metadata: {},
      };
    }
  }

  private defaultSystemPrompt(): string {
    return `Você é Sofia, assistente jurídica de pré-atendimento de um escritório de advocacia. Seu objetivo é qualificar leads de forma empática e profissional.

REGRAS OBRIGATÓRIAS:
- Nunca prometa resultados jurídicos
- Nunca ofereça consultoria jurídica direta
- Colete: nome, área do direito, descrição do problema, urgência, disponibilidade
- Use linguagem simples e acolhedora
- Máximo 3 parágrafos por mensagem
- Não use travessões (—) nas mensagens

Responda SEMPRE em JSON:
{
  "response": "sua resposta para o lead",
  "currentStep": "greeting|consent|collecting_info|qualifying|scheduling|farewell",
  "nextAction": "continue|schedule|transfer_human|close",
  "metadata": {
    "legalAreaSuggested": "área detectada ou null",
    "urgencyDetected": "baixa|media|alta ou null",
    "requiresHumanReview": false
  }
}`;
  }

  private async getConversationHistory(leadId: string): Promise<Array<{ role: string; content: string }>> {
    try {
      const conversation = await this.prisma.conversation.findFirst({
        where: { leadId },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 30,
            where: { senderType: { in: ['lead', 'ai', 'sdr'] } },
          },
        },
      });

      if (!conversation) return [];

      return conversation.messages.map(msg => ({
        role: msg.senderType === 'lead' ? 'user' : 'assistant',
        content: msg.content,
      }));
    } catch (err: any) {
      this.fastify.log.warn({ err: err.message }, 'Erro ao buscar histórico');
      return [];
    }
  }
}
