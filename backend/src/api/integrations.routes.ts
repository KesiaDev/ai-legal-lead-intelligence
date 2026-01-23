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

      const config = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

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
      const existing = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      let config;
      if (existing) {
        // Atualizar existente
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
      
      return reply.status(500).send({
        error: 'Erro ao salvar configurações',
        message: error.message || 'Erro desconhecido',
      });
    }
  });
}
