/**
 * Orquestrador de Classificação de Leads
 * Decide automaticamente entre IA (OpenAI) ou Fallback
 */

import { fallbackLeadClassifier } from './leadFallbackClassifier';
import { aiLeadClassifier } from './leadAiClassifier';

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

export async function classifyLead(
  input: ClassificationInput
): Promise<ClassificationResult> {
  // Tenta usar IA se OpenAI estiver configurado
  try {
    if (process.env.OPENAI_API_KEY) {
      return await aiLeadClassifier(input);
    }
  } catch (err) {
    console.warn('AI classification failed, using fallback:', err);
  }

  // Fallback automático (sempre funciona)
  return fallbackLeadClassifier(input);
}
