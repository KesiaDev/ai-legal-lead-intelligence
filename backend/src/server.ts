import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import prisma from './config/database';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Registrar plugins
async function build() {
  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // WebSocket
  await fastify.register(websocket);

  // Rota raiz
  fastify.get('/', async () => {
    return {
      message: 'SDR Jurídico API',
      version: '1.0.0',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        auth: '/register, /login, /me',
        leads: '/leads',
        conversations: '/conversations',
        pipeline: '/pipeline/stages',
      },
    };
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Rotas de autenticação (simplificadas por enquanto)
  fastify.post('/register', async (request: any, reply: any) => {
    try {
      const { email, name, password, tenantName } = request.body as any;
      
      if (!email || !name || !password || !tenantName) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already registered' });
      }

      const tenant = await prisma.tenant.create({
        data: { name: tenantName },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          password: hashedPassword,
          role: 'admin',
        },
      });

      const token = fastify.jwt.sign({ id: user.id, tenantId: tenant.id });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to register' });
    }
  });

  fastify.post('/login', async (request: any, reply: any) => {
    try {
      const { email, password } = request.body as any;

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({ id: user.id, tenantId: user.tenantId });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
        },
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Failed to login' });
    }
  });

  fastify.get('/me', {
    preHandler: [async (request: any, reply: any) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    }],
  }, async (request: any) => {
    const userId = (request.user as any)?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    return { user };
  });

  return fastify;
}

// Iniciar servidor
async function start() {
  try {
    const app = await build();
    const PORT = Number(process.env.PORT) || env.PORT;
    
    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  start();
}

export { build };
