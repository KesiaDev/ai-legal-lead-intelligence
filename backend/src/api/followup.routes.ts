import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { FollowUpService } from '../services/followup.service';

export async function followUpRoutes(fastify: FastifyInstance) {
  const service = new FollowUpService(fastify);

  fastify.get('/api/followups/lead/:leadId', { preHandler: [authenticate] }, async (req: any) => {
    const { leadId } = req.params as any;
    const { tenantId } = req.user;
    return service.listByLead(leadId, tenantId);
  });

  fastify.get('/api/followups', { preHandler: [authenticate] }, async (req: any) => {
    const { tenantId } = req.user;
    const { status, from, to } = req.query as any;
    return service.listByTenant(tenantId, {
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  });

  fastify.post('/api/followups', { preHandler: [authenticate] }, async (req: any) => {
    const { tenantId, id: userId } = req.user;
    const body = req.body as any;
    return service.create({ ...body, tenantId, createdBy: userId });
  });

  fastify.patch('/api/followups/:id/status', { preHandler: [authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    const { tenantId } = req.user;
    const { status, sentAt, notes } = req.body as any;
    return service.updateStatus(id, tenantId, status, { sentAt, notes });
  });

  fastify.delete('/api/followups/:id', { preHandler: [authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    const { tenantId, id: userId } = req.user;
    return service.cancel(id, tenantId, userId);
  });

  fastify.post('/api/followups/bulk-cancel', { preHandler: [authenticate] }, async (req: any) => {
    const { tenantId } = req.user;
    const { leadId } = req.body as any;
    const result = await service.bulkCancel(tenantId, { leadId });
    return { cancelled: result.count };
  });

  fastify.get('/api/followups/stats', { preHandler: [authenticate] }, async (req: any) => {
    const { tenantId } = req.user;
    return service.getStats(tenantId);
  });
}
