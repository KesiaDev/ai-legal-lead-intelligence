# 🔍 DIAGNÓSTICO BRUTAL: INTEGRAÇÕES DO SISTEMA

**Data:** 2026-01-27  
**Análise:** Engenharia Senior - Auditoria Completa  
**Status:** ⚠️ **PROBLEMAS CRÍTICOS IDENTIFICADOS**

---

## 📊 RESUMO EXECUTIVO

### ✅ O QUE REALMENTE FUNCIONA
1. **OpenAI (AgentService)** - ✅ **FUNCIONAL** - Lê do banco E env vars
2. **Frontend salva configurações** - ✅ **FUNCIONAL** - Persiste no banco
3. **Webhooks Z-API** - ✅ **IMPLEMENTADO** - Mas usa só env vars
4. **Webhooks Evolution** - ✅ **IMPLEMENTADO** - Mas usa só env vars

### ❌ O QUE É SÓ VISUAL / NÃO FUNCIONA
1. **Evolution API** - ❌ **SALVA NO BANCO MAS NÃO USA** - Só lê env vars
2. **Z-API** - ❌ **SALVA NO BANCO MAS NÃO USA** - Só lê env vars
3. **OpenAI (leadAiClassifier)** - ❌ **NÃO USA BANCO** - Só env vars
4. **Configurações por tenant** - ❌ **PARCIALMENTE IMPLEMENTADO**

---

## 1️⃣ OPENAI - ANÁLISE COMPLETA

### ✅ **O QUE FUNCIONA**

#### **AgentService** (`backend/src/services/agent.service.ts`)
- ✅ **Lê do banco PRIMEIRO** (`IntegrationConfig.openaiApiKey` por tenant)
- ✅ **Fallback para env var** (`process.env.OPENAI_API_KEY`)
- ✅ **Try/catch implementado** (linhas 122-129)
- ✅ **Logs detalhados** (linhas 119, 127, 135)
- ✅ **Fallback funcional** (`processWithFallback`)
- ✅ **Model configurável** (`gpt-4o-mini` padrão, pode vir do prompt)
- ✅ **Tratamento de erros** (linhas 75-84)

**Onde é usado:**
- `POST /api/agent/conversation` - ✅ **FUNCIONA**
- `ZApiService.processMessage()` - ✅ **FUNCIONA**
- `WhatsAppService.processMessage()` - ✅ **FUNCIONA**

**Fluxo Real:**
```
Mensagem → AgentService.processConversation()
  → getOpenAIApiKey(leadId, clienteId)
    → PRIORIDADE 1: IntegrationConfig.findUnique({ tenantId })
    → PRIORIDADE 2: process.env.OPENAI_API_KEY
  → Se encontrou: processWithOpenAI()
  → Se não: processWithFallback()
```

### ❌ **O QUE NÃO FUNCIONA**

#### **leadAiClassifier** (`backend/src/services/leadAiClassifier.ts`)
- ❌ **SÓ USA ENV VAR** - Linha 24-26
- ❌ **NÃO LÊ DO BANCO** - Nunca consulta `IntegrationConfig`
- ❌ **NÃO TEM FALLBACK** - Se env var não existir, lança erro
- ❌ **NÃO TEM TRY/CATCH** - Erro explode silenciosamente

**Onde é usado:**
- `classifyLead()` em `leadClassifier.ts` - ⚠️ **FUNCIONA MAS IGNORA BANCO**

**Problema:**
```typescript
// ❌ ERRADO - Só usa env var
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ✅ DEVERIA SER:
// Buscar do banco por tenantId primeiro
```

**Impacto:**
- Se usuário salvar chave no frontend, `leadAiClassifier` **NÃO VAI USAR**
- Só funciona se `OPENAI_API_KEY` estiver nas env vars do Railway
- **INCONSISTÊNCIA CRÍTICA** entre `AgentService` e `leadAiClassifier`

---

## 2️⃣ EVOLUTION API - ANÁLISE COMPLETA

### ❌ **PROBLEMA CRÍTICO: CONFIGURAÇÃO IGNORADA**

#### **WhatsAppService** (`backend/src/services/whatsapp.service.ts`)
- ❌ **SÓ USA ENV VARS** - Linhas 69-71
- ❌ **NUNCA LÊ DO BANCO** - Não consulta `IntegrationConfig`
- ❌ **SALVA NO BANCO MAS NÃO USA** - Frontend salva, backend ignora

**Código Problemático:**
```typescript
// ❌ ERRADO - Só lê env vars no construtor
constructor(fastify: FastifyInstance) {
  this.evolutionApiUrl = process.env.EVOLUTION_API_URL || '';
  this.evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
  this.evolutionInstance = process.env.EVOLUTION_INSTANCE || '';
  // ❌ NUNCA BUSCA DO BANCO!
}
```

**Onde deveria buscar:**
- `sendMessage()` - Linha 438
- `sendAudioMessage()` - Linha 334
- `handleWebhook()` - Linha 84

**Impacto:**
- ✅ Frontend salva `evolutionApiUrl`, `evolutionApiKey`, `evolutionInstance` no banco
- ❌ Backend **IGNORA** essas configurações
- ❌ Só funciona se configurar nas env vars do Railway
- ❌ **CONFIGURAÇÃO POR TENANT NÃO FUNCIONA**

### ✅ **O QUE FUNCIONA**

#### **Webhook** (`POST /api/webhooks/whatsapp`)
- ✅ **IMPLEMENTADO** - Linha 18 em `whatsapp.routes.ts`
- ✅ **Validação** - Verifica se Evolution está configurada (mas só env vars)
- ✅ **Processa mensagens** - Chama `WhatsAppService.handleWebhook()`
- ✅ **Integra com AgentService** - Linha 185

#### **Envio de Mensagens** (`POST /api/whatsapp/send`)
- ✅ **IMPLEMENTADO** - Linha 55 em `whatsapp.routes.ts`
- ✅ **Validação** - Verifica campos obrigatórios
- ✅ **Try/catch** - Linha 79
- ⚠️ **Mas só funciona se env vars estiverem configuradas**

**Fluxo Real:**
```
Webhook → WhatsAppService.handleWebhook()
  → processMessage()
    → AgentService.processConversation() ✅ (usa OpenAI do banco)
    → sendMessage() ❌ (usa Evolution só de env vars)
```

---

## 3️⃣ Z-API - ANÁLISE COMPLETA

### ❌ **PROBLEMA CRÍTICO: CONFIGURAÇÃO IGNORADA**

#### **ZApiService** (`backend/src/services/zapi.service.ts`)
- ❌ **SÓ USA ENV VARS** - Linhas 49-51
- ❌ **NUNCA LÊ DO BANCO** - Não consulta `IntegrationConfig`
- ❌ **SALVA NO BANCO MAS NÃO USA** - Frontend salva, backend ignora

**Código Problemático:**
```typescript
// ❌ ERRADO - Só lê env vars no construtor
constructor(fastify: FastifyInstance) {
  this.zapiInstanceId = process.env.ZAPI_INSTANCE_ID || '';
  this.zapiToken = process.env.ZAPI_TOKEN || '';
  this.zapiBaseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io';
  // ❌ NUNCA BUSCA DO BANCO!
}
```

**Onde deveria buscar:**
- `sendMessage()` - Linha 255
- `handleWebhook()` - Linha 71
- `sendAudioMessage()` - Linha 358

**Impacto:**
- ✅ Frontend salva `zapiInstanceId`, `zapiToken`, `zapiBaseUrl` no banco
- ❌ Backend **IGNORA** essas configurações
- ❌ Só funciona se configurar nas env vars do Railway
- ❌ **CONFIGURAÇÃO POR TENANT NÃO FUNCIONA**

### ✅ **O QUE FUNCIONA**

#### **Webhook** (`POST /api/webhooks/zapi`)
- ✅ **IMPLEMENTADO** - Linha 18 em `zapi.routes.ts`
- ✅ **Validação** - Verifica se Z-API está configurada (mas só env vars)
- ✅ **Processa mensagens** - Chama `ZApiService.handleWebhook()`
- ✅ **Integra com AgentService** - Linha 195
- ✅ **Cria/atualiza leads** - Linha 163
- ✅ **Salva mensagens** - Linha 186

#### **Envio de Mensagens** (`POST /api/zapi/send`)
- ✅ **IMPLEMENTADO** - Linha 55 em `zapi.routes.ts`
- ✅ **Validação** - Verifica campos obrigatórios
- ✅ **Try/catch** - Linha 83
- ⚠️ **Mas só funciona se env vars estiverem configuradas**

#### **Teste de Conexão** (`POST /api/zapi/test-connection`)
- ✅ **IMPLEMENTADO** - Linha 108 em `zapi.routes.ts`
- ✅ **Valida credenciais** - Testa contra API real
- ✅ **Tratamento de erros** - Linhas 179-216
- ⚠️ **Mas usa credenciais do body ou env vars, não do banco**

**Fluxo Real:**
```
Webhook → ZApiService.handleWebhook()
  → processMessage()
    → AgentService.processConversation() ✅ (usa OpenAI do banco)
    → sendMessage() ❌ (usa Z-API só de env vars)
```

---

## 4️⃣ FRONTEND - ANÁLISE COMPLETA

### ✅ **O QUE FUNCIONA**

#### **Salvamento de Configurações** (`IntegrationsSettings.tsx`)
- ✅ **Salva no banco** - `PATCH /api/integrations` (linha 285)
- ✅ **Carrega do banco** - `GET /api/integrations` (linha 113)
- ✅ **Validação de autenticação** - Linhas 99-108
- ✅ **Tratamento de erros** - Linhas 149-170
- ✅ **Indicadores visuais** - Badge "Conectado" quando chave existe

#### **Teste de Conexão**
- ✅ **OpenAI** - Testa diretamente `https://api.openai.com/v1/models` (linha 381)
- ✅ **Z-API** - Usa endpoint `/api/zapi/test-connection` (linha 437)
- ⚠️ **Evolution API** - Não tem teste implementado no frontend

### ❌ **PROBLEMAS**

#### **Configurações Salvas Mas Não Usadas**
- ❌ **Evolution API** - Frontend salva, backend ignora
- ❌ **Z-API** - Frontend salva, backend ignora
- ✅ **OpenAI** - Frontend salva, backend usa (só no AgentService)

#### **localStorage Temporário**
- ⚠️ **Gambiarra** - Usa `localStorage` para manter chaves temporariamente
- ⚠️ **Não é necessário** - Deveria só mostrar indicador visual
- ⚠️ **Pode causar confusão** - Chave no localStorage vs banco

---

## 5️⃣ BACKEND - ROTAS E SERVIÇOS REAIS

### ✅ **ROTAS FUNCIONAIS**

#### **Autenticação**
- ✅ `POST /login` - Funciona
- ✅ `POST /register` - Funciona
- ✅ `GET /me` - Funciona
- ✅ Middleware `authenticate` - Funciona, valida JWT

#### **Integrações**
- ✅ `GET /api/integrations` - **FUNCIONA** - Retorna configurações do banco
- ✅ `PATCH /api/integrations` - **FUNCIONA** - Salva no banco
- ✅ `GET /api/integrations/verify` - **FUNCIONA** - Verifica status

#### **Agente IA**
- ✅ `POST /api/agent/conversation` - **FUNCIONA** - Usa OpenAI do banco
- ⚠️ `POST /api/agent/intake` - **FUNCIONA MAS É MOCK** - Não usa OpenAI real

#### **WhatsApp (Evolution)**
- ✅ `POST /api/webhooks/whatsapp` - **IMPLEMENTADO** - Mas só usa env vars
- ✅ `POST /api/whatsapp/send` - **IMPLEMENTADO** - Mas só usa env vars
- ✅ `GET /api/whatsapp/health` - **IMPLEMENTADO** - Verifica env vars

#### **Z-API**
- ✅ `POST /api/webhooks/zapi` - **IMPLEMENTADO** - Mas só usa env vars
- ✅ `POST /api/zapi/send` - **IMPLEMENTADO** - Mas só usa env vars
- ✅ `GET /api/zapi/health` - **IMPLEMENTADO** - Verifica env vars
- ✅ `POST /api/zapi/test-connection` - **IMPLEMENTADO** - Testa credenciais

#### **Configurações**
- ✅ `GET /api/agent/config` - **FUNCIONA** - Retorna do banco
- ✅ `PATCH /api/agent/config` - **FUNCIONA** - Salva no banco
- ✅ `GET /api/voice/config` - **FUNCIONA** - Retorna do banco
- ✅ `POST /api/voice/config` - **FUNCIONA** - Salva no banco

#### **Leads**
- ✅ `POST /leads` - **FUNCIONA** - Webhook universal
- ✅ `GET /api/leads` - **FUNCIONA** - Lista leads do tenant

#### **Conversas**
- ✅ `GET /api/conversations` - **FUNCIONA**
- ✅ `POST /api/conversations/:id/messages` - **FUNCIONA**

#### **Admin**
- ✅ `POST /api/admin/save-openai-key` - **FUNCIONA** - Endpoint temporário

### ❌ **ROTAS QUE NÃO EXISTEM OU NÃO FUNCIONAM**

- ❌ **Nenhuma rota para ler Evolution/Z-API do banco** - Serviços não implementam isso
- ❌ **Nenhuma rota para atualizar credenciais em runtime** - Precisa reiniciar backend

---

## 6️⃣ BANCO DE DADOS - ANÁLISE COMPLETA

### ✅ **TABELAS EXISTENTES**

#### **IntegrationConfig**
```prisma
model IntegrationConfig {
  tenantId String @unique
  openaiApiKey String?        // ✅ USADO (só AgentService)
  evolutionApiUrl String?      // ❌ SALVO MAS NÃO USADO
  evolutionApiKey String?      // ❌ SALVO MAS NÃO USADO
  evolutionInstance String?    // ❌ SALVO MAS NÃO USADO
  zapiInstanceId String?       // ❌ SALVO MAS NÃO USADO
  zapiToken String?            // ❌ SALVO MAS NÃO USADO
  zapiBaseUrl String?          // ❌ SALVO MAS NÃO USADO
}
```

**Status:**
- ✅ **Persistência funciona** - Dados são salvos
- ❌ **Leitura parcial** - Só OpenAI é lido
- ❌ **Evolution/Z-API ignorados** - Serviços não consultam

#### **AgentConfig**
- ✅ **FUNCIONAL** - Usado pelo frontend
- ✅ **Persistência funciona**

#### **VoiceConfig**
- ✅ **FUNCIONAL** - Usado para ElevenLabs
- ✅ **Persistência funciona**

---

## 7️⃣ LOGS E ERROS SILENCIOSOS

### ✅ **LOGS IMPLEMENTADOS**

#### **AgentService**
- ✅ `fastify.log.info` - Quando encontra chave no banco (linha 119)
- ✅ `fastify.log.warn` - Quando tabela não existe (linha 125)
- ✅ `fastify.log.error` - Erros ao processar conversa (linha 76)

#### **WhatsAppService**
- ✅ `fastify.log.info` - Webhook recebido (linha 86)
- ✅ `fastify.log.warn` - Evolution não configurada (linha 77)
- ✅ `fastify.log.error` - Erros ao processar (linha 163)

#### **ZApiService**
- ✅ `fastify.log.info` - Webhook recebido (linha 73)
- ✅ `fastify.log.warn` - Z-API não configurada (linha 57)
- ✅ `fastify.log.error` - Erros ao processar (linha 100)

### ❌ **ERROS SILENCIOSOS**

#### **leadAiClassifier**
- ❌ **Sem try/catch** - Se OpenAI falhar, explode
- ❌ **Sem fallback** - Não tenta buscar do banco
- ⚠️ **Erro capturado em `classifyLead()`** - Mas só loga warning

#### **Promises sem await**
- ✅ **Não encontrado** - Todas as promises têm await

#### **Erros não logados**
- ⚠️ **leadAiClassifier** - Erro pode ser silencioso se `classifyLead()` capturar

---

## 8️⃣ FLUXOGRAMA REAL DO SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                       │
│  IntegrationsSettings.tsx                                   │
│  ✅ Salva OpenAI → Banco                                    │
│  ✅ Salva Evolution → Banco (MAS BACKEND IGNORA)            │
│  ✅ Salva Z-API → Banco (MAS BACKEND IGNORA)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │ PATCH /api/integrations
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Railway)                        │
│  integrations.routes.ts                                     │
│  ✅ Salva no IntegrationConfig (banco)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (PostgreSQL)                    │
│  IntegrationConfig                                          │
│  ✅ openaiApiKey → SALVO E USADO                            │
│  ❌ evolutionApiKey → SALVO MAS IGNORADO                    │
│  ❌ zapiToken → SALVO MAS IGNORADO                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE MENSAGEM WHATSAPP                     │
└─────────────────────────────────────────────────────────────┘

Z-API/Evolution → Webhook → Backend
                      │
                      ▼
            ┌─────────────────┐
            │  ZApiService /   │
            │ WhatsAppService  │
            │                  │
            │ ❌ Lê só ENV VARS│
            │ ❌ IGNORA BANCO  │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  AgentService    │
            │                  │
            │ ✅ Lê OpenAI do  │
            │    banco (tenant)│
            │ ✅ Fallback env  │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │   OpenAI API     │
            │   (gpt-4o-mini) │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Resposta IA     │
            └────────┬─────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  ZApiService /   │
            │ WhatsAppService  │
            │                  │
            │ ❌ Envia usando  │
            │    só ENV VARS   │
            └──────────────────┘
```

---

## 9️⃣ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 🔴 **CRÍTICO 1: Evolution API Ignora Banco**
**Arquivo:** `backend/src/services/whatsapp.service.ts`  
**Linhas:** 69-71  
**Problema:** Construtor só lê env vars, nunca consulta banco  
**Impacto:** Configurações salvas no frontend são **INÚTEIS**  
**Solução:** Implementar método `getEvolutionConfig(tenantId)` similar ao `getOpenAIApiKey()`

### 🔴 **CRÍTICO 2: Z-API Ignora Banco**
**Arquivo:** `backend/src/services/zapi.service.ts`  
**Linhas:** 49-51  
**Problema:** Construtor só lê env vars, nunca consulta banco  
**Impacto:** Configurações salvas no frontend são **INÚTEIS**  
**Solução:** Implementar método `getZApiConfig(tenantId)` similar ao `getOpenAIApiKey()`

### 🔴 **CRÍTICO 3: leadAiClassifier Ignora Banco**
**Arquivo:** `backend/src/services/leadAiClassifier.ts`  
**Linhas:** 24-26  
**Problema:** Só usa `process.env.OPENAI_API_KEY`  
**Impacto:** Inconsistência com `AgentService`  
**Solução:** Refatorar para usar mesmo método `getOpenAIApiKey()` ou criar função compartilhada

### 🟡 **MÉDIO 1: Configuração Por Tenant Incompleta**
**Problema:** Só OpenAI funciona por tenant, Evolution/Z-API são globais  
**Impacto:** Multi-tenancy não funciona completamente  
**Solução:** Implementar leitura do banco em todos os serviços

### 🟡 **MÉDIO 2: Endpoint /api/agent/intake é Mock**
**Arquivo:** `backend/src/api/agent/intake.ts`  
**Linha:** 6 (TODO comentado)  
**Problema:** Função `analyzeLead()` é mock, não usa OpenAI  
**Impacto:** Análise de leads não usa IA real  
**Solução:** Integrar com `classifyLead()` que usa OpenAI

### 🟡 **MÉDIO 3: localStorage Temporário no Frontend**
**Arquivo:** `src/components/settings/IntegrationsSettings.tsx`  
**Problema:** Usa `localStorage` para manter chaves temporariamente  
**Impacto:** Confusão entre localStorage e banco  
**Solução:** Remover localStorage, só usar indicador visual

---

## 🔟 RISCOS ARQUITETURAIS

### 🔴 **RISCO 1: Inconsistência de Configuração**
**Descrição:** Diferentes serviços usam diferentes fontes de configuração  
**Impacto:** Comportamento imprevisível, difícil debug  
**Probabilidade:** Alta  
**Severidade:** Alta

### 🔴 **RISCO 2: Configuração Por Tenant Quebrada**
**Descrição:** Frontend permite configurar por tenant, mas backend ignora  
**Impacto:** Clientes não podem ter configurações próprias  
**Probabilidade:** Alta  
**Severidade:** Média

### 🟡 **RISCO 3: Dependência de Env Vars**
**Descrição:** Evolution e Z-API só funcionam com env vars  
**Impacto:** Não é possível configurar via UI  
**Probabilidade:** Alta  
**Severidade:** Média

### 🟡 **RISCO 4: Erros Silenciosos**
**Descrição:** `leadAiClassifier` pode falhar silenciosamente  
**Impacto:** Classificação de leads pode não funcionar  
**Probabilidade:** Média  
**Severidade:** Média

---

## 1️⃣1️⃣ CHECKLIST DE FUNCIONALIDADES

### ✅ **FUNCIONA DE VERDADE**
- [x] Frontend salva OpenAI no banco
- [x] AgentService lê OpenAI do banco
- [x] AgentService usa OpenAI para conversas
- [x] Webhooks Z-API recebem mensagens
- [x] Webhooks Evolution recebem mensagens
- [x] Agente IA responde mensagens
- [x] Leads são criados/atualizados
- [x] Mensagens são salvas no banco

### ❌ **NÃO FUNCIONA / SÓ VISUAL**
- [ ] Evolution API usa configuração do banco
- [ ] Z-API usa configuração do banco
- [ ] leadAiClassifier usa configuração do banco
- [ ] Configuração por tenant para Evolution
- [ ] Configuração por tenant para Z-API
- [ ] Endpoint /api/agent/intake usa OpenAI real

---

## 1️⃣2️⃣ RECOMENDAÇÕES PRIORITÁRIAS

### 🔴 **PRIORIDADE 1: CORRIGIR EVOLUTION API**
**Ação:** Modificar `WhatsAppService` para ler do banco  
**Arquivo:** `backend/src/services/whatsapp.service.ts`  
**Mudança:** Adicionar método `getEvolutionConfig(tenantId)` e usar em `sendMessage()`, `sendAudioMessage()`

### 🔴 **PRIORIDADE 2: CORRIGIR Z-API**
**Ação:** Modificar `ZApiService` para ler do banco  
**Arquivo:** `backend/src/services/zapi.service.ts`  
**Mudança:** Adicionar método `getZApiConfig(tenantId)` e usar em `sendMessage()`, `handleWebhook()`

### 🔴 **PRIORIDADE 3: CORRIGIR leadAiClassifier**
**Ação:** Refatorar para usar configuração do banco  
**Arquivo:** `backend/src/services/leadAiClassifier.ts`  
**Mudança:** Criar função compartilhada ou usar `AgentService.getOpenAIApiKey()`

### 🟡 **PRIORIDADE 4: REMOVER localStorage TEMPORÁRIO**
**Ação:** Limpar código do frontend  
**Arquivo:** `src/components/settings/IntegrationsSettings.tsx`  
**Mudança:** Remover lógica de localStorage, manter só indicador visual

### 🟡 **PRIORIDADE 5: IMPLEMENTAR /api/agent/intake COM IA**
**Ação:** Substituir mock por OpenAI real  
**Arquivo:** `backend/src/api/agent/intake.ts`  
**Mudança:** Usar `classifyLead()` em vez de `analyzeLead()` mock

---

## 1️⃣3️⃣ CONCLUSÃO

### ✅ **PONTOS FORTES**
1. **OpenAI (AgentService)** está bem implementado
2. **Webhooks funcionam** (mas dependem de env vars)
3. **Frontend salva tudo** corretamente
4. **Banco de dados** está estruturado corretamente
5. **Tratamento de erros** está presente na maioria dos lugares

### ❌ **PONTOS FRACOS CRÍTICOS**
1. **Evolution API e Z-API ignoram banco** - Configurações salvas são inúteis
2. **Inconsistência** entre diferentes serviços
3. **Configuração por tenant não funciona** para Evolution/Z-API
4. **leadAiClassifier** não usa banco

### 🎯 **AÇÃO IMEDIATA NECESSÁRIA**
**Implementar leitura do banco em `WhatsAppService` e `ZApiService`** para que as configurações salvas no frontend sejam realmente usadas.

---

**FIM DO DIAGNÓSTICO**
