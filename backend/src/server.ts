import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import bcrypt from 'bcryptjs';

import { env } from './config/env';
import prisma from './config/database';

import { registerIntakeRoute } from './api/agent/intake';
import { registerConversationRoute } from './api/agent/conversation';
import { registerPipelineRoutes } from './api/pipelines/routes';
import { registerCrmRoutes } from './api/crm/routes';
import { registerWhatsAppRoutes } from './api/whatsapp.routes';
import { registerPromptsRoutes } from './api/prompts.routes';
import { registerVoiceRoutes } from './api/voice.routes';
import { classifyLead } from './services/leadClassifier';
import { routeLead, getDefaultRouting } from './services/leadRouter';
import { getOrCreateTenantByClienteId as getOrCreateTenantByClienteIdUtil, getOrCreateDefaultTenant } from './utils/tenant';
import { authenticate } from './middleware/auth';

// ======================================================
// TIPOS
// ======================================================
interface RegisterBody {
  email?: string;
  name?: string;
  password?: string;
  tenantName?: string;
}

interface LeadWebhookBody {
  nome?: string;
  telefone?: string;
  email?: string | null;
  origem?: string | null;
  clienteId?: string; // ID do cliente/escritório (para multi-tenancy)
  [key: string]: unknown;
}

const fastify = Fastify({
  logger: true,
});

// ======================================================
// UTIL – TENANT (importado de utils/tenant.ts)
// ======================================================
// Funções movidas para utils/tenant.ts para reutilização

// ======================================================
// UTIL – NORMALIZAÇÃO E ENRIQUECIMENTO (FASE 2)
// ======================================================

/**
 * Normaliza telefone para formato +55XXXXXXXXXXX
 * Remove tudo que não for número
 * Lança erro se inválido
 */
function normalizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Telefone inválido: campo obrigatório');
  }

  // Remove tudo que não for número
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10 || digits.length > 13) {
    throw new Error(`Telefone inválido: deve ter entre 10 e 13 dígitos (recebido: ${digits.length})`);
  }

  // Se começa com 55 (Brasil), mantém
  // Se não, adiciona 55
  let normalized = digits;
  if (!digits.startsWith('55')) {
    normalized = `55${digits}`;
  }

  // Garante formato +55XXXXXXXXXXX
  return `+${normalized}`;
}

/**
 * Normaliza nome: trim, remove espaços duplicados, capitaliza palavras
 */
function normalizeName(name: string): string {
  if (!name || typeof name !== 'string') {
    throw new Error('Nome inválido: campo obrigatório');
  }

  // Trim e remove espaços duplicados
  let normalized = name.trim().replace(/\s+/g, ' ');

  // Capitaliza palavras (primeira letra maiúscula, resto minúscula)
  normalized = normalized
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return normalized;
}

/**
 * Normaliza email: se não existir retorna null, se existir lowercase + trim
 */
function normalizeEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim().toLowerCase();

  // Validação básica de email
  if (trimmed.length === 0 || !trimmed.includes('@')) {
    return null;
  }

  return trimmed;
}

/**
 * Detecta canal baseado na origem
 * Mapeia: n8n/make → automacao, whatsapp → whatsapp, site → inbound, indicacao → referral, default → outros
 */
function detectChannel(origem: string | null | undefined): string {
  if (!origem || typeof origem !== 'string') {
    return 'outros';
  }

  const origemLower = origem.toLowerCase().trim();

  const mapping: Record<string, string> = {
    make: 'automacao',
    whatsapp: 'whatsapp',
    site: 'inbound',
    indicacao: 'referral',
    referral: 'referral',
    inbound: 'inbound',
    automacao: 'automacao',
  };

  return mapping[origemLower] || 'outros';
}

// ======================================================
// BUILD
// ======================================================
async function build() {
  // ---------------- CORS ----------------
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // ---------------- JWT ----------------
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // ---------------- WS ----------------
  await fastify.register(websocket);

  // ======================================================
  // HEALTH
  // ======================================================
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // ======================================================
  // AUTH
  // ======================================================
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = request.body as { email?: string; password?: string };

      if (!email || !password) {
        return reply.status(400).send({ 
          error: 'Email e senha são obrigatórios' 
        });
      }

      const user = await prisma.user.findUnique({ 
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return reply.status(401).send({ 
          error: 'Credenciais inválidas' 
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return reply.status(401).send({ 
          error: 'Credenciais inválidas' 
        });
      }

      if (!user.isActive) {
        return reply.status(403).send({ 
          error: 'Usuário desativado' 
        });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        tenantId: user.tenantId,
      });

      return reply.send({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
        },
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao fazer login',
        message: errorMessage,
      });
    }
  });

  fastify.post('/register', async (request, reply) => {
    const { email, name, password, tenantName } = request.body as RegisterBody;

    if (!email || !name || !password || !tenantName) {
      return reply.status(400).send({ error: 'Campos obrigatórios ausentes' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return reply.status(400).send({ error: 'Email já cadastrado' });
    }

    const tenant = await prisma.tenant.create({
      data: { name: tenantName },
    });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'admin',
        tenantId: tenant.id,
      },
    });

    const token = fastify.jwt.sign({
      id: user.id,
      tenantId: tenant.id,
    });

    return { token, user, tenant };
  });

  // ======================================================
  // 🔥 WEBHOOK UNIVERSAL /leads (Compatível com N8N, Make, Zapier, etc.)
  // FASE 2: Normalização e Enriquecimento
  // ======================================================
  fastify.post('/leads', async (request, reply) => {
    try {
      const body = request.body as LeadWebhookBody;

      if (!body) {
        return reply.status(400).send({ error: 'Body vazio' });
      }

      const { nome, telefone, email, origem, clienteId } = body;

      // Validação básica (antes da normalização)
      if (!nome || !telefone) {
        return reply.status(400).send({
          error: 'nome e telefone são obrigatórios',
        });
      }

      // ============================================
      // FASE 2: NORMALIZAÇÃO E ENRIQUECIMENTO
      // ============================================
      let normalizedPhone: string;
      let normalizedName: string;
      let normalizedEmail: string | null;
      let canal: string;

      try {
        normalizedPhone = normalizePhone(telefone);
        normalizedName = normalizeName(nome);
        normalizedEmail = normalizeEmail(email);
        canal = detectChannel(origem);
      } catch (normalizeError: unknown) {
        const errorMessage = normalizeError instanceof Error ? normalizeError.message : 'Erro desconhecido na normalização';
        return reply.status(400).send({
          error: 'Erro na normalização dos dados',
          message: errorMessage,
        });
      }

      // ============================================
      // DEDUPLICAÇÃO (usando dados normalizados)
      // ============================================
      // Usa clienteId se fornecido, senão usa tenant padrão
      const tenantId = await getOrCreateTenantByClienteIdUtil(clienteId);

      // Busca por telefone normalizado OU email (se fornecido)
      const existing = await prisma.lead.findFirst({
        where: {
          tenantId,
          OR: [
            { phone: normalizedPhone },
            ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ],
        },
      });

      // ============================================
      // FASE 3: CLASSIFICAÇÃO INTELIGENTE
      // ============================================
      let classification;
      try {
        classification = await classifyLead({
          nome: normalizedName,
          telefone: normalizedPhone,
          email: normalizedEmail || undefined,
          origem: origem || undefined,
        });
        fastify.log.info(
          { classification, normalizedName, normalizedPhone },
          'Lead classified'
        );
      } catch (classificationError: unknown) {
        fastify.log.warn(
          { error: classificationError },
          'Classification failed, continuing without classification'
        );
        // Continua sem classificação (não quebra o endpoint)
      }

      // ============================================
      // ROTEAMENTO INTELIGENTE
      // ============================================
      // Garantir que routing SEMPRE exista (obrigatório para automações)
      let routing;
      if (classification) {
        try {
          routing = routeLead(classification);
          fastify.log.info(
            { destino: routing.destino, urgencia: routing.urgencia },
            `Lead roteado para: ${routing.destino}`
          );
          fastify.log.info(
            { urgencia: routing.urgencia },
            `Urgência definida: ${routing.urgencia}`
          );
        } catch (routingError: unknown) {
          fastify.log.warn(
            { error: routingError },
            'Routing failed, using fallback'
          );
          // Fallback seguro com valores padrão
          routing = getDefaultRouting();
        }
      } else {
        // Se não há classificação, usar fallback padrão
        routing = getDefaultRouting();
        fastify.log.info(
          { destino: routing.destino, urgencia: routing.urgencia },
          `Lead roteado para: ${routing.destino} (sem classificação)`
        );
        fastify.log.info(
          { urgencia: routing.urgencia },
          `Urgência definida: ${routing.urgencia}`
        );
      }

      if (existing) {
        return reply.send({
          success: true,
          leadId: existing.id,
          clienteId: tenantId, // Retorna clienteId para filtro em automações
          message: 'Lead já existente',
          ...(classification && { classification }),
          routing: {
            destino: routing.destino,
            urgencia: routing.urgencia,
          },
        });
      }

      // ============================================
      // SALVAR PAYLOAD ORIGINAL E METADADOS
      // ============================================
      // Armazena payload original como JSON string em demandDescription
      // e origem/canal em legalArea/contactPreference
      const payloadOriginal = JSON.stringify(body);

      const lead = await prisma.lead.create({
        data: {
          tenantId,
          name: normalizedName,
          phone: normalizedPhone,
          email: normalizedEmail,
          status: 'novo',
          legalArea: origem ?? null, // Origem original
          contactPreference: canal, // Canal detectado
          demandDescription: payloadOriginal, // Payload original completo
        },
      });

      return reply.status(201).send({
        success: true,
        leadId: lead.id,
        clienteId: tenantId, // Retorna clienteId para filtro no Make
        message: 'Lead criado com sucesso',
        ...(classification && { classification }),
        routing: {
          destino: routing.destino,
          urgencia: routing.urgencia,
        },
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro interno no webhook',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // AGENTE IA
  // ======================================================
  await registerIntakeRoute(fastify);
  await registerConversationRoute(fastify);
  await registerWhatsAppRoutes(fastify);

  // ======================================================
  // PIPELINES E DEALS
  // ======================================================
  await registerPipelineRoutes(fastify);

  // ======================================================
  // INTEGRAÇÕES CRM
  // ======================================================
  await registerCrmRoutes(fastify);

  // ======================================================
  // ENDPOINT TEMPORÁRIO: FIX MIGRATION
  // ⚠️ REMOVER DEPOIS DE APLICAR A MIGRATION
  // Chave secreta temporária: fix-migration-2026
  // ======================================================
  fastify.post('/api/fix-migration', async (request, reply) => {
    try {
      const { secret } = request.body as { secret?: string };
      
      // Verificação simples com chave secreta
      if (secret !== 'fix-migration-2026') {
        return reply.status(401).send({ error: 'Chave secreta inválida' });
      }

      const fs = require('fs');
      const path = require('path');
      // Tentar primeiro o arquivo direto, depois o safe
      let sqlPath = path.join(__dirname, '../fix-migration-direct.sql');
      if (!fs.existsSync(sqlPath)) {
        sqlPath = path.join(__dirname, '../prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql');
      }
      
      if (!fs.existsSync(sqlPath)) {
        return reply.status(404).send({ error: 'Arquivo SQL não encontrado' });
      }

      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      const results = [];
      for (const command of commands) {
        if (command.length > 0) {
          try {
            await prisma.$executeRawUnsafe(command);
            results.push({ status: 'success', command: command.substring(0, 80) + '...' });
          } catch (error: any) {
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('duplicate') ||
                error.message.includes('constraint')) {
              results.push({ status: 'skipped', command: command.substring(0, 80) + '...', reason: 'already exists' });
            } else {
              results.push({ status: 'error', command: command.substring(0, 80) + '...', error: error.message });
            }
          }
        }
      }

      return reply.send({
        success: true,
        message: 'Migration aplicada com sucesso',
        totalCommands: commands.length,
        results,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao aplicar migration',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // GERENCIAMENTO DE TENANTS (CLIENTES)
  // ======================================================
  
  // Listar todos os tenants (requer autenticação)
  fastify.get('/tenants', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      // Usuário autenticado pode ver apenas seu próprio tenant
      // Admin pode ver todos (futuro)
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Não foi possível identificar seu tenant',
        });
      }

      // Por enquanto, retorna apenas o tenant do usuário
      // No futuro, admin pode ver todos
      const tenant = await prisma.tenant.findUnique({
        where: { id: userTenantId },
        select: {
          id: true,
          name: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leads: true,
              users: true,
            },
          },
        },
      });

      if (!tenant) {
        return reply.status(404).send({
          error: 'Tenant não encontrado',
        });
      }

      return reply.send([tenant]); // Retorna array para manter compatibilidade
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao listar tenants',
        message: errorMessage,
      });
    }
  });

  // Obter tenant específico (requer autenticação)
  fastify.get('/tenants/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      // Usuário só pode ver seu próprio tenant
      if (id !== userTenantId) {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Você só pode acessar seu próprio tenant',
        });
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              leads: true,
              users: true,
            },
          },
        },
      });

      if (!tenant) {
        return reply.status(404).send({
          error: 'Tenant não encontrado',
        });
      }

      return reply.send(tenant);
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar tenant',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // API DE LEADS (requer autenticação)
  // ======================================================
  fastify.get('/api/leads', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      const leads = await prisma.lead.findMany({
        where: {
          tenantId: userTenantId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          city: true,
          state: true,
          legalArea: true,
          customLegalArea: true,
          demandDescription: true,
          urgency: true,
          status: true,
          contactPreference: true,
          availableForHumanContact: true,
          lgpdConsent: true,
          lgpdConsentDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.send({
        leads,
        total: leads.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar leads',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // API DE CONVERSAS (requer autenticação)
  // ======================================================
  fastify.get('/api/conversations', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
          message: 'Token de autenticação inválido',
        });
      }

      // Buscar conversas através dos leads do tenant
      const conversations = await prisma.conversation.findMany({
        where: {
          lead: {
            tenantId: userTenantId,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              status: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
            take: 50, // Últimas 50 mensagens por conversa
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 100, // Últimas 100 conversas
      });

      return reply.send({
        conversations,
        total: conversations.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar conversas',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // API DE CONVERSAS - AÇÕES (requer autenticação)
  // ======================================================

  // Atualizar status da conversa
  fastify.patch('/api/conversations/:id/status', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { status } = request.body as { status: string };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!['active', 'paused', 'closed'].includes(status)) {
        return reply.status(400).send({
          error: 'Status inválido',
          message: 'Status deve ser: active, paused ou closed',
        });
      }

      // Verificar se a conversa pertence ao tenant do usuário
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({
          error: 'Conversa não encontrada',
        });
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { status },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
        },
      });

      return reply.send({ conversation: updated });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar status',
        message: errorMessage,
      });
    }
  });

  // Atualizar tipo de atribuição (ai, human, hybrid)
  fastify.patch('/api/conversations/:id/assigned-type', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { assignedType } = request.body as { assignedType: string };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!['ai', 'human', 'hybrid'].includes(assignedType)) {
        return reply.status(400).send({
          error: 'Tipo inválido',
          message: 'Tipo deve ser: ai, human ou hybrid',
        });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({
          error: 'Conversa não encontrada',
        });
      }

      const updated = await prisma.conversation.update({
        where: { id },
        data: { assignedType },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
        },
      });

      return reply.send({ conversation: updated });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar tipo',
        message: errorMessage,
      });
    }
  });

  // Registrar intenção detectada
  fastify.post('/api/conversations/:id/intentions', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { intention } = request.body as { intention: string };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({
          error: 'Conversa não encontrada',
        });
      }

      // Criar mensagem do sistema com a intenção
      const systemMessage = await prisma.message.create({
        data: {
          conversationId: id,
          content: `Intenção detectada: ${intention}`,
          senderType: 'system',
        },
      });

      // Atualizar última mensagem da conversa com intenção (usando campo customizado se necessário)
      // Por enquanto, apenas retornamos a mensagem criada
      const updated = await prisma.conversation.findUnique({
        where: { id },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
        },
      });

      // Adicionar intenção à última mensagem (se houver)
      if (updated && updated.messages.length > 0) {
        const lastMessage = updated.messages[updated.messages.length - 1];
        // Nota: O schema atual não tem campo intention em Message
        // Isso pode ser adicionado depois se necessário
      }

      return reply.send({
        success: true,
        intention,
        message: systemMessage,
        conversation: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao registrar intenção',
        message: errorMessage,
      });
    }
  });

  // Enviar mensagem manual
  fastify.post('/api/conversations/:id/messages', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { content, senderType = 'sdr' } = request.body as { content: string; senderType?: string };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!content || !content.trim()) {
        return reply.status(400).send({
          error: 'Conteúdo da mensagem é obrigatório',
        });
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!conversation) {
        return reply.status(404).send({
          error: 'Conversa não encontrada',
        });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: id,
          content: content.trim(),
          senderType,
        },
      });

      // Atualizar updatedAt da conversa
      await prisma.conversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      const updated = await prisma.conversation.findUnique({
        where: { id },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
          },
        },
      });

      return reply.send({
        success: true,
        message,
        conversation: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao enviar mensagem',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // API DE USUÁRIO E PERFIL (requer autenticação)
  // ======================================================

  // Obter dados do usuário autenticado
  fastify.get('/me', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userId = user?.id;
      const userTenantId = user?.tenantId;

      if (!userId || !userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          tenant: {
            select: {
              id: true,
              name: true,
              plan: true,
            },
          },
        },
      });

      if (!userData) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      return reply.send({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
        tenant: userData.tenant,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar dados do usuário',
        message: errorMessage,
      });
    }
  });

  // Atualizar perfil do usuário
  fastify.patch('/api/user/profile', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userId = user?.id;
      const { name, phone } = request.body as { name?: string; phone?: string };

      if (!userId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          // Phone pode ser adicionado ao schema depois
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return reply.send({
        success: true,
        user: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar perfil',
        message: errorMessage,
      });
    }
  });

  // Alterar senha do usuário
  fastify.patch('/api/user/password', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userId = user?.id;
      const { currentPassword, newPassword } = request.body as { currentPassword?: string; newPassword?: string };

      if (!userId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!currentPassword || !newPassword) {
        return reply.status(400).send({
          error: 'Senha atual e nova senha são obrigatórias',
        });
      }

      if (newPassword.length < 6) {
        return reply.status(400).send({
          error: 'A nova senha deve ter pelo menos 6 caracteres',
        });
      }

      const userData = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userData) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      const valid = await bcrypt.compare(currentPassword, userData.password);
      if (!valid) {
        return reply.status(401).send({
          error: 'Senha atual incorreta',
        });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
      });

      return reply.send({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao alterar senha',
        message: errorMessage,
      });
    }
  });

  // Listar usuários do tenant
  fastify.get('/api/users', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const users = await prisma.user.findMany({
        where: {
          tenantId: userTenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reply.send({
        users,
        total: users.length,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao buscar usuários',
        message: errorMessage,
      });
    }
  });

  // Criar novo usuário
  fastify.post('/api/users', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, email, password, role = 'user' } = request.body as {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (!name || !email || !password) {
        return reply.status(400).send({
          error: 'Nome, email e senha são obrigatórios',
        });
      }

      if (password.length < 6) {
        return reply.status(400).send({
          error: 'A senha deve ter pelo menos 6 caracteres',
        });
      }

      if (!['admin', 'user', 'sdr'].includes(role)) {
        return reply.status(400).send({
          error: 'Role inválido. Use: admin, user ou sdr',
        });
      }

      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) {
        return reply.status(400).send({
          error: 'Email já cadastrado',
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role,
          tenantId: userTenantId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return reply.status(201).send({
        success: true,
        user: newUser,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao criar usuário',
        message: errorMessage,
      });
    }
  });

  // Atualizar usuário
  fastify.patch('/api/users/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, email, role } = request.body as {
        name?: string;
        email?: string;
        role?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!targetUser) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      if (role && !['admin', 'user', 'sdr'].includes(role)) {
        return reply.status(400).send({
          error: 'Role inválido. Use: admin, user ou sdr',
        });
      }

      if (email && email !== targetUser.email) {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
          return reply.status(400).send({
            error: 'Email já cadastrado',
          });
        }
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return reply.send({
        success: true,
        user: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar usuário',
        message: errorMessage,
      });
    }
  });

  // Ativar/Desativar usuário
  fastify.patch('/api/users/:id/status', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { isActive } = request.body as { isActive?: boolean };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      if (typeof isActive !== 'boolean') {
        return reply.status(400).send({
          error: 'isActive deve ser um boolean',
        });
      }

      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!targetUser) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      // Não permitir desativar a si mesmo
      if (id === user.id && !isActive) {
        return reply.status(400).send({
          error: 'Você não pode desativar sua própria conta',
        });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return reply.send({
        success: true,
        user: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar status do usuário',
        message: errorMessage,
      });
    }
  });

  // Deletar usuário
  fastify.delete('/api/users/:id', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      const targetUser = await prisma.user.findFirst({
        where: {
          id,
          tenantId: userTenantId,
        },
      });

      if (!targetUser) {
        return reply.status(404).send({
          error: 'Usuário não encontrado',
        });
      }

      // Não permitir deletar a si mesmo
      if (id === user.id) {
        return reply.status(400).send({
          error: 'Você não pode deletar sua própria conta',
        });
      }

      await prisma.user.delete({
        where: { id },
      });

      return reply.send({
        success: true,
        message: 'Usuário removido com sucesso',
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao deletar usuário',
        message: errorMessage,
      });
    }
  });

  // ======================================================
  // API DE TENANT - CONFIGURAÇÕES (requer autenticação)
  // ======================================================

  // Atualizar configurações da empresa
  fastify.patch('/api/tenant/settings', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const user = request.user as { id: string; tenantId: string } | undefined;
      const userTenantId = user?.tenantId;
      const { name, phone, status } = request.body as {
        name?: string;
        phone?: string;
        status?: string;
      };

      if (!userTenantId) {
        return reply.status(401).send({
          error: 'Não autenticado',
        });
      }

      // Verificar se o usuário tem permissão (admin)
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (currentUser?.role !== 'admin') {
        return reply.status(403).send({
          error: 'Acesso negado',
          message: 'Apenas administradores podem alterar configurações da empresa',
        });
      }

      const updated = await prisma.tenant.update({
        where: { id: userTenantId },
        data: {
          ...(name && { name }),
          // Phone e status podem ser adicionados ao schema depois
        },
        select: {
          id: true,
          name: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.send({
        success: true,
        tenant: updated,
      });
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      return reply.status(500).send({
        error: 'Erro ao atualizar configurações',
        message: errorMessage,
      });
    }
  });

  // Criar tenant manualmente (requer autenticação - apenas admin no futuro)
  fastify.post('/tenants', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    try {
      const body = request.body as {
        id?: string;
        name: string;
        plan?: string;
      };

      if (!body.name) {
        return reply.status(400).send({
          error: 'Nome é obrigatório',
        });
      }

      // Por enquanto, qualquer usuário autenticado pode criar tenant
      // No futuro, apenas admin
      const tenant = await prisma.tenant.create({
        data: {
          id: body.id, // Se fornecido, usa o ID customizado
          name: body.name,
          plan: body.plan || 'free',
        },
        select: {
          id: true,
          name: true,
          plan: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return reply.status(201).send(tenant);
    } catch (err: unknown) {
      fastify.log.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      
      // Se erro for de constraint única (ID duplicado)
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('duplicate key')) {
        return reply.status(409).send({
          error: 'Tenant já existe com este ID',
        });
      }

      return reply.status(500).send({
        error: 'Erro ao criar tenant',
        message: errorMessage,
      });
    }
  });

  return fastify;
}

// ======================================================
// START
// ======================================================
async function start() {
  try {
    await prisma.$connect();
    const app = await build();

    const PORT = Number(process.env.PORT) || 3001;

    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 API rodando na porta ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

export { build };
