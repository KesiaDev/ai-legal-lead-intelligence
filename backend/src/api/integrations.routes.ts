/**
 * Rotas de Configurações de Integração
 * 
 * Gerencia configurações de integração por tenant (OpenAI, N8N, etc.)
 */

import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';

export async function registerIntegrationsRoutes(fastify: FastifyInstance) {
  /**
   * Obter configurações de integração do tenant
   */
  fastify.get('/api/integrations', {
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
      }, 'DEBUG: Request user info - GET /api/integrations');

      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - GET /api/integrations');

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
      }, 'Config endpoint access - GET /api/integrations');

      // Usar upsert para garantir que sempre existe um registro
      let config;
      try {
        config = await fastify.prisma.integrationConfig.upsert({
          where: { tenantId },
          update: {}, // Não atualizar nada se já existir
          create: {
            tenantId,
            openaiApiKey: null,
            n8nWebhookUrl: null,
            evolutionApiUrl: null,
            evolutionApiKey: null,
            evolutionInstance: null,
            zapiInstanceId: null,
            zapiToken: null,
            zapiBaseUrl: 'https://api.z-api.io',
          },
        });
      } catch (dbError: any) {
        // Se erro for "tabela não existe", retornar erro claro
        if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
          fastify.log.error({ tenantId, error: dbError.message }, 'CRÍTICO: Tabela IntegrationConfig não existe');
          return reply.status(503).send({
            error: 'Tabela não encontrada',
            message: 'O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.',
            code: 'MIGRATION_PENDING',
          });
        }
        throw dbError; // Re-throw outros erros
      }

      // Não retornar API keys completas por segurança (apenas indicar se existe)
      return reply.send({
        openaiApiKey: config.openaiApiKey ? '***' + config.openaiApiKey.slice(-4) : null,
        n8nWebhookUrl: config.n8nWebhookUrl || null,
        evolutionApiUrl: config.evolutionApiUrl || null,
        evolutionApiKey: config.evolutionApiKey ? '***' + config.evolutionApiKey.slice(-4) : null,
        evolutionInstance: config.evolutionInstance || null,
        zapiInstanceId: config.zapiInstanceId || null,
        zapiToken: config.zapiToken ? '***' + config.zapiToken.slice(-4) : null,
        zapiBaseUrl: config.zapiBaseUrl || null,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao buscar configurações de integração');
      return reply.status(500).send({
        error: 'Erro ao buscar configurações',
        message: error.message || 'Erro desconhecido',
      });
    }
  });

  /**
   * Atualizar configurações de integração do tenant
   */
  fastify.patch('/api/integrations', {
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
      }, 'DEBUG: Request user info - PATCH /api/integrations');

      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - PATCH /api/integrations');

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
      }, 'Config endpoint access - PATCH /api/integrations');

      const body = request.body as {
        openaiApiKey?: string;
        evolutionApiUrl?: string;
        evolutionApiKey?: string;
        evolutionInstance?: string;
        zapiInstanceId?: string;
        zapiToken?: string;
        zapiBaseUrl?: string;
      };

      // Garantir que sempre existe registro usando upsert antes de atualizar
      try {
        await fastify.prisma.integrationConfig.upsert({
          where: { tenantId },
          update: {}, // Não atualizar nada ainda, só garantir que existe
          create: {
            tenantId,
            openaiApiKey: null,
            n8nWebhookUrl: null,
            evolutionApiUrl: null,
            evolutionApiKey: null,
            evolutionInstance: null,
            zapiInstanceId: null,
            zapiToken: null,
            zapiBaseUrl: 'https://api.z-api.io',
          },
        });
      } catch (dbError: any) {
        // Se erro for "tabela não existe", retornar erro claro
        if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
          fastify.log.error({ tenantId, error: dbError.message }, 'CRÍTICO: Tabela IntegrationConfig não existe no PATCH');
          return reply.status(503).send({
            error: 'Tabela não encontrada',
            message: 'O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.',
            code: 'MIGRATION_PENDING',
          });
        }
        throw dbError; // Re-throw outros erros
      }

      // Atualizar sempre um registro existente
      const updateData: any = {};
      
      // Log detalhado do que está sendo recebido
      fastify.log.info({ 
        tenantId,
        receivedFields: Object.keys(body),
        hasOpenaiKey: !!body.openaiApiKey,
        hasEvolutionKey: !!body.evolutionApiKey,
        hasZapiToken: !!body.zapiToken,
        hasN8nUrl: !!body.n8nWebhookUrl,
      }, 'Recebendo dados para atualizar integrações');
      
      if (body.openaiApiKey !== undefined) {
        updateData.openaiApiKey = body.openaiApiKey === null || body.openaiApiKey === '' ? null : body.openaiApiKey;
        fastify.log.info({ tenantId, hasValue: !!updateData.openaiApiKey, length: updateData.openaiApiKey?.length || 0 }, 'OpenAI API Key será atualizada');
      }
      if (body.evolutionApiUrl !== undefined) {
        updateData.evolutionApiUrl = body.evolutionApiUrl === null || body.evolutionApiUrl === '' ? null : body.evolutionApiUrl;
        fastify.log.info({ tenantId, hasValue: !!updateData.evolutionApiUrl }, 'Evolution API URL será atualizada');
      }
      if (body.evolutionApiKey !== undefined) {
        updateData.evolutionApiKey = body.evolutionApiKey === null || body.evolutionApiKey === '' ? null : body.evolutionApiKey;
        fastify.log.info({ tenantId, hasValue: !!updateData.evolutionApiKey, length: updateData.evolutionApiKey?.length || 0 }, 'Evolution API Key será atualizada');
      }
      if (body.evolutionInstance !== undefined) {
        updateData.evolutionInstance = body.evolutionInstance === null || body.evolutionInstance === '' ? null : body.evolutionInstance;
        fastify.log.info({ tenantId, hasValue: !!updateData.evolutionInstance }, 'Evolution Instance será atualizada');
      }
      if (body.zapiInstanceId !== undefined) {
        updateData.zapiInstanceId = body.zapiInstanceId === null || body.zapiInstanceId === '' ? null : body.zapiInstanceId;
        fastify.log.info({ tenantId, hasValue: !!updateData.zapiInstanceId }, 'Z-API Instance ID será atualizada');
      }
      if (body.zapiToken !== undefined) {
        updateData.zapiToken = body.zapiToken === null || body.zapiToken === '' ? null : body.zapiToken;
        fastify.log.info({ tenantId, hasValue: !!updateData.zapiToken, length: updateData.zapiToken?.length || 0 }, 'Z-API Token será atualizada');
      }
      if (body.zapiBaseUrl !== undefined) {
        updateData.zapiBaseUrl = body.zapiBaseUrl === null || body.zapiBaseUrl === '' ? null : body.zapiBaseUrl;
        fastify.log.info({ tenantId, hasValue: !!updateData.zapiBaseUrl }, 'Z-API Base URL será atualizada');
      }
      
      // Se não há nada para atualizar, retornar sucesso sem fazer update
      if (Object.keys(updateData).length === 0) {
        fastify.log.info({ tenantId }, 'Nenhum campo para atualizar, retornando configuração existente');
        const existingConfig = await fastify.prisma.integrationConfig.findUnique({
          where: { tenantId },
        });
        
        if (!existingConfig) {
          throw new Error('Configuração não encontrada após upsert');
        }
        
        return reply.send({
          success: true,
          message: 'Nenhuma alteração necessária',
          config: {
            openaiApiKey: existingConfig.openaiApiKey ? '***' + existingConfig.openaiApiKey.slice(-4) : null,
            n8nWebhookUrl: existingConfig.n8nWebhookUrl,
            evolutionApiUrl: existingConfig.evolutionApiUrl,
            evolutionApiKey: existingConfig.evolutionApiKey ? '***' + existingConfig.evolutionApiKey.slice(-4) : null,
            evolutionInstance: existingConfig.evolutionInstance,
            zapiInstanceId: existingConfig.zapiInstanceId,
            zapiToken: existingConfig.zapiToken ? '***' + existingConfig.zapiToken.slice(-4) : null,
            zapiBaseUrl: existingConfig.zapiBaseUrl,
          },
        });
      }
      
      // Tentar atualizar com tratamento de erro específico
      let config;
      try {
        fastify.log.info({ 
          tenantId, 
          updateFields: Object.keys(updateData),
          updateDataKeys: Object.keys(updateData),
        }, 'Tentando atualizar IntegrationConfig');
        
        config = await fastify.prisma.integrationConfig.update({
          where: { tenantId },
          data: updateData,
        });
        
        fastify.log.info({ tenantId, success: true }, 'Update de IntegrationConfig bem-sucedido');
      } catch (updateError: any) {
        // Log detalhado do erro de update
        fastify.log.error({ 
          tenantId,
          error: updateError.message,
          code: updateError.code,
          meta: updateError.meta,
          stack: updateError.stack,
          updateDataKeys: Object.keys(updateData),
          updateData,
        }, 'ERRO ESPECÍFICO ao fazer update de IntegrationConfig');
        
        // Se erro for "record not found", tentar criar novamente
        if (updateError.code === 'P2025') {
          fastify.log.warn({ tenantId }, 'Registro não encontrado no update, tentando criar novamente');
          try {
            config = await fastify.prisma.integrationConfig.create({
              data: {
                tenantId,
                ...updateData,
                openaiApiKey: updateData.openaiApiKey ?? null,
                n8nWebhookUrl: updateData.n8nWebhookUrl ?? null,
                evolutionApiUrl: updateData.evolutionApiUrl ?? null,
                evolutionApiKey: updateData.evolutionApiKey ?? null,
                evolutionInstance: updateData.evolutionInstance ?? null,
                zapiInstanceId: updateData.zapiInstanceId ?? null,
                zapiToken: updateData.zapiToken ?? null,
                zapiBaseUrl: updateData.zapiBaseUrl ?? 'https://api.z-api.io',
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

      // Log detalhado do que foi salvo (sem mostrar valores completos por segurança)
      fastify.log.info({ 
        tenantId,
        savedFields: Object.keys(updateData).filter(k => k !== 'updatedAt'),
        hasOpenaiKey: !!config.openaiApiKey,
        hasEvolutionKey: !!config.evolutionApiKey,
        hasZapiToken: !!config.zapiToken,
        hasN8nUrl: !!config.n8nWebhookUrl,
        hasEvolutionUrl: !!config.evolutionApiUrl,
        hasEvolutionInstance: !!config.evolutionInstance,
        hasZapiInstanceId: !!config.zapiInstanceId,
      }, 'Configurações de integração atualizadas com sucesso');

      return reply.send({
        success: true,
        message: 'Configurações salvas com sucesso',
        // Não retornar API keys completas
        config: {
          openaiApiKey: config.openaiApiKey ? '***' + config.openaiApiKey.slice(-4) : null,
          evolutionApiUrl: config.evolutionApiUrl,
          evolutionApiKey: config.evolutionApiKey ? '***' + config.evolutionApiKey.slice(-4) : null,
          evolutionInstance: config.evolutionInstance,
          zapiInstanceId: config.zapiInstanceId,
          zapiToken: config.zapiToken ? '***' + config.zapiToken.slice(-4) : null,
          zapiBaseUrl: config.zapiBaseUrl,
        },
      });
    } catch (error: any) {
      // Log detalhado do erro
      fastify.log.error({ 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        meta: error.meta,
        tenantId,
        errorName: error.name,
      }, 'Erro ao salvar configurações de integração');
      
      // Tratamento específico para erros comuns
      let errorMessage = error.message || 'Erro desconhecido';
      let statusCode = 500;
      
      // Erro de tabela não existe (Prisma Client desatualizado)
      if (error.message?.includes('does not exist') || 
          error.code === 'P2021' || 
          error.message?.includes('Unknown table') ||
          error.meta?.target?.includes('IntegrationConfig')) {
        statusCode = 503;
        errorMessage = 'Tabela não encontrada. O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.';
        fastify.log.error({ tenantId }, 'CRÍTICO: Tabela IntegrationConfig não existe - backend precisa reiniciar');
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
      
      return reply.status(statusCode).send({
        error: 'Erro ao salvar configurações',
        message: errorMessage,
        code: error.code || 'UNKNOWN',
        // Não expor stack em produção
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  });

  /**
   * Endpoint de verificação - retorna status dos tokens salvos (sem valores completos)
   */
  fastify.get('/api/integrations/verify', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Usar upsert para garantir que sempre existe um registro
      const config = await fastify.prisma.integrationConfig.upsert({
        where: { tenantId },
        update: {}, // Não atualizar nada se já existir
        create: {
          tenantId,
          openaiApiKey: null,
          n8nWebhookUrl: null,
          evolutionApiUrl: null,
          evolutionApiKey: null,
          evolutionInstance: null,
          zapiInstanceId: null,
          zapiToken: null,
          zapiBaseUrl: 'https://api.z-api.io',
        },
      });

      return reply.send({
        success: true,
        message: 'Configurações encontradas',
        status: {
          openai: { 
            saved: true, 
            hasValue: !!config.openaiApiKey,
            preview: config.openaiApiKey ? `***${config.openaiApiKey.slice(-4)}` : null,
          },
          n8n: { 
            saved: true, 
            hasValue: !!config.n8nWebhookUrl,
            preview: config.n8nWebhookUrl || null,
          },
          evolution: { 
            saved: true, 
            hasValue: !!(config.evolutionApiKey && config.evolutionApiUrl && config.evolutionInstance),
            preview: {
              url: config.evolutionApiUrl || null,
              instance: config.evolutionInstance || null,
              key: config.evolutionApiKey ? `***${config.evolutionApiKey.slice(-4)}` : null,
            },
          },
          zapi: { 
            saved: true, 
            hasValue: !!(config.zapiInstanceId && config.zapiToken),
            preview: {
              instanceId: config.zapiInstanceId || null,
              token: config.zapiToken ? `***${config.zapiToken.slice(-4)}` : null,
              baseUrl: config.zapiBaseUrl || null,
            },
          },
        },
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao verificar configurações de integração');
      return reply.status(500).send({
        error: 'Erro ao verificar configurações',
        message: error.message || 'Erro desconhecido',
      });
    }
  });
}
