import { FastifyInstance } from 'fastify';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

export async function departmentsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/departments', { preHandler: [authenticate] }, async (req: any) => {
    const { tenantId } = req.user;
    return prisma.department.findMany({
      where: { tenantId },
      include: { members: true },
      orderBy: { name: 'asc' },
    });
  });

  fastify.post('/api/departments', { preHandler: [authenticate] }, async (req: any, reply) => {
    const { tenantId } = req.user;
    const { name, description, color } = req.body as any;
    if (!name) return reply.status(400).send({ error: 'Nome obrigatório' });
    return prisma.department.create({
      data: { tenantId, name, description, color },
    });
  });

  fastify.put('/api/departments/:id', { preHandler: [authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    const { name, description, color, isActive } = req.body as any;
    return prisma.department.update({
      where: { id },
      data: { name, description, color, isActive },
    });
  });

  fastify.patch('/api/departments/:id/toggle', { preHandler: [authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    const current = await prisma.department.findUnique({ where: { id } });
    if (!current) return { error: 'Not found' };
    return prisma.department.update({
      where: { id },
      data: { isActive: !current.isActive },
    });
  });

  fastify.delete('/api/departments/:id', { preHandler: [authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    await prisma.department.delete({ where: { id } });
    return { success: true };
  });

  fastify.post('/api/departments/:id/members', { preHandler: [authenticate] }, async (req: any) => {
    const { id: departmentId } = req.params as any;
    const { userId, role } = req.body as any;
    return prisma.departmentMember.create({
      data: { departmentId, userId, role: role || 'member' },
    });
  });

  fastify.delete('/api/departments/:id/members/:userId', { preHandler: [authenticate] }, async (req: any) => {
    const { id: departmentId, userId } = req.params as any;
    await prisma.departmentMember.deleteMany({ where: { departmentId, userId } });
    return { success: true };
  });
}
