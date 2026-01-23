/**
 * Rotas de API para Gerenciamento de Prompts
 * 
 * Permite que o frontend salve, carregue e gerencie os prompts do agente IA.
 */

import { FastifyInstance } from 'fastify';
import { PromptService } from '../services/prompt.service';
import { authenticate } from '../middleware/auth';

export async function registerPromptsRoutes(fastify: FastifyInstance) {
  const promptService = new PromptService(fastify);

  /**
   * Listar todos os prompts do tenant
   */
  fastify.get('/api/prompts', {
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

      const prompts = await promptService.listPrompts(tenantId);

      return reply.status(200).send({
        prompts,
        total: prompts.length,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao listar prompts');
      return reply.status(500).send({
        error: 'Erro ao listar prompts',
        message: error.message || 'Erro interno',
      });
    }
  });

  /**
   * Obter prompt específico por tipo
   */
  fastify.get('/api/prompts/:type', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const { type } = request.params as { type: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      const prompt = await promptService.getPrompt(type, tenantId);

      if (!prompt) {
        return reply.status(404).send({
          error: 'Prompt não encontrado',
          message: `Prompt do tipo "${type}" não encontrado`,
        });
      }

      return reply.status(200).send({ prompt });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao buscar prompt');
      return reply.status(500).send({
        error: 'Erro ao buscar prompt',
        message: error.message || 'Erro interno',
      });
    }
  });

  /**
   * Criar ou atualizar prompt
   */
  fastify.post('/api/prompts', {
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
        name: string;
        type: string;
        version?: string;
        status?: 'ativo' | 'inativo';
        provider?: 'OpenAI' | 'Google';
        model?: string;
        temperature?: number;
        maxTokens?: number;
        content: string;
        description?: string;
        objective?: string;
        limits?: string[];
        tone?: string;
        outputSchema?: string;
      };

      if (!body.name || !body.type || !body.content) {
        return reply.status(400).send({
          error: 'Campos obrigatórios faltando',
          message: 'name, type e content são obrigatórios',
        });
      }

      const promptConfig = {
        id: '', // Será gerado pelo banco
        name: body.name,
        type: body.type,
        version: body.version || 'v1.0',
        status: (body.status || 'ativo') as 'ativo' | 'inativo',
        provider: (body.provider || 'OpenAI') as 'OpenAI' | 'Google',
        model: body.model || 'gpt-4o-mini',
        content: body.content,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      };

      const savedPrompt = await promptService.savePrompt(promptConfig, tenantId);

      return reply.status(200).send({
        prompt: savedPrompt,
        message: 'Prompt salvo com sucesso',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao salvar prompt');
      return reply.status(500).send({
        error: 'Erro ao salvar prompt',
        message: error.message || 'Erro interno',
      });
    }
  });

  /**
   * Deletar prompt
   */
  fastify.delete('/api/prompts/:id', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const tenantId = user?.tenantId;

      if (!tenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      await promptService.deletePrompt(id, tenantId);

      return reply.status(200).send({
        message: 'Prompt deletado com sucesso',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao deletar prompt');
      return reply.status(500).send({
        error: 'Erro ao deletar prompt',
        message: error.message || 'Erro interno',
      });
    }
  });
}
