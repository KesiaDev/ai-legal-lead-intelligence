/**
 * Classificador de Leads sem IA (Fallback)
 * Usado quando OpenAI não está configurado ou falha
 */

interface ClassificationInput {
  nome: string;
  telefone: string;
  email?: string;
  origem?: string;
}

interface ClassificationResult {
  score: number;
  classificacao: 'lead_quente' | 'lead_morno' | 'lead_frio';
  prioridade: 'alta' | 'media' | 'baixa';
  proximaAcao: 'chamar_whatsapp' | 'nutrir' | 'aguardar';
  motivo: string;
}

export async function fallbackLeadClassifier(
  input: ClassificationInput
): Promise<ClassificationResult> {
  let score = 0;

  // Pontuação baseada em dados disponíveis
  if (input.telefone) score += 30;
  if (input.email) score += 20;
  if (input.origem && input.origem !== 'unknown') score += 10;
  if (input.nome && input.nome.length > 3) score += 10;

  // Classificação baseada no score
  let classificacao: 'lead_quente' | 'lead_morno' | 'lead_frio' = 'lead_frio';
  let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
  let proximaAcao: 'chamar_whatsapp' | 'nutrir' | 'aguardar' = 'aguardar';

  if (score >= 70) {
    classificacao = 'lead_quente';
    prioridade = 'alta';
    proximaAcao = 'chamar_whatsapp';
  } else if (score >= 40) {
    classificacao = 'lead_morno';
    prioridade = 'media';
    proximaAcao = 'nutrir';
  }

  return {
    score,
    classificacao,
    prioridade,
    proximaAcao,
    motivo: 'Classificação automática (fallback)',
  };
}
