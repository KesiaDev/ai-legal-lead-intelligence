/**
 * Serviço de Humanização de Texto
 * 
 * Transforma mensagens formais em texto mais natural e humano,
 * mantendo sempre a clareza jurídica e profissionalismo.
 */

import { HumanizationConfig, HumanizationResult } from '@/types/humanization';

// Mapeamento de abreviações comuns
const ABBREVIATIONS_MAP: Record<string, string> = {
  'você': 'vc',
  'também': 'tb',
  'porque': 'pq',
  'está': 'tá',
  'estou': 'to',
  'para': 'pra',
  'não': 'n',
  'beleza': 'blz',
  'obrigado': 'obg',
  'obrigada': 'obg',
  'combinado': 'combinado',
};

// Emojis contextuais por sentimento
const CONTEXTUAL_EMOJIS: Record<string, string[]> = {
  greeting: ['👋', '😊', '🙂'],
  thanks: ['🙏', '😊', '✨'],
  confirmation: ['✅', '👍', '📌'],
  question: ['🤔', '❓', '💭'],
  farewell: ['👋', '🤝', '😊'],
  positive: ['✨', '💼', '📋'],
  professional: ['⚖️', '📄', '🏛️'],
};

// Erros de digitação realistas
const REALISTIC_TYPOS: Record<string, string[]> = {
  'que': ['qeu', 'qe'],
  'para': ['apra', 'pra'],
  'com': ['ocm', 'com'],
  'uma': ['uma', 'mua'],
  'não': ['nao', 'naõ'],
  'também': ['tambem', 'tmbem'],
  'mais': ['amis', 'masi'],
};

/**
 * Detecta o contexto/sentimento da mensagem
 */
function detectContext(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('olá') || lowerText.includes('bom dia') || lowerText.includes('boa tarde')) {
    return 'greeting';
  }
  if (lowerText.includes('obrigad') || lowerText.includes('agradeç')) {
    return 'thanks';
  }
  if (lowerText.includes('confirma') || lowerText.includes('certo') || lowerText.includes('entendido')) {
    return 'confirmation';
  }
  if (lowerText.includes('?') || lowerText.includes('poderia') || lowerText.includes('gostaria')) {
    return 'question';
  }
  if (lowerText.includes('até') || lowerText.includes('tchau') || lowerText.includes('abraço')) {
    return 'farewell';
  }
  
  return 'professional';
}

/**
 * Aplica abreviações ao texto
 */
function applyAbbreviations(text: string, level: 'desativado' | 'pouco' | 'moderado'): string {
  if (level === 'desativado') return text;
  
  let result = text;
  const entries = Object.entries(ABBREVIATIONS_MAP);
  const limit = level === 'pouco' ? 2 : 5;
  let count = 0;
  
  for (const [full, abbrev] of entries) {
    if (count >= limit) break;
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, abbrev);
      count++;
    }
  }
  
  return result;
}

/**
 * Aplica minúsculas no início das frases
 */
function applyLowercaseStart(text: string, level: 'desativado' | 'pouco' | 'moderado'): string {
  if (level === 'desativado') return text;
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  const probability = level === 'pouco' ? 0.3 : 0.6;
  
  return sentences.map((sentence, index) => {
    // Nunca aplicar na primeira frase ou em nomes próprios
    if (index === 0 || sentence.length < 3) return sentence;
    
    // Verificar se começa com nome próprio comum
    const startsWithProperNoun = /^(Dr\.|Dra\.|Sr\.|Sra\.|[A-Z][a-z]+\s[A-Z])/.test(sentence);
    if (startsWithProperNoun) return sentence;
    
    if (Math.random() < probability) {
      return sentence.charAt(0).toLowerCase() + sentence.slice(1);
    }
    return sentence;
  }).join(' ');
}

/**
 * Simula pequenos erros de digitação
 */
function applyTypoSimulation(text: string, level: 'desativado' | 'pouco' | 'moderado'): string {
  if (level === 'desativado') return text;
  
  let result = text;
  const probability = level === 'pouco' ? 0.05 : 0.1;
  const maxTypos = level === 'pouco' ? 1 : 2;
  let typoCount = 0;
  
  // NUNCA aplicar erros em termos jurídicos críticos
  const protectedTerms = [
    'audiência', 'sentença', 'processo', 'advogado', 'cliente',
    'prazo', 'recurso', 'petição', 'juiz', 'tribunal',
    'LGPD', 'OAB', 'CPF', 'CNPJ', 'RG',
  ];
  
  for (const [word, typos] of Object.entries(REALISTIC_TYPOS)) {
    if (typoCount >= maxTypos) break;
    
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(result) && Math.random() < probability) {
      // Verificar se não está próximo de termo protegido
      const isNearProtected = protectedTerms.some(term => 
        result.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!isNearProtected) {
        const typo = typos[Math.floor(Math.random() * typos.length)];
        result = result.replace(regex, typo);
        typoCount++;
      }
    }
  }
  
  return result;
}

/**
 * Adiciona emojis contextuais
 */
function addEmojis(text: string, usage: 'nunca' | 'moderado' | 'sempre'): string {
  if (usage === 'nunca') return text;
  
  const context = detectContext(text);
  const emojis = CONTEXTUAL_EMOJIS[context] || CONTEXTUAL_EMOJIS.professional;
  const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  const probability = usage === 'moderado' ? 0.5 : 0.9;
  
  if (Math.random() < probability) {
    // Adicionar emoji no final da mensagem
    return `${text.trim()} ${selectedEmoji}`;
  }
  
  return text;
}

/**
 * Ajusta o tamanho da mensagem
 */
function adjustMessageLength(text: string, length: 'curtas' | 'medias' | 'longas'): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  switch (length) {
    case 'curtas':
      // Manter apenas as 2 primeiras frases essenciais
      return sentences.slice(0, 2).join(' ');
    
    case 'longas':
      // Manter texto completo
      return text;
    
    case 'medias':
    default:
      // Manter até 4 frases
      return sentences.slice(0, 4).join(' ');
  }
}

/**
 * Função principal de humanização
 */
export function humanizeText(
  text: string, 
  config: HumanizationConfig
): HumanizationResult {
  if (!config.enabled) {
    return {
      originalText: text,
      humanizedText: text,
      changesApplied: [],
    };
  }
  
  const changesApplied: string[] = [];
  let result = text;
  
  // 1. Ajustar tamanho
  const lengthAdjusted = adjustMessageLength(result, config.messageLength);
  if (lengthAdjusted !== result) {
    changesApplied.push(`Tamanho ajustado para ${config.messageLength}`);
    result = lengthAdjusted;
  }
  
  // 2. Aplicar abreviações
  if (config.abbreviations !== 'desativado') {
    const abbreviated = applyAbbreviations(result, config.abbreviations);
    if (abbreviated !== result) {
      changesApplied.push(`Abreviações: ${config.abbreviations}`);
      result = abbreviated;
    }
  }
  
  // 3. Aplicar minúsculas
  if (config.lowercaseStart !== 'desativado') {
    const lowercased = applyLowercaseStart(result, config.lowercaseStart);
    if (lowercased !== result) {
      changesApplied.push(`Minúsculas: ${config.lowercaseStart}`);
      result = lowercased;
    }
  }
  
  // 4. Simular erros de digitação (CUIDADO: mínimo em contexto jurídico)
  if (config.typoSimulation !== 'desativado') {
    const withTypos = applyTypoSimulation(result, config.typoSimulation);
    if (withTypos !== result) {
      changesApplied.push(`Erros simulados: ${config.typoSimulation}`);
      result = withTypos;
    }
  }
  
  // 5. Adicionar emojis
  if (config.emojiUsage !== 'nunca') {
    const withEmojis = addEmojis(result, config.emojiUsage);
    if (withEmojis !== result) {
      changesApplied.push(`Emojis: ${config.emojiUsage}`);
      result = withEmojis;
    }
  }
  
  return {
    originalText: text,
    humanizedText: result,
    changesApplied,
  };
}

/**
 * Preview da humanização (para configuração)
 */
export function previewHumanization(config: HumanizationConfig): string {
  const sampleText = 'Olá! Obrigado por entrar em contato. Entendi que você está buscando orientação sobre um processo trabalhista. Poderia me informar há quanto tempo você foi desligado da empresa? Essa informação é importante para analisarmos seu caso.';
  
  const result = humanizeText(sampleText, config);
  return result.humanizedText;
}
