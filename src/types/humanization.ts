/**
 * Tipos para Humanização de Texto
 * Configurações que tornam as mensagens mais naturais e humanas
 */

export type MessageLength = 'curtas' | 'medias' | 'longas';
export type EmojiUsage = 'nunca' | 'moderado' | 'sempre';
export type IntensityLevel = 'desativado' | 'pouco' | 'moderado';

export interface HumanizationConfig {
  // Tamanho das mensagens
  messageLength: MessageLength;
  
  // Uso de emojis
  emojiUsage: EmojiUsage;
  
  // Uso de abreviações (vc, tb, etc.)
  abbreviations: IntensityLevel;
  
  // Letras minúsculas no início das frases
  lowercaseStart: IntensityLevel;
  
  // Simulação de pequenos erros de digitação
  typoSimulation: IntensityLevel;
  
  // Ativado/desativado geral
  enabled: boolean;
}

export interface HumanizationResult {
  originalText: string;
  humanizedText: string;
  changesApplied: string[];
}

export const DEFAULT_HUMANIZATION_CONFIG: HumanizationConfig = {
  messageLength: 'medias',
  emojiUsage: 'nunca',
  abbreviations: 'desativado',
  lowercaseStart: 'desativado',
  typoSimulation: 'desativado',
  enabled: false,
};
