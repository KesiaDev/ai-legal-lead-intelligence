/**
 * Serviço de IA Controlada para SDR Jurídico
 * 
 * Este serviço simula chamadas de IA para o MVP.
 * Arquitetura preparada para futura integração com OpenAI/Lovable AI.
 * 
 * IMPORTANTE: A IA é CONTROLADA - não conversa livremente,
 * apenas auxilia na classificação e reescrita de mensagens.
 */

import { 
  AI_RULES, 
  detectLegalArea, 
  detectUrgency, 
  validateMessage, 
  ensureCompliance 
} from './aiRules';
import { ConversationStep } from '@/types/lead';

// Tipos para o serviço de IA
export interface AIAnalysisResult {
  possibleLegalArea: {
    key: string;
    name: string;
    confidence: number;
  };
  urgencyLevel: 'alta' | 'media' | 'baixa';
  summary: string;
  suggestions: string[];
  isCompliant: boolean;
}

export interface AIRewriteResult {
  originalText: string;
  rewrittenText: string;
  tone: 'profissional' | 'neutro';
  improvements: string[];
}

export interface AINextQuestionResult {
  question: string;
  options?: string[];
  reasoning: string;
}

// Configuração do serviço (pode ser alterada via AgentConfig)
export interface AIServiceConfig {
  enabled: boolean;
  interventionLevel: 'baixo' | 'medio';
  simulateDelay: boolean;
  delayMs: number;
}

const defaultConfig: AIServiceConfig = {
  enabled: true,
  interventionLevel: 'medio',
  simulateDelay: true,
  delayMs: 500,
};

let currentConfig = { ...defaultConfig };

/**
 * Atualiza configuração do serviço de IA
 */
export function updateAIConfig(config: Partial<AIServiceConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Obtém configuração atual
 */
export function getAIConfig(): AIServiceConfig {
  return { ...currentConfig };
}

/**
 * Simula delay de API para parecer mais natural
 */
async function simulateAPICall<T>(result: T): Promise<T> {
  if (currentConfig.simulateDelay) {
    await new Promise(resolve => setTimeout(resolve, currentConfig.delayMs));
  }
  return result;
}

/**
 * Analisa mensagem do lead e retorna classificação
 * 
 * @param message - Mensagem do lead
 * @param step - Etapa atual do fluxo de conversação
 * @returns Análise da mensagem
 * 
 * FUTURO: Integrar com OpenAI API
 * const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {...})
 */
export async function analyzeMessage(
  message: string, 
  step: ConversationStep
): Promise<AIAnalysisResult> {
  if (!currentConfig.enabled) {
    return getDefaultAnalysis();
  }

  // Detecta área jurídica
  const legalAreaResult = detectLegalArea(message);
  const legalAreaInfo = AI_RULES.legalAreas.find(a => a.key === legalAreaResult.area);

  // Detecta urgência
  const urgency = detectUrgency(message);

  // Gera resumo simples
  const summary = generateSummary(message, step);

  // Gera sugestões baseadas no contexto
  const suggestions = generateSuggestions(message, step, legalAreaResult.area, urgency);

  // Valida compliance
  const validation = validateMessage(message);

  const result: AIAnalysisResult = {
    possibleLegalArea: {
      key: legalAreaResult.area,
      name: legalAreaInfo?.name || 'Direito Cível',
      confidence: legalAreaResult.confidence,
    },
    urgencyLevel: urgency,
    summary,
    suggestions,
    isCompliant: validation.isValid,
  };

  return simulateAPICall(result);
}

/**
 * Reescreve mensagem do agente com tom profissional
 * 
 * @param text - Texto original
 * @param tone - Tom desejado
 * @returns Texto reescrito
 */
export async function rewriteAgentMessage(
  text: string, 
  tone: 'profissional' | 'neutro' = 'profissional'
): Promise<AIRewriteResult> {
  if (!currentConfig.enabled) {
    return {
      originalText: text,
      rewrittenText: text,
      tone,
      improvements: [],
    };
  }

  const improvements: string[] = [];
  let rewrittenText = text;

  // Aplicar melhorias de tom profissional
  if (tone === 'profissional') {
    // Capitalizar início
    if (rewrittenText[0] !== rewrittenText[0].toUpperCase()) {
      rewrittenText = rewrittenText.charAt(0).toUpperCase() + rewrittenText.slice(1);
      improvements.push('Capitalização corrigida');
    }

    // Remover gírias comuns
    const informalReplacements: Record<string, string> = {
      'vc': 'você',
      'tbm': 'também',
      'pq': 'porque',
      'q': 'que',
      'td': 'tudo',
      'blz': 'certo',
      'ok': 'de acordo',
      'pra': 'para',
      'pro': 'para o',
    };

    for (const [informal, formal] of Object.entries(informalReplacements)) {
      const regex = new RegExp(`\\b${informal}\\b`, 'gi');
      if (regex.test(rewrittenText)) {
        rewrittenText = rewrittenText.replace(regex, formal);
        improvements.push(`"${informal}" substituído por "${formal}"`);
      }
    }

    // Adicionar pontuação final se não tiver
    if (!/[.!?]$/.test(rewrittenText.trim())) {
      rewrittenText = rewrittenText.trim() + '.';
      improvements.push('Pontuação final adicionada');
    }
  }

  // Garantir compliance
  rewrittenText = ensureCompliance(rewrittenText, 'general');

  const result: AIRewriteResult = {
    originalText: text,
    rewrittenText,
    tone,
    improvements,
  };

  return simulateAPICall(result);
}

/**
 * Sugere próxima pergunta do fluxo
 * 
 * @param context - Contexto da conversa atual
 * @returns Sugestão de próxima pergunta
 */
export async function suggestNextQuestion(context: {
  currentStep: ConversationStep;
  leadData: Record<string, string>;
  conversationHistory: string[];
}): Promise<AINextQuestionResult> {
  if (!currentConfig.enabled) {
    return {
      question: context.currentStep.question,
      options: context.currentStep.options,
      reasoning: 'IA desabilitada - usando pergunta padrão do fluxo',
    };
  }

  const { currentStep, leadData } = context;

  // Lógica de personalização baseada em contexto
  let customQuestion = currentStep.question;
  let reasoning = 'Pergunta padrão do fluxo';

  // Personalizar saudação se temos o nome
  if (leadData.name && !customQuestion.includes(leadData.name)) {
    if (currentStep.type === 'area' || currentStep.type === 'demand') {
      customQuestion = customQuestion.replace('Agora, por favor,', `${leadData.name}, por favor,`);
      reasoning = 'Personalizado com nome do lead';
    }
  }

  // Ajustar tom baseado na urgência detectada
  if (leadData.demand) {
    const urgency = detectUrgency(leadData.demand);
    if (urgency === 'alta' && currentStep.type === 'urgency') {
      customQuestion = 'Entendemos que sua situação parece urgente. Pode confirmar o grau de urgência?';
      reasoning = 'Ajustado para reconhecer urgência detectada';
    }
  }

  const result: AINextQuestionResult = {
    question: customQuestion,
    options: currentStep.options,
    reasoning,
  };

  return simulateAPICall(result);
}

/**
 * Gera resumo da demanda
 */
function generateSummary(message: string, step: ConversationStep): string {
  // Se for etapa de demanda, gerar resumo
  if (step.type === 'demand') {
    const words = message.split(' ');
    if (words.length > 20) {
      return words.slice(0, 20).join(' ') + '...';
    }
    return message;
  }

  return `Resposta na etapa: ${step.id}`;
}

/**
 * Gera sugestões baseadas no contexto
 */
function generateSuggestions(
  message: string, 
  step: ConversationStep, 
  legalArea: string,
  urgency: string
): string[] {
  const suggestions: string[] = [];

  // Sugestões baseadas na área
  if (step.type === 'demand') {
    const areaInfo = AI_RULES.legalAreas.find(a => a.key === legalArea);
    if (areaInfo) {
      suggestions.push(`Área detectada: ${areaInfo.name}`);
    }
  }

  // Sugestões baseadas na urgência
  if (urgency === 'alta') {
    suggestions.push('⚠️ Alta urgência detectada - priorizar atendimento');
  }

  // Sugestões de compliance
  if (message.toLowerCase().includes('processo') || message.toLowerCase().includes('audiência')) {
    suggestions.push('💡 Verificar se há prazos judiciais em andamento');
  }

  return suggestions;
}

/**
 * Retorna análise padrão quando IA está desabilitada
 */
function getDefaultAnalysis(): AIAnalysisResult {
  return {
    possibleLegalArea: {
      key: 'civel',
      name: 'Direito Cível',
      confidence: 0,
    },
    urgencyLevel: 'baixa',
    summary: 'IA desabilitada',
    suggestions: [],
    isCompliant: true,
  };
}
