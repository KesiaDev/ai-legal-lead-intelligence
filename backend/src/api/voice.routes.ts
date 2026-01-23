/**
 * Rotas de API para Gerenciamento de Configurações de Voz
 * 
 * Permite que o frontend salve, carregue e gerencie as configurações de voz do agente IA.
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

export async function registerVoiceRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;

  /**
   * Obter configuração de voz do tenant
   */
  fastify.get('/api/voice/config', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      // Buscar configuração existente
      let voiceConfig = await prisma.voiceConfig.findUnique({
        where: { tenantId },
      });

      // Se não existir, criar automaticamente com valores default
      if (!voiceConfig) {
        fastify.log.info({ tenantId }, 'Criando VoiceConfig automaticamente para o tenant');
        voiceConfig = await prisma.voiceConfig.create({
          data: {
            tenantId,
            provider: 'elevenlabs',
            elevenlabsApiKey: null,
            voiceId: 'EXAVITQu4vr4xnSDxMaL',
            voiceName: 'Sarah - Profissional Feminina',
            audioResponseProbabilityOnText: 'nunca',
            audioResponseProbabilityOnAudio: 'alta',
            audioResponseProbabilityOnMedia: 'baixa',
            maxAudioDuration: 60,
            textToSpeechAdjustment: 'moderado',
            textOnlyKeywords: [],
            voiceStability: 0.5,
            voiceSimilarityBoost: 0.75,
            voiceStyle: 0.3,
            voiceSpeed: 1.0,
            enabled: false,
          },
        });
      }

      return reply.status(200).send({
        config: {
          id: voiceConfig.id,
          provider: voiceConfig.provider,
          voiceId: voiceConfig.voiceId,
          voiceName: voiceConfig.voiceName,
          audioResponseProbabilityOnText: voiceConfig.audioResponseProbabilityOnText,
          audioResponseProbabilityOnAudio: voiceConfig.audioResponseProbabilityOnAudio,
          audioResponseProbabilityOnMedia: voiceConfig.audioResponseProbabilityOnMedia,
          maxAudioDuration: voiceConfig.maxAudioDuration,
          textToSpeechAdjustment: voiceConfig.textToSpeechAdjustment,
          textOnlyKeywords: (voiceConfig.textOnlyKeywords as string[]) || [],
          voiceStability: voiceConfig.voiceStability,
          voiceSimilarityBoost: voiceConfig.voiceSimilarityBoost,
          voiceStyle: voiceConfig.voiceStyle,
          voiceSpeed: voiceConfig.voiceSpeed,
          enabled: voiceConfig.enabled,
          // Não retornar API key por segurança
        },
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao buscar configuração de voz');
      return reply.status(500).send({
        error: 'Erro ao buscar configuração de voz',
        message: error.message || 'Erro interno',
      });
    }
  });

  /**
   * Salvar ou atualizar configuração de voz
   */
  fastify.post('/api/voice/config', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      const body = request.body as {
        provider?: string;
        elevenlabsApiKey?: string;
        voiceId?: string;
        voiceName?: string;
        audioResponseProbabilityOnText?: string;
        audioResponseProbabilityOnAudio?: string;
        audioResponseProbabilityOnMedia?: string;
        maxAudioDuration?: number;
        textToSpeechAdjustment?: string;
        textOnlyKeywords?: string[];
        voiceStability?: number;
        voiceSimilarityBoost?: number;
        voiceStyle?: number;
        voiceSpeed?: number;
        enabled?: boolean;
      };

      // Verificar se já existe
      let existing = null;
      try {
        existing = await prisma.voiceConfig.findUnique({
          where: { tenantId },
        });
      } catch (dbError: any) {
        // Se a tabela não existir, criar a primeira vez
        if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.code === '42P01' || dbError.code === 'P2025') {
          fastify.log.warn({ tenantId, error: dbError.message }, 'Tabela VoiceConfig não existe ainda, criando...');
          existing = null;
        } else {
          throw dbError;
        }
      }

      if (existing) {
        // Atualizar
        const updated = await prisma.voiceConfig.update({
          where: { tenantId },
          data: {
            provider: body.provider || existing.provider,
            elevenlabsApiKey: body.elevenlabsApiKey !== undefined ? body.elevenlabsApiKey : existing.elevenlabsApiKey,
            voiceId: body.voiceId || existing.voiceId,
            voiceName: body.voiceName || existing.voiceName,
            audioResponseProbabilityOnText: body.audioResponseProbabilityOnText || existing.audioResponseProbabilityOnText,
            audioResponseProbabilityOnAudio: body.audioResponseProbabilityOnAudio || existing.audioResponseProbabilityOnAudio,
            audioResponseProbabilityOnMedia: body.audioResponseProbabilityOnMedia || existing.audioResponseProbabilityOnMedia,
            maxAudioDuration: body.maxAudioDuration !== undefined ? body.maxAudioDuration : existing.maxAudioDuration,
            textToSpeechAdjustment: body.textToSpeechAdjustment || existing.textToSpeechAdjustment,
            textOnlyKeywords: body.textOnlyKeywords !== undefined ? body.textOnlyKeywords : existing.textOnlyKeywords,
            voiceStability: body.voiceStability !== undefined ? body.voiceStability : existing.voiceStability,
            voiceSimilarityBoost: body.voiceSimilarityBoost !== undefined ? body.voiceSimilarityBoost : existing.voiceSimilarityBoost,
            voiceStyle: body.voiceStyle !== undefined ? body.voiceStyle : existing.voiceStyle,
            voiceSpeed: body.voiceSpeed !== undefined ? body.voiceSpeed : existing.voiceSpeed,
            enabled: body.enabled !== undefined ? body.enabled : existing.enabled,
            updatedAt: new Date(),
          },
        });

        fastify.log.info({ tenantId }, 'Configuração de voz atualizada');
        return reply.status(200).send({
          success: true,
          message: 'Configuração de voz atualizada com sucesso',
        });
      } else {
        // Criar nova
        const created = await prisma.voiceConfig.create({
          data: {
            tenantId,
            provider: body.provider || 'elevenlabs',
            elevenlabsApiKey: body.elevenlabsApiKey || null,
            voiceId: body.voiceId || 'EXAVITQu4vr4xnSDxMaL',
            voiceName: body.voiceName || 'Sarah - Profissional Feminina',
            audioResponseProbabilityOnText: body.audioResponseProbabilityOnText || 'nunca',
            audioResponseProbabilityOnAudio: body.audioResponseProbabilityOnAudio || 'alta',
            audioResponseProbabilityOnMedia: body.audioResponseProbabilityOnMedia || 'baixa',
            maxAudioDuration: body.maxAudioDuration || 60,
            textToSpeechAdjustment: body.textToSpeechAdjustment || 'moderado',
            textOnlyKeywords: body.textOnlyKeywords || [],
            voiceStability: body.voiceStability || 0.5,
            voiceSimilarityBoost: body.voiceSimilarityBoost || 0.75,
            voiceStyle: body.voiceStyle || 0.3,
            voiceSpeed: body.voiceSpeed || 1.0,
            enabled: body.enabled || false,
          },
        });

        fastify.log.info({ tenantId }, 'Configuração de voz criada');
        return reply.status(201).send({
          success: true,
          message: 'Configuração de voz criada com sucesso',
        });
      }
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao salvar configuração de voz');
      return reply.status(500).send({
        error: 'Erro ao salvar configuração de voz',
        message: error.message || 'Erro interno',
      });
    }
  });

  /**
   * Testar geração de áudio (sem salvar)
   */
  fastify.post('/api/voice/test', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const { text, voiceId, apiKey } = request.body as {
        text: string;
        voiceId?: string;
        apiKey?: string;
      };

      if (!text) {
        return reply.status(400).send({
          error: 'Texto é obrigatório',
        });
      }

      // Buscar configuração ou usar parâmetros fornecidos
      const voiceConfig = await prisma.voiceConfig.findUnique({
        where: { tenantId },
      });

      const testApiKey = apiKey || voiceConfig?.elevenlabsApiKey;
      const testVoiceId = voiceId || voiceConfig?.voiceId || 'EXAVITQu4vr4xnSDxMaL';

      if (!testApiKey) {
        return reply.status(400).send({
          error: 'API Key do ElevenLabs não configurada',
        });
      }

      // Importar serviço dinamicamente
      const { ElevenLabsService } = await import('../services/elevenlabs.service');
      const elevenlabsService = new ElevenLabsService(fastify);

      const result = await elevenlabsService.generateVoice(testApiKey, {
        text,
        voiceId: testVoiceId,
        settings: {
          stability: voiceConfig?.voiceStability || 0.5,
          similarityBoost: voiceConfig?.voiceSimilarityBoost || 0.75,
          style: voiceConfig?.voiceStyle || 0.3,
          speed: voiceConfig?.voiceSpeed || 1.0,
        },
      });

      if (!result.success) {
        return reply.status(400).send({
          error: result.error || 'Erro ao gerar áudio',
        });
      }

      // Retornar áudio como base64
      const audioBase64 = result.audioBuffer?.toString('base64');

      return reply.status(200).send({
        success: true,
        audioBase64,
        duration: result.duration,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao testar geração de áudio');
      return reply.status(500).send({
        error: 'Erro ao testar geração de áudio',
        message: error.message || 'Erro interno',
      });
    }
  });
}
