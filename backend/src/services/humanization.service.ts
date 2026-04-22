/**
 * Serviço de Ultra-Humanização — 8 Camadas
 * Usado pelo agente IA antes de enviar mensagens
 */

export interface HumanizationOptions {
  profileType?: 'formal' | 'informal' | 'auto'; // Adaptação de perfil
  enableDelay?: boolean; // Delay inteligente
  enableTypos?: boolean; // Erros propositais
  enableEmojis?: boolean;
  enableAbbreviations?: boolean;
  brandTone?: string; // Tom de marca
  previousResponses?: string[]; // Para evitar repetição
}

// Pool de variações para evitar repetição
const RESPONSE_VARIATIONS: Record<string, string[]> = {
  greeting: [
    'Oi! Tudo bem?',
    'Olá! Como posso te ajudar?',
    'Oi, boa tarde!',
    'Olá, seja bem-vindo!',
    'Oi! Em que posso ajudar?',
  ],
  understanding: [
    'Entendi!',
    'Compreendo.',
    'Certo, anotado!',
    'Ok, entendi a situação.',
    'Perfeito, já entendi.',
  ],
  waiting: [
    'Um momento...',
    'Deixa eu verificar...',
    'Só um segundo...',
    'Aguarda um instante...',
    'Deixa eu checar aqui...',
  ],
  confirmation: [
    'Combinado!',
    'Perfeito!',
    'Ótimo!',
    'Show!',
    'Tá ótimo!',
  ],
};

// Calcula delay baseado no tamanho da mensagem (simula digitação real)
export function calculateTypingDelay(text: string): number {
  const baseCharsPerSecond = 8; // ~8 caracteres/segundo (digitação humana)
  const minDelay = 800; // mínimo 0.8s
  const maxDelay = 6000; // máximo 6s
  const calculated = (text.length / baseCharsPerSecond) * 1000;
  // Adiciona variação aleatória ±20%
  const variation = calculated * (0.8 + Math.random() * 0.4);
  return Math.min(Math.max(variation, minDelay), maxDelay);
}

// Detecta perfil do lead pela conversa
export function detectLeadProfile(messages: string[]): 'formal' | 'informal' {
  const informalSignals = ['vc', 'tb', 'pq', 'tá', 'blz', 'vlw', 'kk', 'hehe', '!!', '?!'];
  const formalSignals = ['prezado', 'senhor', 'senhora', 'gostaria de', 'por gentileza', 'informar'];

  const allText = messages.join(' ').toLowerCase();
  const informalScore = informalSignals.filter(s => allText.includes(s)).length;
  const formalScore = formalSignals.filter(s => allText.includes(s)).length;

  return informalScore > formalScore ? 'informal' : 'formal';
}

// Adapta o texto ao perfil detectado
export function adaptToProfile(text: string, profile: 'formal' | 'informal'): string {
  if (profile === 'informal') {
    return text
      .replace(/\bVocê\b/g, 'Vc')
      .replace(/\bvocê\b/g, 'vc')
      .replace(/\btambém\b/g, 'tb')
      .replace(/\bpara\b/g, 'pra')
      .replace(/\bpor favor\b/gi, 'pfv')
      .replace(/Olá/g, 'Oi')
      .replace(/Obrigado/g, 'Obg')
      .replace(/Obrigada/g, 'Obg');
  }
  return text; // formal: manter como está
}

// Seleciona variação para evitar repetição
export function selectVariation(category: string, previousResponses: string[]): string | null {
  const variations = RESPONSE_VARIATIONS[category];
  if (!variations) return null;

  // Filtra as que não foram usadas recentemente
  const unused = variations.filter(v => !previousResponses.includes(v));
  const pool = unused.length > 0 ? unused : variations;

  return pool[Math.floor(Math.random() * pool.length)];
}

// Pipeline completo de ultra-humanização
export function ultraHumanize(
  text: string,
  options: HumanizationOptions = {}
): { text: string; delayMs: number } {
  let result = text;

  // 1. Adaptação de perfil
  if (options.profileType && options.profileType !== 'auto') {
    result = adaptToProfile(result, options.profileType);
  } else if (options.profileType === 'auto' && options.previousResponses) {
    const detectedProfile = detectLeadProfile(options.previousResponses);
    result = adaptToProfile(result, detectedProfile);
  }

  // 2. Erros propositais (muito sutis — apenas 5% das mensagens)
  if (options.enableTypos && Math.random() < 0.05) {
    const typoMap: Record<string, string> = {
      'também': 'tambem',
      'que': 'qeu',
    };
    for (const [word, typo] of Object.entries(typoMap)) {
      if (result.includes(word) && Math.random() < 0.3) {
        result = result.replace(word, typo);
        // Simula correção automática: adiciona texto corrigido
        result += ` *${word}`;
        break; // só um erro por mensagem
      }
    }
  }

  // 3. Emojis
  if (options.enableEmojis) {
    const lowerText = result.toLowerCase();
    if (lowerText.includes('obrigad') && !result.includes('🙏')) result += ' 🙏';
    else if (lowerText.includes('ótimo') || lowerText.includes('perfeito')) result = result.replace(/Ótimo|Perfeito/g, m => m + ' ✅');
    else if (lowerText.includes('olá') || lowerText.includes('oi ')) {
      if (!result.includes('👋')) result = result.replace(/Olá|Oi/i, m => m + ' 👋');
    }
  }

  // 4. Calcular delay de digitação
  const delayMs = options.enableDelay ? calculateTypingDelay(result) : 0;

  return { text: result, delayMs };
}
