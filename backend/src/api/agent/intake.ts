import { FastifyInstance } from 'fastify';
import { getOrCreateTenantByClienteId } from '../../utils/tenant';

/**
 * Função mock para análise jurídica de leads
 * TODO: Substituir por integração real com OpenAI/IA
 */
function analyzeLead(mensagem: string): {
  area: string;
  urgencia: string;
  score: number;
  acao: string;
  etapa_funil: string;
  prioridade: string;
} {
  // Análise mock - retorna dados fixos para teste
  // Esta função será substituída pela IA real no futuro
  
  const mensagemLower = mensagem.toLowerCase();
  
  // Detecção básica de área jurídica (mock)
  let area = 'Direito Civil';
  if (mensagemLower.includes('trabalh') || mensagemLower.includes('clt')) {
    area = 'Direito Trabalhista';
  } else if (mensagemLower.includes('previdenci') || mensagemLower.includes('inss')) {
    area = 'Direito Previdenciário';
  } else if (mensagemLower.includes('familia') || mensagemLower.includes('divorcio')) {
    area = 'Direito de Família';
  } else if (mensagemLower.includes('penal') || mensagemLower.includes('crime')) {
    area = 'Direito Penal';
  } else if (mensagemLower.includes('empresarial') || mensagemLower.includes('societario')) {
    area = 'Direito Empresarial';
  }
  
  // Detecção básica de urgência (mock)
  let urgencia = 'media';
  let prioridade = 'normal';
  if (mensagemLower.includes('urgent') || mensagemLower.includes('imediato') || mensagemLower.includes('hoje')) {
    urgencia = 'alta';
    prioridade = 'alta';
  } else if (mensagemLower.includes('prazo') || mensagemLower.includes('venc')) {
    urgencia = 'alta';
    prioridade = 'alta';
  } else if (mensagemLower.includes('consulta') || mensagemLower.includes('informacao')) {
    urgencia = 'baixa';
    prioridade = 'baixa';
  }
  
  // Score de viabilidade (mock)
  const score = Math.floor(Math.random() * 40) + 60; // Entre 60-100
  
  // Ação sugerida (mock)
  let acao = 'qualificar';
  if (score >= 80) {
    acao = 'agendar_consulta';
  } else if (score >= 70) {
    acao = 'enviar_proposta';
  } else if (score < 60) {
    acao = 'coletar_mais_info';
  }
  
  // Etapa do funil (mock)
  let etapa_funil = 'novo';
  if (acao === 'agendar_consulta') {
    etapa_funil = 'qualificado';
  } else if (acao === 'enviar_proposta') {
    etapa_funil = 'em_triagem';
  }
  
  return {
    area,
    urgencia,
    score,
    acao,
    etapa_funil,
    prioridade,
  };
}

/**
 * Registra a rota de intake de leads
 * Endpoint isolado para receber leads do n8n
 */
export async function registerIntakeRoute(fastify: FastifyInstance) {
  fastify.post('/api/agent/intake', async (request: any, reply: any) => {
    try {
      // Log da requisição
      fastify.log.info({ body: request.body }, 'INTAKE REQUEST');
      
      const body = request.body as any;
      
      // Validação do body
      if (!body || typeof body !== 'object') {
        fastify.log.warn({ body }, 'Invalid body in intake');
        return reply.status(400).send({ 
          error: 'Invalid request body',
          message: 'Body must be a valid JSON object'
        });
      }
      
      // Validação dos campos obrigatórios
      const { lead_id, mensagem, canal, clienteId } = body;
      
      if (!lead_id || typeof lead_id !== 'string') {
        return reply.status(400).send({ 
          error: 'Missing or invalid lead_id',
          message: 'lead_id is required and must be a string'
        });
      }
      
      if (!mensagem || typeof mensagem !== 'string') {
        return reply.status(400).send({ 
          error: 'Missing or invalid mensagem',
          message: 'mensagem is required and must be a string'
        });
      }
      
      // Canal é opcional, mas se fornecido deve ser string
      if (canal && typeof canal !== 'string') {
        return reply.status(400).send({ 
          error: 'Invalid canal',
          message: 'canal must be a string if provided'
        });
      }

      // Obter tenantId baseado no clienteId (se fornecido)
      let tenantId: string | undefined;
      if (clienteId && typeof clienteId === 'string') {
        tenantId = await getOrCreateTenantByClienteId(clienteId);
        fastify.log.info({ clienteId, tenantId }, 'Tenant identificado para intake');
      }
      
      // Chamar função de análise jurídica (mock por enquanto)
      const analise = analyzeLead(mensagem);
      
      // Retornar resposta estruturada
      return reply.status(200).send({
        lead_id,
        canal: canal || 'webhook',
        ...(tenantId && { clienteId: tenantId }),
        analise: {
          area: analise.area,
          urgencia: analise.urgencia,
          score: analise.score,
          acao: analise.acao,
          etapa_funil: analise.etapa_funil,
          prioridade: analise.prioridade,
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      fastify.log.error('Intake error:', error);
      return reply.status(500).send({ 
        error: 'Failed to process intake',
        message: error.message || 'Internal server error'
      });
    }
  });
}
