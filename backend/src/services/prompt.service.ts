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
      // Normalizar tipo
      const normalizedType = this.normalizePromptType(type);

      // Se tiver tenantId, buscar do banco primeiro
      if (tenantId) {
        const dbPrompt = await this.prisma.agentPrompt.findFirst({
          where: {
            tenantId,
            type: normalizedType,
            status: 'ativo',
          },
          orderBy: {
            version: 'desc', // Pega a versão mais recente
          },
        });

        if (dbPrompt) {
          this.fastify.log.info({ type: normalizedType, tenantId }, 'Prompt encontrado no banco');
          return {
            id: dbPrompt.id,
            name: dbPrompt.name,
            type: dbPrompt.type,
            version: dbPrompt.version,
            status: dbPrompt.status as 'ativo' | 'inativo',
            provider: dbPrompt.provider as 'OpenAI' | 'Google',
            model: dbPrompt.model,
            content: dbPrompt.content,
            temperature: dbPrompt.temperature ?? undefined,
            maxTokens: dbPrompt.maxTokens ?? undefined,
          };
        }
      }

      // Se não encontrou no banco, usa prompt padrão
      const prompt = this.defaultPrompts.get(normalizedType);
      if (prompt) {
        this.fastify.log.debug({ type: normalizedType }, 'Usando prompt padrão');
        return prompt;
      }

      // Fallback para orquestrador
      this.fastify.log.warn({ type: normalizedType }, 'Tipo de prompt não encontrado, usando orquestrador');
      return this.defaultPrompts.get('orquestrador') || null;
    } catch (error: any) {
      this.fastify.log.error({ error, type }, 'Erro ao buscar prompt');
      // Retorna prompt padrão em caso de erro
      return this.defaultPrompts.get('orquestrador') || null;
    }
  }

  /**
   * Normaliza tipo de prompt para formato padrão
   */
  private normalizePromptType(type: string): string {
    const typeMap: Record<string, string> = {
      'orquestrador': 'orquestrador',
      'orquestrador conversacional': 'orquestrador',
      'agente conversacional': 'orquestrador',
      'scheduler': 'scheduler',
      'qualifier': 'qualificador',
      'qualificador': 'qualificador',
      'resumo': 'resumo',
      'conversation_summary': 'resumo',
      'followup': 'followup',
      'insights': 'insights',
      'lembrete': 'lembrete',
    };

    return typeMap[type.toLowerCase()] || type.toLowerCase();
  }

  /**
   * Salva ou atualiza prompt no banco
   */
  async savePrompt(prompt: PromptConfig, tenantId: string): Promise<PromptConfig> {
    try {
      const normalizedType = this.normalizePromptType(prompt.type);

      // Verificar se já existe
      const existing = await this.prisma.agentPrompt.findFirst({
        where: {
          tenantId,
          type: normalizedType,
          version: prompt.version,
        },
      });

      if (existing) {
        // Atualizar existente
        const updated = await this.prisma.agentPrompt.update({
          where: { id: existing.id },
          data: {
            name: prompt.name,
            status: prompt.status,
            provider: prompt.provider,
            model: prompt.model,
            temperature: prompt.temperature,
            maxTokens: prompt.maxTokens,
            content: prompt.content,
            updatedAt: new Date(),
          },
        });

        this.fastify.log.info({ id: updated.id, type: normalizedType }, 'Prompt atualizado no banco');
        return {
          id: updated.id,
          name: updated.name,
          type: updated.type,
          version: updated.version,
          status: updated.status as 'ativo' | 'inativo',
          provider: updated.provider as 'OpenAI' | 'Google',
          model: updated.model,
          content: updated.content,
          temperature: updated.temperature ?? undefined,
          maxTokens: updated.maxTokens ?? undefined,
        };
      } else {
        // Criar novo
        const created = await this.prisma.agentPrompt.create({
          data: {
            tenantId,
            name: prompt.name,
            type: normalizedType,
            version: prompt.version,
            status: prompt.status,
            provider: prompt.provider,
            model: prompt.model,
            temperature: prompt.temperature,
            maxTokens: prompt.maxTokens,
            content: prompt.content,
          },
        });

        this.fastify.log.info({ id: created.id, type: normalizedType }, 'Prompt criado no banco');
        return {
          id: created.id,
          name: created.name,
          type: created.type,
          version: created.version,
          status: created.status as 'ativo' | 'inativo',
          provider: created.provider as 'OpenAI' | 'Google',
          model: created.model,
          content: created.content,
          temperature: created.temperature ?? undefined,
          maxTokens: created.maxTokens ?? undefined,
        };
      }
    } catch (error: any) {
      this.fastify.log.error({ error, prompt, tenantId }, 'Erro ao salvar prompt');
      throw error;
    }
  }

  /**
   * Lista todos os prompts disponíveis (banco + padrão)
   */
  async listPrompts(tenantId?: string): Promise<PromptConfig[]> {
    const prompts: PromptConfig[] = [];

    // Buscar do banco se tiver tenantId
    if (tenantId) {
      const dbPrompts = await this.prisma.agentPrompt.findMany({
        where: {
          tenantId,
          status: 'ativo',
        },
        orderBy: [
          { type: 'asc' },
          { version: 'desc' },
        ],
      });

      for (const dbPrompt of dbPrompts) {
        prompts.push({
          id: dbPrompt.id,
          name: dbPrompt.name,
          type: dbPrompt.type,
          version: dbPrompt.version,
          status: dbPrompt.status as 'ativo' | 'inativo',
          provider: dbPrompt.provider as 'OpenAI' | 'Google',
          model: dbPrompt.model,
          content: dbPrompt.content,
          temperature: dbPrompt.temperature ?? undefined,
          maxTokens: dbPrompt.maxTokens ?? undefined,
        });
      }
    }

    // Adicionar prompts padrão que não estão no banco
    const defaultPrompts = Array.from(this.defaultPrompts.values());
    for (const defaultPrompt of defaultPrompts) {
      const exists = prompts.some(p => p.type === defaultPrompt.type);
      if (!exists) {
        prompts.push(defaultPrompt);
      }
    }

    return prompts;
  }

  /**
   * Deleta prompt do banco
   */
  async deletePrompt(promptId: string, tenantId: string): Promise<void> {
    try {
      await this.prisma.agentPrompt.deleteMany({
        where: {
          id: promptId,
          tenantId,
        },
      });
      this.fastify.log.info({ promptId, tenantId }, 'Prompt deletado');
    } catch (error: any) {
      this.fastify.log.error({ error, promptId, tenantId }, 'Erro ao deletar prompt');
      throw error;
    }
  }
}
