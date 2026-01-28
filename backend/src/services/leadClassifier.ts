/**
 * Orquestrador de Classificação de Leads
 * Decide automaticamente entre IA (OpenAI) ou Fallback
 */

import { FastifyInstance } from 'fastify';
import { fallbackLeadClassifier } from './leadFallbackClassifier';
import { aiLeadClassifier } from './leadAiClassifier';
import { IntegrationConfigService } from './integrationConfig.service';

interface ClassificationInput {
  nome: string;
  telefone: string;
  email?: string;
  origem?: string;
  tenantId?: string; // Adicionado para suportar multi-tenant
}

interface ClassificationResult {
  score: number;
  classificacao: 'lead_quente' | 'lead_morno' | 'lead_frio';
  prioridade: 'alta' | 'media' | 'baixa';
  proximaAcao: 'chamar_whatsapp' | 'nutrir' | 'aguardar';
  motivo: string;
}

export async function classifyLead(
  input: ClassificationInput,
  fastify?: FastifyInstance
): Promise<ClassificationResult> {
  // Tenta usar IA se OpenAI estiver configurado (banco ou env)
  try {
    let hasOpenAI = false;

    // Verificar se OpenAI está configurado via IntegrationConfigService
    if (fastify) {
      const configService = new IntegrationConfigService(fastify);
      hasOpenAI = await configService.isConfigured('openai', input.tenantId);
    } else {
      // Fallback: verificar env var diretamente
      hasOpenAI = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && process.env.OPENAI_API_KEY !== 'sua-chave-aqui');
    }

    if (hasOpenAI) {
      return await aiLeadClassifier(input, fastify);
    }
  } catch (err: any) {
    if (fastify) {
      fastify.log.warn({ error: err, tenantId: input.tenantId }, 'AI classification failed, using fallback');
    } else {
      console.warn('AI classification failed, using fallback:', err);
    }
  }

  // Fallback automático (sempre funciona)
  return fallbackLeadClassifier(input);
}
