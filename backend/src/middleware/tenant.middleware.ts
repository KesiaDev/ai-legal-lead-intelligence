import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './auth.middleware';

export async function ensureTenantAccess(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
  if (!request.user?.tenantId) {
    return reply.status(403).send({ error: 'Tenant access required' });
  }
  
  // Adicionar tenantId ao request para uso nas rotas
  (request as any).tenantId = request.user.tenantId;
}
