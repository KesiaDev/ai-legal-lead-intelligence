/**
 * Webhook Asaas — Ativa, suspende e cancela tenants conforme pagamento
 *
 * Eventos tratados:
 *  PAYMENT_CONFIRMED        → ativa tenant (status: active, isActive: true)
 *  PAYMENT_RECEIVED         → mesmo que PAYMENT_CONFIRMED
 *  PAYMENT_OVERDUE          → marca overdue (suspende após 3 dias via cron)
 *  PAYMENT_DELETED          → não faz nada
 *  SUBSCRIPTION_CANCELLED   → suspende tenant (status: cancelled)
 *
 * Segurança: valida header asaas-access-token contra ASAAS_WEBHOOK_TOKEN env var
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { EvolutionProvisioningService } from '../../services/evolution-provisioning.service';

function periodEnd(from = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function registerAsaasWebhook(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;

  fastify.post('/api/webhooks/asaas', async (request: any, reply: any) => {
    // Validação do token de segurança (opcional mas recomendado)
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const receivedToken = request.headers['asaas-access-token'];
      if (receivedToken !== webhookToken) {
        fastify.log.warn('Asaas webhook: token inválido');
        return reply.status(401).send({ error: 'Unauthorized' });
      }
    }

    const payload = request.body as any;
    const event = payload?.event;
    const payment = payload?.payment;

    fastify.log.info({ event, paymentId: payment?.id }, 'Asaas webhook recebido');

    if (!event || !payment) {
      return reply.status(200).send({ ok: true }); // Asaas exige 200 mesmo em caso de skip
    }

    // Busca tenant pelo externalReference (= tenantId salvo na assinatura)
    const externalRef = payment.externalReference || payment.subscription?.externalReference;
    if (!externalRef) {
      return reply.status(200).send({ ok: true });
    }

    const sub = await (prisma as any).subscription.findUnique({
      where: { tenantId: externalRef },
    }).catch(() => null);

    if (!sub) {
      fastify.log.warn({ externalRef }, 'Asaas webhook: subscription não encontrada');
      return reply.status(200).send({ ok: true });
    }

    const tenantId = sub.tenantId;

    // ── Eventos ────────────────────────────────────────────────────────────
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      // Ativa tenant
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { plan: sub.plan },
      });

      // Ativa todos os usuários do tenant
      await prisma.user.updateMany({
        where: { tenantId },
        data: { isActive: true },
      });

      // Ativa agente IA
      await (prisma as any).agentConfig.updateMany({
        where: { tenantId },
        data: { isActive: true },
      });

      // Atualiza subscription
      await (prisma as any).subscription.update({
        where: { tenantId },
        data: {
          status: 'active',
          setupFeePaid: true,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd(),
          leadsUsedThisPeriod: 0,
        },
      });

      fastify.log.info({ tenantId, plan: sub.plan }, 'Tenant ativado via pagamento Asaas');

    } else if (event === 'PAYMENT_OVERDUE') {
      await (prisma as any).subscription.update({
        where: { tenantId },
        data: { status: 'overdue' },
      });

      fastify.log.warn({ tenantId }, 'Tenant com pagamento em atraso');

    } else if (event === 'SUBSCRIPTION_CANCELLED') {
      // Bloqueia todos os usuários do tenant
      await prisma.user.updateMany({
        where: { tenantId },
        data: { isActive: false },
      });

      await (prisma as any).agentConfig.updateMany({
        where: { tenantId },
        data: { isActive: false },
      });

      await (prisma as any).subscription.update({
        where: { tenantId },
        data: { status: 'cancelled' },
      });

      // Deleta instância Evolution GO do tenant
      try {
        const instanceName = EvolutionProvisioningService.instanceName(tenantId);
        await EvolutionProvisioningService.deleteInstance(instanceName);
      } catch {}

      fastify.log.info({ tenantId }, 'Tenant suspenso — assinatura cancelada');

    } else if (event === 'PAYMENT_REFUNDED' || event === 'PAYMENT_CHARGEBACK') {
      // Bloqueia todos os usuários do tenant
      await prisma.user.updateMany({
        where: { tenantId },
        data: { isActive: false },
      });

      await (prisma as any).subscription.update({
        where: { tenantId },
        data: { status: 'suspended' },
      });

      await (prisma as any).agentConfig.updateMany({
        where: { tenantId },
        data: { isActive: false },
      });
    }

    return reply.status(200).send({ ok: true });
  });

  // ── GET health para o Asaas verificar o endpoint ─────────────────────────
  fastify.get('/api/webhooks/asaas', async (_req, reply) => {
    return reply.send({ status: 'ok', service: 'SDR Jurídico Asaas Webhook' });
  });
}
