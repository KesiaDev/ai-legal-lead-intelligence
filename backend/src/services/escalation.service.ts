/**
 * EscalationService — Escalação para Atendimento Humano
 *
 * Acionado quando:
 *  - nextAction === 'transfer_human'
 *  - metadata.requiresHumanReview === true
 *  - Lead solicita explicitamente falar com advogado
 *
 * O que faz:
 *  1. Pausa a IA na conversa (assignedType → 'human')
 *  2. Atualiza status do lead para 'qualificado'
 *  3. Notifica o advogado/responsável via WhatsApp (Evolution API)
 *  4. Cria registro de follow-up para o humano resolver
 *  5. Envia mensagem de transição ao lead
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { EvolutionService } from './evolution.service';

interface EscalationOptions {
  reason: string;
  conversationId?: string;
  legalArea?: string;
}

export class EscalationService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private evolution: EvolutionService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.evolution = new EvolutionService(fastify);
  }

  async escalate(leadId: string, tenantId: string, options: EscalationOptions) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, phone: true, legalArea: true, status: true, demandDescription: true },
    });

    if (!lead) throw new Error(`Lead ${leadId} não encontrado`);

    // 1. Pausa IA na conversa ativa
    if (options.conversationId) {
      await this.prisma.conversation.update({
        where: { id: options.conversationId },
        data: { assignedType: 'human' },
      }).catch(() => {});
    } else {
      await this.prisma.conversation.updateMany({
        where: { leadId, status: 'active' },
        data: { assignedType: 'human' },
      }).catch(() => {});
    }

    // 2. Atualiza lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: {
        status: lead.status === 'novo' || lead.status === 'em_triagem' ? 'qualificado' : lead.status,
        legalArea: options.legalArea || lead.legalArea,
      },
    });

    // 3. Notifica o advogado/responsável
    try {
      await this.notifyAdvogado(tenantId, lead, options);
    } catch (err: any) {
      this.fastify.log.warn({ err: err.message }, 'Notificação ao advogado falhou');
    }

    // 4. Mensagem de transição ao lead
    try {
      await this.sendTransitionMessage(tenantId, lead);
    } catch (err: any) {
      this.fastify.log.warn({ err: err.message }, 'Mensagem de transição falhou');
    }

    // 5. Follow-up de acompanhamento para o humano
    await this.prisma.followUp.create({
      data: {
        tenantId,
        leadId,
        type: 'human_review',
        scheduledAt: new Date(Date.now() + 15 * 60 * 1000), // +15min
        content: `Lead ${lead.name} aguardando atendimento humano. Motivo: ${options.reason}. Área: ${options.legalArea || lead.legalArea || 'N/D'}.`,
        status: 'pending',
        createdBy: 'escalation',
      },
    });

    this.fastify.log.info({ leadId, reason: options.reason }, 'Lead escalado para humano');
  }

  private async notifyAdvogado(tenantId: string, lead: any, options: EscalationOptions) {
    const agentConfig = await (this.prisma as any).agentConfig.findUnique({
      where: { tenantId },
      select: { notificationPhone: true },
    });

    const notificationPhone = agentConfig?.notificationPhone || process.env.NOTIFICATION_PHONE;
    if (!notificationPhone) return;

    const area = options.legalArea || lead.legalArea || 'N/D';
    const demand = lead.demandDescription
      ? `\n📝 *Demanda:* ${lead.demandDescription.substring(0, 200)}`
      : '';

    const message = `🚨 *Novo lead para atendimento humano*\n\n👤 *Lead:* ${lead.name}\n📱 *Telefone:* ${lead.phone}\n⚖️ *Área:* ${area}${demand}\n\n💬 *Motivo:* ${options.reason}\n\n_O lead está aguardando seu contato. A IA foi pausada._`;

    await this.evolution.sendText(notificationPhone, message, tenantId);
  }

  private async sendTransitionMessage(tenantId: string, lead: any) {
    const firstName = lead.name.split(' ')[0];
    const message = `Olá, ${firstName}! Entendemos a sua situação e vamos conectar você diretamente com um de nossos advogados agora. Aguarde um momento — eles entrarão em contato em breve. 🤝`;

    await this.evolution.sendText(lead.phone, message, tenantId);

    // Salva a mensagem de transição na conversa
    const conversation = await this.prisma.conversation.findFirst({
      where: { leadId: lead.id, status: 'active' },
    });
    if (conversation) {
      await (this.prisma.message as any).create({
        data: {
          conversationId: conversation.id,
          content: message,
          senderType: 'system',
          intention: 'transfer_human',
        },
      });
    }
  }

  async resumeAI(leadId: string) {
    await this.prisma.conversation.updateMany({
      where: { leadId, status: 'active' },
      data: { assignedType: 'ai' },
    });
    this.fastify.log.info({ leadId }, 'IA retomada para o lead');
  }
}
