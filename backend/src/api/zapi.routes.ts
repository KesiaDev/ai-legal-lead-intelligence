/**
 * Rotas de Webhook do WhatsApp (Z-API)
 * 
 * Este arquivo registra as rotas para receber webhooks do Z-API
 * e processar mensagens do WhatsApp diretamente na plataforma.
 */

import { FastifyInstance } from 'fastify';
import { ZApiService, ZApiWebhookData } from '../services/zapi.service';

export async function registerZApiRoutes(fastify: FastifyInstance) {
  const zapiService = new ZApiService(fastify);

  /**
   * Webhook do Z-API
   * Recebe mensagens do WhatsApp e processa com agente IA
   */
  fastify.post('/api/webhooks/zapi', async (request: any, reply: any) => {
    try {
      fastify.log.info({ body: request.body }, 'Webhook Z-API recebido');

      // Validar se Z-API está configurada
      if (!zapiService.isConfigured()) {
        fastify.log.warn('Z-API não configurada. Webhook ignorado.');
        return reply.status(200).send({
          success: false,
          message: 'Z-API não configurada',
        });
      }

      const webhookData = request.body as ZApiWebhookData;

      // Extrair clienteId do header ou body (se fornecido)
      const clienteId = request.headers['x-cliente-id'] || request.body?.clienteId;

      // Processar webhook
      await zapiService.handleWebhook(webhookData, clienteId);

      return reply.status(200).send({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao processar webhook Z-API');
      return reply.status(500).send({
        success: false,
        error: error.message || 'Erro ao processar webhook',
      });
    }
  });

  /**
   * Endpoint para enviar mensagem manualmente (teste/admin)
   */
  fastify.post('/api/zapi/send', async (request: any, reply: any) => {
    try {
      const { to, message, tenantId } = request.body as { 
        to: string; 
        message: string;
        tenantId?: string;
      };

      if (!to || !message) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'to and message are required',
        });
      }

      if (!zapiService.isConfigured()) {
        return reply.status(400).send({
          error: 'Z-API not configured',
          message: 'Configure ZAPI_INSTANCE_ID and ZAPI_TOKEN',
        });
      }

      await zapiService.sendMessage(to, message, tenantId);

      return reply.status(200).send({
        success: true,
        message: 'Mensagem enviada com sucesso',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao enviar mensagem');
      return reply.status(500).send({
        success: false,
        error: error.message || 'Erro ao enviar mensagem',
      });
    }
  });

  /**
   * Health check do serviço Z-API
   */
  fastify.get('/api/zapi/health', async (request: any, reply: any) => {
    return reply.status(200).send({
      configured: zapiService.isConfigured(),
      zapiInstanceId: process.env.ZAPI_INSTANCE_ID ? 'configured' : 'not configured',
      zapiToken: process.env.ZAPI_TOKEN ? 'configured' : 'not configured',
      zapiBaseUrl: process.env.ZAPI_BASE_URL || 'https://api.z-api.io',
    });
  });
}
