import { PrismaClient } from '@prisma/client';
import { PLANS, PlanName } from '../config/plans';

export class PlanLimitError extends Error {
  constructor(
    public readonly feature: string,
    public readonly limit: number,
    public readonly current: number,
    public readonly plan: string,
  ) {
    super(`Limite do plano ${plan} atingido: ${feature} (${current}/${limit})`);
    this.name = 'PlanLimitError';
  }
}

export async function getPlanConfig(prisma: PrismaClient, tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
  const plan = (tenant?.plan ?? 'free') as PlanName;
  return { plan, limits: PLANS[plan] ?? PLANS.free };
}

export async function checkLeadLimit(prisma: PrismaClient, tenantId: string) {
  const { plan, limits } = await getPlanConfig(prisma, tenantId);
  if (limits.maxLeads === Infinity) return;
  const count = await prisma.lead.count({ where: { tenantId } });
  if (count >= limits.maxLeads) {
    throw new PlanLimitError('leads', limits.maxLeads, count, plan);
  }
}

export async function checkUserLimit(prisma: PrismaClient, tenantId: string) {
  const { plan, limits } = await getPlanConfig(prisma, tenantId);
  if (limits.maxUsers === Infinity) return;
  const count = await prisma.user.count({ where: { tenantId, isActive: true } });
  if (count >= limits.maxUsers) {
    throw new PlanLimitError('usuários', limits.maxUsers, count, plan);
  }
}

export async function getPlanUsage(prisma: PrismaClient, tenantId: string) {
  const { plan, limits } = await getPlanConfig(prisma, tenantId);
  const [leads, users] = await Promise.all([
    prisma.lead.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
  ]);
  return {
    plan,
    label: limits.label,
    limits: {
      maxLeads: limits.maxLeads === Infinity ? null : limits.maxLeads,
      maxUsers: limits.maxUsers === Infinity ? null : limits.maxUsers,
      aiAgentEnabled: limits.aiAgentEnabled,
      exportsEnabled: limits.exportsEnabled,
    },
    usage: { leads, users },
  };
}
