/**
 * Onboarding Self-Service — SDR Jurídico SaaS
 *
 * POST /api/onboarding/register
 *   1. Valida dados (nome, email, senha, plano)
 *   2. Cria Tenant + User (admin)
 *   3. Cria IntegrationConfig e AgentConfig com defaults
 *   4. Cria cliente no Asaas
 *   5. Cria assinatura mensal no Asaas
 *   6. Salva Subscription no banco
 *   7. Retorna { tenantId, paymentLink } para o frontend redirecionar
 *
 * GET /api/onboarding/plans
 *   Retorna os planos disponíveis com preços
 *
 * GET /api/onboarding/status/:tenantId
 *   Retorna status da assinatura do tenant
 */

import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { AsaasService } from '../services/asaas.service';
import { PLANS, PLAN_FEATURES, PlanName } from '../config/plans';
import { EvolutionProvisioningService } from '../services/evolution-provisioning.service';
import prisma from '../config/database';
import { authenticate } from '../middleware/auth';

const VALID_PLANS = ['essencial', 'escritorio', 'corporativo'] as const;
type ValidPlan = typeof VALID_PLANS[number];

function periodEnd(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

export async function registerOnboardingRoutes(fastify: FastifyInstance) {

  // ── GET /api/onboarding/plans ────────────────────────────────────────────
  fastify.get('/api/onboarding/plans', async (_req, reply) => {
    const plans = VALID_PLANS.map((key) => {
      const p = PLAN_FEATURES[key];
      const limits = PLANS[key as PlanName];
      return {
        id: key,
        name: p.name,
        monthlyPrice: p.price,
        pricePerLead: p.pricePerLead,
        leadsIncluded: 1000,
        features: {
          maxUsers: limits.maxUsers === Infinity ? null : limits.maxUsers,
          maxAgents: (limits as any).maxAgents === Infinity ? null : (limits as any).maxAgents,
          aiAgent: limits.aiAgentEnabled,
          voice: (limits as any).voiceEnabled,
          crm: (limits as any).crmEnabled,
          calendar: (limits as any).calendarEnabled,
          reports: (limits as any).reportsEnabled,
          exports: limits.exportsEnabled,
        },
      };
    });
    return reply.send({ plans });
  });

  // ── POST /api/onboarding/register ────────────────────────────────────────
  fastify.post('/api/onboarding/register', async (request: any, reply: any) => {
    try {
      const {
        name,
        email,
        password,
        officeName,
        phone,
        cpfCnpj,
        plan = 'essencial',
        evolutionApiUrl,
        evolutionApiKey,
        evolutionInstance,
      } = request.body as any;

      // Validações básicas
      if (!name || !email || !password || !officeName) {
        return reply.status(400).send({ error: 'name, email, password e officeName são obrigatórios' });
      }
      if (!VALID_PLANS.includes(plan as ValidPlan)) {
        return reply.status(400).send({ error: `Plano inválido. Use: ${VALID_PLANS.join(', ')}` });
      }
      if (password.length < 6) {
        return reply.status(400).send({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Email já existe?
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return reply.status(409).send({ error: 'E-mail já cadastrado' });
      }

      const planConfig = PLANS[plan as PlanName];
      const planFeature = PLAN_FEATURES[plan];

      // 1. Criar Tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: officeName,
          plan,
        },
      });

      // 2. Criar User admin
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          password: hashedPassword,
          role: 'admin',
          isActive: false,
        },
      });

      // 3. Provisiona instância Evolution GO automaticamente
      let provisionedInstance: string | null = null;
      let qrCode: string | null = null;

      try {
        const provisioned = await EvolutionProvisioningService.createInstance(tenant.id);
        provisionedInstance = provisioned.instanceName;
        qrCode = provisioned.qrCode;
        fastify.log.info({ tenantId: tenant.id, instance: provisionedInstance }, 'Instância Evolution criada');
      } catch (err: any) {
        fastify.log.warn({ err: err.message }, 'Falha ao provisionar instância Evolution — cliente configura manualmente');
      }

      // IntegrationConfig com Evolution API
      await (prisma as any).integrationConfig.create({
        data: {
          tenantId: tenant.id,
          evolutionApiUrl: evolutionApiUrl || process.env.EVOLUTION_API_URL || null,
          evolutionApiKey: evolutionApiKey || process.env.EVOLUTION_API_KEY || null,
          evolutionInstance: evolutionInstance || provisionedInstance || null,
        },
      });

      // 4. AgentConfig padrão
      await (prisma as any).agentConfig.create({
        data: {
          tenantId: tenant.id,
          name: `Agente ${officeName}`,
          isActive: false, // ativa após pagamento confirmado
          communicationConfig: { bufferLatency: 3, errorMessage: 'Desculpe, tive um problema. Pode repetir?' },
        },
      });

      // 5. Criar cliente no Asaas
      let asaasCustomerId: string | null = null;
      let asaasSubscriptionId: string | null = null;
      let paymentLink: string | null = null;

      try {
        const customer = await AsaasService.createCustomer({
          name,
          email,
          cpfCnpj,
          phone,
          externalReference: tenant.id,
        });
        asaasCustomerId = customer.id;

        // 6. Criar assinatura mensal
        const subscription = await AsaasService.createSubscription({
          customerId: asaasCustomerId,
          plan: plan as ValidPlan,
          externalReference: tenant.id,
        });
        asaasSubscriptionId = subscription.id;
        paymentLink = subscription.paymentLink;

        // Busca link se não veio direto
        if (!paymentLink && asaasSubscriptionId) {
          paymentLink = await AsaasService.getPaymentLink(asaasSubscriptionId);
        }
      } catch (err: any) {
        fastify.log.warn({ err: err.message }, 'Asaas não configurado — tenant criado sem cobrança');
      }

      // 7. Salvar Subscription no banco
      await (prisma as any).subscription.create({
        data: {
          tenantId: tenant.id,
          plan,
          status: asaasSubscriptionId ? 'trial' : 'active', // sem Asaas → ativa direto
          asaasCustomerId,
          asaasSubscriptionId,
          asaasPaymentLink: paymentLink,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd(),
          leadsIncluded: 1000,
          pricePerLead: planFeature.pricePerLead,
          monthlyPrice: planFeature.price,
        },
      });

      fastify.log.info({ tenantId: tenant.id, plan }, 'Novo tenant criado via onboarding');

      return reply.status(201).send({
        tenantId: tenant.id,
        plan,
        paymentLink,
        whatsapp: provisionedInstance ? {
          instanceName: provisionedInstance,
          qrCode,
          status: qrCode ? 'awaiting_scan' : 'created',
          message: 'Escaneie o QR code com seu WhatsApp para conectar',
        } : null,
        message: paymentLink
          ? 'Cadastro criado! Complete o pagamento e escaneie o QR code do WhatsApp.'
          : 'Cadastro criado! Escaneie o QR code para conectar seu WhatsApp.',
      });

    } catch (error: any) {
      fastify.log.error({ err: error.message }, 'Onboarding error');
      return reply.status(500).send({ error: 'Erro ao criar conta', message: error.message });
    }
  });

  // ── GET /api/onboarding/status/:tenantId ─────────────────────────────────
  fastify.get('/api/onboarding/status/:tenantId', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.params;

      const sub = await (prisma as any).subscription.findUnique({ where: { tenantId } });
      if (!sub) return reply.status(404).send({ error: 'Assinatura não encontrada' });

      return reply.send({
        tenantId,
        plan: sub.plan,
        status: sub.status,
        paymentLink: sub.asaasPaymentLink,
        leadsUsedThisPeriod: sub.leadsUsedThisPeriod,
        leadsIncluded: sub.leadsIncluded,
        currentPeriodEnd: sub.currentPeriodEnd,
      });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao buscar status' });
    }
  });

  // ── POST /api/onboarding/configure-evolution ─────────────────────────────
  fastify.post('/api/onboarding/configure-evolution', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      const { evolutionApiUrl, evolutionApiKey, evolutionInstance, notificationPhone } = request.body as any;
      const tenantId = request.user?.tenantId;

      if (!tenantId) return reply.status(401).send({ error: 'Não autorizado' });
      if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
        return reply.status(400).send({ error: 'evolutionApiUrl, evolutionApiKey e evolutionInstance são obrigatórios' });
      }

      await (prisma as any).integrationConfig.upsert({
        where: { tenantId },
        update: { evolutionApiUrl, evolutionApiKey, evolutionInstance },
        create: { tenantId, evolutionApiUrl, evolutionApiKey, evolutionInstance },
      });

      if (notificationPhone) {
        await (prisma as any).agentConfig.upsert({
          where: { tenantId },
          update: { notificationPhone },
          create: { tenantId, name: 'Agente', notificationPhone },
        });
      }

      return reply.send({ success: true, message: 'Evolution API configurada com sucesso' });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao configurar Evolution API' });
    }
  });

  // ── GET /api/onboarding/whatsapp/qrcode/:tenantId ────────────────────────
  // Retorna QR code para o cliente escanear e conectar o WhatsApp
  fastify.get('/api/onboarding/whatsapp/qrcode/:tenantId', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.params;

      const config = await (prisma as any).integrationConfig.findUnique({
        where: { tenantId },
        select: { evolutionInstance: true },
      });

      if (!config?.evolutionInstance) {
        return reply.status(404).send({ error: 'Instância WhatsApp não encontrada para este tenant' });
      }

      const qrCode = await EvolutionProvisioningService.getQrCode(config.evolutionInstance);
      const status = await EvolutionProvisioningService.getStatus(config.evolutionInstance);

      return reply.send({
        tenantId,
        instanceName: config.evolutionInstance,
        status,
        qrCode,
        connected: status === 'open',
      });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao buscar QR code' });
    }
  });

  // ── GET /api/onboarding/whatsapp/status/:tenantId ─────────────────────────
  fastify.get('/api/onboarding/whatsapp/status/:tenantId', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.params;

      const config = await (prisma as any).integrationConfig.findUnique({
        where: { tenantId },
        select: { evolutionInstance: true },
      });

      if (!config?.evolutionInstance) {
        return reply.send({ connected: false, status: 'not_configured' });
      }

      const status = await EvolutionProvisioningService.getStatus(config.evolutionInstance);

      return reply.send({
        tenantId,
        instanceName: config.evolutionInstance,
        connected: status === 'open',
        status,
      });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao buscar status' });
    }
  });

  // ── Admin: lista todas as instâncias do Evolution GO ─────────────────────
  fastify.get('/api/admin/evolution/instances', { preHandler: [authenticate] }, async (request: any, reply: any) => {
    try {
      if (!request.user?.isSystemAdmin) {
        return reply.status(403).send({ error: 'Apenas administradores do sistema' });
      }
      const instances = await EvolutionProvisioningService.listInstances();
      return reply.send({ instances, total: instances.length });
    } catch (error: any) {
      return reply.status(500).send({ error: 'Erro ao listar instâncias' });
    }
  });
}
