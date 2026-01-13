/**
 * Regras de Compliance para IA Jurídica
 * 
 * Este arquivo centraliza todas as regras éticas e de compliance
 * que a IA deve seguir ao interagir com leads jurídicos.
 */

export const AI_RULES = {
  // Regras de tom e linguagem
  tone: {
    professional: true,
    formal: true,
    respectful: true,
    clear: true,
  },

  // Frases proibidas - NUNCA usar
  forbiddenPhrases: [
    'você vai ganhar',
    'garantimos o resultado',
    'é certo que',
    'sem dúvida você terá',
    'prometemos que',
    'com certeza vai conseguir',
    'é impossível perder',
    'vitória garantida',
    'sucesso assegurado',
  ],

  // Frases obrigatórias em certas situações
  requiredDisclaimers: {
    legalAdvice: 'Este é apenas um atendimento de triagem. Para consultoria jurídica completa, é necessário o atendimento por um advogado.',
    noGuarantee: 'Cada caso é único e os resultados podem variar conforme as circunstâncias específicas.',
    lgpd: 'Seus dados serão tratados conforme a Lei Geral de Proteção de Dados (LGPD).',
  },

  // Limites de atuação da IA
  limits: {
    canClassifyLegalArea: true,
    canAssessUrgency: true,
    canSummarizeDemand: true,
    canRewriteMessages: true,
    canSuggestNextQuestion: true,
    canGiveLegalAdvice: false, // NUNCA
    canPromiseResults: false, // NUNCA
    canMakeDecisions: false, // Sempre humano decide
    canConverseFreeely: false, // Apenas fluxo definido
  },

  // Áreas do direito reconhecidas
  legalAreas: [
    { key: 'trabalhista', name: 'Direito Trabalhista', keywords: ['CLT', 'demissão', 'salário', 'horas extras', 'trabalho', 'emprego', 'férias', 'FGTS', 'rescisão'] },
    { key: 'previdenciario', name: 'Direito Previdenciário', keywords: ['INSS', 'aposentadoria', 'benefício', 'auxílio', 'pensão', 'invalidez', 'BPC'] },
    { key: 'familia', name: 'Direito de Família', keywords: ['divórcio', 'guarda', 'pensão alimentícia', 'casamento', 'união estável', 'inventário', 'herança'] },
    { key: 'civel', name: 'Direito Cível', keywords: ['contrato', 'dano', 'indenização', 'cobrança', 'consumidor', 'vizinhança', 'propriedade'] },
    { key: 'penal', name: 'Direito Penal', keywords: ['crime', 'processo criminal', 'prisão', 'defesa', 'acusação', 'inquérito', 'delegacia'] },
  ],

  // Indicadores de urgência
  urgencyIndicators: {
    alta: ['urgente', 'hoje', 'agora', 'imediato', 'emergência', 'prazo amanhã', 'audiência', 'citação', 'intimação', 'preso', 'prisão'],
    media: ['breve', 'logo', 'próximos dias', 'semana que vem', 'preciso resolver', 'importante'],
    baixa: ['quando puder', 'sem pressa', 'dúvida', 'informação', 'consulta', 'apenas saber'],
  },
} as const;

/**
 * Valida se uma mensagem viola as regras de compliance
 */
export function validateMessage(message: string): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const lowerMessage = message.toLowerCase();

  for (const phrase of AI_RULES.forbiddenPhrases) {
    if (lowerMessage.includes(phrase.toLowerCase())) {
      violations.push(`Frase proibida detectada: "${phrase}"`);
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Adiciona disclaimer se necessário
 */
export function ensureCompliance(message: string, context: 'legal' | 'general'): string {
  if (context === 'legal' && !message.includes('triagem')) {
    return `${message}\n\n${AI_RULES.requiredDisclaimers.legalAdvice}`;
  }
  return message;
}

/**
 * Detecta área do direito baseado em keywords
 */
export function detectLegalArea(text: string): { area: string; confidence: number } {
  const lowerText = text.toLowerCase();
  let bestMatch = { area: 'civel', confidence: 0 };

  for (const area of AI_RULES.legalAreas) {
    const matchCount = area.keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length;
    const confidence = matchCount / area.keywords.length;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { area: area.key, confidence };
    }
  }

  return bestMatch;
}

/**
 * Detecta nível de urgência baseado em indicadores
 */
export function detectUrgency(text: string): 'alta' | 'media' | 'baixa' {
  const lowerText = text.toLowerCase();

  // Verifica alta urgência primeiro
  for (const indicator of AI_RULES.urgencyIndicators.alta) {
    if (lowerText.includes(indicator)) return 'alta';
  }

  // Depois média
  for (const indicator of AI_RULES.urgencyIndicators.media) {
    if (lowerText.includes(indicator)) return 'media';
  }

  // Default: baixa
  return 'baixa';
}
