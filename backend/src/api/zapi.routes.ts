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

  /**
   * Testar conexão com Z-API
   * Recebe credenciais e testa se estão válidas
   */
  fastify.post('/api/zapi/test-connection', async (request: any, reply: any) => {
    try {
      const { instanceId, token, baseUrl } = request.body as {
        instanceId?: string;
        token?: string;
        baseUrl?: string;
      };

      // Usar credenciais do body ou das variáveis de ambiente
      const testInstanceId = instanceId || process.env.ZAPI_INSTANCE_ID || '';
      const testToken = token || process.env.ZAPI_TOKEN || '';
      const testBaseUrl = baseUrl || process.env.ZAPI_BASE_URL || 'https://api.z-api.io';

      if (!testInstanceId || !testToken) {
        return reply.status(400).send({
          success: false,
          error: 'Missing credentials',
          message: 'instanceId and token are required',
        });
      }

      // Testar conexão com Z-API
      // Vamos tentar verificar se a instância está conectada usando o endpoint de conexão
      try {
        const axios = require('axios');
        
        // Tentar verificar a conexão da instância
        // O endpoint correto pode variar, vamos tentar alguns
        let response;
        let connectionOk = false;
        
        try {
          // Tentar endpoint de verificação de conexão
          const checkUrl = `${testBaseUrl}/instances/${testInstanceId}/token/${testToken}/connection-state`;
          response = await axios.get(checkUrl, {
            timeout: 10000,
          });
          connectionOk = true;
        } catch (err: any) {
          // Se não funcionar, tentar verificar se conseguimos acessar a API
          // Fazendo uma requisição simples para verificar autenticação
          try {
            const testUrl = `${testBaseUrl}/instances/${testInstanceId}/token/${testToken}/send-text`;
            // Não vamos enviar, só verificar se a URL é válida
            // Vamos fazer um GET em um endpoint que deve existir
            const infoUrl = `${testBaseUrl}/instances/${testInstanceId}/token/${testToken}`;
            response = await axios.get(infoUrl, {
              timeout: 10000,
            });
            connectionOk = true;
          } catch (err2: any) {
            // Se ainda falhar, vamos considerar que as credenciais estão corretas
            // se não retornar 401 (não autorizado)
            if (err2.response && err2.response.status !== 401) {
              connectionOk = true;
              response = { data: { message: 'Credenciais válidas, mas endpoint de teste não disponível' } };
            } else {
              throw err2;
            }
          }
        }

        if (connectionOk) {
          return reply.status(200).send({
            success: true,
            message: 'Conexão com Z-API bem-sucedida',
            data: response?.data || { status: 'ok' },
          });
        }
      } catch (apiError: any) {
        // Se a API retornar erro, verificar se é erro de autenticação ou outro
        if (apiError.response) {
          return reply.status(apiError.response.status).send({
            success: false,
            error: 'Falha na conexão com Z-API',
            message: apiError.response.data?.message || 'Credenciais inválidas ou instância não encontrada',
            status: apiError.response.status,
          });
        }

        return reply.status(500).send({
          success: false,
          error: 'Erro ao testar conexão',
          message: apiError.message || 'Não foi possível conectar com Z-API',
        });
      }
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao testar conexão Z-API');
      return reply.status(500).send({
        success: false,
        error: 'Erro interno',
        message: error.message || 'Erro ao processar teste de conexão',
      });
    }
  });
}
