/**
 * Worker de Follow-ups Automáticos
 *
 * Roda a cada 2 minutos via setInterval.
 * Busca todos os follow-ups pendentes com scheduledAt <= agora,
 * dispara via Evolution API (WhatsApp) ou email, e atualiza o status.
 *
 * Retry: até 3 tentativas com back-off antes de marcar como 'failed'.
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { EvolutionService } from '../services/evolution.service';

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutos
const MAX_RETRIES = 3;

export class FollowUpWorker {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private evolution: EvolutionService;
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.evolution = new EvolutionService(fastify);
  }

  start() {
    this.fastify.log.info('FollowUpWorker iniciado — verificando a cada 2 minutos');
    this.tick();
    this.timer = setInterval(() => this.tick(), INTERVAL_MS);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async tick() {
    if (this.running) return;
    this.running = true;

    try {
      const now = new Date();

      const pending = await this.prisma.followUp.findMany({
        where: {
          status: 'pending',
          scheduledAt: { lte: now },
        },
        include: {
          lead: {
            select: { id: true, name: true, phone: true, email: true, legalArea: true, tenantId: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 100,
      });

      if (pending.length === 0) return;

      this.fastify.log.info({ count: pending.length }, 'FollowUpWorker: processando follow-ups pendentes');

      for (const followUp of pending) {
        await this.dispatch(followUp);
      }
    } catch (err: any) {
      this.fastify.log.error({ err: err.message }, 'FollowUpWorker: erro no tick');
    } finally {
      this.running = false;
    }
  }

  private async dispatch(followUp: any) {
    const { id, lead, content, type, tenantId } = followUp;

    let attempts = 0;
    try {
      const meta = followUp.notes ? JSON.parse(followUp.notes) : {};
      attempts = meta.attempts || 0;
    } catch {}

    if (attempts >= MAX_RETRIES) {
      await this.prisma.followUp.update({
        where: { id },
        data: { status: 'failed', notes: JSON.stringify({ attempts, lastError: 'max_retries_exceeded' }) },
      });
      return;
    }

    try {
      const message = this.buildMessage(followUp);

      if (type === 'email') {
        await this.sendEmail(lead.email, lead.name, message, followUp.content);
      } else {
        // whatsapp, whatsapp_followup, lembrete_consulta, human_review, reativacao → Evolution API
        await this.evolution.sendText(lead.phone, message, tenantId || lead.tenantId);
      }

      await this.prisma.followUp.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          notes: JSON.stringify({ attempts: attempts + 1, sentAt: new Date().toISOString() }),
        },
      });

      this.fastify.log.info({ followUpId: id, leadId: lead.id, type }, 'FollowUp disparado com sucesso');
    } catch (err: any) {
      this.fastify.log.warn({ followUpId: id, err: err.message, attempts }, 'FollowUp falhou, agendando retry');

      await this.prisma.followUp.update({
        where: { id },
        data: {
          // Reagenda com back-off exponencial: 5min, 15min, 45min
          scheduledAt: new Date(Date.now() + Math.pow(3, attempts) * 5 * 60 * 1000),
          notes: JSON.stringify({ attempts: attempts + 1, lastError: err.message }),
        },
      });
    }
  }

  private buildMessage(followUp: any): string {
    const { lead, content, type } = followUp;
    const name = lead?.name?.split(' ')[0] || 'cliente';

    if (content) return content;

    const templates: Record<string, string> = {
      whatsapp_followup:  `Olá, ${name}! Tudo bem? Passando para verificar se você ainda tem interesse em falar com nosso advogado sobre seu caso. Podemos ajudar? 😊`,
      lembrete_consulta:  `Olá, ${name}! Lembrando que você tem uma consulta agendada. Confirma presença? Qualquer dúvida, é só responder aqui! ✅`,
      nao_confirmado:     `Oi ${name}, percebemos que ainda não confirmou sua consulta. Ainda tem interesse? Podemos encontrar um horário melhor para você! 📅`,
      reativacao:         `Olá, ${name}! Faz um tempo que não nos falamos. Seu caso jurídico ainda está em aberto? Podemos ajudar com ${lead.legalArea || 'sua demanda'}. 🤝`,
      human_review:       `Olá, ${name}! Um de nossos advogados está analisando seu caso e entrará em contato em breve. Obrigado pela paciência! 🙏`,
    };

    return templates[type] || `Olá, ${name}! Nossa equipe jurídica está disponível para ajudar você. Podemos conversar? 😊`;
  }

  private async sendEmail(email: string | null, name: string, subject: string, body: string) {
    if (!email) throw new Error('Lead sem email para follow-up por email');

    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text: body || subject,
      html: `<p>${(body || subject).replace(/\n/g, '<br>')}</p>`,
    });
  }
}
