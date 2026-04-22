import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { PLANS, PlanName } from '../config/plans';

async function requireSuperAdmin(request: any, reply: any) {
  if (!request.user?.isSystemAdmin) {
    return reply.status(403).send({ error: 'Acesso negado. Requer permissão de super admin.' });
  }
}

export async function registerAdminRoutes(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;
  const preHandler = [authenticate, requireSuperAdmin];

  // GET /admin/tenants — lista todos os tenants
  fastify.get('/admin/tenants', { preHandler }, async (_req: any, reply: any) => {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, leads: true } },
      },
    });
    return reply.send({ tenants });
  });

  // PATCH /admin/tenants/:id/plan — altera plano
  fastify.patch('/admin/tenants/:id/plan', { preHandler }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const { plan } = request.body as { plan: string };

    if (!Object.keys(PLANS).includes(plan)) {
      return reply.status(400).send({ error: `Plano inválido. Use: ${Object.keys(PLANS).join(', ')}` });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: { plan },
    });
    return reply.send({ tenant });
  });

  // GET /admin/users — lista todos os usuários
  fastify.get('/admin/users', { preHandler }, async (request: any, reply: any) => {
    const { search = '', page = '1', limit = '20' } = request.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { email: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isActive: true, isSystemAdmin: true, createdAt: true, tenant: { select: { id: true, name: true, plan: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    return reply.send({ users, total, page: parseInt(page), limit: parseInt(limit) });
  });

  // POST /admin/users/:id/reset-password — redefine senha diretamente
  fastify.post('/admin/users/:id/reset-password', { preHandler }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const { newPassword } = request.body as { newPassword: string };

    if (!newPassword || newPassword.length < 6) {
      return reply.status(400).send({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id },
      data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
    });

    return reply.send({ message: 'Senha redefinida com sucesso.' });
  });

  // PATCH /admin/users/:id/status — ativa ou desativa usuário
  fastify.patch('/admin/users/:id/status', { preHandler }, async (request: any, reply: any) => {
    const { id } = request.params as { id: string };
    const { isActive } = request.body as { isActive: boolean };

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    return reply.send({ user });
  });
}
