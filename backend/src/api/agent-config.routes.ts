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
      const updateData: any = {};

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

      // Se não há nada para atualizar, retornar sucesso sem fazer update
      if (Object.keys(updateData).length === 0) {
        fastify.log.info({ tenantId }, 'Nenhum campo para atualizar, retornando configuração existente');
        const existingConfig = await fastify.prisma.agentConfig.findUnique({
          where: { tenantId },
        });
        
        if (!existingConfig) {
          throw new Error('Configuração não encontrada após upsert');
        }
        
        return reply.send({
          success: true,
          message: 'Nenhuma alteração necessária',
          config: {
            name: existingConfig.name,
            description: existingConfig.description,
            isActive: existingConfig.isActive,
            communicationConfig: existingConfig.communicationConfig,
            followUpConfig: existingConfig.followUpConfig,
            scheduleConfig: existingConfig.scheduleConfig,
            humanizationConfig: existingConfig.humanizationConfig,
            knowledgeBase: existingConfig.knowledgeBase,
            intentions: existingConfig.intentions,
            templates: existingConfig.templates,
            funnelStages: existingConfig.funnelStages,
            lawyers: existingConfig.lawyers,
            rotationRules: existingConfig.rotationRules,
            reminders: existingConfig.reminders,
            eventConfig: existingConfig.eventConfig,
          },
        });
      }

      // Tentar atualizar com tratamento de erro específico
      let config;
      try {
        fastify.log.info({ 
          tenantId, 
          updateFields: Object.keys(updateData),
        }, 'Tentando atualizar AgentConfig');
        
        config = await fastify.prisma.agentConfig.update({
          where: { tenantId },
          data: updateData,
        });
        
        fastify.log.info({ tenantId, success: true }, 'Update de AgentConfig bem-sucedido');
      } catch (updateError: any) {
        // Log detalhado do erro de update
        fastify.log.error({ 
          tenantId,
          error: updateError.message,
          code: updateError.code,
          meta: updateError.meta,
          stack: updateError.stack,
          updateDataKeys: Object.keys(updateData),
        }, 'ERRO ESPECÍFICO ao fazer update de AgentConfig');
        
        // Se erro for "record not found", tentar criar novamente
        if (updateError.code === 'P2025') {
          fastify.log.warn({ tenantId }, 'Registro não encontrado no update, tentando criar novamente');
          try {
            config = await fastify.prisma.agentConfig.create({
              data: {
                tenantId,
                name: updateData.name ?? 'Agente Padrão',
                description: updateData.description ?? 'Configuração inicial do agente',
                isActive: updateData.isActive ?? true,
                communicationConfig: updateData.communicationConfig ?? null,
                followUpConfig: updateData.followUpConfig ?? null,
                scheduleConfig: updateData.scheduleConfig ?? null,
                humanizationConfig: updateData.humanizationConfig ?? null,
                knowledgeBase: updateData.knowledgeBase ?? null,
                intentions: updateData.intentions ?? null,
                templates: updateData.templates ?? null,
                funnelStages: updateData.funnelStages ?? null,
                lawyers: updateData.lawyers ?? null,
                rotationRules: updateData.rotationRules ?? null,
                reminders: updateData.reminders ?? null,
                eventConfig: updateData.eventConfig ?? null,
              },
            });
            fastify.log.info({ tenantId }, 'Registro criado com sucesso após falha no update');
          } catch (createError: any) {
            fastify.log.error({ 
              tenantId,
              error: createError.message,
              code: createError.code,
            }, 'Erro ao criar registro após falha no update');
            throw createError;
          }
        } else {
          // Re-throw para ser capturado pelo catch externo
          throw updateError;
        }
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
      // Log detalhado do erro
      fastify.log.error({ 
        tenantId: request.user?.tenantId,
        error: error.message, 
        stack: error.stack,
        code: error.code,
        meta: error.meta,
        errorName: error.name,
      }, 'Erro ao salvar configurações do agente');
      
      // Tratamento específico para erros comuns
      let errorMessage = error.message || 'Erro desconhecido';
      let statusCode = 500;
      
      // Erro de tabela não existe (Prisma Client desatualizado)
      if (error.message?.includes('does not exist') || 
          error.code === 'P2021' || 
          error.message?.includes('Unknown table') ||
          error.meta?.target?.includes('AgentConfig')) {
        statusCode = 503;
        errorMessage = 'Tabela não encontrada. O backend precisa ser reiniciado para aplicar migrations. Aguarde alguns minutos e tente novamente.';
        fastify.log.error({ tenantId: request.user?.tenantId }, 'CRÍTICO: Tabela AgentConfig não existe - backend precisa reiniciar');
      }
      
      // Erro de constraint (tenantId duplicado, etc)
      if (error.code === 'P2002') {
        statusCode = 409;
        errorMessage = 'Já existe uma configuração para este tenant. Tente atualizar em vez de criar.';
      }
      
      // Erro de conexão com banco
      if (error.code === 'P1001' || error.message?.includes('connect')) {
        statusCode = 503;
        errorMessage = 'Erro de conexão com banco de dados. Tente novamente em alguns segundos.';
      }
      
      // Erro de registro não encontrado
      if (error.code === 'P2025') {
        statusCode = 404;
        errorMessage = 'Configuração não encontrada. Tente recarregar a página.';
      }
      
      return reply.status(statusCode).send({
        error: 'Erro ao salvar configurações',
        message: errorMessage,
        code: error.code || 'UNKNOWN',
        // Não expor stack em produção
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  });
}
