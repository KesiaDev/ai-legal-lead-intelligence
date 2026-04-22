import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export async function departmentsRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;

  fastify.get('/api/departments', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { tenantId } = req.user as any;
    return prisma.department.findMany({
      where: { tenantId },
      include: { members: true },
      orderBy: { name: 'asc' },
    });
  });

  fastify.post('/api/departments', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { tenantId } = req.user as any;
    const { name, description, color } = req.body as any;
    return prisma.department.create({
      data: { tenantId, name, description, color },
    });
  });

  fastify.patch('/api/departments/:id', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    const { name, description, color, isActive } = req.body as any;
    return prisma.department.update({
      where: { id },
      data: { name, description, color, isActive },
    });
  });

  fastify.delete('/api/departments/:id', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { id } = req.params as any;
    await prisma.department.delete({ where: { id } });
    return { success: true };
  });

  // Adicionar membro
  fastify.post('/api/departments/:id/members', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { id: departmentId } = req.params as any;
    const { userId, role } = req.body as any;
    return prisma.departmentMember.create({
      data: { departmentId, userId, role: role || 'member' },
    });
  });

  // Remover membro
  fastify.delete('/api/departments/:id/members/:userId', { preHandler: [fastify.authenticate] }, async (req: any) => {
    const { id: departmentId, userId } = req.params as any;
    await prisma.departmentMember.deleteMany({ where: { departmentId, userId } });
    return { success: true };
  });
}
