// @ts-nocheck
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthenticatedRequest, authenticate, loadUser } from '../middleware/auth.middleware';
import { ensureTenantAccess } from '../middleware/tenant.middleware';
import { generateAIResponse, detectIntentBasic, type AIMessageContext } from '../services/ai.service';
import { wsManager } from '../services/websocket.service';

const createConversationSchema = z.object({
  leadId: z.string().uuid(),
  channel: z.enum(['whatsapp', 'instagram', 'site', 'chat']),
  assignedType: z.enum(['ai', 'human', 'hybrid']).default('ai'),
});

const sendMessageSchema = z.object({
  content: z.string().min(1),
  senderType: z.enum(['lead', 'ai', 'human']),
  isAI: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
});

export async function conversationsRoutes(fastify: FastifyInstance) {
  // Listar conversas
  fastify.get('/conversations', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { status, assignedTo, leadId } = request.query as any;

      const where: any = { tenantId };
      if (status) where.status = status;
      if (assignedTo) where.assignedTo = assignedTo;
      if (leadId) where.leadId = leadId;

      const conversations = await prisma.conversation.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      });

      return reply.send({ conversations });
    } catch (error) {
      console.error('List conversations error:', error);
      return reply.status(500).send({ error: 'Failed to list conversations' });
    }
  });

  // Obter conversa por ID
  fastify.get('/conversations/:id', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const { id } = request.params as { id: string };

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          lead: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      return reply.send({ conversation });
    } catch (error) {
      console.error('Get conversation error:', error);
      return reply.status(500).send({ error: 'Failed to get conversation' });
    }
  });

  // Criar conversa
  fastify.post('/conversations', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const data = createConversationSchema.parse(request.body);

      // Verificar se lead existe e pertence ao tenant
      const lead = await prisma.lead.findFirst({
        where: {
          id: data.leadId,
          tenantId,
        },
      });

      if (!lead) {
        return reply.status(404).send({ error: 'Lead not found' });
      }

      // Verificar se já existe conversa ativa
      const existing = await prisma.conversation.findFirst({
        where: {
          leadId: data.leadId,
          status: 'active',
          tenantId,
        },
      });

      if (existing) {
        return reply.send({ conversation: existing });
      }

      const conversation = await prisma.conversation.create({
        data: {
          ...data,
          tenantId,
          status: 'active',
        },
        include: {
          lead: true,
        },
      });

      return reply.status(201).send({ conversation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Create conversation error:', error);
      return reply.status(500).send({ error: 'Failed to create conversation' });
    }
  });

  // Enviar mensagem
  fastify.post('/conversations/:id/messages', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const userId = request.user?.id;
      const { id } = request.params as { id: string };
      const data = sendMessageSchema.parse(request.body);

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: id,
          content: data.content,
          senderType: data.senderType,
          senderId: data.senderType === 'human' ? userId : null,
          isAI: data.isAI,
          metadata: data.metadata || {},
        },
      });

      // Atualizar timestamp da conversa
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      // Se mensagem é do lead e conversa está em modo AI, gerar resposta automática
      let aiResponse = null;
      if (data.senderType === 'lead' && conversation.assignedType === 'ai' && conversation.status === 'active') {
        try {
          // Buscar histórico de mensagens
          const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
            take: 20, // Últimas 20 mensagens para contexto
          });

          // Buscar informações do lead
          const lead = await prisma.lead.findUnique({
            where: { id: conversation.leadId },
            select: {
              name: true,
              legalArea: true,
              customLegalArea: true,
              urgency: true,
              demandDescription: true,
            },
          });

          if (lead) {
            const context: AIMessageContext = {
              conversationHistory: messages.map(msg => ({
                role: msg.senderType as 'lead' | 'ai' | 'human',
                content: msg.content,
                timestamp: msg.createdAt,
              })),
              leadInfo: {
                name: lead.name,
                legalArea: lead.legalArea || undefined,
                customLegalArea: lead.customLegalArea || undefined,
                urgency: lead.urgency || undefined,
                demandDescription: lead.demandDescription || undefined,
              },
              conversationId: id,
            };

            // Gerar resposta da IA
            const aiResult = await generateAIResponse(data.content, context);

            // Salvar resposta da IA como mensagem
            aiResponse = await prisma.message.create({
              data: {
                conversationId: id,
                content: aiResult.message,
                senderType: 'ai',
                senderId: null,
                isAI: true,
                metadata: {
                  intent: aiResult.intent,
                  confidence: aiResult.confidence,
                  shouldEscalate: aiResult.shouldEscalate,
                  suggestedAction: aiResult.suggestedAction,
                },
              },
            });

            // Atualizar timestamp novamente
            await prisma.conversation.update({
              where: { id },
              data: { updatedAt: new Date() },
            });

            // Broadcast resposta da IA via WebSocket
            wsManager.broadcastToConversation(id, {
              type: 'new_message',
              message: {
                id: aiResponse.id,
                content: aiResponse.content,
                senderType: 'ai',
                isAI: true,
                createdAt: aiResponse.createdAt,
                metadata: aiResponse.metadata,
              },
            });

            // Se deve escalar, atualizar conversa
            if (aiResult.shouldEscalate) {
              await prisma.conversation.update({
                where: { id },
                data: {
                  assignedType: 'hybrid',
                  status: 'active',
                },
              });

              // Broadcast atualização de conversa
              wsManager.broadcastToConversation(id, {
                type: 'conversation_updated',
                conversation: {
                  id,
                  assignedType: 'hybrid',
                  status: 'active',
                },
              });
            }
          }
        } catch (error) {
          console.error('AI response generation error:', error);
          // Não falhar a requisição se IA falhar
        }
      }

      return reply.status(201).send({ 
        message,
        aiResponse: aiResponse ? {
          id: aiResponse.id,
          content: aiResponse.content,
          createdAt: aiResponse.createdAt,
        } : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid data', details: error.errors });
      }
      console.error('Send message error:', error);
      return reply.status(500).send({ error: 'Failed to send message' });
    }
  });

  // Atualizar conversa (assumir, devolver, pausar)
  fastify.patch('/conversations/:id', {
    preHandler: [authenticate, loadUser, ensureTenantAccess],
  }, async (request: AuthenticatedRequest, reply) => {
    try {
      const tenantId = (request as any).tenantId;
      const userId = request.user?.id;
      const { id } = request.params as { id: string };
      const { assignedType, status, assignedTo } = request.body as any;

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({ error: 'Conversation not found' });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (assignedType) updateData.assignedType = assignedType;
      if (status) updateData.status = status;
      if (assignedTo !== undefined) {
        updateData.assignedTo = assignedTo || null;
        if (assignedTo) {
          updateData.assignedType = 'human';
        }
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: updateData,
        include: {
          lead: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.send({ conversation: updated });
    } catch (error) {
      console.error('Update conversation error:', error);
      return reply.status(500).send({ error: 'Failed to update conversation' });
    }
  });
}
