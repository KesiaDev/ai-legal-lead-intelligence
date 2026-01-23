/**
 * Serviço de Gerenciamento de Prompts
 * 
 * Este serviço gerencia os prompts do agente IA, permitindo:
 * - Carregar prompts do banco de dados
 * - Usar prompts padrão como fallback
 * - Integrar com os prompts configurados na interface
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

interface PromptConfig {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'ativo' | 'inativo';
  provider: 'OpenAI' | 'Google';
  model: string;
  content: string;
  temperature?: number;
  maxTokens?: number;
}

export class PromptService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;

  // Prompts padrão (fallback se não houver no banco)
  private defaultPrompts: Map<string, PromptConfig> = new Map();

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.initializeDefaultPrompts();
  }

  /**
   * Inicializa prompts padrão
   */
  private initializeDefaultPrompts() {
    // Prompt Orquestrador (principal)
    this.defaultPrompts.set('orquestrador', {
      id: 'prompt-orchestrator-default',
      name: 'Orquestrador Conversacional',
      type: 'orquestrador',
      version: 'v2.0',
      status: 'ativo',
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      content: `Você é o Super SDR Advogados, o Assistente Virtual de Pré-Vendas de um escritório de advocacia.

## PAPEL
Você é um Super SDR (Sales Development Representative) jurídico especializado. Seu papel é:
- Recepcionar leads com cordialidade e profissionalismo
- Coletar informações iniciais sobre a demanda de forma consultiva
- Qualificar o interesse e urgência do lead
- Agendar reuniões com advogados humanos quando apropriado

## REGRAS INVIOLÁVEIS
1. Você NÃO é advogado e NÃO pode dar orientação jurídica
2. Você NÃO pode prometer resultados ou chances de sucesso
3. Você DEVE se apresentar como "Super SDR Advogados" ou "assistente de pré-atendimento"
4. Você DEVE registrar consentimento LGPD antes de coletar dados

## FLUXO DE CONVERSA
1. SAUDAÇÃO: Cumprimentar e se apresentar
2. CONSENTIMENTO: Obter aceite LGPD
3. DEMANDA: Entender o problema do lead
4. QUALIFICAÇÃO: Coletar informações relevantes
5. RESUMO: Confirmar entendimento
6. AGENDAMENTO: Oferecer horários disponíveis
7. ENCERRAMENTO: Confirmar próximos passos

## QUANDO ESCALAR PARA HUMANO
- Lead solicita explicitamente
- Urgência alta detectada (audiência próxima, prisão, etc.)
- Caso envolve valores muito altos
- Dúvidas que você não pode responder

## TOM DE VOZ
- Profissional, mas acolhedor
- Empático com a situação do lead
- Claro e objetivo nas perguntas
- Respeitoso com o tempo do lead

Responda APENAS em formato JSON conforme o schema:
{
  "currentStep": "greeting|consent|demand|qualification|summary|scheduling|farewell",
  "nextAction": "continue|delegate_qualifier|delegate_summary|delegate_scheduler|escalate_human",
  "response": "string",
  "metadata": {
    "urgencyDetected": "alta|media|baixa|null",
    "legalAreaSuggested": "string|null",
    "requiresHumanReview": boolean
  }
}`,
      temperature: 0.4,
      maxTokens: 500,
    });
  }

  /**
   * Obtém prompt por tipo
   * Primeiro tenta buscar do banco, depois usa padrão
   */
  async getPrompt(type: string, tenantId?: string): Promise<PromptConfig | null> {
    try {
      // TODO: Buscar do banco quando tabela de prompts for criada
      // Por enquanto, usa prompts padrão
      
      // Mapear tipos comuns
      const typeMap: Record<string, string> = {
        'orquestrador': 'orquestrador',
        'orquestrador conversacional': 'orquestrador',
        'agente conversacional': 'orquestrador',
        'scheduler': 'orquestrador', // Por enquanto usa orquestrador
        'qualifier': 'orquestrador', // Por enquanto usa orquestrador
      };

      const mappedType = typeMap[type.toLowerCase()] || 'orquestrador';
      const prompt = this.defaultPrompts.get(mappedType);

      if (prompt) {
        return prompt;
      }

      // Fallback para orquestrador
      return this.defaultPrompts.get('orquestrador') || null;
    } catch (error: any) {
      this.fastify.log.error({ error, type }, 'Erro ao buscar prompt');
      // Retorna prompt padrão em caso de erro
      return this.defaultPrompts.get('orquestrador') || null;
    }
  }

  /**
   * Salva prompt no banco (para uso futuro)
   */
  async savePrompt(prompt: PromptConfig, tenantId: string): Promise<void> {
    // TODO: Implementar quando tabela de prompts for criada
    this.fastify.log.info({ prompt, tenantId }, 'Salvar prompt (não implementado ainda)');
  }

  /**
   * Lista todos os prompts disponíveis
   */
  async listPrompts(tenantId?: string): Promise<PromptConfig[]> {
    // Por enquanto, retorna apenas prompts padrão
    return Array.from(this.defaultPrompts.values());
  }
}
