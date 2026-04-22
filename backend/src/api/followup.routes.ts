import { FastifyInstance } from 'fastify';
import { FollowUpService } from '../services/followup.service';

export async function followUpRoutes(fastify: FastifyInstance) {
  const service = new FollowUpService(fastify);

  // Lista follow-ups de um lead
  fastify.get('/api/followups/lead/:leadId', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { leadId } = req.params as any;
    const { tenantId } = req.user as any;
    return service.listByLead(leadId, tenantId);
  });

  // Lista todos follow-ups do tenant
  fastify.get('/api/followups', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    const { status, from, to } = req.query as any;
    return service.listByTenant(tenantId, {
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  });

  // Cria follow-up
  fastify.post('/api/followups', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { tenantId, id: userId } = req.user as any;
    const body = req.body as any;
    return service.create({ ...body, tenantId, createdBy: userId });
  });

  // Atualiza status
  fastify.patch('/api/followups/:id/status', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { id } = req.params as any;
    const { tenantId } = req.user as any;
    const { status, sentAt, notes } = req.body as any;
    return service.updateStatus(id, tenantId, status, { sentAt, notes });
  });

  // Cancela um follow-up
  fastify.delete('/api/followups/:id', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { id } = req.params as any;
    const { tenantId, id: userId } = req.user as any;
    return service.cancel(id, tenantId, userId);
  });

  // Cancela em massa
  fastify.post('/api/followups/bulk-cancel', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    const { leadId } = req.body as any;
    const result = await service.bulkCancel(tenantId, { leadId });
    return { cancelled: result.count };
  });

  // Stats
  fastify.get('/api/followups/stats', { preHandler: [fastify.authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    return service.getStats(tenantId);
  });
}
