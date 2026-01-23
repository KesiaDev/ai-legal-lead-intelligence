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

      // Buscar configuração existente
      let config = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      // Se não existir, criar automaticamente com todos os campos null/default
      if (!config) {
        fastify.log.info({ tenantId }, 'Criando IntegrationConfig automaticamente para o tenant');
        config = await fastify.prisma.integrationConfig.create({
          data: {
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
        n8nWebhookUrl?: string;
        evolutionApiUrl?: string;
        evolutionApiKey?: string;
        evolutionInstance?: string;
        zapiInstanceId?: string;
        zapiToken?: string;
        zapiBaseUrl?: string;
      };

      // Verificar se já existe configuração, criar se não existir
      let existing = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      // Garantir que sempre existe registro antes de atualizar
      if (!existing) {
        fastify.log.info({ tenantId }, 'Criando IntegrationConfig automaticamente antes de atualizar');
        existing = await fastify.prisma.integrationConfig.create({
          data: {
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
      }

      // Atualizar sempre um registro existente
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
      
      const config = await fastify.prisma.integrationConfig.update({
        where: { tenantId },
        data: updateData,
      });

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
