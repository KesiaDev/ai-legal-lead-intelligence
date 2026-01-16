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

// Registrar plugins
async function build() {
  // FormBody - parser de JSON e form-data (OBRIGATÓRIO para POST em produção)
  await fastify.register(formbody);

  // Parser explícito de JSON (garantia extra)
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

  // CORS - suporta múltiplas origens com callback (melhor para produção)
  const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Permitir requisições sem origin (mobile apps, Postman, etc)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
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

  // Rotas de autenticação
  fastify.post('/register', async (request: any, reply: any) => {
    try {
      // Log do body para debug
      fastify.log.info({ body: request.body, headers: request.headers }, 'REGISTER REQUEST');
      
      const body = request.body as any;
      
      // Validação explícita do body
      if (!body || typeof body !== 'object') {
        fastify.log.warn({ body }, 'Invalid body in register');
        return reply.status(400).send({ error: 'Invalid request body' });
      }

      const { email, name, password, tenantName } = body;
      
      if (!email || !name || !password || !tenantName) {
        return reply.status(400).send({ 
          error: 'Missing required fields',
          required: ['email', 'name', 'password', 'tenantName']
        });
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
      fastify.log.error('Register error:', error);
      return reply.status(500).send({ 
        error: 'Failed to register',
        message: error.message || 'Internal server error'
      });
    }
  });

  fastify.post('/login', async (request: any, reply: any) => {
    try {
      // Log do body para debug
      fastify.log.info({ body: request.body, headers: request.headers }, 'LOGIN REQUEST');
      
      const body = request.body as any;
      
      // Validação explícita do body
      if (!body || typeof body !== 'object') {
        fastify.log.warn({ body }, 'Invalid body in login');
        return reply.status(400).send({ error: 'Invalid request body' });
      }

      const { email, password } = body;

      if (!email || !password) {
        return reply.status(400).send({ 
          error: 'Email and password required',
          received: { hasEmail: !!email, hasPassword: !!password }
        });
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
      fastify.log.error('Login error:', error);
      return reply.status(500).send({ 
        error: 'Failed to login',
        message: error.message || 'Internal server error'
      });
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

  // Registrar rota de intake de leads (isolada)
  await registerIntakeRoute(fastify);
  
  // Registrar rota de conversação com agente IA (conversacional)
  await registerConversationRoute(fastify);

  return fastify;
}

// Iniciar servidor
async function start() {
  try {
    // Testar conexão com banco
    await prisma.$connect();
    console.log('✅ Database connected');

    const app = await build();
    // Railway fornece PORT via process.env, priorizar isso
    const PORT = Number(process.env.PORT) || Number(env.PORT) || 3001;
    
    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
    console.log(`🔌 Process PORT: ${process.env.PORT || 'not set'}`);
  } catch (err: any) {
    console.error('❌ Failed to start server:', err);
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Executar
if (require.main === module) {
  start();
}

export { build };
