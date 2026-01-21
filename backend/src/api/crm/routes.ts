import { FastifyInstance } from 'fastify';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

/**
 * Registra todas as rotas de integração CRM
 */
export async function registerCrmRoutes(fastify: FastifyInstance) {
  // Listar integrações CRM
  fastify.get('/api/crm/integrations', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const integrations = await prisma.crmIntegration.findMany({
        where: {
          tenantId: userTenantId,
        },
        select: {
          id: true,
          type: true,
          name: true,
          isActive: true,
          syncDirection: true,
          autoSync: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
          // Não retornar credenciais
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        integrations,
        total: integrations.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar integrações',
        message: errorMessage,
      });
    }
  });

  // Criar integração CRM
  fastify.post('/api/crm/integrations', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const {
        type,
        name,
        apiKey,
        apiSecret,
        apiUrl,
        workspaceId,
        syncDirection,
        autoSync,
        syncInterval,
        fieldMapping,
      } = request.body as {
        type: string;
        name: string;
        apiKey?: string;
        apiSecret?: string;
        apiUrl?: string;
        workspaceId?: string;
        syncDirection?: string;
        autoSync?: boolean;
        syncInterval?: number;
        fieldMapping?: any;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!type || !name) {
        return reply.status(400).send({
          error: 'Tipo e nome da integração são obrigatórios',
        });
      }

      // Verificar se já existe integração do mesmo tipo
      const existing = await prisma.crmIntegration.findFirst({
        where: {
          tenantId: userTenantId,
          type,
          workspaceId: workspaceId || null,
        },
      });

      if (existing) {
        return reply.status(409).send({
          error: 'Integração deste tipo já existe',
        });
      }

      const integration = await prisma.crmIntegration.create({
        data: {
          tenantId: userTenantId,
          type,
          name,
          apiKey,
          apiSecret,
          apiUrl,
          workspaceId,
          syncDirection: syncDirection || 'bidirectional',
          autoSync: autoSync !== undefined ? autoSync : true,
          syncInterval: syncInterval || 3600,
          fieldMapping: fieldMapping || {},
        },
        select: {
          id: true,
          type: true,
          name: true,
          isActive: true,
          syncDirection: true,
          autoSync: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.status(201).send({
        success: true,
        integration,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao criar integração',
        message: errorMessage,
      });
    }
  });

  // Atualizar integração CRM
  fastify.patch('/api/crm/integrations/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const {
        name,
        apiKey,
        apiSecret,
        apiUrl,
        isActive,
        syncDirection,
        autoSync,
        syncInterval,
        fieldMapping,
      } = request.body as {
        name?: string;
        apiKey?: string;
        apiSecret?: string;
        apiUrl?: string;
        isActive?: boolean;
        syncDirection?: string;
        autoSync?: boolean;
        syncInterval?: number;
        fieldMapping?: any;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const integration = await prisma.crmIntegration.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!integration) {
        return reply.status(404).send({
          error: 'Integração não encontrada',
        });
      }

      const updated = await prisma.crmIntegration.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(apiKey !== undefined && { apiKey }),
          ...(apiSecret !== undefined && { apiSecret }),
          ...(apiUrl !== undefined && { apiUrl }),
          ...(isActive !== undefined && { isActive }),
          ...(syncDirection && { syncDirection }),
          ...(autoSync !== undefined && { autoSync }),
          ...(syncInterval !== undefined && { syncInterval }),
          ...(fieldMapping !== undefined && { fieldMapping }),
        },
        select: {
          id: true,
          type: true,
          name: true,
          isActive: true,
          syncDirection: true,
          autoSync: true,
          lastSyncAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.send({
        success: true,
        integration: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar integração',
        message: errorMessage,
      });
    }
  });

  // Deletar integração CRM
  fastify.delete('/api/crm/integrations/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const integration = await prisma.crmIntegration.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!integration) {
        return reply.status(404).send({
          error: 'Integração não encontrada',
        });
      }

      await prisma.crmIntegration.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Integração removida com sucesso',
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao deletar integração',
        message: errorMessage,
      });
    }
  });

  // Sincronizar manualmente com CRM
  fastify.post('/api/crm/integrations/:id/sync', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const integration = await prisma.crmIntegration.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!integration) {
        return reply.status(404).send({
          error: 'Integração não encontrada',
        });
      }

      if (!integration.isActive) {
        return reply.status(400).send({
          error: 'Integração está desativada',
        });
      }

      // TODO: Implementar lógica de sincronização com CRM específico
      // Por enquanto, apenas atualiza lastSyncAt
      await prisma.crmIntegration.update({
        where: { id },
        data: {
          lastSyncAt: new Date(),
        },
      });

      return reply.send({
        success: true,
        message: 'Sincronização iniciada',
        // TODO: Retornar resultado da sincronização
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao sincronizar',
        message: errorMessage,
      });
    }
  });
}
