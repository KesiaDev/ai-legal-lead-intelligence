import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export class FollowUpService {
  private prisma: PrismaClient;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
  }

  async listByLead(leadId: string, tenantId: string) {
    return this.prisma.followUp.findMany({
      where: { leadId, tenantId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async listByTenant(tenantId: string, filters?: {
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    return this.prisma.followUp.findMany({
      where: {
        tenantId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.from && { scheduledAt: { gte: filters.from } }),
        ...(filters?.to && { scheduledAt: { lte: filters.to } }),
      },
      include: { lead: { select: { id: true, name: true, phone: true, legalArea: true } } },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(data: {
    tenantId: string;
    leadId: string;
    type: string;
    scheduledAt: Date;
    content?: string;
    mediaUrl?: string;
    templateId?: string;
    notes?: string;
    createdBy?: string;
  }) {
    return this.prisma.followUp.create({ data: { ...data, status: 'pending' } });
  }

  async updateStatus(id: string, tenantId: string, status: string, extra?: { sentAt?: Date; notes?: string }) {
    return this.prisma.followUp.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  async cancel(id: string, tenantId: string, cancelledBy: string) {
    return this.prisma.followUp.update({
      where: { id },
      data: { status: 'cancelled', cancelledBy, cancelledAt: new Date() },
    });
  }

  async bulkCancel(tenantId: string, filters?: { leadId?: string; status?: string }) {
    const result = await this.prisma.followUp.updateMany({
      where: {
        tenantId,
        status: { in: ['pending'] },
        ...(filters?.leadId && { leadId: filters.leadId }),
      },
      data: { status: 'cancelled', cancelledBy: 'system', cancelledAt: new Date() },
    });
    return result;
  }

  async getPendingForProcessing(tenantId: string) {
    const now = new Date();
    return this.prisma.followUp.findMany({
      where: {
        tenantId,
        status: 'pending',
        scheduledAt: { lte: now },
      },
      include: { lead: true },
    });
  }

  async getStats(tenantId: string) {
    const [total, pending, sent, failed, cancelled] = await Promise.all([
      this.prisma.followUp.count({ where: { tenantId } }),
      this.prisma.followUp.count({ where: { tenantId, status: 'pending' } }),
      this.prisma.followUp.count({ where: { tenantId, status: 'sent' } }),
      this.prisma.followUp.count({ where: { tenantId, status: 'failed' } }),
      this.prisma.followUp.count({ where: { tenantId, status: 'cancelled' } }),
    ]);
    return { total, pending, sent, failed, cancelled };
  }
}
