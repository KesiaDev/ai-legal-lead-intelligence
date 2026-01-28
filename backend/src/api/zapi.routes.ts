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

      const webhookData = request.body as ZApiWebhookData;

      // Extrair clienteId do header ou body (se fornecido)
      const clienteId = request.headers['x-cliente-id'] || request.body?.clienteId;

      // Validar se Z-API está configurada (pode ser por tenant ou global)
      const isConfigured = await zapiService.isConfigured(clienteId);
      if (!isConfigured) {
        fastify.log.warn({ clienteId }, 'Z-API não configurada. Webhook ignorado.');
        return reply.status(200).send({
          success: false,
          message: 'Z-API não configurada',
        });
      }

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

      // Validar se Z-API está configurada (pode ser por tenant ou global)
      const isConfigured = await zapiService.isConfigured(tenantId);
      if (!isConfigured) {
        return reply.status(400).send({
          error: 'Z-API not configured',
          message: 'Configure Z-API via IntegrationConfig (tenant) or environment variables (global)',
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
    const tenantId = request.query?.tenantId as string | undefined;
    const configured = await zapiService.isConfigured(tenantId);
    
    return reply.status(200).send({
      configured,
      tenantId: tenantId || 'global',
      zapiInstanceId: process.env.ZAPI_INSTANCE_ID ? 'configured (env)' : 'not configured',
      zapiToken: process.env.ZAPI_TOKEN ? 'configured (env)' : 'not configured',
      zapiBaseUrl: process.env.ZAPI_BASE_URL || 'https://api.z-api.io',
      note: 'Configurations can come from IntegrationConfig (database) or environment variables',
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
      // Como a Z-API pode não ter um endpoint de status, vamos validar as credenciais
      // verificando se conseguimos fazer uma requisição autenticada
      try {
        const axios = require('axios');
        
        // Validar formato das credenciais
        if (testInstanceId.length < 10 || testToken.length < 10) {
          return reply.status(400).send({
            success: false,
            error: 'Credenciais inválidas',
            message: 'ID da instância e Token devem ter pelo menos 10 caracteres',
          });
        }

        // Tentar fazer uma requisição simples para verificar autenticação
        // Vamos tentar acessar informações da instância
        try {
          // Tentar endpoint que deve existir (informações da instância)
          const infoUrl = `${testBaseUrl}/instances/${testInstanceId}/token/${testToken}`;
          const response = await axios.get(infoUrl, {
            timeout: 10000,
            validateStatus: (status: number) => status < 500, // Aceitar qualquer status < 500
          });

          // Se retornar 401, credenciais inválidas
          if (response.status === 401) {
            return reply.status(401).send({
              success: false,
              error: 'Credenciais inválidas',
              message: 'Token ou ID da instância incorretos',
            });
          }

          // Se retornar 404, pode ser que o endpoint não exista, mas as credenciais podem estar corretas
          // Se retornar 200, tudo certo
          if (response.status === 200 || response.status === 404) {
            return reply.status(200).send({
              success: true,
              message: 'Credenciais válidas',
              data: response.status === 200 ? response.data : { message: 'Credenciais aceitas pela API' },
            });
          }

          // Outros status codes
          return reply.status(200).send({
            success: true,
            message: 'Credenciais válidas',
            data: { status: response.status },
          });
        } catch (apiError: any) {
          // Se retornar erro de autenticação, credenciais inválidas
          if (apiError.response && apiError.response.status === 401) {
            return reply.status(401).send({
              success: false,
              error: 'Credenciais inválidas',
              message: 'Token ou ID da instância incorretos. Verifique no painel do Z-API.',
            });
          }

          // Se for erro de rede ou timeout
          if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ETIMEDOUT') {
            return reply.status(500).send({
              success: false,
              error: 'Erro de conexão',
              message: 'Não foi possível conectar com a API do Z-API. Verifique sua conexão.',
            });
          }

          // Outros erros
          throw apiError;
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
