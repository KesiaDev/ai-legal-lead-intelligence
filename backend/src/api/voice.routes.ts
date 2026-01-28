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
      // DEBUG: Log detalhado do request.user
      request.log.info({
        hasUser: !!request.user,
        userId: request.user?.id,
        tenantId: request.user?.tenantId,
        userObject: request.user,
        route: request.routerPath,
        authHeader: request.headers.authorization ? 'present' : 'missing',
      }, 'DEBUG: Request user info - GET /api/voice/config');

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
      // DEBUG: Log detalhado do request.user
      request.log.info({
        hasUser: !!request.user,
        userId: request.user?.id,
        tenantId: request.user?.tenantId,
        userObject: request.user,
        route: request.routerPath,
        authHeader: request.headers.authorization ? 'present' : 'missing',
      }, 'DEBUG: Request user info - POST /api/voice/config');

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

      if (!existing) {
        throw new Error('Configuração não encontrada após upsert');
      }

      // Construir objeto de atualização apenas com campos fornecidos
      const updateData: any = {};
      
      if (body.provider !== undefined) updateData.provider = body.provider;
      if (body.elevenlabsApiKey !== undefined) updateData.elevenlabsApiKey = body.elevenlabsApiKey === null || body.elevenlabsApiKey === '' ? null : body.elevenlabsApiKey;
      if (body.voiceId !== undefined) updateData.voiceId = body.voiceId;
      if (body.voiceName !== undefined) updateData.voiceName = body.voiceName;
      if (body.audioResponseProbabilityOnText !== undefined) updateData.audioResponseProbabilityOnText = body.audioResponseProbabilityOnText;
      if (body.audioResponseProbabilityOnAudio !== undefined) updateData.audioResponseProbabilityOnAudio = body.audioResponseProbabilityOnAudio;
      if (body.audioResponseProbabilityOnMedia !== undefined) updateData.audioResponseProbabilityOnMedia = body.audioResponseProbabilityOnMedia;
      if (body.maxAudioDuration !== undefined) updateData.maxAudioDuration = body.maxAudioDuration;
      if (body.textToSpeechAdjustment !== undefined) updateData.textToSpeechAdjustment = body.textToSpeechAdjustment;
      if (body.textOnlyKeywords !== undefined) updateData.textOnlyKeywords = body.textOnlyKeywords;
      if (body.voiceStability !== undefined) updateData.voiceStability = body.voiceStability;
      if (body.voiceSimilarityBoost !== undefined) updateData.voiceSimilarityBoost = body.voiceSimilarityBoost;
      if (body.voiceStyle !== undefined) updateData.voiceStyle = body.voiceStyle;
      if (body.voiceSpeed !== undefined) updateData.voiceSpeed = body.voiceSpeed;
      if (body.enabled !== undefined) updateData.enabled = body.enabled;

      // Se não há nada para atualizar, retornar sucesso
      if (Object.keys(updateData).length === 0) {
        fastify.log.info({ tenantId }, 'Nenhum campo para atualizar, retornando configuração existente');
        return reply.status(200).send({
          success: true,
          message: 'Nenhuma alteração necessária',
        });
      }

      // Tentar atualizar com tratamento de erro específico
      let updated;
      try {
        fastify.log.info({ 
          tenantId, 
          updateFields: Object.keys(updateData),
        }, 'Tentando atualizar VoiceConfig');
        
        updated = await prisma.voiceConfig.update({
          where: { tenantId },
          data: updateData,
        });
        
        fastify.log.info({ tenantId, success: true }, 'Update de VoiceConfig bem-sucedido');
      } catch (updateError: any) {
        // Log detalhado do erro de update
        fastify.log.error({ 
          tenantId,
          error: updateError.message,
          code: updateError.code,
          meta: updateError.meta,
          stack: updateError.stack,
          updateDataKeys: Object.keys(updateData),
        }, 'ERRO ESPECÍFICO ao fazer update de VoiceConfig');
        
        // Se erro for "record not found", tentar criar novamente
        if (updateError.code === 'P2025') {
          fastify.log.warn({ tenantId }, 'Registro não encontrado no update, tentando criar novamente');
          try {
            updated = await prisma.voiceConfig.create({
              data: {
                tenantId,
                provider: updateData.provider ?? 'elevenlabs',
                elevenlabsApiKey: updateData.elevenlabsApiKey ?? null,
                voiceId: updateData.voiceId ?? 'EXAVITQu4vr4xnSDxMaL',
                voiceName: updateData.voiceName ?? 'Sarah - Profissional Feminina',
                audioResponseProbabilityOnText: updateData.audioResponseProbabilityOnText ?? 'nunca',
                audioResponseProbabilityOnAudio: updateData.audioResponseProbabilityOnAudio ?? 'alta',
                audioResponseProbabilityOnMedia: updateData.audioResponseProbabilityOnMedia ?? 'baixa',
                maxAudioDuration: updateData.maxAudioDuration ?? 60,
                textToSpeechAdjustment: updateData.textToSpeechAdjustment ?? 'moderado',
                textOnlyKeywords: updateData.textOnlyKeywords ?? [],
                voiceStability: updateData.voiceStability ?? 0.5,
                voiceSimilarityBoost: updateData.voiceSimilarityBoost ?? 0.75,
                voiceStyle: updateData.voiceStyle ?? 0.3,
                voiceSpeed: updateData.voiceSpeed ?? 1.0,
                enabled: updateData.enabled ?? false,
              },
            });
            fastify.log.info({ tenantId }, 'Registro criado com sucesso após falha no update');
          } catch (createError: any) {
            fastify.log.error({ 
              tenantId,
              error: createError.message,
              code: createError.code,
            }, 'Erro ao criar registro após falha no update');
            throw createError;
          }
        } else {
          // Re-throw para ser capturado pelo catch externo
          throw updateError;
        }
      }

      fastify.log.info({ tenantId }, 'Configuração de voz atualizada');
      return reply.status(200).send({
        success: true,
        message: 'Configuração de voz atualizada com sucesso',
      });
    } catch (error: any) {
      // Log detalhado do erro
      fastify.log.error({ 
        tenantId: request.user?.tenantId,
        error: error.message, 
        stack: error.stack,
        code: error.code,
        meta: error.meta,
        errorName: error.name,
      }, 'Erro ao salvar configuração de voz');
      
      // Tratamento específico para erros comuns
      let errorMessage = error.message || 'Erro desconhecido';
      let statusCode = 500;
      
      // Erro de tabela não existe (Prisma Client desatualizado)
      if (error.message?.includes('does not exist') || 
          error.code === 'P2021' || 
          error.message?.includes('Unknown table') ||
          error.meta?.target?.includes('VoiceConfig')) {
        statusCode = 503;
        errorMessage = 'Tabela não encontrada. O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.';
        fastify.log.error({ tenantId: request.user?.tenantId }, 'CRÍTICO: Tabela VoiceConfig não existe - backend precisa reiniciar');
      }
      
      // Erro de constraint (tenantId duplicado, etc)
      if (error.code === 'P2002') {
        statusCode = 409;
        errorMessage = 'Já existe uma configuração para este tenant. Tente atualizar em vez de criar.';
      }
      
      // Erro de conexão com banco
      if (error.code === 'P1001' || error.message?.includes('connect')) {
        statusCode = 503;
        errorMessage = 'Erro de conexão com banco de dados. Tente novamente em alguns segundos.';
      }
      
      // Erro de registro não encontrado
      if (error.code === 'P2025') {
        statusCode = 404;
        errorMessage = 'Configuração não encontrada. Tente recarregar a página.';
      }
      
      return reply.status(statusCode).send({
        error: 'Erro ao salvar configuração de voz',
        message: errorMessage,
        code: error.code || 'UNKNOWN',
        // Não expor stack em produção
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
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
