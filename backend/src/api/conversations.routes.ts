import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';

export async function registerConversationsRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as any;

  // ─── GET /api/conversations ───────────────────────────────────────────────
  // Lista todas as conversas do tenant com lead + últimas mensagens
  fastify.get('/api/conversations', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      if (!tenantId) return reply.status(401).send({ error: 'Tenant não identificado' });

      const { status, channel, search, page = '1', limit = '50' } = request.query as any;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: any = { tenantId };
      if (status) where.status = status;
      if (channel) where.channel = channel;

      // Filtro de busca por nome/telefone do lead
      if (search) {
        where.lead = {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        };
      }

      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          skip,
          take: parseInt(limit),
          include: {
            lead: {
              select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true },
            },
            messages: {
              orderBy: { createdAt: 'asc' },
              select: { id: true, content: true, senderType: true, createdAt: true, intention: true },
            },
          },
        }),
        prisma.conversation.count({ where }),
      ]);

      return reply.send({ conversations, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao listar conversas');
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── GET /api/conversations/:id ──────────────────────────────────────────
  fastify.get('/api/conversations/:id', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { id } = request.params as { id: string };

      const conversation = await prisma.conversation.findFirst({
        where: { id, tenantId },
        include: {
          lead: {
            select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            select: { id: true, content: true, senderType: true, createdAt: true, intention: true },
          },
        },
      });

      if (!conversation) return reply.status(404).send({ error: 'Conversa não encontrada' });

      return reply.send({ conversation });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── POST /api/conversations/:id/messages ─────────────────────────────────
  // Advogado/humano envia uma mensagem manualmente
  fastify.post('/api/conversations/:id/messages', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { id } = request.params as { id: string };
      const { content, senderType = 'sdr' } = request.body as { content: string; senderType?: string };

      if (!content?.trim()) return reply.status(400).send({ error: 'Conteúdo obrigatório' });

      const conversation = await prisma.conversation.findFirst({ where: { id, tenantId } });
      if (!conversation) return reply.status(404).send({ error: 'Conversa não encontrada' });

      await prisma.message.create({
        data: { conversationId: id, content: content.trim(), senderType },
      });

      // Atualizar updatedAt da conversa
      await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

      // Buscar conversa atualizada
      const updated = await prisma.conversation.findFirst({
        where: { id },
        include: {
          lead: { select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true } },
          messages: { orderBy: { createdAt: 'asc' }, select: { id: true, content: true, senderType: true, createdAt: true, intention: true } },
        },
      });

      return reply.send({ conversation: updated });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── PATCH /api/conversations/:id/status ─────────────────────────────────
  fastify.patch('/api/conversations/:id/status', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: 'active' | 'paused' | 'closed' };

      if (!['active', 'paused', 'closed'].includes(status)) {
        return reply.status(400).send({ error: 'Status inválido' });
      }

      const conversation = await prisma.conversation.findFirst({ where: { id, tenantId } });
      if (!conversation) return reply.status(404).send({ error: 'Conversa não encontrada' });

      await prisma.conversation.update({ where: { id }, data: { status } });

      const updated = await prisma.conversation.findFirst({
        where: { id },
        include: {
          lead: { select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true } },
          messages: { orderBy: { createdAt: 'asc' }, select: { id: true, content: true, senderType: true, createdAt: true, intention: true } },
        },
      });

      return reply.send({ conversation: updated });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── PATCH /api/conversations/:id/assigned-type ───────────────────────────
  fastify.patch('/api/conversations/:id/assigned-type', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { id } = request.params as { id: string };
      const { assignedType } = request.body as { assignedType: 'ai' | 'human' | 'hybrid' };

      if (!['ai', 'human', 'hybrid'].includes(assignedType)) {
        return reply.status(400).send({ error: 'assignedType inválido' });
      }

      const conversation = await prisma.conversation.findFirst({ where: { id, tenantId } });
      if (!conversation) return reply.status(404).send({ error: 'Conversa não encontrada' });

      await prisma.conversation.update({ where: { id }, data: { assignedType } });

      const updated = await prisma.conversation.findFirst({
        where: { id },
        include: {
          lead: { select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true } },
          messages: { orderBy: { createdAt: 'asc' }, select: { id: true, content: true, senderType: true, createdAt: true, intention: true } },
        },
      });

      return reply.send({ conversation: updated });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── POST /api/conversations/:id/intentions ───────────────────────────────
  fastify.post('/api/conversations/:id/intentions', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { id } = request.params as { id: string };
      const { intention } = request.body as { intention: string };

      if (!intention) return reply.status(400).send({ error: 'intention obrigatória' });

      const conversation = await prisma.conversation.findFirst({ where: { id, tenantId } });
      if (!conversation) return reply.status(404).send({ error: 'Conversa não encontrada' });

      // Salvar como mensagem de sistema com a intenção marcada
      await prisma.message.create({
        data: {
          conversationId: id,
          content: `[Intenção registrada: ${intention}]`,
          senderType: 'system',
          intention,
        },
      });

      await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

      return reply.send({ ok: true, intention });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // ─── PATCH /api/leads/:leadId ─────────────────────────────────────────────
  // Atualizar status do lead (usado pelo ChatActions)
  fastify.patch('/api/leads/:leadId', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { leadId } = request.params as { leadId: string };
      const { status, legalArea, name } = request.body as any;

      const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId } });
      if (!lead) return reply.status(404).send({ error: 'Lead não encontrado' });

      const updated = await prisma.lead.update({
        where: { id: leadId },
        data: {
          ...(status && { status }),
          ...(legalArea && { legalArea }),
          ...(name && { name }),
        },
      });

      return reply.send({ lead: updated });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });
}
