# 🔧 Implementação do Fluxo Completo - Passo a Passo Técnico

## 🎯 Objetivo

Implementar o fluxo completo do agente IA conforme o diagrama, conectando todas as partes que ainda estão faltando.

---

## 📊 STATUS ATUAL vs FLUXO IDEAL

### ✅ **JÁ IMPLEMENTADO (Funciona Agora)**

| Componente | Status | Endpoint/Arquivo |
|------------|--------|------------------|
| Recebimento | ✅ | `POST /leads` |
| Validação | ✅ | `POST /leads` (normalização) |
| Dados do Lead | ✅ | `POST /leads` (buscar/criar) |
| Classificação | ✅ | `classifyLead()` |
| Roteamento | ✅ | `routeLead()` |
| Composição IA | ✅ | `POST /api/agent/conversation` |
| Registro no Banco | ✅ | Prisma (Lead model) |

### ⚠️ **PARCIALMENTE IMPLEMENTADO (Precisa Melhorar)**

| Componente | Status | O Que Falta |
|------------|--------|-------------|
| Filtros Iniciais | ⚠️ | Detecção avançada de spam |
| Orquestrador | ⚠️ | Verificar status do agente |
| Tratamento Mensagens | ⚠️ | Áudio, imagem, vídeo |
| Buffer | ⚠️ | Sistema de fila robusto |
| Agenda IA | ⚠️ | Integração calendário |
| Humanização | ⚠️ | Aplicar nas respostas |
| Envio Respostas | ⚠️ | N8N configurado |

### ❌ **NÃO IMPLEMENTADO (Precisa Criar)**

| Componente | Status | O Que Fazer |
|------------|--------|-------------|
| Processamento Áudio | ❌ | Transcrição (Whisper API) |
| Processamento Imagem | ❌ | OCR (Tesseract/Vision API) |
| Processamento Vídeo | ❌ | Extração de frames |
| Integração Calendário | ❌ | Google Calendar API |

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Orquestrador Completo** (Prioridade ALTA)

**Objetivo:** Decidir corretamente entre IA, Humano ou Desativado.

#### 1.1 Criar Schema no Prisma

```prisma
// backend/prisma/schema.prisma

model AgentConfig {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  // Status do Agente
  isActive    Boolean  @default(false)
  isPaused    Boolean  @default(false)
  
  // Horário de Funcionamento
  is24Hours   Boolean  @default(false)
  businessHours Json?  // { monday: { start: "09:00", end: "18:00" }, ... }
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId])
}
```

#### 1.2 Criar Endpoint para Verificar Status

```typescript
// backend/src/api/agent/orchestrator.ts

import { FastifyInstance } from 'fastify';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

export async function registerOrchestratorRoute(fastify: FastifyInstance) {
  // GET: Verificar status do agente e decidir rota
  fastify.post('/api/agent/orchestrator', async (request, reply) => {
    try {
      const body = request.body as {
        lead_id: string;
        message: string;
        clienteId?: string;
      };

      if (!body.lead_id) {
        return reply.status(400).send({
          error: 'lead_id is required',
        });
      }

      // Buscar configuração do agente
      const tenantId = body.clienteId 
        ? await getOrCreateTenantByClienteId(body.clienteId)
        : null;

      if (!tenantId) {
        return reply.status(400).send({
          error: 'clienteId is required',
        });
      }

      const agentConfig = await prisma.agentConfig.findUnique({
        where: { tenantId },
      });

      // Decisão 1: Agente está desativado?
      if (!agentConfig || !agentConfig.isActive || agentConfig.isPaused) {
        return reply.send({
          destino: 'humano',
          motivo: 'Agente desativado ou pausado',
          prioridade: 'normal',
        });
      }

      // Decisão 2: Está dentro do horário de funcionamento?
      if (!agentConfig.is24Hours && agentConfig.businessHours) {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = domingo, 1 = segunda, etc.
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const businessHours = agentConfig.businessHours as any;
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
        const daySchedule = businessHours[dayName];

        if (daySchedule && daySchedule.enabled) {
          const [startHour, startMin] = daySchedule.start.split(':').map(Number);
          const [endHour, endMin] = daySchedule.end.split(':').map(Number);

          const currentTime = currentHour * 60 + currentMinute;
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          if (currentTime < startTime || currentTime > endTime) {
            return reply.send({
              destino: 'humano',
              motivo: 'Fora do horário de funcionamento',
              prioridade: 'normal',
            });
          }
        }
      }

      // Decisão 3: Analisar urgência da mensagem
      const urgency = analyzeUrgency(body.message);

      if (urgency === 'critica' || urgency === 'alta') {
        return reply.send({
          destino: 'humano',
          motivo: 'Urgência alta detectada',
          prioridade: urgency,
        });
      }

      // Decisão 4: Verificar se lead pediu explicitamente humano
      if (body.message.toLowerCase().includes('falar com advogado') ||
          body.message.toLowerCase().includes('quero falar com humano') ||
          body.message.toLowerCase().includes('atendimento humano')) {
        return reply.send({
          destino: 'humano',
          motivo: 'Lead solicitou atendimento humano',
          prioridade: 'alta',
        });
      }

      // Decisão 5: Tudo OK, usar IA
      return reply.send({
        destino: 'ia',
        motivo: 'Condições atendidas para IA',
        prioridade: 'normal',
      });

    } catch (error: any) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Erro no orquestrador',
        message: error.message,
      });
    }
  });
}

function analyzeUrgency(message: string): 'critica' | 'alta' | 'normal' {
  const msgLower = message.toLowerCase();
  
  // Palavras-chave de urgência crítica
  const criticalKeywords = [
    'preso', 'prisão', 'prisao',
    'prazo vencendo', 'prazo vence',
    'violência', 'violencia',
    'risco iminente',
  ];
  
  // Palavras-chave de urgência alta
  const highKeywords = [
    'urgente', 'urgência', 'urgencia',
    'hoje', 'agora', 'imediatamente',
    'prazo', 'vencendo',
  ];
  
  if (criticalKeywords.some(kw => msgLower.includes(kw))) {
    return 'critica';
  }
  
  if (highKeywords.some(kw => msgLower.includes(kw))) {
    return 'alta';
  }
  
  return 'normal';
}
```

#### 1.3 Registrar Rota no server.ts

```typescript
// backend/src/server.ts

import { registerOrchestratorRoute } from './api/agent/orchestrator';

// Dentro da função build():
await registerOrchestratorRoute(fastify);
```

---

### **FASE 2: Humanização de Respostas** (Prioridade MÉDIA)

**Objetivo:** Aplicar configurações de humanização nas respostas da IA.

#### 2.1 Criar Serviço de Humanização

```typescript
// backend/src/services/humanization.ts

interface HumanizationConfig {
  messageLength: 'curto' | 'medio' | 'longo';
  emojiUsage: 'nenhum' | 'pouco' | 'medio' | 'muito';
  abbreviateWords: boolean;
  lowercaseStart: boolean;
  typingErrors: 'nenhum' | 'pouco' | 'medio' | 'muito';
}

export function humanizeResponse(
  message: string,
  config: HumanizationConfig
): string {
  let humanized = message;

  // 1. Ajustar tamanho da mensagem
  if (config.messageLength === 'curto') {
    humanized = shortenMessage(humanized);
  } else if (config.messageLength === 'longo') {
    humanized = expandMessage(humanized);
  }

  // 2. Adicionar emojis
  if (config.emojiUsage !== 'nenhum') {
    humanized = addEmojis(humanized, config.emojiUsage);
  }

  // 3. Abreviar palavras
  if (config.abbreviateWords) {
    humanized = abbreviateWords(humanized);
  }

  // 4. Começar com minúscula
  if (config.lowercaseStart) {
    humanized = lowercaseFirstLetter(humanized);
  }

  // 5. Adicionar erros de digitação
  if (config.typingErrors !== 'nenhum') {
    humanized = addTypingErrors(humanized, config.typingErrors);
  }

  return humanized;
}

function shortenMessage(message: string): string {
  // Remove frases desnecessárias, mantém essencial
  const sentences = message.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 3) {
    return sentences.slice(0, 3).join('. ') + '.';
  }
  return message;
}

function expandMessage(message: string): string {
  // Adiciona mais contexto e explicações
  // Implementação específica conforme necessário
  return message;
}

function addEmojis(message: string, level: string): string {
  const emojiMap: Record<string, string[]> = {
    pouco: ['👍', '✅', '😊'],
    medio: ['👍', '✅', '😊', '💬', '📝'],
    muito: ['👍', '✅', '😊', '💬', '📝', '🎯', '🚀', '💡'],
  };

  const emojis = emojiMap[level] || [];
  // Adiciona emojis aleatoriamente (implementação específica)
  return message;
}

function abbreviateWords(message: string): string {
  const abbreviations: Record<string, string> = {
    'você': 'vc',
    'para': 'pra',
    'com': 'c/',
    'está': 'ta',
    'estou': 'to',
  };

  let abbreviated = message;
  Object.entries(abbreviations).forEach(([full, abbr]) => {
    abbreviated = abbreviated.replace(new RegExp(full, 'gi'), abbr);
  });

  return abbreviated;
}

function lowercaseFirstLetter(message: string): string {
  if (message.length === 0) return message;
  return message.charAt(0).toLowerCase() + message.slice(1);
}

function addTypingErrors(message: string, level: string): string {
  const errorRate = {
    pouco: 0.02,  // 2% de erro
    medio: 0.05,  // 5% de erro
    muito: 0.10,  // 10% de erro
  }[level] || 0;

  // Implementação: trocar letras aleatoriamente
  // (exemplo simplificado)
  return message;
}
```

#### 2.2 Aplicar Humanização no Endpoint de Conversação

```typescript
// backend/src/api/agent/conversation.ts

import { humanizeResponse } from '../../services/humanization';
import prisma from '../../config/database';

// Dentro do endpoint POST /api/agent/conversation:

// Após gerar resposta da IA:
const agentResponse = generateAgentResponse(userMessage, currentData);

// Buscar configuração de humanização
const agentConfig = await prisma.agentConfig.findUnique({
  where: { tenantId },
  include: { humanizationConfig: true },
});

// Aplicar humanização se configurado
let finalMessage = agentResponse.message;
if (agentConfig?.humanizationConfig) {
  finalMessage = humanizeResponse(
    agentResponse.message,
    agentConfig.humanizationConfig as any
  );
}

// Retornar mensagem humanizada
return reply.send({
  lead_id,
  state: currentData.state,
  message: finalMessage, // Mensagem humanizada
  options: agentResponse.options,
  conversation_data: currentData,
  timestamp: new Date().toISOString(),
});
```

---

### **FASE 3: Integração com Calendário** (Prioridade BAIXA)

**Objetivo:** Agendar consultas automaticamente.

#### 3.1 Instalar Dependências

```bash
npm install googleapis
```

#### 3.2 Criar Serviço de Calendário

```typescript
// backend/src/services/calendar.ts

import { google } from 'googleapis';

export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    description: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: Array<{ email: string }>;
  }
) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Fase 1: Orquestrador**
- [ ] Criar schema `AgentConfig` no Prisma
- [ ] Rodar migration
- [ ] Criar endpoint `/api/agent/orchestrator`
- [ ] Implementar lógica de decisão
- [ ] Testar com diferentes cenários

### **Fase 2: Humanização**
- [ ] Criar serviço `humanization.ts`
- [ ] Implementar funções de humanização
- [ ] Conectar ao endpoint de conversação
- [ ] Testar diferentes níveis de humanização

### **Fase 3: Calendário**
- [ ] Instalar `googleapis`
- [ ] Criar serviço de calendário
- [ ] Implementar autenticação OAuth
- [ ] Criar eventos
- [ ] Enviar confirmações

---

## 🎯 PRÓXIMOS PASSOS

1. **HOJE:** Implementar Fase 1 (Orquestrador)
2. **AMANHÃ:** Implementar Fase 2 (Humanização)
3. **DEPOIS:** Implementar Fase 3 (Calendário)

---

**Quer que eu implemente alguma dessas fases agora?** 🚀
