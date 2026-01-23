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
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      let config;
      try {
        config = await fastify.prisma.integrationConfig.findUnique({
          where: { tenantId },
        });
      } catch (dbError: any) {
        // Se a tabela não existir, retornar null (migration não aplicada)
        if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.code === '42P01') {
          fastify.log.warn({ tenantId, error: dbError.message }, 'Tabela IntegrationConfig não existe ainda');
          return reply.send({
            openaiApiKey: null,
            n8nWebhookUrl: null,
            evolutionApiUrl: null,
            evolutionApiKey: null,
            evolutionInstance: null,
            zapiInstanceId: null,
            zapiToken: null,
            zapiBaseUrl: null,
          });
        }
        throw dbError;
      }

      // Não retornar API keys completas por segurança (apenas indicar se existe)
      return reply.send({
        openaiApiKey: config?.openaiApiKey ? '***' + config.openaiApiKey.slice(-4) : null,
        n8nWebhookUrl: config?.n8nWebhookUrl || null,
        evolutionApiUrl: config?.evolutionApiUrl || null,
        evolutionApiKey: config?.evolutionApiKey ? '***' + config.evolutionApiKey.slice(-4) : null,
        evolutionInstance: config?.evolutionInstance || null,
        zapiInstanceId: config?.zapiInstanceId || null,
        zapiToken: config?.zapiToken ? '***' + config.zapiToken.slice(-4) : null,
        zapiBaseUrl: config?.zapiBaseUrl || null,
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
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      const body = request.body as {
        openaiApiKey?: string;
        n8nWebhookUrl?: string;
        evolutionApiUrl?: string;
        evolutionApiKey?: string;
        evolutionInstance?: string;
        zapiInstanceId?: string;
        zapiToken?: string;
        zapiBaseUrl?: string;
      };

      // Verificar se já existe configuração
      let existing;
      try {
        existing = await fastify.prisma.integrationConfig.findUnique({
          where: { tenantId },
        });
      } catch (dbError: any) {
        // Se a tabela não existir, criar a primeira vez
        if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.code === '42P01') {
          fastify.log.warn({ tenantId, error: dbError.message }, 'Tabela IntegrationConfig não existe ainda, criando...');
          existing = null;
        } else {
          throw dbError;
        }
      }

      let config;
      try {
        if (existing) {
          // Atualizar existente
          // IMPORTANTE: Se openaiApiKey for null explicitamente, limpar o campo
          const updateData: any = {
            updatedAt: new Date(),
          };
          
          if (body.openaiApiKey !== undefined) {
            updateData.openaiApiKey = body.openaiApiKey === null || body.openaiApiKey === '' ? null : body.openaiApiKey;
          }
          if (body.n8nWebhookUrl !== undefined) {
            updateData.n8nWebhookUrl = body.n8nWebhookUrl || null;
          }
          if (body.evolutionApiUrl !== undefined) {
            updateData.evolutionApiUrl = body.evolutionApiUrl || null;
          }
          if (body.evolutionApiKey !== undefined) {
            updateData.evolutionApiKey = body.evolutionApiKey || null;
          }
          if (body.evolutionInstance !== undefined) {
            updateData.evolutionInstance = body.evolutionInstance || null;
          }
          if (body.zapiInstanceId !== undefined) {
            updateData.zapiInstanceId = body.zapiInstanceId || null;
          }
          if (body.zapiToken !== undefined) {
            updateData.zapiToken = body.zapiToken || null;
          }
          if (body.zapiBaseUrl !== undefined) {
            updateData.zapiBaseUrl = body.zapiBaseUrl || null;
          }
          
          config = await fastify.prisma.integrationConfig.update({
            where: { tenantId },
            data: updateData,
          });
        } else {
          // Criar novo
          config = await fastify.prisma.integrationConfig.create({
            data: {
              tenantId,
              openaiApiKey: body.openaiApiKey || null,
              n8nWebhookUrl: body.n8nWebhookUrl || null,
              evolutionApiUrl: body.evolutionApiUrl || null,
              evolutionApiKey: body.evolutionApiKey || null,
              evolutionInstance: body.evolutionInstance || null,
              zapiInstanceId: body.zapiInstanceId || null,
              zapiToken: body.zapiToken || null,
              zapiBaseUrl: body.zapiBaseUrl || null,
            },
          });
        }
      } catch (dbError: any) {
        // Se der erro ao criar/atualizar, pode ser que a tabela ainda não foi reconhecida pelo Prisma
        if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.code === '42P01' || dbError.code === 'P2025') {
          fastify.log.error({ tenantId, error: dbError.message }, 'Tabela IntegrationConfig não reconhecida pelo Prisma após migration. Tente regenerar o Prisma Client.');
          return reply.status(503).send({
            error: 'Tabela não reconhecida',
            message: 'A migration foi aplicada, mas o Prisma Client precisa ser regenerado. Aguarde alguns minutos e tente novamente.',
            suggestion: 'O backend precisa ser reiniciado para reconhecer as novas tabelas.',
          });
        }
        // Outros erros de banco
        fastify.log.error({ tenantId, error: dbError }, 'Erro ao salvar IntegrationConfig');
        throw dbError;
      }

      fastify.log.info({ tenantId }, 'Configurações de integração atualizadas');

      return reply.send({
        success: true,
        message: 'Configurações salvas com sucesso',
        // Não retornar API keys completas
        config: {
          openaiApiKey: config.openaiApiKey ? '***' + config.openaiApiKey.slice(-4) : null,
          n8nWebhookUrl: config.n8nWebhookUrl,
          evolutionApiUrl: config.evolutionApiUrl,
          evolutionApiKey: config.evolutionApiKey ? '***' + config.evolutionApiKey.slice(-4) : null,
          evolutionInstance: config.evolutionInstance,
          zapiInstanceId: config.zapiInstanceId,
          zapiToken: config.zapiToken ? '***' + config.zapiToken.slice(-4) : null,
          zapiBaseUrl: config.zapiBaseUrl,
        },
      });
    } catch (error: any) {
      fastify.log.error({ 
        error: error.message, 
        stack: error.stack,
        code: error.code,
        meta: error.meta,
        tenantId 
      }, 'Erro ao salvar configurações de integração');
      
      // Mensagem de erro mais específica
      let errorMessage = error.message || 'Erro desconhecido';
      
      // Se for erro de tabela não encontrada
      if (error.message?.includes('does not exist') || 
          error.message?.includes('relation') || 
          error.code === '42P01' || 
          error.code === 'P2025') {
        errorMessage = 'Tabela IntegrationConfig não existe. A migration foi aplicada, mas o Prisma Client precisa ser regenerado. Reinicie o backend no Railway.';
      }
      
      // Se for erro de Prisma Client
      if (error.code === 'P2002' || error.message?.includes('Unique constraint')) {
        errorMessage = 'Já existe uma configuração para este tenant. Tente atualizar em vez de criar.';
      }
      
      return reply.status(500).send({
        error: 'Erro ao salvar configurações',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          code: error.code,
          meta: error.meta,
          stack: error.stack,
        } : undefined,
      });
    }
  });
}
