// @ts-nocheck
import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    tenantId: string;
    email: string;
    role: string;
  };
  tenantId?: string;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export async function loadUser(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  try {
    const userId = (request.user as any)?.id;
    
    if (!userId) {
      return reply.status(401).send({ error: 'User not found in token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tenantId: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'User not found or inactive' });
    }

    request.user = user;
  } catch (error) {
    reply.status(500).send({ error: 'Failed to load user' });
  }
}
