/**
 * SchedulerService — Agendamento Automático de Consultas
 *
 * Quando o AgentService retorna nextAction: 'schedule':
 *  1. Busca horários disponíveis no AgentConfig do tenant
 *  2. Seleciona o próximo slot disponível
 *  3. Cria evento no Google Calendar (se token configurado)
 *  4. Atualiza status do lead para 'consulta_agendada'
 *  5. Envia confirmação via WhatsApp (Evolution API) com data + lista de documentos
 *  6. Cria follow-up de lembrete 1h antes da consulta
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { EvolutionService } from './evolution.service';

interface ScheduleMetadata {
  legalAreaSuggested?: string;
  urgencyDetected?: string;
  preferredDate?: string;
  [key: string]: any;
}

export class SchedulerService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;
  private evolution: EvolutionService;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
    this.evolution = new EvolutionService(fastify);
  }

  async autoSchedule(leadId: string, tenantId: string, metadata: ScheduleMetadata = {}) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, name: true, phone: true, email: true, legalArea: true },
    });

    if (!lead) throw new Error(`Lead ${leadId} não encontrado`);

    const slot = await this.nextAvailableSlot(tenantId, metadata.urgencyDetected);
    const legalArea = metadata.legalAreaSuggested || lead.legalArea || 'Jurídico';

    // Atualiza lead
    await this.prisma.lead.update({
      where: { id: leadId },
      data: { status: 'consulta_agendada', scheduledContact: slot, legalArea },
    });

    // Tenta criar evento no Google Calendar
    try {
      await this.createCalendarEvent(tenantId, lead, slot, legalArea);
    } catch (err: any) {
      this.fastify.log.warn({ err: err.message }, 'Google Calendar não configurado, pulando');
    }

    // Envia confirmação via WhatsApp (Evolution API)
    try {
      await this.sendConfirmation(tenantId, lead, slot, legalArea);
    } catch (err: any) {
      this.fastify.log.warn({ err: err.message }, 'Confirmação WhatsApp falhou');
    }

    // Cria follow-up lembrete 1h antes
    const reminderAt = new Date(slot.getTime() - 60 * 60 * 1000);
    if (reminderAt > new Date()) {
      await this.prisma.followUp.create({
        data: {
          tenantId,
          leadId,
          type: 'lembrete_consulta',
          scheduledAt: reminderAt,
          content: this.buildReminderMessage(lead.name, slot, legalArea),
          status: 'pending',
          createdBy: 'scheduler',
        },
      });
    }

    this.fastify.log.info({ leadId, slot, legalArea }, 'Consulta agendada automaticamente');
    return { slot, legalArea };
  }

  async nextAvailableSlot(tenantId: string, urgency?: string): Promise<Date> {
    let availableSlots: string[] = [];

    try {
      const config = await (this.prisma as any).agentConfig.findUnique({
        where: { tenantId },
        select: { availableSlots: true },
      });
      if (config?.availableSlots && Array.isArray(config.availableSlots)) {
        availableSlots = config.availableSlots;
      }
    } catch {}

    const hoursAhead = urgency === 'alta' ? 2 : 24;
    const base = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);

    if (availableSlots.length > 0) {
      for (const slot of availableSlots) {
        const slotDate = this.parseSlot(slot, base);
        if (slotDate && slotDate > new Date()) {
          const alreadyBooked = await this.prisma.lead.count({
            where: {
              tenantId,
              status: 'consulta_agendada',
              scheduledContact: {
                gte: new Date(slotDate.getTime() - 30 * 60 * 1000),
                lte: new Date(slotDate.getTime() + 30 * 60 * 1000),
              },
            },
          });
          if (alreadyBooked === 0) return slotDate;
        }
      }
    }

    return this.nextBusinessDay(base, 10);
  }

  private parseSlot(slot: string, base: Date): Date | null {
    try {
      if (/^\d{2}:\d{2}$/.test(slot)) {
        const [h, m] = slot.split(':').map(Number);
        const d = new Date(base);
        d.setHours(h, m, 0, 0);
        if (d <= new Date()) d.setDate(d.getDate() + 1);
        return this.skipWeekend(d);
      }
      if (/^\d{4}-\d{2}-\d{2}/.test(slot)) {
        return new Date(slot);
      }
    } catch {}
    return null;
  }

  private nextBusinessDay(from: Date, hour: number): Date {
    const d = new Date(from);
    d.setHours(hour, 0, 0, 0);
    if (d <= new Date()) d.setDate(d.getDate() + 1);
    return this.skipWeekend(d);
  }

  private skipWeekend(d: Date): Date {
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() + 1);
    if (day === 6) d.setDate(d.getDate() + 2);
    return d;
  }

  private async createCalendarEvent(tenantId: string, lead: any, slot: Date, legalArea: string) {
    const integration = await (this.prisma as any).userIntegration.findFirst({
      where: { tenantId, provider: 'google_calendar' },
      select: { accessToken: true },
    });

    if (!integration?.accessToken) return;

    const endSlot = new Date(slot.getTime() + 60 * 60 * 1000);
    const body = {
      summary: `Consulta Jurídica — ${lead.name} (${legalArea})`,
      description: `Lead: ${lead.name}\nTelefone: ${lead.phone}\nÁrea: ${legalArea}\n\nAgendado automaticamente pelo SDR Jurídico IA.`,
      start: { dateTime: slot.toISOString(), timeZone: 'America/Sao_Paulo' },
      end: { dateTime: endSlot.toISOString(), timeZone: 'America/Sao_Paulo' },
      ...(lead.email && { attendees: [{ email: lead.email }] }),
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${integration.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Google Calendar API ${res.status}`);
    this.fastify.log.info({ leadId: lead.id }, 'Evento criado no Google Calendar');
  }

  private async sendConfirmation(tenantId: string, lead: any, slot: Date, legalArea: string) {
    const firstName = lead.name.split(' ')[0];
    const dateStr = slot.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    const timeStr = slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const docs = this.documentsByArea(legalArea);

    const message = `✅ *Consulta confirmada!*\n\nOlá, ${firstName}! Sua consulta jurídica foi agendada:\n\n📅 *Data:* ${dateStr}\n⏰ *Horário:* ${timeStr}\n⚖️ *Área:* ${legalArea}\n\n📋 *Documentos para trazer:*\n${docs}\n\nQualquer dúvida, é só responder aqui. Até lá! 🤝`;

    await this.evolution.sendText(lead.phone, message, tenantId);
  }

  private buildReminderMessage(name: string, slot: Date, legalArea: string): string {
    const firstName = name.split(' ')[0];
    const timeStr = slot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `⏰ Olá, ${firstName}! Lembrete: sua consulta jurídica (${legalArea}) é hoje às ${timeStr}. Confirma presença? ✅`;
  }

  private documentsByArea(area: string): string {
    const docs: Record<string, string> = {
      'Direito Trabalhista':    '• CTPS (Carteira de Trabalho)\n• Últimos contracheques\n• Termo de rescisão (se houver)\n• CPF e RG',
      'Direito Previdenciário': '• CPF e RG\n• Cartão do INSS\n• Extrato do CNIS\n• Laudos médicos (se houver)',
      'Direito de Família':     '• CPF e RG\n• Certidão de casamento ou nascimento\n• Comprovante de renda\n• Comprovante de residência',
      'Direito Cível':          '• CPF e RG\n• Documentos do contrato em questão\n• Comprovantes de pagamento\n• Notificações recebidas',
      'Direito Penal':          '• CPF e RG\n• Boletim de ocorrência (se houver)\n• Documentos relacionados ao caso',
      'Direito Imobiliário':    '• CPF e RG\n• Escritura ou contrato do imóvel\n• IPTU\n• Documentos de financiamento',
    };

    for (const [key, value] of Object.entries(docs)) {
      if (area.toLowerCase().includes(key.toLowerCase().split(' ')[1] || key.toLowerCase())) {
        return value;
      }
    }
    return '• CPF e RG\n• Documentos relacionados ao seu caso\n• Comprovante de residência';
  }
}
