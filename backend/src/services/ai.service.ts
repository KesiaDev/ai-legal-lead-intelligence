import OpenAI from 'openai';
import { env } from '../config/env';

// Inicializar cliente OpenAI
const openai = env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    })
  : null;

export interface AIMessageContext {
  conversationHistory: Array<{
    role: 'lead' | 'ai' | 'human';
    content: string;
    timestamp: Date;
  }>;
  leadInfo: {
    name: string;
    legalArea?: string;
    customLegalArea?: string;
    urgency?: string;
    demandDescription?: string;
  };
  conversationId: string;
}

export interface AIResponse {
  message: string;
  intent?: 'contratar' | 'informacao' | 'comparacao' | 'urgencia' | 'outro';
  confidence: number;
  shouldEscalate?: boolean;
  suggestedAction?: string;
}

/**
 * Gera resposta automática da IA baseada no contexto da conversa
 */
export async function generateAIResponse(
  userMessage: string,
  context: AIMessageContext
): Promise<AIResponse> {
  if (!openai) {
    // Fallback quando OpenAI não está configurado
    return {
      message: 'Olá! Obrigado por entrar em contato. Em breve um de nossos advogados entrará em contato.',
      intent: 'informacao',
      confidence: 0.5,
    };
  }

  try {
    // Construir histórico de mensagens para o contexto
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: buildSystemPrompt(context),
      },
      ...buildConversationHistory(context.conversationHistory),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Modelo mais econômico para MVP
      messages,
      temperature: 0.7,
      max_tokens: 500,
      functions: [
        {
          name: 'detect_intent',
          description: 'Detecta a intenção do lead na mensagem',
          parameters: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                enum: ['contratar', 'informacao', 'comparacao', 'urgencia', 'outro'],
                description: 'Intenção detectada do lead',
              },
              confidence: {
                type: 'number',
                description: 'Confiança na detecção (0-1)',
              },
              shouldEscalate: {
                type: 'boolean',
                description: 'Se deve escalar para humano',
              },
              suggestedAction: {
                type: 'string',
                description: 'Ação sugerida para o operador',
              },
            },
            required: ['intent', 'confidence'],
          },
        },
      ],
      function_call: { name: 'detect_intent' },
    });

    const message = completion.choices[0].message;
    let response: AIResponse;

    // Se a IA chamou a função de detecção de intenção
    if (message.function_call?.name === 'detect_intent') {
      const functionArgs = JSON.parse(message.function_call.arguments);
      
      // Gerar resposta baseada na intenção detectada
      const responseCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(context),
          },
          ...buildConversationHistory(context.conversationHistory),
          {
            role: 'user',
            content: userMessage,
          },
          {
            role: 'assistant',
            content: `Intenção detectada: ${functionArgs.intent}. Gerar resposta apropriada.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      response = {
        message: responseCompletion.choices[0].message.content || '',
        intent: functionArgs.intent,
        confidence: functionArgs.confidence,
        shouldEscalate: functionArgs.shouldEscalate,
        suggestedAction: functionArgs.suggestedAction,
      };
    } else {
      // Resposta direta
      response = {
        message: message.content || '',
        intent: 'outro',
        confidence: 0.7,
      };
    }

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback em caso de erro
    return {
      message: 'Desculpe, não consegui processar sua mensagem no momento. Um de nossos advogados entrará em contato em breve.',
      intent: 'outro',
      confidence: 0.3,
    };
  }
}

/**
 * Constrói o prompt do sistema baseado no contexto
 */
function buildSystemPrompt(context: AIMessageContext): string {
  const { leadInfo } = context;
  
  const legalAreaText = leadInfo.customLegalArea 
    ? leadInfo.customLegalArea 
    : leadInfo.legalArea || 'não especificada';

  return `Você é um assistente jurídico virtual (SDR) para um escritório de advocacia brasileiro.

CONTEXTO DO LEAD:
- Nome: ${leadInfo.name}
- Área do Direito: ${legalAreaText}
- Urgência: ${leadInfo.urgency || 'não especificada'}
- Demanda: ${leadInfo.demandDescription || 'não informada'}

DIRETRIZES IMPORTANTES:
1. NUNCA ofereça consultoria jurídica específica
2. NUNCA prometa resultados ou garantias
3. Seja cordial, profissional e empático
4. Foque em qualificar o lead e entender a demanda
5. Se a situação for urgente ou complexa, sugira escalação para humano
6. Use linguagem clara e acessível
7. Sempre peça consentimento LGPD quando necessário
8. Mantenha tom profissional mas acolhedor

OBJETIVO:
Qualificar o lead, entender a demanda e agendar uma consulta com advogado quando apropriado.

Responda de forma breve, direta e útil.`;
}

/**
 * Constrói histórico de conversa para o contexto da IA
 */
function buildConversationHistory(
  history: AIMessageContext['conversationHistory']
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
  return history.slice(-10).map(msg => ({
    role: msg.role === 'lead' ? 'user' : 'assistant',
    content: msg.content,
  })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];
}

/**
 * Detecta intenção básica usando análise simples (fallback)
 */
export function detectIntentBasic(message: string): {
  intent: AIResponse['intent'];
  confidence: number;
} {
  const lowerMessage = message.toLowerCase();

  // Palavras-chave para cada intenção
  const contratarKeywords = ['contratar', 'contrato', 'serviço', 'advogado', 'preciso', 'quero'];
  const informacaoKeywords = ['informação', 'saber', 'entender', 'dúvida', 'pergunta'];
  const comparacaoKeywords = ['comparar', 'diferença', 'melhor', 'outro', 'outros'];
  const urgenciaKeywords = ['urgente', 'urgência', 'rápido', 'imediato', 'agora', 'hoje'];

  let intent: AIResponse['intent'] = 'outro';
  let maxMatches = 0;

  const matches = {
    contratar: contratarKeywords.filter(kw => lowerMessage.includes(kw)).length,
    informacao: informacaoKeywords.filter(kw => lowerMessage.includes(kw)).length,
    comparacao: comparacaoKeywords.filter(kw => lowerMessage.includes(kw)).length,
    urgencia: urgenciaKeywords.filter(kw => lowerMessage.includes(kw)).length,
  };

  for (const [key, count] of Object.entries(matches)) {
    if (count > maxMatches) {
      maxMatches = count;
      intent = key as AIResponse['intent'];
    }
  }

  const confidence = maxMatches > 0 ? Math.min(0.3 + maxMatches * 0.2, 0.9) : 0.3;

  return { intent, confidence };
}
