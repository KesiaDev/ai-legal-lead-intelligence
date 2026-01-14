/**
 * Serviço de Voz
 * 
 * Gerencia a conversão de texto para fala (TTS)
 * com integração conceitual para ElevenLabs.
 * 
 * IMPORTANTE: Este serviço está preparado para integração real,
 * mas atualmente simula as operações para o MVP.
 */

import { 
  VoiceConfig, 
  VoiceGenerationRequest, 
  VoiceGenerationResult,
  VoiceResponseProbability 
} from '@/types/voice';

/**
 * Verifica se o texto contém palavras que forçam resposta em texto
 */
export function containsTextOnlyKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Converte texto para "roteiro de fala"
 * Remove elementos que não devem ser lidos em voz alta
 */
export function convertToSpeechScript(
  text: string, 
  adjustmentLevel: 'desativado' | 'pouco' | 'moderado'
): string {
  if (adjustmentLevel === 'desativado') return text;
  
  let script = text;
  
  // Remover URLs
  script = script.replace(/https?:\/\/[^\s]+/g, 'link enviado por mensagem');
  
  // Remover emails
  script = script.replace(/[\w.-]+@[\w.-]+\.\w+/g, 'email enviado por mensagem');
  
  // Converter números de telefone para leitura
  script = script.replace(
    /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g, 
    'número de telefone informado por escrito'
  );
  
  // Converter valores monetários
  script = script.replace(/R\$\s?[\d.,]+/g, (match) => {
    const value = match.replace(/[R$\s.]/g, '').replace(',', '.');
    const num = parseFloat(value);
    if (isNaN(num)) return 'valor informado por escrito';
    
    // Simplificar leitura de valores
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} milhões de reais`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)} mil reais`;
    }
    return `${num} reais`;
  });
  
  // Converter siglas jurídicas para leitura
  const legalAcronyms: Record<string, string> = {
    'OAB': 'Ordem dos Advogados do Brasil',
    'LGPD': 'Lei Geral de Proteção de Dados',
    'CLT': 'Consolidação das Leis do Trabalho',
    'INSS': 'Instituto Nacional do Seguro Social',
    'STF': 'Supremo Tribunal Federal',
    'STJ': 'Superior Tribunal de Justiça',
    'TRT': 'Tribunal Regional do Trabalho',
    'TJ': 'Tribunal de Justiça',
  };
  
  if (adjustmentLevel === 'moderado') {
    for (const [acronym, fullName] of Object.entries(legalAcronyms)) {
      script = script.replace(new RegExp(`\\b${acronym}\\b`, 'g'), fullName);
    }
  }
  
  // Remover caracteres especiais que não devem ser lidos
  script = script.replace(/[*_~`#]/g, '');
  
  // Converter listas para formato falado
  script = script.replace(/^\s*[-•]\s*/gm, 'Primeiro: ');
  
  // Adicionar pausas naturais
  script = script.replace(/\. /g, '. ... ');
  script = script.replace(/\? /g, '? ... ');
  script = script.replace(/! /g, '! ... ');
  
  return script.trim();
}

/**
 * Determina se deve responder em áudio
 */
export function shouldRespondWithAudio(
  config: VoiceConfig,
  inputType: 'text' | 'audio' | 'media',
  messageText: string
): boolean {
  if (!config.enabled) return false;
  
  // Verificar blacklist
  if (containsTextOnlyKeywords(messageText, config.textOnlyKeywords)) {
    return false;
  }
  
  // Obter probabilidade baseada no tipo de input
  const probabilityMap: Record<VoiceResponseProbability, number> = {
    'nunca': 0,
    'baixa': 0.25,
    'media': 0.5,
    'alta': 0.75,
    'sempre': 1,
  };
  
  let probability: VoiceResponseProbability;
  switch (inputType) {
    case 'audio':
      probability = config.audioResponseProbability.onAudio;
      break;
    case 'media':
      probability = config.audioResponseProbability.onMedia;
      break;
    default:
      probability = config.audioResponseProbability.onText;
  }
  
  return Math.random() < probabilityMap[probability];
}

/**
 * Estima a duração do áudio em segundos
 * Baseado em ~150 palavras por minuto
 */
export function estimateAudioDuration(text: string): number {
  const words = text.split(/\s+/).length;
  const wordsPerSecond = 150 / 60; // 2.5 palavras por segundo
  return Math.ceil(words / wordsPerSecond);
}

/**
 * Valida se o texto pode ser convertido em áudio
 * respeitando as limitações de duração
 */
export function validateForAudioConversion(
  text: string, 
  maxDuration: number
): { valid: boolean; estimatedDuration: number; reason?: string } {
  const estimatedDuration = estimateAudioDuration(text);
  
  if (estimatedDuration > maxDuration) {
    return {
      valid: false,
      estimatedDuration,
      reason: `Texto muito longo. Duração estimada: ${estimatedDuration}s (máximo: ${maxDuration}s)`,
    };
  }
  
  return { valid: true, estimatedDuration };
}

/**
 * SIMULAÇÃO: Gera áudio a partir de texto
 * Em produção, isso chamaria a API do ElevenLabs
 */
export async function generateVoice(
  request: VoiceGenerationRequest
): Promise<VoiceGenerationResult> {
  // Simular latência de API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validar entrada
  if (!request.text || request.text.trim().length === 0) {
    return {
      success: false,
      error: 'Texto vazio não pode ser convertido em áudio',
    };
  }
  
  const duration = estimateAudioDuration(request.text);
  
  // Simular sucesso
  console.log('[VoiceService] Simulando geração de áudio:', {
    voiceId: request.voiceId,
    textLength: request.text.length,
    estimatedDuration: duration,
    settings: request.settings,
  });
  
  return {
    success: true,
    audioUrl: 'simulated://audio-' + Date.now() + '.mp3',
    duration,
  };
}

/**
 * PREPARADO PARA PRODUÇÃO: Chamada real ao ElevenLabs
 * Descomentar quando a integração estiver configurada
 */
/*
export async function generateVoiceElevenLabs(
  request: VoiceGenerationRequest,
  apiKey: string
): Promise<VoiceGenerationResult> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${request.voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: request.settings.stability,
          similarity_boost: request.settings.similarityBoost,
          style: request.settings.style,
          speed: request.settings.speed,
        },
      }),
    }
  );

  if (!response.ok) {
    return {
      success: false,
      error: `ElevenLabs API error: ${response.status}`,
    };
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  return {
    success: true,
    audioUrl,
    duration: estimateAudioDuration(request.text),
  };
}
*/

/**
 * Pipeline completo de preparação e geração de voz
 */
export async function prepareAndGenerateVoice(
  text: string,
  config: VoiceConfig,
  inputType: 'text' | 'audio' | 'media' = 'text'
): Promise<{ shouldUseAudio: boolean; result?: VoiceGenerationResult; script?: string }> {
  // 1. Verificar se deve usar áudio
  if (!shouldRespondWithAudio(config, inputType, text)) {
    return { shouldUseAudio: false };
  }
  
  // 2. Converter para roteiro de fala
  const script = convertToSpeechScript(text, config.textToSpeechAdjustment);
  
  // 3. Validar duração
  const validation = validateForAudioConversion(script, config.maxAudioDuration);
  if (!validation.valid) {
    console.log('[VoiceService] Texto muito longo para áudio:', validation.reason);
    return { shouldUseAudio: false };
  }
  
  // 4. Gerar áudio
  const result = await generateVoice({
    text: script,
    voiceId: config.voiceId,
    settings: config.voiceSettings,
  });
  
  return {
    shouldUseAudio: result.success,
    result,
    script,
  };
}
