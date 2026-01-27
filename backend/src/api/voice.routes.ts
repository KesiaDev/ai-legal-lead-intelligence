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
      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - GET /api/voice/config');

        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Log de diagnóstico
      request.log.info({
        tenantId,
        userId: request.user?.id,
        route: request.routerPath,
      }, 'Config endpoint access - GET /api/voice/config');

      // Usar upsert para garantir que sempre existe um registro
      let voiceConfig;
      try {
        voiceConfig = await prisma.voiceConfig.upsert({
          where: { tenantId },
          update: {}, // Não atualizar nada se já existir
          create: {
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
      } catch (dbError: any) {
        // Log detalhado do erro
        fastify.log.error({ 
          tenantId,
          error: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
          stack: dbError.stack,
        }, 'Erro ao fazer upsert de VoiceConfig');
        
        // Se erro for "tabela não existe", retornar erro claro
        if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
          return reply.status(503).send({
            error: 'Tabela não encontrada',
            message: 'O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.',
            code: 'MIGRATION_PENDING',
          });
        }
        
        // Re-throw para ser capturado pelo catch externo
        throw dbError;
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
      // Log detalhado do erro
      fastify.log.error({ 
        tenantId: request.user?.tenantId,
        error: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
        errorName: error.name,
      }, 'Erro ao buscar configuração de voz');
      
      // Tratamento específico para erros comuns
      let errorMessage = error.message || 'Erro interno';
      let statusCode = 500;
      
      // Erro de tabela não existe
      if (error.message?.includes('does not exist') || error.code === 'P2021') {
        statusCode = 503;
        errorMessage = 'Tabela não encontrada. O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.';
      }
      
      // Erro de conexão com banco
      if (error.code === 'P1001' || error.message?.includes('connect')) {
        statusCode = 503;
        errorMessage = 'Erro de conexão com banco de dados. Tente novamente em alguns segundos.';
      }
      
      return reply.status(statusCode).send({
        error: 'Erro ao buscar configuração de voz',
        message: errorMessage,
        code: error.code || 'UNKNOWN',
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
      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - POST /api/voice/config');

        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Log de diagnóstico
      request.log.info({
        tenantId,
        userId: request.user?.id,
        route: request.routerPath,
      }, 'Config endpoint access - POST /api/voice/config');

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

      // Garantir que sempre existe registro usando upsert antes de atualizar
      await prisma.voiceConfig.upsert({
        where: { tenantId },
        update: {}, // Não atualizar nada ainda, só garantir que existe
        create: {
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

      // Buscar configuração existente para mesclar valores
      const existing = await prisma.voiceConfig.findUnique({
        where: { tenantId },
      });

      // Atualizar com os dados recebidos, mantendo valores existentes quando não fornecidos
      const updated = await prisma.voiceConfig.update({
        where: { tenantId },
        data: {
          provider: body.provider !== undefined ? body.provider : existing!.provider,
          elevenlabsApiKey: body.elevenlabsApiKey !== undefined ? body.elevenlabsApiKey : existing!.elevenlabsApiKey,
          voiceId: body.voiceId !== undefined ? body.voiceId : existing!.voiceId,
          voiceName: body.voiceName !== undefined ? body.voiceName : existing!.voiceName,
          audioResponseProbabilityOnText: body.audioResponseProbabilityOnText !== undefined ? body.audioResponseProbabilityOnText : existing!.audioResponseProbabilityOnText,
          audioResponseProbabilityOnAudio: body.audioResponseProbabilityOnAudio !== undefined ? body.audioResponseProbabilityOnAudio : existing!.audioResponseProbabilityOnAudio,
          audioResponseProbabilityOnMedia: body.audioResponseProbabilityOnMedia !== undefined ? body.audioResponseProbabilityOnMedia : existing!.audioResponseProbabilityOnMedia,
          maxAudioDuration: body.maxAudioDuration !== undefined ? body.maxAudioDuration : existing!.maxAudioDuration,
          textToSpeechAdjustment: body.textToSpeechAdjustment !== undefined ? body.textToSpeechAdjustment : existing!.textToSpeechAdjustment,
          textOnlyKeywords: body.textOnlyKeywords !== undefined ? body.textOnlyKeywords : existing!.textOnlyKeywords,
          voiceStability: body.voiceStability !== undefined ? body.voiceStability : existing!.voiceStability,
          voiceSimilarityBoost: body.voiceSimilarityBoost !== undefined ? body.voiceSimilarityBoost : existing!.voiceSimilarityBoost,
          voiceStyle: body.voiceStyle !== undefined ? body.voiceStyle : existing!.voiceStyle,
          voiceSpeed: body.voiceSpeed !== undefined ? body.voiceSpeed : existing!.voiceSpeed,
          enabled: body.enabled !== undefined ? body.enabled : existing!.enabled,
          updatedAt: new Date(),
        },
      });

      fastify.log.info({ tenantId }, 'Configuração de voz atualizada');
      return reply.status(200).send({
        success: true,
        message: 'Configuração de voz atualizada com sucesso',
      });
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
      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - POST /api/voice/test');

        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Log de diagnóstico
      request.log.info({
        tenantId,
        userId: request.user?.id,
        route: request.routerPath,
      }, 'Config endpoint access - POST /api/voice/test');

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

      // Usar upsert para garantir que sempre existe um registro
      const voiceConfig = await prisma.voiceConfig.upsert({
        where: { tenantId },
        update: {}, // Não atualizar nada se já existir
        create: {
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
