import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import bcrypt from 'bcryptjs';

import { env } from './config/env';
import prisma from './config/database';

import { registerIntakeRoute } from './api/agent/intake';
import { registerConversationRoute } from './api/agent/conversation';

const fastify = Fastify({
  logger: true,
});

// ======================================================
// UTIL – TENANT PADRÃO (WEBHOOKS)
// ======================================================
async function getOrCreateDefaultTenant(): Promise<string> {
  const NAME = 'Tenant Padrão SDR';

  let tenant = await prisma.tenant.findFirst({
    where: { name: NAME },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: NAME,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}

// ======================================================
// BUILD
// ======================================================
async function build() {
  // ---------------- CORS ----------------
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // ---------------- JWT ----------------
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // ---------------- WS ----------------
  await fastify.register(websocket);

  // ======================================================
  // HEALTH
  // ======================================================
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // ======================================================
  // AUTH
  // ======================================================
  fastify.post('/register', async (request, reply) => {
    const { email, name, password, tenantName } = request.body as any;

    if (!email || !name || !password || !tenantName) {
      return reply.status(400).send({ error: 'Campos obrigatórios ausentes' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return reply.status(400).send({ error: 'Email já cadastrado' });
    }

    const tenant = await prisma.tenant.create({
      data: { name: tenantName },
    });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'admin',
        tenantId: tenant.id,
      },
    });

    const token = fastify.jwt.sign({
      id: user.id,
      tenantId: tenant.id,
    });

    return { token, user, tenant };
  });

  // ======================================================
  // 🔥 WEBHOOK UNIVERSAL /leads (À PROVA DE MAKE)
  // ======================================================
  fastify.post('/leads', async (request, reply) => {
    try {
      const body = request.body as any;

      if (!body) {
        return reply.status(400).send({ error: 'Body vazio' });
      }

      const { nome, telefone, email, origem } = body;

      if (!nome || !telefone) {
        return reply.status(400).send({
          error: 'nome e telefone são obrigatórios',
        });
      }

      const tenantId = await getOrCreateDefaultTenant();

      const existing = await prisma.lead.findFirst({
        where: {
          tenantId,
          phone: telefone,
        },
      });

      if (existing) {
        return reply.send({
          success: true,
          leadId: existing.id,
          message: 'Lead já existente',
        });
      }

      const lead = await prisma.lead.create({
        data: {
          tenantId,
          name: nome,
          phone: telefone,
          email: email ?? null,
          status: 'novo',
          legalArea: origem ?? null,
        },
      });

      return reply.status(201).send({
        success: true,
        leadId: lead.id,
        message: 'Lead criado com sucesso',
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({
        error: 'Erro interno no webhook',
      });
    }
  });

  // ======================================================
  // AGENTE IA
  // ======================================================
  await registerIntakeRoute(fastify);
  await registerConversationRoute(fastify);

  return fastify;
}

// ======================================================
// START
// ======================================================
async function start() {
  try {
    await prisma.$connect();
    const app = await build();

    const PORT = Number(process.env.PORT) || 3001;

    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 API rodando na porta ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { build };
