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

// =====================================================
// UTILITÁRIO — TENANT PADRÃO (OBRIGATÓRIO PARA WEBHOOK)
// =====================================================
async function getOrCreateDefaultTenant(): Promise<string> {
  const TENANT_NAME = 'Tenant Padrão SDR';

  let tenant = await prisma.tenant.findFirst({
    where: { name: TENANT_NAME },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: TENANT_NAME,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}

// =====================================================
// BUILD APP
// =====================================================
async function build() {
  // -------------------------------
  // BODY PARSERS
  // -------------------------------
  await fastify.register(formbody);

  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      try {
        done(null, JSON.parse(body as string));
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
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // -------------------------------
  // JWT
  // -------------------------------
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  // -------------------------------
  // WEBSOCKET
  // -------------------------------
  await fastify.register(websocket);

  // =====================================================
  // ROTAS BASE
  // =====================================================
  fastify.get('/', async () => ({
    message: 'SDR Jurídico API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/health', async () => (
