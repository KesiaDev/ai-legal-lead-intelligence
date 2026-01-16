import Fastify from 'fastify';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import bcrypt from 'bcryptjs';

import { env } from './config/env';
import prisma from './config/database';

import { registerIntakeRoute } from './api/agent/intake';
import { registerConversationRoute } from './api/agent/conversation';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// ===============================
// UTILITÁRIOS
// ===============================

/**
 * Obtém ou cria o Tenant padrão do sistema
 * Garante que sempre existe um tenant válido para webhooks e leads externos
 */
async function getOrCreateDefaultTenant(): Promise<string> {
  const DEFAULT_TENANT_NAME = 'Tenant Padrão SDR';

  let tenant = await prisma.tenant.findFirst({
    where: { name: DEFAULT_TENANT_NAME },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: DEFAULT_TENANT_NAME,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}

// ===============================
// BUILD APP
// ===============================
async function build() {
  // -------------------------------
  // BODY PARSERS
  // -------------------------------
  await fastify.register(formbody);

  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // -------------------------------
  // CORS
  // -------------------------------
  const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });

  // -------------------------------
  // JWT
  // -------------------------------
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // -------------------------------
  // WEBSOCKET
  // -------------------------------
  await fastify.register(websocket);

  // ===============================
  // ROTAS BASE
  // ===============================
  fastify.get('/', async () => {
    return {
      message: 'SDR Jurídico API',
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // ===============================
  // AUTH
  // ===============================
  fastify.post('/register', async (request: any, reply: any) => {
    try {
      const { email, name, password, tenantName } = request.body as any;

      if (!email || !name || !password || !tenantName) {
        return reply.status(400).send({
          error: 'Campos obrigatórios ausentes',
        });
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

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant,
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Erro no registro' });
    }
  });

  fastify.post('/login', async (request: any, reply: any) => {
    try {
      const { email, password } = request.body as any;

      if (!email || !password) {
        return reply.status(400).send({ error: 'Credenciais inválidas' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        tenantId: user.tenantId,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: user.tenant,
      };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Erro no login' });
    }
  });

  fastify.get(
    '/me',
    {
      preHandler: async (request: any, reply: any) => {
        try {
          await request.jwtVerify();
        } catch {
          return reply.status(401).send({ error: 'Unauthorized' });
        }
      },
    },
    async (request: any) => {
      const userId = request.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true },
      });

      return { user };
    }
  );

  // ===============================
  // LEADS (WEBHOOK UNIVERSAL)
  // ===============================
  fastify.post('/leads', async (request: any, reply: any) => {
      try {
        const { nome, telefone, email } = request.body;
  
        // Validação básica
        if (!nome || !telefone) {
          return reply.status(400).send({
            error: 'nome e telefone são obrigatórios',
          });
        }
  
        // Obtém ou cria tenant padrão
        const tenantId = await getOrCreateDefaultTenant();
  
        // Verifica se lead já existe (idempotência)
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
  
        // Cria novo lead
        const lead = await prisma.lead.create({
          data: {
            tenantId,
            name: nome,
            phone: telefone,
            email: email ?? null,
            status: 'novo',
          },
        });
  
        return reply.status(201).send({
          success: true,
          leadId: lead.id,
          message: 'Lead criado com sucesso',
        });
      } catch (err: any) {
        fastify.log.error(err);
        return reply.status(500).send({
          error: 'Erro interno',
        });
      }
    }
  );
  // ===============================
  // ROTAS DE AGENTE IA
  // ===============================
  await registerIntakeRoute(fastify);
  await registerConversationRoute(fastify);

  return fastify;
}

// ===============================
// START SERVER
// ===============================
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const app = await build();
    const PORT = Number(process.env.PORT) || Number(env.PORT) || 3001;

    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    console.error('❌ Failed to start server', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { build };