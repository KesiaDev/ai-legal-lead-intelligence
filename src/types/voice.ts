/**
 * Tipos para Configuração de Voz
 * Integração conceitual com ElevenLabs e outros provedores TTS
 */

export type VoiceProvider = 'elevenlabs' | 'google' | 'azure' | 'none';
export type VoiceResponseProbability = 'nunca' | 'baixa' | 'media' | 'alta' | 'sempre';
export type TextAdjustmentLevel = 'desativado' | 'pouco' | 'moderado';

export interface VoiceConfig {
  // Provider de voz
  provider: VoiceProvider;
  
  // API Key do ElevenLabs (opcional, pode ser configurada por tenant)
  elevenlabsApiKey?: string;
  
  // ID da voz selecionada (ElevenLabs)
  voiceId: string;
  voiceName: string;
  
  // Probabilidades de resposta em áudio
  audioResponseProbability: {
    onText: VoiceResponseProbability;
    onAudio: VoiceResponseProbability;
    onMedia: VoiceResponseProbability;
  };
  
  // Duração máxima do áudio em segundos
  maxAudioDuration: number;
  
  // Ajuste de texto para linguagem falada
  textToSpeechAdjustment: TextAdjustmentLevel;
  
  // Palavras que forçam resposta em texto (blacklist)
  textOnlyKeywords: string[];
  
  // Configurações de voz (ElevenLabs)
  voiceSettings: {
    stability: number; // 0-1
    similarityBoost: number; // 0-1
    style: number; // 0-1
    speed: number; // 0.7-1.2
  };
  
  // Ativado/desativado
  enabled: boolean;
}

export interface VoiceGenerationRequest {
  text: string;
  voiceId: string;
  settings: VoiceConfig['voiceSettings'];
}

export interface VoiceGenerationResult {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

// Vozes pré-configuradas do ElevenLabs
export const ELEVENLABS_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Profissional Feminina', language: 'pt-BR' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George - Profissional Masculino', language: 'pt-BR' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel - Consultor', language: 'pt-BR' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily - Atendimento', language: 'pt-BR' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica - Executiva', language: 'pt-BR' },
] as const;

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  provider: 'elevenlabs',
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
  voiceName: 'Sarah - Profissional Feminina',
  audioResponseProbability: {
    onText: 'nunca',
    onAudio: 'alta',
    onMedia: 'baixa',
  },
  maxAudioDuration: 60,
  textToSpeechAdjustment: 'moderado',
  textOnlyKeywords: [
    'http', 'www', '@', '.com', '.br',
    'cpf', 'cnpj', 'oab', 'cnh',
    'r$', 'reais', '%',
    'artigo', 'parágrafo', 'inciso',
  ],
  voiceSettings: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.3,
    speed: 1.0,
  },
  enabled: false,
};
