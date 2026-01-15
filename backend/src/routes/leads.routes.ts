// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest, authenticate, loadUser } from '../middleware/auth.middleware';
import { ensureTenantAccess } from '../middleware/tenant.middleware';

const createLeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  legalArea: z.string().optional(),
  caseType: z.string().optional(),
  demandDescription: z.string().optional(),
  urgency: z.enum(['baixa', 'media', 'alta']).optional(),
  origin: z.string().optional(),
  estimatedTicket: z.number().optional(),
  contactPreference: z.string().optional(),
  availableForHumanContact: z.boolean().default(false),
  lgpdConsent: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const updateLeadSchema = createLeadSchema.partial();

export async function leadsRoutes(fastify: FastifyInstance) {
  // Listar leads
  fastify.get('/leads', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { status, pipelineStage, assignedTo, search } = request.query as any;

      const where: any = {
        tenantId,
      };

      if (status) where.status = status;
      if (pipelineStage) where.pipelineStage = pipelineStage;
      if (assignedTo) where.assignedTo = assignedTo;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const leads = await prisma.lead.findMany({
        where,
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conversations: {
            take: 1,
            orderBy: { updatedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return reply.send({ leads });
    } catch (error) {
      console.error('List leads error:', error);
      return reply.status(500).send({ error: 'Failed to list leads' });
    }
  });

  // Obter lead por ID
  fastify.get('/leads/:id', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { id } = request.params as { id: string };

      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          conversations: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 50,
              },
            },
            orderBy: { updatedAt: 'desc' },
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
          },
        },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      return reply.send({ lead });
    } catch (error) {
      console.error('Get lead error:', error);
      return reply.status(500).send({ error: 'Failed to get lead' });
    }
  });

  // Criar lead
  fastify.post('/leads', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const data = createLeadSchema.parse(request.body);

      const lead = await prisma.lead.create({
        data: {
          ...data,
          tenantId,
          status: 'novo',
          lgpdConsentDate: data.lgpdConsent ? new Date() : null,
        },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.status(201).send({ lead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Create lead error:', error);
      return reply.status(500).send({ error: 'Failed to create lead' });
    }
  });

  // Atualizar lead
  fastify.patch('/leads/:id', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { id } = request.params as { id: string };
      const data = updateLeadSchema.parse(request.body);

      const lead = await prisma.lead.findFirst({
        where: { id, tenantId },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          ...data,
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
        },
      });

      return reply.send({ lead: updatedLead });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Update lead error:', error);
      return reply.status(500).send({ error: 'Failed to update lead' });
    }
  });

  // Deletar lead
  fastify.delete('/leads/:id', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { id } = request.params as { id: string };

      const lead = await prisma.lead.findFirst({
        where: { id, tenantId },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      await prisma.lead.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error) {
      console.error('Delete lead error:', error);
      return reply.status(500).send({ error: 'Failed to delete lead' });
    }
  });
}
