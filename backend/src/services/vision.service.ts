/**
 * Vision Service — Leitura de imagens via IA
 * Baixa imagens da Evolution API e descreve em português
 * Suporta OpenAI GPT-4o-mini e Anthropic Claude (multimodal)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { FastifyInstance } from 'fastify';

const IMAGE_PROMPT =
  'Você é assistente de um escritório de advocacia. Descreva esta imagem em português de forma concisa e objetiva, focando em informações juridicamente relevantes. Se for um documento, identifique o tipo e destaque campos importantes (nome, datas, valores, nº processo). Se for uma foto de situação (acidente, imóvel, etc.), descreva o contexto. Máximo 3 linhas.';

export class VisionService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Descreve uma imagem a partir de URL da Evolution API
   * Tenta OpenAI Vision, depois Anthropic, depois retorna null
   */
  async describeImageFromUrl(
    imageUrl: string,
    evolutionApiKey: string,
    openaiApiKey?: string,
    anthropicApiKey?: string,
  ): Promise<string | null> {
    try {
      // Baixar imagem da Evolution API
      const imgResponse = await fetch(imageUrl, {
        headers: { apikey: evolutionApiKey },
      });

      if (!imgResponse.ok) {
        this.fastify.log.warn({ status: imgResponse.status }, 'Falha ao baixar imagem');
        return null;
      }

      const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
      const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
      const base64 = imgBuffer.toString('base64');

      // Tentar Anthropic primeiro (claude-haiku é rápido e barato)
      if (anthropicApiKey) {
        try {
          const result = await this.describeWithAnthropic(base64, contentType, anthropicApiKey);
          if (result) return result;
        } catch (err: any) {
          this.fastify.log.warn({ err: err.message }, 'Falha no Anthropic Vision, tentando OpenAI');
        }
      }

      // Fallback para OpenAI GPT-4o-mini
      if (openaiApiKey) {
        try {
          const result = await this.describeWithOpenAI(base64, contentType, openaiApiKey);
          if (result) return result;
        } catch (err: any) {
          this.fastify.log.warn({ err: err.message }, 'Falha no OpenAI Vision');
        }
      }

      return null;
    } catch (err: any) {
      this.fastify.log.error({ err: err.message }, 'Erro ao processar imagem');
      return null;
    }
  }

  private async describeWithAnthropic(base64: string, mimeType: string, apiKey: string): Promise<string | null> {
    const validMime = (mimeType.split(';')[0].trim()) as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: validMime, data: base64 } },
          { type: 'text', text: IMAGE_PROMPT },
        ],
      }],
    });

    const text = (response.content[0] as any).text?.trim();
    if (text) this.fastify.log.info('Imagem descrita via Anthropic Vision');
    return text || null;
  }

  private async describeWithOpenAI(base64: string, mimeType: string, apiKey: string): Promise<string | null> {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' } },
          { type: 'text', text: IMAGE_PROMPT },
        ],
      }],
    });

    const text = response.choices[0].message.content?.trim();
    if (text) this.fastify.log.info('Imagem descrita via OpenAI Vision');
    return text || null;
  }
}
