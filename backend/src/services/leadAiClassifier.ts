/**
 * Classificador de Leads com OpenAI
 * Usa IntegrationConfigService para buscar chave do banco (por tenant) ou env vars
 */

import OpenAI from 'openai';
import { FastifyInstance } from 'fastify';
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

/**
 * Classifica lead usando OpenAI
 * Busca API key do banco (por tenant) ou env vars como fallback
 */
export async function aiLeadClassifier(
  input: ClassificationInput,
  fastify?: FastifyInstance
): Promise<ClassificationResult> {
  let apiKey: string | null = null;
  let source: string = 'unknown';

  // Buscar API key via IntegrationConfigService se fastify estiver disponível
  if (fastify && input.tenantId) {
    try {
      const configService = new IntegrationConfigService(fastify);
      const config = await configService.getConfig(input.tenantId);
      apiKey = config.openaiApiKey;
      source = config.details.openaiApiKey || 'unknown';
      
      if (apiKey) {
        fastify.log.info({ tenantId: input.tenantId, source }, 'OpenAI API key encontrada para classificação de lead');
      }
    } catch (error: any) {
      fastify.log.warn({ error, tenantId: input.tenantId }, 'Erro ao buscar OpenAI API key do banco, tentando env vars');
    }
  }

  // Fallback para env var se não encontrou no banco
  if (!apiKey && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && process.env.OPENAI_API_KEY !== 'sua-chave-aqui') {
    apiKey = process.env.OPENAI_API_KEY;
    source = 'environment';
    if (fastify) {
      fastify.log.info('Usando OpenAI API key de variável de ambiente para classificação');
    }
  }

  if (!apiKey) {
    throw new Error('OpenAI not configured');
  }

  // Criar cliente OpenAI com a chave encontrada
  const openai = new OpenAI({ apiKey });

  const prompt = `
Classifique o lead abaixo e responda SOMENTE em JSON válido:

Nome: ${input.nome}
Telefone: ${input.telefone}
Email: ${input.email || 'não informado'}
Origem: ${input.origem || 'desconhecida'}

Formato esperado:
{
  "score": number,
  "classificacao": "lead_quente" | "lead_morno" | "lead_frio",
  "prioridade": "alta" | "media" | "baixa",
  "proximaAcao": "chamar_whatsapp" | "nutrir" | "aguardar",
  "motivo": string
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('Empty AI response');
    }

    try {
      const parsed = JSON.parse(content);
      return parsed as ClassificationResult;
    } catch (parseError) {
      throw new Error(`Invalid JSON response from AI: ${parseError}`);
    }
  } catch (error: any) {
    if (fastify) {
      fastify.log.error({ error, source, tenantId: input.tenantId }, 'Erro ao classificar lead com OpenAI');
    }
    throw error;
  }
}
