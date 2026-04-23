/**
 * Whisper Service — Transcrição de áudio via OpenAI Whisper
 * Baixa o áudio da Evolution API e transcreve para texto em português
 */

import OpenAI, { toFile } from 'openai';
import { FastifyInstance } from 'fastify';

export class WhisperService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Transcreve áudio a partir de uma URL da Evolution API
   * @param audioUrl URL do áudio na Evolution API
   * @param evolutionApiKey API Key para autenticar o download
   * @param openaiApiKey API Key da OpenAI para o Whisper
   * @returns Texto transcrito ou null se falhar
   */
  async transcribeFromUrl(
    audioUrl: string,
    evolutionApiKey: string,
    openaiApiKey: string,
  ): Promise<string | null> {
    try {
      // Baixar áudio da Evolution API (requer autenticação)
      const audioResponse = await fetch(audioUrl, {
        headers: { apikey: evolutionApiKey },
      });

      if (!audioResponse.ok) {
        this.fastify.log.warn(
          { status: audioResponse.status, url: audioUrl },
          'Falha ao baixar áudio para transcrição',
        );
        return null;
      }

      const contentType = audioResponse.headers.get('content-type') || 'audio/ogg';
      const extension = contentType.includes('mp4') ? 'mp4'
        : contentType.includes('mpeg') ? 'mp3'
        : contentType.includes('webm') ? 'webm'
        : 'ogg';

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

      // Usar toFile do SDK OpenAI — sem escrever em disco
      const audioFile = await toFile(audioBuffer, `audio.${extension}`, { type: contentType });

      const openai = new OpenAI({ apiKey: openaiApiKey });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'text',
      });

      const text = (transcription as unknown as string).trim();
      this.fastify.log.info({ chars: text.length }, 'Áudio transcrito com Whisper');
      return text || null;
    } catch (err: any) {
      this.fastify.log.error({ err: err.message }, 'Erro na transcrição de áudio');
      return null;
    }
  }
}
