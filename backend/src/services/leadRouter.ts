/**
 * Roteador Inteligente de Leads
 * Decide automaticamente o destino do lead baseado na classificação
 */

interface Classification {
  score: number;
  classificacao: 'lead_quente' | 'lead_morno' | 'lead_frio';
  prioridade: 'alta' | 'media' | 'baixa';
  proximaAcao: string;
  motivo: string;
}

interface RoutingResult {
  destino: 'whatsapp_humano' | 'sdr_ia' | 'nutricao';
  urgencia: 'imediata' | 'alta' | 'normal';
  descricao: string;
}

/**
 * Roteia lead baseado na classificação
 * 
 * Regras:
 * - lead_quente → whatsapp_humano, imediata
 * - lead_morno → sdr_ia, alta
 * - lead_frio → nutricao, normal
 */
export function routeLead(classification: Classification): RoutingResult {
  switch (classification.classificacao) {
    case 'lead_quente':
      return {
        destino: 'whatsapp_humano',
        urgencia: 'imediata',
        descricao: 'Lead quente direcionado para contato humano imediato via WhatsApp',
      };

    case 'lead_morno':
      return {
        destino: 'sdr_ia',
        urgencia: 'alta',
        descricao: 'Lead morno direcionado para SDR IA para qualificação',
      };

    case 'lead_frio':
      return {
        destino: 'nutricao',
        urgencia: 'normal',
        descricao: 'Lead frio direcionado para nutrição de conteúdo',
      };

    default:
      // Fallback seguro (nunca deve chegar aqui, mas garante segurança)
      return {
        destino: 'nutricao',
        urgencia: 'normal',
        descricao: 'Lead direcionado para nutrição (fallback)',
      };
  }
}

/**
 * Retorna routing padrão (fallback seguro)
 * Usado quando classificação não está disponível ou falha
 */
export function getDefaultRouting(): RoutingResult {
  return {
    destino: 'nutricao',
    urgencia: 'normal',
    descricao: 'Lead direcionado para nutrição (fallback padrão)',
  };
}
