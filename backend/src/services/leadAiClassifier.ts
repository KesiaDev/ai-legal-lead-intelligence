/**
 * Classificador de Leads com OpenAI
 * Usado quando OPENAI_API_KEY está configurado
 */

import OpenAI from 'openai';

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

// Inicializa OpenAI apenas se a API key existir
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function aiLeadClassifier(
  input: ClassificationInput
): Promise<ClassificationResult> {
  if (!openai) {
    throw new Error('OpenAI not configured');
  }

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
}
