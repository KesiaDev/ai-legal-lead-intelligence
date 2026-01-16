import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import bcrypt from 'bcryptjs';

import { env } from './config/env';
import prisma from './config/database';

import { registerIntakeRoute } from './api/agent/intake';
import { registerConversationRoute } from './api/agent/conversation';
import { classifyLead } from './services/leadClassifier';
import { routeLead } from './services/leadRouter';

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
  [key: string]: unknown;
}

const fastify = Fastify({
  logger: true,
});

// ======================================================
// UTIL – TENANT PADRÃO (WEBHOOKS)
// ======================================================
async function getOrCreateDefaultTenant(): Promise<string> {
  const NAME = 'Tenant Padrão SDR';

  let tenant = await prisma.tenant.findFirst({
    where: { name: NAME },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: NAME,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}

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
 * Mapeia: make → automacao, whatsapp → whatsapp, site → inbound, indicacao → referral, default → outros
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
  // 🔥 WEBHOOK UNIVERSAL /leads (À PROVA DE MAKE)
  // FASE 2: Normalização e Enriquecimento
  // ======================================================
  fastify.post('/leads', async (request, reply) => {
    try {
      const body = request.body as LeadWebhookBody;

      if (!body) {
        return reply.status(400).send({ error: 'Body vazio' });
      }

      const { nome, telefone, email, origem } = body;

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
      const tenantId = await getOrCreateDefaultTenant();

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
          // Fallback seguro
          routing = {
            destino: 'nutricao' as const,
            urgencia: 'sem_pressa' as const,
            descricao: 'Lead direcionado para nutrição (fallback seguro)',
          };
        }
      }

      if (existing) {
        return reply.send({
          success: true,
          leadId: existing.id,
          message: 'Lead já existente',
          ...(classification && { classification }),
          ...(routing && { routing }),
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
        message: 'Lead criado com sucesso',
        ...(classification && { classification }),
        ...(routing && { routing }),
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
