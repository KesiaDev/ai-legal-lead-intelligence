import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const transitionSchema = z.object({
  toStage: z.string().uuid(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export async function pipelineRoutes(fastify: FastifyInstance) {
  // Listar estágios do pipeline
  fastify.get('/pipeline/stages', {
    preHandler: [fastify.authenticate, fastify.loadUser, fastify.ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;

      const stages = await prisma.pipelineStage.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: { order: 'asc' },
      });

      return reply.send({ stages });
    } catch (error) {
      console.error('List stages error:', error);
      return reply.status(500).send({ error: 'Failed to list stages' });
    }
  });

  // Transicionar lead para novo estágio
  fastify.post('/leads/:id/transition', {
    preHandler: [fastify.authenticate, fastify.loadUser, fastify.ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const userId = request.user?.id;
      const { id } = request.params as { id: string };
      const data = transitionSchema.parse(request.body);

      // Verificar se lead existe
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      // Verificar se estágio existe
      const stage = await prisma.pipelineStage.findFirst({
        where: {
          id: data.toStage,
          tenantId,
        },
      });

      if (!stage) {
        return reply.status(404).send({ error: 'Stage not found' });
      }

      // Criar transição
      const transition = await prisma.pipelineTransition.create({
        data: {
          leadId: id,
          fromStage: lead.pipelineStage || null,
          toStage: data.toStage,
          userId: userId || null,
          reason: data.reason,
          notes: data.notes,
        },
      });

      // Atualizar lead
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          pipelineStage: data.toStage,
          status: stage.name.toLowerCase().replace(/\s+/g, '_'),
          updatedAt: new Date(),
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          pipelineTransitions: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      return reply.send({
        lead: updatedLead,
        transition,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Transition error:', error);
      return reply.status(500).send({ error: 'Failed to transition lead' });
    }
  });

  // Obter histórico de transições de um lead
  fastify.get('/leads/:id/transitions', {
    preHandler: [fastify.authenticate, fastify.loadUser, fastify.ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { id } = request.params as { id: string };

      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      const transitions = await prisma.pipelineTransition.findMany({
        where: { leadId: id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stage: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.send({ transitions });
    } catch (error) {
      console.error('Get transitions error:', error);
      return reply.status(500).send({ error: 'Failed to get transitions' });
    }
  });
}
