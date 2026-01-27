import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Interface para o payload do JWT
 */
interface JWTPayload {
  id: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}

/**
 * Estende o tipo FastifyRequest para incluir user
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      tenantId: string;
    };
  }
}

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona user ao request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Verifica se há token no header Authorization
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        error: 'Não autenticado',
        message: 'Token de autenticação não fornecido',
      });
    }

    // Verifica e decodifica o token
    const decoded = request.server.jwt.verify<JWTPayload>(token);

    // DEBUG: Log detalhado do token decodificado
    request.log.info({
      decodedId: decoded.id,
      decodedTenantId: decoded.tenantId,
      hasTenantId: !!decoded.tenantId,
      route: request.routerPath,
      method: request.method,
    }, 'DEBUG: Token decodificado no middleware');

    // Validar que tenantId está presente no token
    if (!decoded.tenantId) {
      request.log.error({
        decoded,
        token: token.substring(0, 20) + '...',
        route: request.routerPath,
      }, 'Token JWT sem tenantId');
      
      return reply.status(401).send({
        error: 'Token inválido',
        message: 'Token não contém tenantId. Faça login novamente.',
      });
    }

    // Adiciona user ao request
    request.user = {
      id: decoded.id,
      tenantId: decoded.tenantId,
    };
    
    // DEBUG: Confirmar que request.user foi populado
    request.log.info({
      requestUserId: request.user.id,
      requestUserTenantId: request.user.tenantId,
      route: request.routerPath,
    }, 'DEBUG: request.user populado no middleware');
  } catch (error) {
    // Token inválido ou expirado
    return reply.status(401).send({
      error: 'Não autenticado',
      message: 'Token inválido ou expirado',
    });
  }
}

/**
 * Middleware opcional - verifica se o usuário é admin
 * (Pode ser usado no futuro para endpoints administrativos)
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Primeiro verifica autenticação
  await authenticate(request, reply);

  // Se já retornou erro, não continua
  if (reply.statusCode === 401) {
    return;
  }

  // TODO: Verificar se user.role === 'admin' no banco
  // Por enquanto, qualquer usuário autenticado pode acessar
}
