import { FastifyInstance } from 'fastify';
import { getOrCreateTenantByClienteId } from '../../utils/tenant';
import { ultraHumanize } from '../../services/humanization.service';
import { getPipedriveClient } from '../../services/thirdPartyConfig.service';

/**
 * Análise jurídica de leads com score determinístico (sem aleatoriedade).
 * Detecta área, urgência e calcula score por pontuação objetiva.
 */
function analyzeLead(mensagem: string): {
  area: string;
  urgencia: string;
  score: number;
  acao: string;
  etapa_funil: string;
  prioridade: string;
} {
  const m = mensagem.toLowerCase();

  // --- Detecção de área jurídica por keywords ---
  let area = 'Direito Civil';
  let areaClara = false;

  if (m.includes('trabalh') || m.includes('clt') || m.includes('trabalhista') || m.includes('demiss') || m.includes('empregad')) {
    area = 'Direito Trabalhista';
    areaClara = true;
  } else if (m.includes('previdenci') || m.includes('inss') || m.includes('aposentadori') || m.includes('beneficio')) {
    area = 'Direito Previdenciário';
    areaClara = true;
  } else if (m.includes('famili') || m.includes('família') || m.includes('divorci') || m.includes('divórcio') || m.includes('guarda') || m.includes('aliment') || m.includes('pensão') || m.includes('pensao')) {
    area = 'Direito de Família';
    areaClara = true;
  } else if (m.includes('penal') || m.includes('crime') || m.includes('criminal') || m.includes('preso') || m.includes('inquérito') || m.includes('inquerito') || m.includes('policia') || m.includes('polícia')) {
    area = 'Direito Penal';
    areaClara = true;
  } else if (m.includes('empresarial') || m.includes('societari') || m.includes('empresa') || m.includes('contrato social') || m.includes('cnpj')) {
    area = 'Direito Empresarial';
    areaClara = true;
  } else if (m.includes('consumidor') || m.includes('produto') || m.includes('compra') || m.includes('loja') || m.includes('procon') || m.includes('reembolso')) {
    area = 'Direito do Consumidor';
    areaClara = true;
  } else if (m.includes('imovel') || m.includes('imóvel') || m.includes('imobiliári') || m.includes('imobiliario') || m.includes('aluguel') || m.includes('despejo') || m.includes('financiamento imobil')) {
    area = 'Direito Imobiliário';
    areaClara = true;
  } else if (m.includes('civil') || m.includes('indeniz') || m.includes('dano') || m.includes('contrato')) {
    area = 'Direito Civil';
    areaClara = true;
  }

  // --- Detecção de urgência por keywords ---
  let urgencia = 'media';
  let urgenciaAlta = false;

  const urgentKeywords = ['urgente', 'urgência', 'urgencia', 'prazo', 'audiência', 'audiencia', 'hoje', 'amanhã', 'amanha', 'imediato', 'imediata'];
  const lowKeywords = ['normal', 'quero saber', 'gostaria de saber', 'informação', 'informacao', 'curiosidade', 'pesquisando'];

  if (urgentKeywords.some(k => m.includes(k))) {
    urgencia = 'alta';
    urgenciaAlta = true;
  } else if (lowKeywords.some(k => m.includes(k))) {
    urgencia = 'baixa';
  }

  const prioridade = urgenciaAlta ? 'alta' : urgencia === 'baixa' ? 'baixa' : 'normal';

  // --- Score determinístico ---
  let score = 60; // base
  if (areaClara) score += 15;
  if (urgenciaAlta) score += 10;
  if (mensagem.length > 50) score += 5;
  const documentoKeywords = ['document', 'prova', 'contrato', 'comprovante', 'recibo', 'nota fiscal', 'laudo', 'certidão', 'certidao', 'procuração', 'procuracao'];
  if (documentoKeywords.some(k => m.includes(k))) score += 10;

  // --- Ação sugerida baseada no score ---
  let acao = 'qualificar';
  if (score >= 80) {
    acao = 'agendar_consulta';
  } else if (score >= 70) {
    acao = 'enviar_proposta';
  } else if (score < 60) {
    acao = 'coletar_mais_info';
  }

  // --- Etapa do funil ---
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
      
      // Análise jurídica determinística
      const analise = analyzeLead(mensagem);

      // Sync não-bloqueante com Pipedrive (apenas se score >= 60 e tenantId disponível)
      if (tenantId && analise.score >= 60) {
        const leadData = body as any;
        getPipedriveClient(tenantId).then(pipedrive => {
          if (!pipedrive) return;
          return pipedrive.syncLead({
            name: leadData.name || 'Lead',
            phone: leadData.phone,
            legalArea: analise.area,
            urgency: analise.urgencia,
            score: analise.score,
            status: 'novo',
          });
        }).catch((err: Error) => console.error('Pipedrive sync error:', err));
      }

      // Montar texto de resposta e humanizar antes de enviar
      const responseText = `Olá! Recebemos sua mensagem sobre ${analise.area}. Vamos analisar sua situação e retornar em breve.`;
      const { text: humanizedText, delayMs } = ultraHumanize(responseText, {
        profileType: 'informal',
        enableTypos: true,
        enableDelay: true,
      });

      // Simula tempo de digitação humana
      if (delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }

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
        resposta: humanizedText,
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
