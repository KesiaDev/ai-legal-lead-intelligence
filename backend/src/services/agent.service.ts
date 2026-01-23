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

// Importar prompts da plataforma (será adaptado para backend)
const ORCHESTRATOR_PROMPT_DEFAULT = `Você é o Super SDR Advogados, o Assistente Virtual de Pré-Vendas de um escritório de advocacia.

## PAPEL
Você é um Super SDR (Sales Development Representative) jurídico especializado. Seu papel é:
- Recepcionar leads com cordialidade e profissionalismo
- Coletar informações iniciais sobre a demanda de forma consultiva
- Qualificar o interesse e urgência do lead
- Agendar reuniões com advogados humanos quando apropriado

## REGRAS INVIOLÁVEIS
1. Você NÃO é advogado e NÃO pode dar orientação jurídica
2. Você NÃO pode prometer resultados ou chances de sucesso
3. Você DEVE se apresentar como "Super SDR Advogados" ou "assistente de pré-atendimento"
4. Você DEVE registrar consentimento LGPD antes de coletar dados

## FLUXO DE CONVERSA
1. SAUDAÇÃO: Cumprimentar e se apresentar
2. CONSENTIMENTO: Obter aceite LGPD
3. DEMANDA: Entender o problema do lead
4. QUALIFICAÇÃO: Coletar informações relevantes
5. RESUMO: Confirmar entendimento
6. AGENDAMENTO: Oferecer horários disponíveis
7. ENCERRAMENTO: Confirmar próximos passos

## QUANDO ESCALAR PARA HUMANO
- Lead solicita explicitamente
- Urgência alta detectada (audiência próxima, prisão, etc.)
- Caso envolve valores muito altos
- Dúvidas que você não pode responder

## TOM DE VOZ
- Profissional, mas acolhedor
- Empático com a situação do lead
- Claro e objetivo nas perguntas
- Respeitoso com o tempo do lead

Responda APENAS em formato JSON conforme o schema:
{
  "currentStep": "greeting|consent|demand|qualification|summary|scheduling|farewell",
  "nextAction": "continue|delegate_qualifier|delegate_summary|delegate_scheduler|escalate_human",
  "response": "string",
  "metadata": {
    "urgencyDetected": "alta|media|baixa|null",
    "legalAreaSuggested": "string|null",
    "requiresHumanReview": boolean
  }
}`;

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

      // Se OpenAI estiver configurado, usar IA
      if (this.openai) {
        return await this.processWithOpenAI(request, conversationHistory);
      } else {
        // Fallback para lógica básica
        return await this.processWithFallback(request, conversationHistory);
      }
    } catch (error: any) {
      this.fastify.log.error({ error }, 'Erro ao processar conversa com agente');
      throw error;
    }
  }

  /**
   * Processa conversa usando OpenAI
   */
  private async processWithOpenAI(
    request: ConversationRequest,
    history: Array<{ role: string; content: string }>
  ): Promise<AgentResponse> {
    if (!this.openai) {
      throw new Error('OpenAI não configurado');
    }

    // Obter prompt do serviço de prompts (tenta banco, depois padrão)
    const promptConfig = await this.promptService.getPrompt('orquestrador', request.clienteId);
    const systemPrompt = promptConfig?.content || ORCHESTRATOR_PROMPT_DEFAULT;
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
    const completion = await this.openai.chat.completions.create({
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
    const messages = await this.prisma.message.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20, // Últimas 20 mensagens
    });

    return messages.map((msg) => ({
      role: msg.senderType === 'lead' ? 'user' : msg.senderType === 'bot' ? 'bot' : 'system',
      content: msg.content,
    }));
  }

  /**
   * Salva mensagem no banco
   */
  private async saveMessage(leadId: string, content: string, senderType: 'lead' | 'bot' | 'system'): Promise<void> {
    await this.prisma.message.create({
      data: {
        leadId,
        content,
        senderType,
        channel: 'whatsapp',
      },
    });
  }
}
