/**
 * Rotas de Webhook do WhatsApp (Evolution API)
 * 
 * Este arquivo registra as rotas para receber webhooks do Evolution API
 * e processar mensagens do WhatsApp diretamente na plataforma.
 */

import { FastifyInstance } from 'fastify';
import { WhatsAppService, WhatsAppWebhookData } from '../services/whatsapp.service';

export async function registerWhatsAppRoutes(fastify: FastifyInstance) {
  const whatsappService = new WhatsAppService(fastify);

  /**
   * Webhook do Evolution API
   * Recebe mensagens do WhatsApp e processa com agente IA
   */
  fastify.post('/api/webhooks/whatsapp', async (request: any, reply: any) => {
    try {
      fastify.log.info({ body: request.body }, 'Webhook WhatsApp recebido');

      // Validar se Evolution API está configurada
      if (!whatsappService.isConfigured()) {
        fastify.log.warn('Evolution API não configurada. Webhook ignorado.');
        return reply.status(200).send({
          success: false,
          message: 'Evolution API não configurada',
        });
      }

      const webhookData = request.body as WhatsAppWebhookData;

      // Extrair clienteId do header ou body (se fornecido)
      const clienteId = request.headers['x-cliente-id'] || request.body?.clienteId;

      // Processar webhook
      await whatsappService.handleWebhook(webhookData, clienteId);

      return reply.status(200).send({
        success: true,
        message: 'Webhook processado com sucesso',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao processar webhook WhatsApp');
      return reply.status(500).send({
        success: false,
        error: error.message || 'Erro ao processar webhook',
      });
    }
  });

  /**
   * Endpoint para enviar mensagem manualmente (teste/admin)
   */
  fastify.post('/api/whatsapp/send', async (request: any, reply: any) => {
    try {
      const { to, message } = request.body as { to: string; message: string };

      if (!to || !message) {
        return reply.status(400).send({
          error: 'Missing required fields',
          message: 'to and message are required',
        });
      }

      if (!whatsappService.isConfigured()) {
        return reply.status(400).send({
          error: 'Evolution API not configured',
          message: 'Configure EVOLUTION_API_URL, EVOLUTION_API_KEY, and EVOLUTION_INSTANCE',
        });
      }

      await whatsappService.sendMessage(to, message);

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
   * Health check do serviço WhatsApp
   */
  fastify.get('/api/whatsapp/health', async (request: any, reply: any) => {
    return reply.status(200).send({
      configured: whatsappService.isConfigured(),
      evolutionApiUrl: process.env.EVOLUTION_API_URL ? 'configured' : 'not configured',
      evolutionApiKey: process.env.EVOLUTION_API_KEY ? 'configured' : 'not configured',
      evolutionInstance: process.env.EVOLUTION_INSTANCE ? 'configured' : 'not configured',
    });
  });
}
