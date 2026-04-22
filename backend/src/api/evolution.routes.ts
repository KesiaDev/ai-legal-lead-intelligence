/**
 * Rotas Evolution API — Webhook WhatsApp
 *
 * Configure no painel Evolution API:
 *   Webhook URL: https://api.sdrjuridico.com.br/api/webhooks/evolution?tenantId=SEU_TENANT_ID
 *   Events: MESSAGES_UPSERT, CONNECTION_UPDATE
 */

import { FastifyInstance } from 'fastify';
import { EvolutionService, EvolutionWebhookData } from '../services/evolution.service';

export async function registerEvolutionRoutes(fastify: FastifyInstance) {
  const service = new EvolutionService(fastify);

  /**
   * Webhook principal da Evolution API
   * Evolution envia POST a cada mensagem recebida
   */
  fastify.post('/api/webhooks/evolution', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.query as { tenantId?: string };

      if (!tenantId) {
        fastify.log.warn('Evolution webhook sem tenantId na query string');
        return reply.status(400).send({ error: 'tenantId obrigatório na query string' });
      }

      const payload = request.body as EvolutionWebhookData;

      fastify.log.info(
        { event: payload?.event, instance: payload?.instance, tenantId },
        'Evolution API webhook recebido',
      );

      // Processar em background para responder 200 rápido
      service.handleWebhook(payload, tenantId).catch((err) => {
        fastify.log.error({ err, tenantId }, 'Erro ao processar webhook Evolution');
      });

      return reply.status(200).send({ ok: true });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro no webhook Evolution API');
      return reply.status(500).send({ error: error.message });
    }
  });

  /**
   * Endpoint para ENVIAR mensagem via Evolution API (uso interno / N8N)
   * POST /api/evolution/send
   * Body: { tenantId, to, text }
   */
  fastify.post('/api/evolution/send', async (request: any, reply: any) => {
    const token = request.headers['x-n8n-token'];
    const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';
    if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });

    const { tenantId, to, text } = request.body as any;
    if (!tenantId || !to || !text) {
      return reply.status(400).send({ error: 'tenantId, to e text são obrigatórios' });
    }

    await service.sendText(to, text, tenantId);
    return reply.send({ ok: true });
  });

  /**
   * Endpoint para ENVIAR ÁUDIO via Evolution API (uso interno / N8N)
   * POST /api/evolution/send-audio
   * Body: { tenantId, to, text }  — converte texto → áudio ElevenLabs → envia
   */
  fastify.post('/api/evolution/send-audio', async (request: any, reply: any) => {
    const token = request.headers['x-n8n-token'];
    const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';
    if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });

    const { tenantId, to, text } = request.body as any;
    if (!tenantId || !to || !text) {
      return reply.status(400).send({ error: 'tenantId, to e text são obrigatórios' });
    }

    await service.sendAudio(to, text, tenantId);
    return reply.send({ ok: true });
  });
}
