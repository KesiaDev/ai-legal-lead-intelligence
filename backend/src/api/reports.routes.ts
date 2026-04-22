import { FastifyInstance } from 'fastify';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

export async function reportsRoutes(fastify: FastifyInstance) {

  // Relatório de conversas
  fastify.get('/api/reports/conversations', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    const { from, to, channel } = req.query as any;

    try {
      const where: any = { tenantId };
      if (channel) where.channel = channel;
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      const [totalConversations, byChannel, byStatus, byAssignedType] = await Promise.all([
        prisma.conversation.count({ where }),
        prisma.conversation.groupBy({ by: ['channel'], where, _count: true }),
        prisma.conversation.groupBy({ by: ['status'], where, _count: true }),
        prisma.conversation.groupBy({ by: ['assignedType'], where, _count: true }),
      ]);

      // Total de mensagens
      const totalMessages = await prisma.message.count({
        where: {
          conversation: { tenantId },
          ...(from || to ? { createdAt: where.createdAt } : {}),
        },
      }).catch(() => 0);

      // Média de mensagens por conversa
      const avgMessages = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;

      return {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation: avgMessages,
        byChannel: byChannel.map(c => ({ channel: c.channel, count: c._count })),
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
        byAssignedType: byAssignedType.map(a => ({ type: a.assignedType, count: a._count })),
      };
    } catch (err) {
      fastify.log.error({ err, tenantId }, 'Erro ao gerar relatório de conversas');
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        byChannel: [],
        byStatus: [],
        byAssignedType: [],
      };
    }
  });

  // Relatório de leads
  fastify.get('/api/reports/leads', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    const { from, to } = req.query as any;

    try {
      const where: any = { tenantId };
      if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
      }

      const [totalLeads, byStatus, byLegalArea, byUrgency] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.groupBy({ by: ['status'], where, _count: true }),
        prisma.lead.groupBy({ by: ['legalArea'], where, _count: true }),
        prisma.lead.groupBy({ by: ['urgency'], where, _count: true }),
      ]);

      // Leads por período (últimos 7 dias)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        const count = await prisma.lead.count({
          where: { tenantId, createdAt: { gte: dayStart, lte: dayEnd } },
        }).catch(() => 0);
        last7Days.push({ date: dayStart.toISOString().split('T')[0], count });
      }

      return {
        totalLeads,
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
        byLegalArea: byLegalArea.filter(l => l.legalArea).map(l => ({ area: l.legalArea, count: l._count })),
        byUrgency: byUrgency.filter(u => u.urgency).map(u => ({ urgency: u.urgency, count: u._count })),
        last7Days,
      };
    } catch (err) {
      fastify.log.error({ err, tenantId }, 'Erro ao gerar relatório de leads');
      return {
        totalLeads: 0,
        byStatus: [],
        byLegalArea: [],
        byUrgency: [],
        last7Days: [],
      };
    }
  });

  // Relatório de follow-ups
  fastify.get('/api/reports/followups', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;
    const { from, to } = req.query as any;

    const where: any = { tenantId };
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from);
      if (to) where.scheduledAt.lte = new Date(to);
    }

    try {
      const [total, byStatus, byType] = await Promise.all([
        prisma.followUp.count({ where }),
        prisma.followUp.groupBy({ by: ['status'], where, _count: true }),
        prisma.followUp.groupBy({ by: ['type'], where, _count: true }),
      ]);

      return {
        total,
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
        byType: byType.map(t => ({ type: t.type, count: t._count })),
      };
    } catch {
      return { total: 0, byStatus: [], byType: [] };
    }
  });

  // Dashboard summary
  fastify.get('/api/reports/summary', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user as any;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalLeads,
        leadsToday,
        activeConversations,
        scheduledLeads,
      ] = await Promise.all([
        prisma.lead.count({ where: { tenantId } }),
        prisma.lead.count({ where: { tenantId, createdAt: { gte: today } } }),
        prisma.conversation.count({ where: { tenantId, status: 'active' } }),
        prisma.lead.count({ where: { tenantId, status: 'consulta_agendada' } }),
      ]);

      return {
        totalLeads,
        leadsToday,
        activeConversations,
        scheduledLeads,
      };
    } catch (err) {
      fastify.log.error({ err, tenantId }, 'Erro ao gerar summary do dashboard');
      return {
        totalLeads: 0,
        leadsToday: 0,
        activeConversations: 0,
        scheduledLeads: 0,
      };
    }
  });
}
