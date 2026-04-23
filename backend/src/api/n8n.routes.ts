/**
 * Rotas de Integração N8N
 *
 * Webhook para receber leads do N8N (via Apify ou outras fontes)
 * e endpoint para disparar runs do Apify via N8N
 */

import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { apifyService } from '../services/apify.service';

export async function registerN8NRoutes(fastify: FastifyInstance) {
  /**
   * Webhook público para N8N enviar leads importados
   * N8N chama: POST /api/n8n/leads?token=<webhook_token>
   *
   * Aceita array de leads ou lead único
   */
  fastify.post('/api/n8n/leads', async (request: any, reply: any) => {
    try {
      const { token, tenantId } = request.query as { token?: string; tenantId?: string };

      // Verificar token de webhook (simples, por tenantId)
      if (!tenantId) {
        return reply.status(400).send({ error: 'tenantId obrigatório na query string' });
      }

      // Verificar se tenant existe
      const tenant = await fastify.prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        return reply.status(404).send({ error: 'Tenant não encontrado' });
      }

      const body = request.body as any;
      const leadsRaw = Array.isArray(body) ? body : [body];

      const created: string[] = [];
      const errors: string[] = [];

      for (const item of leadsRaw) {
        try {
          const name = item.nome || item.name || item.fullName || 'Lead sem nome';
          const email = item.email || item.emailAddress || null;
          const phone = item.telefone || item.phone || item.phoneNumber || '+55';
          const legalArea = item.area || item.legalArea || null;
          const demandDescription = item.descricao || item.description || item.summary || null;

          const lead = await fastify.prisma.lead.create({
            data: {
              tenantId,
              name,
              email,
              phone,
              legalArea,
              demandDescription,
              status: 'novo',
            },
          });

          created.push(lead.id);
        } catch (itemError: any) {
          errors.push(`${item.nome || item.name || 'sem nome'}: ${itemError.message}`);
          fastify.log.error({ error: itemError.message, item }, 'Erro ao criar lead via N8N');
        }
      }

      return reply.status(201).send({
        success: true,
        created: created.length,
        errors: errors.length,
        leadIds: created,
        errorDetails: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro no webhook N8N');
      return reply.status(500).send({ error: 'Erro interno', message: error.message });
    }
  });

  /**
   * Disparar um actor do Apify diretamente via API (sem N8N)
   * Autenticado — apenas usuários logados podem disparar
   */
  fastify.post('/api/apify/run', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      if (!tenantId) {
        return reply.status(401).send({ error: 'Tenant não identificado' });
      }

      const { actorId, input, waitForFinish = 60 } = request.body as {
        actorId: string;
        input: Record<string, any>;
        waitForFinish?: number;
      };

      if (!actorId) {
        return reply.status(400).send({ error: 'actorId é obrigatório' });
      }

      // Buscar API key do Apify salva para este tenant
      const config = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      const apiKey = config?.apifyApiKey || process.env.APIFY_API_KEY;
      if (!apiKey) {
        return reply.status(400).send({
          error: 'Apify API Key não configurada',
          message: 'Configure a Apify API Key em Configurações > Integrações',
        });
      }

      const run = await apifyService.runActor({
        actorId,
        apiKey,
        input: input || {},
        waitForFinish,
      });

      return reply.send({
        success: true,
        runId: run.runId,
        datasetId: run.datasetId,
        message: waitForFinish > 0
          ? 'Actor iniciado. Aguardando resultados...'
          : 'Actor iniciado em background. Use /api/apify/results/:datasetId para buscar resultados.',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao disparar actor Apify');
      return reply.status(500).send({ error: 'Erro ao executar Apify', message: error.message });
    }
  });

  /**
   * Buscar resultados de um dataset Apify e importar como leads
   */
  fastify.post('/api/apify/import/:datasetId', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      if (!tenantId) {
        return reply.status(401).send({ error: 'Tenant não identificado' });
      }

      const { datasetId } = request.params as { datasetId: string };
      const { area = 'Geral', fonte = 'apify' } = request.body as {
        area?: string;
        fonte?: string;
      };

      const config = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      const apiKey = config?.apifyApiKey || process.env.APIFY_API_KEY;
      if (!apiKey) {
        return reply.status(400).send({ error: 'Apify API Key não configurada' });
      }

      const items = await apifyService.getDatasetItems(datasetId, apiKey);
      const created: string[] = [];

      for (const item of items) {
        const normalized = apifyService.normalizeToLead(item);
        const lead = await fastify.prisma.lead.create({
          data: {
            tenantId,
            name: normalized.nome,
            email: normalized.email || null,
            phone: normalized.telefone || '+55',
            legalArea: area || null,
            demandDescription: normalized.descricao || null,
            status: 'novo',
          },
        });
        created.push(lead.id);
      }

      return reply.send({
        success: true,
        imported: created.length,
        leadIds: created,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao importar leads do Apify');
      return reply.status(500).send({ error: 'Erro ao importar', message: error.message });
    }
  });

  /**
   * Verificar status de um run do Apify
   */
  fastify.get('/api/apify/status/:runId', {
    preHandler: [authenticate],
  }, async (request: any, reply: any) => {
    try {
      const tenantId = request.user?.tenantId;
      const { runId } = request.params as { runId: string };

      const config = await fastify.prisma.integrationConfig.findUnique({
        where: { tenantId },
      });

      const apiKey = config?.apifyApiKey || process.env.APIFY_API_KEY;
      if (!apiKey) {
        return reply.status(400).send({ error: 'Apify API Key não configurada' });
      }

      const status = await apifyService.getRunStatus(runId, apiKey);
      return reply.send(status);
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  /**
   * ═══════════════════════════════════════════════════════
   * GET /api/n8n/agent-config
   * ═══════════════════════════════════════════════════════
   * Endpoint público para o N8N buscar TODA a configuração
   * do agente em tempo real. Protegido por token estático.
   *
   * N8N chama no início de cada execução:
   *   GET /api/n8n/agent-config?tenantId=xxx
   *   Header: x-n8n-token: <N8N_SECRET do .env>
   *
   * Retorna config completa: prompt, humanização, intenções,
   * base de conhecimento, agenda, follow-up, comunicação.
   * ═══════════════════════════════════════════════════════
   */
  fastify.get('/api/n8n/agent-config', async (request: any, reply: any) => {
    try {
      const { tenantId } = request.query as { tenantId?: string };
      const token = request.headers['x-n8n-token'];
      const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';

      if (!tenantId) return reply.status(400).send({ error: 'tenantId obrigatório' });
      if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });

      const prisma = fastify.prisma as any;

      const [agentConfig, prompts, voiceConfig] = await Promise.all([
        prisma.agentConfig.findUnique({ where: { tenantId } }),
        prisma.agentPrompt.findMany({
          where: { tenantId, status: 'ativo' },
          select: { type: true, content: true, model: true, temperature: true, maxTokens: true },
        }),
        prisma.voiceConfig.findUnique({ where: { tenantId } }),
      ]);

      // Montar mapa de prompts por tipo
      const promptMap: Record<string, any> = {};
      for (const p of (prompts || [])) promptMap[p.type] = p;

      // Prompt principal (orquestrador)
      const systemPrompt = promptMap['orquestrador']?.content
        || agentConfig?.templates?.find?.((t: any) => t.type === 'system')?.content
        || 'Você é Sofia, assistente jurídica de IA. Seja empática, profissional e qualifique o lead com perguntas claras.';

      return reply.send({
        // Identidade do agente
        name: agentConfig?.name || 'Sofia',
        description: agentConfig?.description || '',
        isActive: agentConfig?.isActive ?? true,

        // Prompt principal para o AI node do N8N
        systemPrompt,

        // Todos os prompts disponíveis (qualificador, follow-up, etc.)
        prompts: promptMap,

        // Configuração de comunicação
        // N8N usa: communicationConfig.bufferLatency → Wait node (ms)
        //          communicationConfig.timeBetweenMessages → delay entre partes
        communicationConfig: agentConfig?.communicationConfig || {
          bufferLatency: 3000,
          timeBetweenMessages: 1500,
          errorMessage: 'Desculpe, tive um problema. Pode repetir?',
        },

        // Configuração de humanização
        // N8N usa: humanizationConfig.typoRate, emojiFrequency, responseVariation
        humanizationConfig: agentConfig?.humanizationConfig || {
          typoRate: 0.05,
          emojiFrequency: 'medium',
          responseVariation: true,
          splitMessages: true,
          typingSpeed: 'medium',
        },

        // Base de conhecimento → injetada como contexto no AI node
        // Array de { question: string, answer: string }
        knowledgeBase: agentConfig?.knowledgeBase || [],

        // Intenções → N8N usa para routing antes do AI
        // Array de { keyword: string, action: string, response?: string }
        intentions: agentConfig?.intentions || [],

        // Follow-up config
        followUpConfig: agentConfig?.followUpConfig || {
          businessHours: { start: '09:00', end: '18:00', days: [1,2,3,4,5] },
          cadence: [1, 3, 7],
        },

        // Agenda / Horário de atendimento
        scheduleConfig: agentConfig?.scheduleConfig || {
          timezone: 'America/Sao_Paulo',
          slots: [],
        },

        // Templates de mensagem
        templates: agentConfig?.templates || [],

        // Funil de etapas
        funnelStages: agentConfig?.funnelStages || [],

        // Advogados / rotação
        lawyers: agentConfig?.lawyers || [],
        rotationRules: agentConfig?.rotationRules || {},

        // Voz
        voice: voiceConfig ? {
          enabled: voiceConfig.enabled,
          provider: voiceConfig.provider,
          voiceId: voiceConfig.voiceId,
          voiceName: voiceConfig.voiceName,
          audioOnText: voiceConfig.audioResponseProbabilityOnText,
          audioOnAudio: voiceConfig.audioResponseProbabilityOnAudio,
        } : { enabled: false },

        // Meta
        _fetched_at: new Date().toISOString(),
        _version: '2.0',
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao buscar agent config para N8N');
      return reply.status(500).send({ error: error.message });
    }
  });

  /**
   * POST /api/n8n/log
   * N8N registra execuções para debug e auditoria
   */
  fastify.post('/api/n8n/log', async (request: any, reply: any) => {
    const token = request.headers['x-n8n-token'];
    const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';
    if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });
    fastify.log.info({ body: request.body }, 'N8N execution log');
    return reply.send({ ok: true });
  });

  /**
   * ═══════════════════════════════════════════════════════
   * GET /api/n8n/conversation-history
   * ═══════════════════════════════════════════════════════
   * N8N busca histórico da conversa por telefone ANTES de chamar a IA
   * para fornecer memória completa ao modelo.
   *
   * GET /api/n8n/conversation-history?tenantId=xxx&phone=5511999999999&limit=30
   * Header: x-n8n-token: <N8N_SECRET>
   *
   * Retorna:
   *  - messages: [{role: 'user'|'assistant', content: string}]
   *  - lead: dados do lead se encontrado
   *  - totalMessages: total histórico
   * ═══════════════════════════════════════════════════════
   */
  fastify.get('/api/n8n/conversation-history', async (request: any, reply: any) => {
    try {
      const { tenantId, phone, limit = '30' } = request.query as {
        tenantId?: string;
        phone?: string;
        limit?: string;
      };
      const token = request.headers['x-n8n-token'];
      const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';

      if (!tenantId) return reply.status(400).send({ error: 'tenantId obrigatório' });
      if (!phone) return reply.status(400).send({ error: 'phone obrigatório' });
      if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });

      const prisma = fastify.prisma as any;

      // Normalizar telefone
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;

      // Buscar lead
      const lead = await prisma.lead.findFirst({
        where: { tenantId, phone: normalizedPhone },
        select: { id: true, name: true, phone: true, email: true, status: true, legalArea: true, demandDescription: true },
      });

      if (!lead) {
        return reply.send({
          messages: [],
          lead: null,
          totalMessages: 0,
          isNewLead: true,
        });
      }

      // Buscar conversa ativa mais recente
      const conversation = await prisma.conversation.findFirst({
        where: { leadId: lead.id, tenantId, status: 'active' },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: parseInt(limit),
            where: { senderType: { in: ['lead', 'ai', 'sdr'] } },
          },
        },
      });

      if (!conversation) {
        return reply.send({
          messages: [],
          lead,
          totalMessages: 0,
          isNewLead: false,
          assignedType: 'ai',
        });
      }

      // Formatar mensagens para o N8N/IA
      const messages = conversation.messages.map((msg: any) => ({
        role: msg.senderType === 'lead' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.createdAt,
      }));

      return reply.send({
        messages,
        lead,
        totalMessages: messages.length,
        isNewLead: false,
        conversationId: conversation.id,
        assignedType: conversation.assignedType,
        conversationStatus: conversation.status,
      });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao buscar histórico para N8N');
      return reply.status(500).send({ error: error.message });
    }
  });

  /**
   * ═══════════════════════════════════════════════════════
   * POST /api/n8n/save-message
   * ═══════════════════════════════════════════════════════
   * N8N salva mensagens no banco após processar com IA.
   * Garante que o histórico da plataforma fica sincronizado com o N8N.
   *
   * Body: { tenantId, phone, messages: [{role, content}], leadName? }
   * ═══════════════════════════════════════════════════════
   */
  fastify.post('/api/n8n/save-message', async (request: any, reply: any) => {
    try {
      const token = request.headers['x-n8n-token'];
      const expected = process.env.N8N_SECRET || 'sdr-juridico-n8n-secret';
      if (token !== expected) return reply.status(401).send({ error: 'Token inválido' });

      const { tenantId, phone, messages, leadName } = request.body as {
        tenantId: string;
        phone: string;
        messages: Array<{ role: 'user' | 'assistant'; content: string }>;
        leadName?: string;
      };

      if (!tenantId || !phone || !messages?.length) {
        return reply.status(400).send({ error: 'tenantId, phone e messages são obrigatórios' });
      }

      const prisma = fastify.prisma as any;
      const digits = phone.replace(/\D/g, '');
      const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;

      // Upsert lead
      let lead = await prisma.lead.findFirst({ where: { tenantId, phone: normalizedPhone } });
      if (!lead) {
        lead = await prisma.lead.create({
          data: { tenantId, name: leadName || normalizedPhone, phone: normalizedPhone, status: 'novo' },
        });
      }

      // Upsert conversa
      let conversation = await prisma.conversation.findFirst({
        where: { leadId: lead.id, channel: 'whatsapp', status: 'active' },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { leadId: lead.id, tenantId, channel: 'whatsapp', status: 'active', assignedType: 'ai' },
        });
      }

      // Salvar mensagens novas
      for (const msg of messages) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: msg.content,
            senderType: msg.role === 'user' ? 'lead' : 'ai',
          },
        });
      }

      await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

      return reply.send({ ok: true, leadId: lead.id, conversationId: conversation.id });
    } catch (error: any) {
      fastify.log.error({ error }, 'Erro ao salvar mensagens do N8N');
      return reply.status(500).send({ error: error.message });
    }
  });
}
