import { FastifyInstance } from 'fastify';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

/**
 * Registra todas as rotas de pipelines e deals
 */
export async function registerPipelineRoutes(fastify: FastifyInstance) {
  // ======================================================
  // PIPELINES
  // ======================================================

  // Listar pipelines do tenant
  fastify.get('/api/pipelines', {
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

      const pipelines = await prisma.pipeline.findMany({
        where: {
          tenantId: userTenantId,
        },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { deals: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        pipelines,
        total: pipelines.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar pipelines',
        message: errorMessage,
      });
    }
  });

  // Criar pipeline
  fastify.post('/api/pipelines', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, description, color, stages } = request.body as {
        name: string;
        description?: string;
        color?: string;
        stages?: Array<{ name: string; order: number; color?: string }>;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!name) {
        return reply.status(400).send({
          error: 'Nome do pipeline é obrigatório',
        });
      }

      // Verificar se já existe pipeline com mesmo nome
      const existing = await prisma.pipeline.findFirst({
        where: {
          tenantId: userTenantId,
          name,
        },
      });

      if (existing) {
        return reply.status(409).send({
          error: 'Pipeline com este nome já existe',
        });
      }

      const pipeline = await prisma.pipeline.create({
        data: {
          tenantId: userTenantId,
          name,
          description,
          color,
          stages: {
            create: stages?.map((stage, index) => ({
              name: stage.name,
              order: stage.order ?? index,
              color: stage.color,
            })) || [],
          },
        },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return reply.status(201).send({
        success: true,
        pipeline,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao criar pipeline',
        message: errorMessage,
      });
    }
  });

  // Atualizar pipeline
  fastify.patch('/api/pipelines/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, description, color, isActive } = request.body as {
        name?: string;
        description?: string;
        color?: string;
        isActive?: boolean;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      const updated = await prisma.pipeline.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(color !== undefined && { color }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return reply.send({
        success: true,
        pipeline: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar pipeline',
        message: errorMessage,
      });
    }
  });

  // Deletar pipeline
  fastify.delete('/api/pipelines/:id', {
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

      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      await prisma.pipeline.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Pipeline removido com sucesso',
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao deletar pipeline',
        message: errorMessage,
      });
    }
  });

  // Adicionar etapa ao pipeline
  fastify.post('/api/pipelines/:id/stages', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, order, color } = request.body as {
        name: string;
        order?: number;
        color?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!name) {
        return reply.status(400).send({
          error: 'Nome da etapa é obrigatório',
        });
      }

      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      // Se não especificar order, pega o último + 1
      let stageOrder = order;
      if (stageOrder === undefined) {
        const lastStage = await prisma.pipelineStage.findFirst({
          where: { pipelineId: id },
          orderBy: { order: 'desc' },
        });
        stageOrder = lastStage ? lastStage.order + 1 : 0;
      }

      const stage = await prisma.pipelineStage.create({
        data: {
          pipelineId: id,
          name,
          order: stageOrder,
          color,
        },
      });

      return reply.status(201).send({
        success: true,
        stage,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao criar etapa',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // DEALS
  // ======================================================

  // Listar deals de um pipeline
  fastify.get('/api/pipelines/:id/deals', {
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

      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      const deals = await prisma.deal.findMany({
        where: {
          pipelineId: id,
          tenantId: userTenantId,
        },
        include: {
          stage: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Agrupar deals por stage
      const dealsByStage: Record<string, typeof deals> = {};
      deals.forEach(deal => {
        const stageId = deal.stageId;
        if (!dealsByStage[stageId]) {
          dealsByStage[stageId] = [];
        }
        dealsByStage[stageId].push(deal);
      });

      return reply.send({
        deals,
        dealsByStage,
        total: deals.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar deals',
        message: errorMessage,
      });
    }
  });

  // Criar deal
  fastify.post('/api/deals', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { pipelineId, stageId, leadId, title, value, currency, assignedTo, notes } = request.body as {
        pipelineId: string;
        stageId: string;
        leadId?: string;
        title: string;
        value?: number;
        currency?: string;
        assignedTo?: string;
        notes?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!pipelineId || !stageId || !title) {
        return reply.status(400).send({
          error: 'Pipeline, etapa e título são obrigatórios',
        });
      }

      // Verificar se pipeline e stage existem e pertencem ao tenant
      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id: pipelineId,
          tenantId: userTenantId,
        },
        include: {
          stages: true,
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      const stage = pipeline.stages.find(s => s.id === stageId);
      if (!stage) {
        return reply.status(404).send({
          error: 'Etapa não encontrada neste pipeline',
        });
      }

      const deal = await prisma.deal.create({
        data: {
          tenantId: userTenantId,
          pipelineId,
          stageId,
          leadId,
          title,
          value,
          currency: currency || 'BRL',
          assignedTo,
          notes,
        },
        include: {
          stage: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      // Registrar no histórico
      await prisma.pipelineHistory.create({
        data: {
          tenantId: userTenantId,
          dealId: deal.id,
          leadId: leadId || null,
          stageName: stage.name,
          changedBy: user.id,
          notes: 'Deal criado',
        },
      });

      return reply.status(201).send({
        success: true,
        deal,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao criar deal',
        message: errorMessage,
      });
    }
  });

  // Mover deal entre etapas
  fastify.patch('/api/deals/:id/stage', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { stageId, notes } = request.body as {
        stageId: string;
        notes?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!stageId) {
        return reply.status(400).send({
          error: 'ID da etapa é obrigatório',
        });
      }

      const deal = await prisma.deal.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
        include: {
          stage: true,
          pipeline: {
            include: {
              stages: true,
            },
          },
        },
      });

      if (!deal) {
        return reply.status(404).send({
          error: 'Deal não encontrado',
        });
      }

      const newStage = deal.pipeline.stages.find(s => s.id === stageId);
      if (!newStage) {
        return reply.status(404).send({
          error: 'Etapa não encontrada neste pipeline',
        });
      }

      const oldStageName = deal.stage.name;

      const updated = await prisma.deal.update({
        where: { id },
        data: { stageId },
        include: {
          stage: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      // Registrar no histórico
      await prisma.pipelineHistory.create({
        data: {
          tenantId: userTenantId,
          dealId: id,
          leadId: deal.leadId,
          stageName: newStage.name,
          changedBy: user.id,
          notes: notes || `Movido de "${oldStageName}" para "${newStage.name}"`,
        },
      });

      return reply.send({
        success: true,
        deal: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao mover deal',
        message: errorMessage,
      });
    }
  });

  // Atualizar deal
  fastify.patch('/api/deals/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { title, value, currency, assignedTo, notes } = request.body as {
        title?: string;
        value?: number;
        currency?: string;
        assignedTo?: string;
        notes?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const deal = await prisma.deal.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!deal) {
        return reply.status(404).send({
          error: 'Deal não encontrado',
        });
      }

      const updated = await prisma.deal.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(value !== undefined && { value }),
          ...(currency && { currency }),
          ...(assignedTo !== undefined && { assignedTo }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          stage: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      return reply.send({
        success: true,
        deal: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar deal',
        message: errorMessage,
      });
    }
  });

  // Deletar deal
  fastify.delete('/api/deals/:id', {
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

      const deal = await prisma.deal.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!deal) {
        return reply.status(404).send({
          error: 'Deal não encontrado',
        });
      }

      await prisma.deal.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Deal removido com sucesso',
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao deletar deal',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // ESTATÍSTICAS DO FUNIL
  // ======================================================

  // Obter estatísticas de conversão do pipeline
  fastify.get('/api/pipelines/:id/stats', {
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

      const pipeline = await prisma.pipeline.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
        include: {
          stages: {
            orderBy: { order: 'asc' },
            include: {
              _count: {
                select: { deals: true },
              },
            },
          },
          deals: {
            include: {
              stage: true,
            },
          },
        },
      });

      if (!pipeline) {
        return reply.status(404).send({
          error: 'Pipeline não encontrado',
        });
      }

      // Calcular conversão por etapa
      const totalDeals = pipeline.deals.length;
      const stagesStats = pipeline.stages.map((stage, index) => {
        const dealsInStage = pipeline.deals.filter(d => d.stageId === stage.id).length;
        const previousStage = index > 0 ? pipeline.stages[index - 1] : null;
        const dealsInPreviousStage = previousStage
          ? pipeline.deals.filter(d => d.stageId === previousStage.id).length
          : totalDeals;

        // Conversão = deals nesta etapa / deals na etapa anterior (ou total se primeira)
        const conversion = dealsInPreviousStage > 0
          ? (dealsInStage / dealsInPreviousStage) * 100
          : 0;

        return {
          stageId: stage.id,
          stageName: stage.name,
          deals: dealsInStage,
          conversion: Math.round(conversion * 10) / 10, // 1 casa decimal
        };
      });

      // Conversão geral (última etapa / primeira etapa)
      const firstStageDeals = pipeline.stages[0]
        ? pipeline.deals.filter(d => d.stageId === pipeline.stages[0].id).length
        : 0;
      const lastStageDeals = pipeline.stages.length > 0
        ? pipeline.deals.filter(d => d.stageId === pipeline.stages[pipeline.stages.length - 1].id).length
        : 0;
      const overallConversion = firstStageDeals > 0
        ? (lastStageDeals / firstStageDeals) * 100
        : 0;

      return reply.send({
        pipeline: {
          id: pipeline.id,
          name: pipeline.name,
        },
        totalDeals,
        overallConversion: Math.round(overallConversion * 10) / 10,
        stagesStats,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao calcular estatísticas',
        message: errorMessage,
      });
    }
  });
}
