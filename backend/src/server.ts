import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { env } from './config/env';
import { authenticate, loadUser, AuthenticatedRequest } from './middleware/auth.middleware';
import { ensureTenantAccess } from './middleware/tenant.middleware';
import { authRoutes } from './routes/auth.routes';
import { leadsRoutes } from './routes/leads.routes';
import { conversationsRoutes } from './routes/conversations.routes';
import { pipelineRoutes } from './routes/pipeline.routes';
import { wsManager, initializeWebSocket } from './services/websocket.service';

// Declare types for decorators
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    loadUser: (request: AuthenticatedRequest, reply: FastifyReply) => Promise<void>;
    ensureTenantAccess: (request: AuthenticatedRequest, reply: FastifyReply) => Promise<void>;
  }
}

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

  // Decorators para middleware
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    await authenticate(request, reply);
  });

  fastify.decorate('loadUser', async (request: any, reply: any) => {
    await loadUser(request, reply);
  });

  fastify.decorate('ensureTenantAccess', async (request: any, reply: any) => {
    await ensureTenantAccess(request, reply);
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Registrar rotas
  await fastify.register(authRoutes);
  await fastify.register(leadsRoutes);
  await fastify.register(conversationsRoutes);
  await fastify.register(pipelineRoutes);

  // Configurar WebSocket Manager
  wsManager.setFastifyInstance(fastify);

  // WebSocket para chat ao vivo
  fastify.get('/ws/:conversationId', { websocket: true }, async (connection, req) => {
    await initializeWebSocket(connection, req, fastify);
  });

  // Limpar conexões fechadas periodicamente
  setInterval(() => {
    wsManager.cleanup();
  }, 60000); // A cada 1 minuto

  return fastify;
}

// Iniciar servidor
async function start() {
  try {
    const app = await build();
    
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
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
