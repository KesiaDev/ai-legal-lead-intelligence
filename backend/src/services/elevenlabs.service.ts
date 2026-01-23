/**
 * Serviço de Integração com ElevenLabs
 * 
 * Gerencia a conversão de texto para fala usando a API do ElevenLabs.
 */

import axios from 'axios';
import { FastifyInstance } from 'fastify';

export interface VoiceGenerationRequest {
  text: string;
  voiceId: string;
  settings: {
    stability: number;
    similarityBoost: number;
    style: number;
    speed: number;
  };
}

export interface VoiceGenerationResult {
  success: boolean;
  audioBuffer?: Buffer;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

export class ElevenLabsService {
  private fastify: FastifyInstance;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Gera áudio a partir de texto usando ElevenLabs
   */
  async generateVoice(
    apiKey: string,
    request: VoiceGenerationRequest
  ): Promise<VoiceGenerationResult> {
    try {
      if (!apiKey) {
        return {
          success: false,
          error: 'ElevenLabs API Key não configurada',
        };
      }

      if (!request.text || request.text.trim().length === 0) {
        return {
          success: false,
          error: 'Texto vazio não pode ser convertido em áudio',
        };
      }

      // Converter texto para roteiro de fala
      const script = this.convertToSpeechScript(request.text);

      // Estimar duração
      const estimatedDuration = this.estimateAudioDuration(script);

      this.fastify.log.info({
        voiceId: request.voiceId,
        textLength: script.length,
        estimatedDuration,
      }, 'Gerando áudio com ElevenLabs');

      // Chamar API do ElevenLabs
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${request.voiceId}`,
        {
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: request.settings.stability,
            similarity_boost: request.settings.similarityBoost,
            style: request.settings.style,
            use_speaker_boost: true,
          },
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          params: {
            output_format: 'mp3_44100_128',
            optimize_streaming_latency: '3',
          },
          responseType: 'arraybuffer',
          timeout: 30000, // 30 segundos
        }
      );

      if (response.status !== 200) {
        return {
          success: false,
          error: `ElevenLabs API retornou status ${response.status}`,
        };
      }

      const audioBuffer = Buffer.from(response.data);

      this.fastify.log.info({
        voiceId: request.voiceId,
        audioSize: audioBuffer.length,
        duration: estimatedDuration,
      }, 'Áudio gerado com sucesso');

      return {
        success: true,
        audioBuffer,
        duration: estimatedDuration,
      };
    } catch (error: any) {
      this.fastify.log.error({ error, request }, 'Erro ao gerar áudio com ElevenLabs');
      
      const errorMessage = error.response?.data?.detail?.message || 
                          error.response?.statusText || 
                          error.message || 
                          'Erro desconhecido ao gerar áudio';

      return {
        success: false,
        error: `ElevenLabs: ${errorMessage}`,
      };
    }
  }

  /**
   * Converte texto para roteiro de fala
   */
  private convertToSpeechScript(text: string): string {
    let script = text;

    // Remover URLs
    script = script.replace(/https?:\/\/[^\s]+/g, 'link enviado por mensagem');

    // Remover emails
    script = script.replace(/[\w.-]+@[\w.-]+\.\w+/g, 'email enviado por mensagem');

    // Converter números de telefone
    script = script.replace(
      /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,
      'número de telefone informado por escrito'
    );

    // Converter valores monetários
    script = script.replace(/R\$\s?[\d.,]+/g, (match) => {
      const value = match.replace(/[R$\s.]/g, '').replace(',', '.');
      const num = parseFloat(value);
      if (isNaN(num)) return 'valor informado por escrito';

      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)} milhões de reais`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)} mil reais`;
      }
      return `${num} reais`;
    });

    // Converter siglas jurídicas
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

    for (const [acronym, fullName] of Object.entries(legalAcronyms)) {
      script = script.replace(new RegExp(`\\b${acronym}\\b`, 'g'), fullName);
    }

    // Remover caracteres especiais
    script = script.replace(/[*_~`#]/g, '');

    // Adicionar pausas naturais
    script = script.replace(/\. /g, '. ... ');
    script = script.replace(/\? /g, '? ... ');
    script = script.replace(/! /g, '! ... ');

    return script.trim();
  }

  /**
   * Estima duração do áudio em segundos
   */
  private estimateAudioDuration(text: string): number {
    const words = text.split(/\s+/).length;
    const wordsPerSecond = 150 / 60; // ~2.5 palavras por segundo
    return Math.ceil(words / wordsPerSecond);
  }

  /**
   * Verifica se deve responder em áudio
   */
  shouldRespondWithAudio(
    config: {
      enabled: boolean;
      audioResponseProbabilityOnText: string;
      audioResponseProbabilityOnAudio: string;
      audioResponseProbabilityOnMedia: string;
      textOnlyKeywords: string[];
    },
    inputType: 'text' | 'audio' | 'media',
    messageText: string
  ): boolean {
    if (!config.enabled) return false;

    // Verificar blacklist
    const lowerText = messageText.toLowerCase();
    const hasBlacklistedKeyword = config.textOnlyKeywords.some((keyword: string) =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasBlacklistedKeyword) {
      return false;
    }

    // Obter probabilidade baseada no tipo de input
    const probabilityMap: Record<string, number> = {
      'nunca': 0,
      'baixa': 0.25,
      'media': 0.5,
      'alta': 0.75,
      'sempre': 1,
    };

    let probability: string;
    switch (inputType) {
      case 'audio':
        probability = config.audioResponseProbabilityOnAudio;
        break;
      case 'media':
        probability = config.audioResponseProbabilityOnMedia;
        break;
      default:
        probability = config.audioResponseProbabilityOnText;
    }

    return Math.random() < (probabilityMap[probability] || 0);
  }
}
