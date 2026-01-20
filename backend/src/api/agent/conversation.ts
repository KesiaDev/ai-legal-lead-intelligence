import { FastifyInstance } from 'fastify';
import { getOrCreateTenantByClienteId } from '../../utils/tenant';

/**
 * Estados da conversa
 */
type ConversationState = 
  | 'greeting'
  | 'lgpd_consent'
  | 'collecting_name'
  | 'collecting_area'
  | 'collecting_demand'
  | 'collecting_urgency'
  | 'collecting_location'
  | 'collecting_contact'
  | 'scheduling'
  | 'complete'
  | 'rejected';

/**
 * Dados coletados durante a conversa
 */
interface ConversationData {
  lead_id: string;
  state: ConversationState;
  lgpd_consent?: boolean;
  name?: string;
  area?: string;
  demand?: string;
  urgency?: 'baixa' | 'media' | 'alta';
  location?: string;
  contact_preference?: string;
  wants_schedule?: boolean;
  conversation_history: Array<{
    role: 'user' | 'bot';
    message: string;
    timestamp: string;
  }>;
}

/**
 * Resposta do agente IA
 */
interface AgentResponse {
  message: string;
  next_state: ConversationState;
  options?: string[];
  requires_human?: boolean;
  analysis?: {
    area?: string;
    urgency?: 'baixa' | 'media' | 'alta';
    score?: number;
    action?: string;
  };
}

/**
 * Análise básica da mensagem (mock - será substituído por OpenAI)
 */
function analyzeMessage(message: string, currentData: ConversationData): {
  area?: string;
  urgency?: 'baixa' | 'media' | 'alta';
  score: number;
  action: string;
} {
  const msgLower = message.toLowerCase();
  
  // Detectar área jurídica
  let area: string | undefined;
  if (msgLower.includes('trabalh') || msgLower.includes('clt') || msgLower.includes('demissão')) {
    area = 'Direito Trabalhista';
  } else if (msgLower.includes('previdenci') || msgLower.includes('inss') || msgLower.includes('aposentadoria')) {
    area = 'Direito Previdenciário';
  } else if (msgLower.includes('familia') || msgLower.includes('divorcio') || msgLower.includes('pensão')) {
    area = 'Direito de Família';
  } else if (msgLower.includes('penal') || msgLower.includes('crime') || msgLower.includes('prisão')) {
    area = 'Direito Penal';
  } else if (msgLower.includes('empresarial') || msgLower.includes('societario') || msgLower.includes('contrato')) {
    area = 'Direito Empresarial';
  }
  
  // Detectar urgência
  let urgency: 'baixa' | 'media' | 'alta' = 'media';
  if (msgLower.includes('urgent') || msgLower.includes('imediato') || msgLower.includes('hoje') || msgLower.includes('prazo')) {
    urgency = 'alta';
  } else if (msgLower.includes('consulta') || msgLower.includes('informação') || msgLower.includes('dúvida')) {
    urgency = 'baixa';
  }
  
  // Calcular score (mock)
  let score = 60;
  if (area) score += 15;
  if (urgency === 'alta') score += 15;
  if (currentData.name) score += 5;
  if (currentData.location) score += 5;
  
  // Definir ação
  let action = 'continue_qualifying';
  if (score >= 80 && currentData.demand && currentData.area) {
    action = 'ready_to_schedule';
  } else if (score < 50) {
    action = 'need_more_info';
  }
  
  return { area, urgency, score, action };
}

/**
 * Gera resposta do agente baseada no estado atual
 */
function generateAgentResponse(
  userMessage: string,
  currentData: ConversationData
): AgentResponse {
  const msgLower = userMessage.toLowerCase();
  
  // Análise da mensagem
  const analysis = analyzeMessage(userMessage, currentData);
  
  switch (currentData.state) {
    case 'greeting':
      return {
        message: 'Olá! Sou o Super SDR Advogados, seu assistente virtual de pré-atendimento jurídico. Estou aqui para ajudá-lo(a) a entender sua demanda e conectá-lo(a) com o advogado mais adequado.\n\nAntes de prosseguirmos, informamos que seus dados serão utilizados exclusivamente para contato e encaminhamento ao advogado responsável, em conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\nVocê concorda em prosseguir com o atendimento?',
        next_state: 'lgpd_consent',
        options: ['Sim, concordo', 'Não concordo'],
      };
    
    case 'lgpd_consent':
      if (msgLower.includes('sim') || msgLower.includes('concordo') || msgLower.includes('aceito')) {
        return {
          message: 'Perfeito! Obrigado por seu consentimento. Para que eu possa ajudá-lo(a) da melhor forma, qual é o seu nome completo?',
          next_state: 'collecting_name',
        };
      } else {
        return {
          message: 'Compreendemos. Sem o consentimento, não podemos prosseguir com o atendimento. Agradecemos o contato.',
          next_state: 'rejected',
        };
      }
    
    case 'collecting_name':
      return {
        message: `Olá, ${userMessage}! Agora, por favor, selecione a área do Direito relacionada à sua demanda:`,
        next_state: 'collecting_area',
        options: [
          'Direito Trabalhista',
          'Direito Previdenciário',
          'Direito de Família',
          'Direito Cível',
          'Direito Penal',
          'Direito Empresarial',
        ],
      };
    
    case 'collecting_area':
      return {
        message: 'Por favor, descreva brevemente sua demanda. Lembre-se: este é apenas um primeiro contato para triagem. Não oferecemos consultoria jurídica por este canal.',
        next_state: 'collecting_demand',
        analysis: {
          area: analysis.area || userMessage,
        },
      };
    
    case 'collecting_demand':
      // Se já tem área detectada, pode pular para urgência
      if (analysis.area && !currentData.area) {
        return {
          message: `Entendi. Você mencionou algo relacionado a ${analysis.area}. Qual o grau de urgência da sua demanda?`,
          next_state: 'collecting_urgency',
          options: [
            'Baixa - Posso aguardar alguns dias',
            'Média - Preciso de resposta em breve',
            'Alta - Situação urgente',
          ],
          analysis: {
            area: analysis.area,
            urgency: analysis.urgency,
            score: analysis.score,
            action: analysis.action,
          },
        };
      }
      
      return {
        message: 'Qual o grau de urgência da sua demanda?',
        next_state: 'collecting_urgency',
        options: [
          'Baixa - Posso aguardar alguns dias',
          'Média - Preciso de resposta em breve',
          'Alta - Situação urgente',
        ],
        analysis: {
          urgency: analysis.urgency,
          score: analysis.score,
        },
      };
    
    case 'collecting_urgency':
      let detectedUrgency: 'baixa' | 'media' | 'alta' = 'media';
      if (msgLower.includes('alta') || msgLower.includes('urgent')) {
        detectedUrgency = 'alta';
      } else if (msgLower.includes('baixa')) {
        detectedUrgency = 'baixa';
      }
      
      return {
        message: 'Em qual cidade e estado você está localizado(a)?',
        next_state: 'collecting_location',
        analysis: {
          urgency: detectedUrgency,
        },
      };
    
    case 'collecting_location':
      return {
        message: 'Qual sua preferência de contato?',
        next_state: 'collecting_contact',
        options: ['WhatsApp', 'Ligação telefônica', 'E-mail'],
      };
    
    case 'collecting_contact':
      // Se score alto e tem todas as info, pode agendar
      if (analysis.score >= 80 && currentData.demand && currentData.area) {
        return {
          message: 'Perfeito! Você gostaria de agendar uma conversa com um de nossos advogados?',
          next_state: 'scheduling',
          options: ['Sim, gostaria de agendar', 'Não, apenas gostaria de informações'],
          analysis: {
            area: currentData.area,
            urgency: currentData.urgency || analysis.urgency,
            score: analysis.score,
            action: 'ready_to_schedule',
          },
        };
      }
      
      // Caso contrário, fazer mais perguntas ou agendar mesmo assim
      return {
        message: 'Você gostaria de agendar uma conversa com um de nossos advogados?',
        next_state: 'scheduling',
        options: ['Sim, gostaria de agendar', 'Não, apenas gostaria de informações'],
        analysis: {
          area: currentData.area,
          urgency: currentData.urgency || analysis.urgency,
          score: analysis.score,
        },
      };
    
    case 'scheduling':
      if (msgLower.includes('sim') || msgLower.includes('agendar')) {
        return {
          message: 'Perfeito! Seus dados foram registrados com sucesso. Um de nossos advogados entrará em contato em breve através do meio de comunicação escolhido.\n\nAgradecemos a confiança em nossos serviços jurídicos.',
          next_state: 'complete',
          analysis: {
            area: currentData.area,
            urgency: currentData.urgency,
            score: analysis.score,
            action: 'scheduled',
          },
        };
      } else {
        return {
          message: 'Entendido. Registramos seu interesse. Um de nossos advogados entrará em contato em breve para mais informações.\n\nAgradecemos o contato!',
          next_state: 'complete',
          analysis: {
            area: currentData.area,
            urgency: currentData.urgency,
            score: analysis.score,
            action: 'info_only',
          },
        };
      }
    
    case 'complete':
    case 'rejected':
      return {
        message: 'Obrigado pelo contato. Se precisar de mais alguma coisa, estaremos à disposição.',
        next_state: currentData.state,
      };
    
    default:
      return {
        message: 'Como posso ajudá-lo hoje?',
        next_state: 'greeting',
      };
  }
}

/**
 * Registra a rota de conversação com agente IA
 * Endpoint conversacional que gerencia o fluxo de qualificação
 */
export async function registerConversationRoute(fastify: FastifyInstance) {
  // POST: Iniciar ou continuar conversa
  fastify.post('/api/agent/conversation', async (request: any, reply: any) => {
    try {
      fastify.log.info({ body: request.body }, 'CONVERSATION REQUEST');
      
      const body = request.body as any;
      
      // Validação
      if (!body || typeof body !== 'object') {
        return reply.status(400).send({
          error: 'Invalid request body',
          message: 'Body must be a valid JSON object',
        });
      }
      
      const { lead_id, message, conversation_data, clienteId } = body;
      
      if (!lead_id || typeof lead_id !== 'string') {
        return reply.status(400).send({
          error: 'Missing or invalid lead_id',
          message: 'lead_id is required and must be a string',
        });
      }
      
      if (!message || typeof message !== 'string') {
        return reply.status(400).send({
          error: 'Missing or invalid message',
          message: 'message is required and must be a string',
        });
      }

      // Obter tenantId baseado no clienteId (se fornecido)
      let tenantId: string | undefined;
      if (clienteId && typeof clienteId === 'string') {
        tenantId = await getOrCreateTenantByClienteId(clienteId);
        fastify.log.info({ clienteId, tenantId }, 'Tenant identificado para conversação');
      }
      
      // Recuperar ou inicializar dados da conversa
      let currentData: ConversationData = conversation_data || {
        lead_id,
        state: 'greeting',
        conversation_history: [],
      };
      
      // Adicionar mensagem do usuário ao histórico
      currentData.conversation_history.push({
        role: 'user',
        message,
        timestamp: new Date().toISOString(),
      });
      
      // Processar mensagem e atualizar dados
      if (currentData.state === 'collecting_name') {
        currentData.name = message;
      } else if (currentData.state === 'collecting_area') {
        currentData.area = message;
      } else if (currentData.state === 'collecting_demand') {
        currentData.demand = message;
      } else if (currentData.state === 'collecting_urgency') {
        const msgLower = message.toLowerCase();
        if (msgLower.includes('alta') || msgLower.includes('urgent')) {
          currentData.urgency = 'alta';
        } else if (msgLower.includes('baixa')) {
          currentData.urgency = 'baixa';
        } else {
          currentData.urgency = 'media';
        }
      } else if (currentData.state === 'collecting_location') {
        currentData.location = message;
      } else if (currentData.state === 'collecting_contact') {
        currentData.contact_preference = message;
      } else if (currentData.state === 'scheduling') {
        currentData.wants_schedule = message.toLowerCase().includes('sim') || message.toLowerCase().includes('agendar');
      } else if (currentData.state === 'lgpd_consent') {
        currentData.lgpd_consent = message.toLowerCase().includes('sim') || message.toLowerCase().includes('concordo');
      }
      
      // Gerar resposta do agente
      const agentResponse = generateAgentResponse(message, currentData);
      
      // Atualizar estado
      currentData.state = agentResponse.next_state;
      
      // Adicionar resposta do bot ao histórico
      currentData.conversation_history.push({
        role: 'bot',
        message: agentResponse.message,
        timestamp: new Date().toISOString(),
      });
      
      // Retornar resposta
      return reply.status(200).send({
        lead_id,
        ...(tenantId && { clienteId: tenantId }),
        state: currentData.state,
        message: agentResponse.message,
        options: agentResponse.options,
        conversation_data: currentData,
        analysis: agentResponse.analysis,
        requires_human: agentResponse.requires_human || false,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      fastify.log.error('Conversation error:', error);
      return reply.status(500).send({
        error: 'Failed to process conversation',
        message: error.message || 'Internal server error',
      });
    }
  });
  
  // GET: Iniciar nova conversa
  fastify.get('/api/agent/conversation/:lead_id', async (request: any, reply: any) => {
    try {
      const { lead_id } = request.params;
      
      if (!lead_id) {
        return reply.status(400).send({
          error: 'Missing lead_id',
          message: 'lead_id is required',
        });
      }
      
      // Iniciar nova conversa
      const initialData: ConversationData = {
        lead_id,
        state: 'greeting',
        conversation_history: [],
      };
      
      const agentResponse = generateAgentResponse('', initialData);
      initialData.state = agentResponse.next_state;
      
      initialData.conversation_history.push({
        role: 'bot',
        message: agentResponse.message,
        timestamp: new Date().toISOString(),
      });
      
      return reply.status(200).send({
        lead_id,
        state: initialData.state,
        message: agentResponse.message,
        options: agentResponse.options,
        conversation_data: initialData,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      fastify.log.error('Conversation init error:', error);
      return reply.status(500).send({
        error: 'Failed to initialize conversation',
        message: error.message || 'Internal server error',
      });
    }
  });
}
