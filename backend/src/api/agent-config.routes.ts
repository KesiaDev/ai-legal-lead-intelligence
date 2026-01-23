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
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      const config = await fastify.prisma.agentConfig.findUnique({
        where: { tenantId },
      });

      if (!config) {
        // Retornar configurações padrão se não existir
        return reply.send({
          name: 'SDR Jurídico',
          description: '',
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
        });
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
      fastify.log.error({ error }, 'Erro ao buscar configurações do agente');
      return reply.status(500).send({
        error: 'Erro ao buscar configurações',
        message: error.message || 'Erro desconhecido',
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
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

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

      // Verificar se já existe configuração
      const existing = await fastify.prisma.agentConfig.findUnique({
        where: { tenantId },
      });

      let config;
      if (existing) {
        // Atualizar existente
        config = await fastify.prisma.agentConfig.update({
          where: { tenantId },
          data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.description !== undefined && { description: body.description }),
            ...(body.isActive !== undefined && { isActive: body.isActive }),
            ...(body.communicationConfig !== undefined && { communicationConfig: body.communicationConfig }),
            ...(body.followUpConfig !== undefined && { followUpConfig: body.followUpConfig }),
            ...(body.scheduleConfig !== undefined && { scheduleConfig: body.scheduleConfig }),
            ...(body.humanizationConfig !== undefined && { humanizationConfig: body.humanizationConfig }),
            ...(body.knowledgeBase !== undefined && { knowledgeBase: body.knowledgeBase }),
            ...(body.intentions !== undefined && { intentions: body.intentions }),
            ...(body.templates !== undefined && { templates: body.templates }),
            ...(body.funnelStages !== undefined && { funnelStages: body.funnelStages }),
            ...(body.lawyers !== undefined && { lawyers: body.lawyers }),
            ...(body.rotationRules !== undefined && { rotationRules: body.rotationRules }),
            ...(body.reminders !== undefined && { reminders: body.reminders }),
            ...(body.eventConfig !== undefined && { eventConfig: body.eventConfig }),
            updatedAt: new Date(),
          },
        });
      } else {
        // Criar novo
        config = await fastify.prisma.agentConfig.create({
          data: {
            tenantId,
            name: body.name || 'SDR Jurídico',
            description: body.description || null,
            isActive: body.isActive !== undefined ? body.isActive : true,
            communicationConfig: body.communicationConfig || null,
            followUpConfig: body.followUpConfig || null,
            scheduleConfig: body.scheduleConfig || null,
            humanizationConfig: body.humanizationConfig || null,
            knowledgeBase: body.knowledgeBase || null,
            intentions: body.intentions || null,
            templates: body.templates || null,
            funnelStages: body.funnelStages || null,
            lawyers: body.lawyers || null,
            rotationRules: body.rotationRules || null,
            reminders: body.reminders || null,
            eventConfig: body.eventConfig || null,
          },
        });
      }

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
