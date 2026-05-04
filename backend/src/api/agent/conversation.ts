/**
 * Rota de Conversação com Agente IA — SDR Jurídico
 *
 * Substituição do mock por chamada real ao AgentService (Claude/OpenAI).
 * Persiste mensagens no banco, detecta nextAction e dispara:
 *   - 'schedule'        → SchedulerService.autoSchedule()
 *   - 'transfer_human'  → EscalationService.escalate()
 *
 * Fluxo por mensagem:
 *  1. Busca ou cria Conversation no banco
 *  2. Salva mensagem do lead
 *  3. Chama AgentService.processConversation() (Claude/OpenAI/fallback)
 *  4. Salva resposta da IA
 *  5. Verifica nextAction e dispara ações automáticas
 *  6. Retorna resposta estruturada
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AgentService } from '../../services/agent.service';
import { SchedulerService } from '../../services/scheduler.service';
import { EscalationService } from '../../services/escalation.service';
import { getOrCreateTenantByClienteId } from '../../utils/tenant';

export async function registerConversationRoute(fastify: FastifyInstance) {
  const prisma = fastify.prisma as PrismaClient;
  const agentService = new AgentService(fastify);
  const schedulerService = new SchedulerService(fastify);
  const escalationService = new EscalationService(fastify);

  // ─── POST /api/agent/conversation ────────────────────────────────────────
  fastify.post('/api/agent/conversation', async (request: any, reply: any) => {
    try {
      const body = request.body as any;

      if (!body?.lead_id || typeof body.lead_id !== 'string') {
        return reply.status(400).send({ error: 'lead_id obrigatório' });
      }
      if (!body?.message || typeof body.message !== 'string') {
        return reply.status(400).send({ error: 'message obrigatória' });
      }

      const { lead_id, message, clienteId, channel = 'chat' } = body;

      // Resolver tenant
      let tenantId: string | undefined;
      if (clienteId) {
        tenantId = await getOrCreateTenantByClienteId(clienteId);
      } else {
        const lead = await prisma.lead.findUnique({ where: { id: lead_id }, select: { tenantId: true } });
        tenantId = lead?.tenantId;
      }

      if (!tenantId) {
        return reply.status(404).send({ error: 'Lead ou tenant não encontrado' });
      }

      // ── 1. Busca ou cria conversa ──────────────────────────────────────
      let conversation = await prisma.conversation.findFirst({
        where: { leadId: lead_id, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            leadId: lead_id,
            tenantId,
            channel,
            assignedType: 'ai',
            status: 'active',
          },
        });
      }

      // ── 2. Salva mensagem do lead ──────────────────────────────────────
      await (prisma.message as any).create({
        data: {
          conversationId: conversation.id,
          content: message,
          senderType: 'lead',
        },
      });

      // ── 3. Chama AgentService (Claude/OpenAI/fallback) ─────────────────
      const agentResult = await agentService.processConversation({
        lead_id,
        message,
        conversation_data: body.conversation_data,
        clienteId: tenantId,
      });

      // ── 4. Salva resposta da IA ────────────────────────────────────────
      await (prisma.message as any).create({
        data: {
          conversationId: conversation.id,
          content: agentResult.response,
          senderType: 'ai',
          intention: agentResult.nextAction,
        },
      });

      // ── 5. Atualiza status do lead conforme etapa ──────────────────────
      const stepToStatus: Record<string, string> = {
        qualifying: 'em_triagem',
        consent: 'em_triagem',
        schedule: 'consulta_agendada',
        farewell: 'qualificado',
        transfer_human: 'qualificado',
      };
      const newStatus = stepToStatus[agentResult.currentStep] || stepToStatus[agentResult.nextAction];
      if (newStatus) {
        await prisma.lead.update({
          where: { id: lead_id },
          data: { status: newStatus },
        }).catch(() => {}); // não interrompe o fluxo se falhar
      }

      // ── 6. Ações automáticas por nextAction ────────────────────────────
      if (agentResult.nextAction === 'schedule') {
        schedulerService.autoSchedule(lead_id, tenantId, agentResult.metadata).catch((err: any) => {
          fastify.log.warn({ err: err.message }, 'autoSchedule falhou (não-crítico)');
        });
      }

      if (agentResult.nextAction === 'transfer_human' || agentResult.metadata?.requiresHumanReview) {
        escalationService.escalate(lead_id, tenantId, {
          reason: agentResult.metadata?.requiresHumanReview
            ? 'IA solicitou revisão humana'
            : 'Lead solicitou falar com advogado',
          conversationId: conversation.id,
          legalArea: agentResult.metadata?.legalAreaSuggested,
        }).catch((err: any) => {
          fastify.log.warn({ err: err.message }, 'escalate falhou (não-crítico)');
        });
      }

      // ── 7. Auto-criação de follow-up se qualificado ────────────────────
      if (agentResult.currentStep === 'farewell' && agentResult.nextAction !== 'schedule') {
        prisma.followUp.create({
          data: {
            tenantId,
            leadId: lead_id,
            type: 'whatsapp_followup',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
            content: '',
            status: 'pending',
            createdBy: 'ai',
          },
        }).catch(() => {});
      }

      return reply.status(200).send({
        lead_id,
        tenantId,
        message: agentResult.response,
        currentStep: agentResult.currentStep,
        nextAction: agentResult.nextAction,
        metadata: agentResult.metadata,
        requires_human: agentResult.metadata?.requiresHumanReview || false,
        conversation_data: agentResult.conversationData,
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      fastify.log.error({ err: error.message }, 'Conversation route error');
      return reply.status(500).send({ error: 'Erro ao processar conversa', message: error.message });
    }
  });

  // ─── GET /api/agent/conversation/:lead_id ────────────────────────────────
  // Retorna histórico da conversa ativa
  fastify.get('/api/agent/conversation/:lead_id', async (request: any, reply: any) => {
    try {
      const { lead_id } = request.params;

      const conversation = await prisma.conversation.findFirst({
        where: { leadId: lead_id, status: 'active' },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
        },
      });

      if (!conversation) {
        // Sem conversa ainda — retorna saudação inicial da IA
        const lead = await prisma.lead.findUnique({ where: { id: lead_id }, select: { tenantId: true, name: true } });
        const firstName = lead?.name?.split(' ')[0] || 'cliente';
        return reply.status(200).send({
          lead_id,
          conversation: null,
          messages: [],
          greeting: `Olá, ${firstName}! Sou a assistente jurídica de pré-atendimento. Como posso ajudar você hoje?`,
          timestamp: new Date().toISOString(),
        });
      }

      return reply.status(200).send({
        lead_id,
        conversation: {
          id: conversation.id,
          channel: conversation.channel,
          status: conversation.status,
          assignedType: conversation.assignedType,
          createdAt: conversation.createdAt,
        },
        messages: conversation.messages.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderType: m.senderType,
          intention: m.intention,
          createdAt: m.createdAt,
        })),
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      fastify.log.error({ err: error.message }, 'Conversation GET error');
      return reply.status(500).send({ error: 'Erro ao buscar conversa' });
    }
  });
}
