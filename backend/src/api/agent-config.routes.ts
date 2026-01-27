/**
 * Rotas de Configurações do Agente
 * 
 * Gerencia todas as configurações do agente (nome, comunicação, follow-up, etc.)
 */

import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';

export async function registerAgentConfigRoutes(fastify: FastifyInstance) {
  /**
   * Obter configurações do agente do tenant
   */
  fastify.get('/api/agent/config', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      // DEBUG: Log detalhado do request.user
      request.log.info({
        hasUser: !!request.user,
        userId: request.user?.id,
        tenantId: request.user?.tenantId,
        userObject: request.user,
        route: request.routerPath,
        authHeader: request.headers.authorization ? 'present' : 'missing',
      }, 'DEBUG: Request user info - GET /api/agent/config');

      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - GET /api/agent/config');

        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Log de diagnóstico
      request.log.info({
        tenantId,
        userId: request.user?.id,
        route: request.routerPath,
      }, 'Config endpoint access - GET /api/agent/config');

      // Usar upsert para garantir que sempre existe um registro
      let config;
      try {
        config = await fastify.prisma.agentConfig.upsert({
          where: { tenantId },
          update: {}, // Não atualizar nada se já existir
          create: {
            tenantId,
            name: 'Agente Padrão',
            description: 'Configuração inicial do agente',
            isActive: true,
            communicationConfig: null,
            followUpConfig: null,
            scheduleConfig: null,
            humanizationConfig: null,
            knowledgeBase: null,
            intentions: null,
            templates: null,
            funnelStages: null,
            lawyers: null,
            rotationRules: null,
            reminders: null,
            eventConfig: null,
          },
        });
      } catch (dbError: any) {
        // Log detalhado do erro
        fastify.log.error({ 
          tenantId,
          error: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
          stack: dbError.stack,
        }, 'Erro ao fazer upsert de AgentConfig');
        
        // Se erro for "tabela não existe", retornar erro claro
        if (dbError.message?.includes('does not exist') || dbError.code === 'P2021') {
          return reply.status(503).send({
            error: 'Tabela não encontrada',
            message: 'O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.',
            code: 'MIGRATION_PENDING',
          });
        }
        
        // Re-throw para ser capturado pelo catch externo
        throw dbError;
      }

      return reply.send({
        name: config.name,
        description: config.description,
        isActive: config.isActive,
        communicationConfig: config.communicationConfig,
        followUpConfig: config.followUpConfig,
        scheduleConfig: config.scheduleConfig,
        humanizationConfig: config.humanizationConfig,
        knowledgeBase: config.knowledgeBase,
        intentions: config.intentions,
        templates: config.templates,
        funnelStages: config.funnelStages,
        lawyers: config.lawyers,
        rotationRules: config.rotationRules,
        reminders: config.reminders,
        eventConfig: config.eventConfig,
      });
    } catch (error: any) {
      // Log detalhado do erro
      fastify.log.error({ 
        tenantId: request.user?.tenantId,
        error: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
        errorName: error.name,
      }, 'Erro ao buscar configurações do agente');
      
      // Tratamento específico para erros comuns
      let errorMessage = error.message || 'Erro desconhecido';
      let statusCode = 500;
      
      // Erro de tabela não existe
      if (error.message?.includes('does not exist') || error.code === 'P2021') {
        statusCode = 503;
        errorMessage = 'Tabela não encontrada. O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.';
      }
      
      // Erro de conexão com banco
      if (error.code === 'P1001' || error.message?.includes('connect')) {
        statusCode = 503;
        errorMessage = 'Erro de conexão com banco de dados. Tente novamente em alguns segundos.';
      }
      
      return reply.status(statusCode).send({
        error: 'Erro ao buscar configurações',
        message: errorMessage,
        code: error.code || 'UNKNOWN',
      });
    }
  });

  /**
   * Atualizar configurações do agente do tenant
   */
  fastify.patch('/api/agent/config', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      // DEBUG: Log detalhado do request.user
      request.log.info({
        hasUser: !!request.user,
        userId: request.user?.id,
        tenantId: request.user?.tenantId,
        userObject: request.user,
        route: request.routerPath,
        authHeader: request.headers.authorization ? 'present' : 'missing',
      }, 'DEBUG: Request user info - PATCH /api/agent/config');

      // Validação obrigatória de tenantId ANTES de qualquer chamada Prisma
      const tenantId = request.user?.tenantId;

      if (!tenantId) {
        request.log.error({
          user: request.user,
          headers: request.headers,
          route: request.routerPath,
        }, 'TenantId ausente no request - PATCH /api/agent/config');

        return reply.status(401).send({
          error: 'Tenant não identificado',
          message: 'Usuário não está associado a um tenant válido',
        });
      }

      // Log de diagnóstico
      request.log.info({
        tenantId,
        userId: request.user?.id,
        route: request.routerPath,
      }, 'Config endpoint access - PATCH /api/agent/config');

      const body = request.body as {
        name?: string;
        description?: string;
        isActive?: boolean;
        communicationConfig?: any;
        followUpConfig?: any;
        scheduleConfig?: any;
        humanizationConfig?: any;
        knowledgeBase?: any;
        intentions?: any;
        templates?: any;
        funnelStages?: any;
        lawyers?: any;
        rotationRules?: any;
        reminders?: any;
        eventConfig?: any;
      };

      // Garantir que sempre existe registro usando upsert antes de atualizar
      await fastify.prisma.agentConfig.upsert({
        where: { tenantId },
        update: {}, // Não atualizar nada ainda, só garantir que existe
        create: {
          tenantId,
          name: 'Agente Padrão',
          description: 'Configuração inicial do agente',
          isActive: true,
          communicationConfig: null,
          followUpConfig: null,
          scheduleConfig: null,
          humanizationConfig: null,
          knowledgeBase: null,
          intentions: null,
          templates: null,
          funnelStages: null,
          lawyers: null,
          rotationRules: null,
          reminders: null,
          eventConfig: null,
        },
      });

      // Atualizar com os dados recebidos
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;
      if (body.communicationConfig !== undefined) updateData.communicationConfig = body.communicationConfig;
      if (body.followUpConfig !== undefined) updateData.followUpConfig = body.followUpConfig;
      if (body.scheduleConfig !== undefined) updateData.scheduleConfig = body.scheduleConfig;
      if (body.humanizationConfig !== undefined) updateData.humanizationConfig = body.humanizationConfig;
      if (body.knowledgeBase !== undefined) updateData.knowledgeBase = body.knowledgeBase;
      if (body.intentions !== undefined) updateData.intentions = body.intentions;
      if (body.templates !== undefined) updateData.templates = body.templates;
      if (body.funnelStages !== undefined) updateData.funnelStages = body.funnelStages;
      if (body.lawyers !== undefined) updateData.lawyers = body.lawyers;
      if (body.rotationRules !== undefined) updateData.rotationRules = body.rotationRules;
      if (body.reminders !== undefined) updateData.reminders = body.reminders;
      if (body.eventConfig !== undefined) updateData.eventConfig = body.eventConfig;

      const config = await fastify.prisma.agentConfig.update({
        where: { tenantId },
        data: updateData,
      });

      fastify.log.info({ tenantId }, 'Configurações do agente atualizadas');

      return reply.send({
        success: true,
        message: 'Configurações salvas com sucesso',
        config: {
          name: config.name,
          description: config.description,
          isActive: config.isActive,
          communicationConfig: config.communicationConfig,
          followUpConfig: config.followUpConfig,
          scheduleConfig: config.scheduleConfig,
          humanizationConfig: config.humanizationConfig,
          knowledgeBase: config.knowledgeBase,
          intentions: config.intentions,
          templates: config.templates,
          funnelStages: config.funnelStages,
          lawyers: config.lawyers,
          rotationRules: config.rotationRules,
          reminders: config.reminders,
          eventConfig: config.eventConfig,
        },
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao salvar configurações do agente');
      return reply.status(500).send({
        error: 'Erro ao salvar configurações',
        message: error.message || 'Erro desconhecido',
      });
    }
  });
}
