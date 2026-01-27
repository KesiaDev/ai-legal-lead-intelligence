# 🔍 AUDITORIA COMPLETA DO BACKEND NO RAILWAY (SDR JURÍDICO)

## 📋 OBJETIVO
Mapear completamente como o backend do SDR Jurídico está configurado, identificar inconsistências e possíveis causas de dados incorretos sendo salvos.

**Data da Auditoria:** 2026-01-27  
**Escopo:** Apenas diagnóstico - NÃO foram feitas correções

---

## 1️⃣ MAPEAR O BACKEND ESPERADO PELO CÓDIGO

### **1.1 Framework e Entrypoint**

**Framework:** Fastify v4.28.1  
**Entrypoint:** `backend/src/server.ts`  
**Tipo:** TypeScript (CommonJS)  
**Runtime:** Node.js >=18

### **1.2 Script de Start em Produção**

**Arquivo:** `backend/package.json`  
**Script `start`:** 
```json
"start": "prisma migrate deploy && prisma generate && tsx src/server.ts"
```

**Ordem de Execução:**
1. `prisma migrate deploy` - Aplica migrations pendentes
2. `prisma generate` - Regenera Prisma Client
3. `tsx src/server.ts` - Inicia servidor TypeScript

**Comando Real que Sobe o Servidor:**
- Em produção: `npm start` → executa script acima
- Em desenvolvimento: `npm run dev` → `tsx watch src/server.ts`

### **1.3 Porta Esperada**

**Código:** `backend/src/server.ts:1628`
```typescript
const PORT = Number(process.env.PORT) || 3001;
```

**Porta Padrão:** `3001`  
**Porta Configurável:** Via variável `PORT`  
**Host:** `0.0.0.0` (aceita conexões de qualquer IP)

### **1.4 Estrutura do Servidor**

**Inicialização:**
- Fastify com logger habilitado
- CORS configurado (origin: true, credentials: true)
- JWT configurado (secret: `env.JWT_SECRET`)
- WebSocket habilitado
- Prisma Client conectado

**Rotas Registradas:**
- `/health` - Health check
- `/login` - Autenticação
- `/register` - Registro de usuário
- `/api/integrations` - Configurações de integração
- `/api/agent/config` - Configurações do agente
- `/api/voice/config` - Configurações de voz
- `/api/webhooks/zapi` - Webhook Z-API
- `/api/webhooks/whatsapp` - Webhook Evolution API
- `/api/pipelines` - Gestão de pipelines
- `/api/crm` - Integrações CRM
- E outras...

---

## 2️⃣ MAPEAR VARIÁVEIS DE AMBIENTE USADAS PELO BACKEND

### **2.1 Variáveis Obrigatórias (Validadas por Zod)**

**Arquivo:** `backend/src/config/env.ts`

| Variável | Tipo | Validação | Fallback | Obrigatória |
|----------|------|-----------|----------|-------------|
| `DATABASE_URL` | string (URL) | `z.string().url()` | ❌ Nenhum | ✅ **SIM** |
| `JWT_SECRET` | string | `z.string().min(32)` | ❌ Nenhum | ✅ **SIM** |
| `JWT_EXPIRES_IN` | string | `z.string()` | `'7d'` | ⚠️ Opcional |
| `PORT` | number | `z.coerce.number()` | `3001` | ⚠️ Opcional |
| `NODE_ENV` | enum | `'development'\|'production'\|'test'` | `'development'` | ⚠️ Opcional |
| `CORS_ORIGIN` | string | `z.string()` | `'http://localhost:5173'` | ⚠️ Opcional |
| `OPENAI_API_KEY` | string | `z.string().optional()` | `undefined` | ❌ Não |

### **2.2 Variáveis Opcionais (Usadas Diretamente com `process.env.*`)**

**Z-API:**
- `ZAPI_INSTANCE_ID` - Usado em: `zapi.service.ts:49`, `zapi.routes.ts:98,117`
- `ZAPI_TOKEN` - Usado em: `zapi.service.ts:50`, `zapi.routes.ts:99,118`
- `ZAPI_BASE_URL` - Usado em: `zapi.service.ts:51`, `zapi.routes.ts:100,119`  
  - **Fallback:** `'https://api.z-api.io'`

**Evolution API:**
- `EVOLUTION_API_URL` - Usado em: `whatsapp.service.ts:69`, `whatsapp.routes.ts:94`
- `EVOLUTION_API_KEY` - Usado em: `whatsapp.service.ts:70`, `whatsapp.routes.ts:95`
- `EVOLUTION_INSTANCE` - Usado em: `whatsapp.service.ts:71`, `whatsapp.routes.ts:96`  
  - **Fallback:** `''` (string vazia)

**OpenAI:**
- `OPENAI_API_KEY` - Usado em: `agent.service.ts:44,92,133`, `leadClassifier.ts:29`, `leadAiClassifier.ts:24`  
  - **Fallback:** `null` (não configurado)
- `OPENAI_MODEL` - Usado em: `agent.service.ts:169`  
  - **Fallback:** `'gpt-4o-mini'`

### **2.3 Variáveis de Ambiente NÃO Usadas**

**Não encontradas referências a:**
- `RAILWAY_*` (nenhuma dependência específica do Railway)
- `TENANT_*`
- `CLIENT_ID`
- `INSTANCE_*` (exceto `EVOLUTION_INSTANCE` e `ZAPI_INSTANCE_ID`)

### **2.4 Fallbacks Perigosos Identificados**

**⚠️ RISCO ALTO:**
1. **`ZAPI_INSTANCE_ID` e `ZAPI_TOKEN` com fallback vazio:**
   - `process.env.ZAPI_INSTANCE_ID || ''` 
   - Se não configurado, usa string vazia (não `null`)
   - Pode causar erros silenciosos

2. **`EVOLUTION_INSTANCE` com fallback vazio:**
   - `process.env.EVOLUTION_INSTANCE || ''`
   - Se não configurado, usa string vazia

**✅ SEGURO:**
- `OPENAI_API_KEY` - Fallback `null` (verificado antes de usar)
- `PORT` - Fallback `3001` (valor padrão seguro)

---

## 3️⃣ MAPEAR DEPENDÊNCIA COM O RAILWAY

### **3.1 Lógica Dependente de Railway**

**❌ NENHUMA DEPENDÊNCIA ESPECÍFICA DO RAILWAY ENCONTRADA**

- Não há referências a `process.env.RAILWAY_*`
- Não há lógica condicional baseada em `RAILWAY_ENVIRONMENT`
- Não há detecção automática de ambiente Railway

### **3.2 Seed Automático Condicionado a Ambiente**

**❌ NENHUM SEED AUTOMÁTICO ENCONTRADO**

- Script `db:seed` existe em `package.json` mas não é executado automaticamente
- Não há seed condicionado a `NODE_ENV`
- Não há criação automática de dados iniciais

### **3.3 Diferenças Entre Dev e Prod**

**Únicas Diferenças Identificadas:**

1. **Prisma Logs:**
   - Dev: `['query', 'error', 'warn']`
   - Prod: `['error']`
   - Arquivo: `backend/src/config/database.ts:4`

2. **Stack Trace em Erros:**
   - Dev: Stack trace exposto em erros 500
   - Prod: Stack trace oculto
   - Arquivo: `backend/src/api/integrations.routes.ts:323`

3. **CORS Origin:**
   - Dev: `'http://localhost:5173'` (fallback)
   - Prod: Deve ser configurado via `CORS_ORIGIN` ou aceita qualquer origem (`origin: true`)

---

## 4️⃣ MAPEAR CONFIGURAÇÃO DO BANCO

### **4.1 Schema Prisma em Uso**

**Arquivo:** `backend/prisma/schema.prisma`  
**Provider:** PostgreSQL  
**URL:** Via `DATABASE_URL` (obrigatória)

### **4.2 DATABASE_URL Esperado**

**Formato Esperado:**
```
postgresql://user:password@host:port/database
```

**Exemplo Railway:**
```
postgresql://postgres:password@postgres.railway.internal:5432/railway
```

**Validação:** URL válida (validação Zod)

### **4.3 Possibilidade de Múltiplos Bancos**

**❌ NÃO HÁ SUPORTE A MÚLTIPLOS BANCOS**

- Apenas uma `DATABASE_URL` é usada
- Não há lógica para staging vs produção
- Não há detecção de ambiente para escolher banco

### **4.4 Criação Automática de Registros**

**✅ AUTO-CREATE IMPLEMENTADO:**

**Arquivo:** `backend/src/api/integrations.routes.ts`

**GET `/api/integrations`:**
- Se `IntegrationConfig` não existe para `tenantId`, cria automaticamente com todos campos `null`
- **Campos criados:** `openaiApiKey: null`, `n8nWebhookUrl: null`, `evolutionApiUrl: null`, `evolutionApiKey: null`, `evolutionInstance: null`, `zapiInstanceId: null`, `zapiToken: null`, `zapiBaseUrl: 'https://api.z-api.io'`

**PATCH `/api/integrations`:**
- Se `IntegrationConfig` não existe, cria antes de atualizar
- Mesmos valores padrão acima

**⚠️ PONTO DE ATENÇÃO:**
- Auto-create usa apenas `tenantId` do JWT
- Não há validação se `tenantId` é válido antes de criar
- Não há verificação se dados do usuário estão sendo usados incorretamente

---

## 5️⃣ MAPEAR FLUXO DE CRIAÇÃO / UPDATE DE IntegrationConfig

### **5.1 Fluxo Completo: Frontend → API → Controller → Prisma**

```
1. Frontend (IntegrationsSettings.tsx)
   └─> Usuário preenche campos (zapiInstanceId, zapiToken, etc.)
   └─> handleSubmit() ou handleAutoSave()
   └─> api.patch('/api/integrations', payload)
   └─> Payload: { zapiInstanceId: string, zapiToken: string, ... }

2. API Client (src/api/client.ts)
   └─> Axios interceptor adiciona: Authorization: Bearer {token}
   └─> Request para: {VITE_API_URL}/api/integrations
   └─> Método: PATCH
   └─> Body: payload do frontend

3. Backend Route (backend/src/api/integrations.routes.ts)
   └─> Middleware: authenticate (valida JWT)
   └─> Extrai: request.user.tenantId do JWT
   └─> Valida: tenantId existe (retorna 401 se não)
   └─> Recebe: request.body (payload do frontend)
   └─> Verifica: IntegrationConfig existe para tenantId
   └─> Se não existe: Cria com valores null
   └─> Atualiza: updateData com campos do body
   └─> Persiste: prisma.integrationConfig.update()

4. Prisma Client
   └─> Executa: UPDATE "IntegrationConfig" SET ... WHERE "tenantId" = ?
   └─> Retorna: config atualizado
```

### **5.2 Onde o Body Entra**

**Arquivo:** `backend/src/api/integrations.routes.ts:140-149`

```typescript
const body = request.body as {
  openaiApiKey?: string;
  n8nWebhookUrl?: string;
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  evolutionInstance?: string;
  zapiInstanceId?: string;
  zapiToken?: string;
  zapiBaseUrl?: string;
};
```

**Validação:** Apenas TypeScript (sem validação runtime)

### **5.3 Onde Pode Ser Alterado**

**Pontos de Transformação:**

1. **Frontend → API:**
   - `IntegrationsSettings.tsx:121-148` - Tratamento de strings vazias
   - Strings vazias são convertidas para `null`
   - `trim()` é aplicado antes de enviar

2. **API → Prisma:**
   - `integrations.routes.ts:215-246` - Tratamento de valores
   - Strings vazias → `null`
   - `undefined` → campo não atualizado
   - Valores válidos → salvos diretamente

### **5.4 Onde É Persistido**

**Arquivo:** `backend/src/api/integrations.routes.ts:248-251`

```typescript
const config = await fastify.prisma.integrationConfig.update({
  where: { tenantId },
  data: updateData,
});
```

**Constraint:** `tenantId` é único (garante um registro por tenant)

### **5.5 Verificação de Valores Default Incorretos**

**✅ NÃO ENCONTRADOS VALORES DEFAULT INCORRETOS**

- Auto-create usa `null` para todos os campos (correto)
- Não há fallback para `user.email` ou outros dados do usuário
- Não há uso de variáveis de ambiente como default para campos do banco

**⚠️ EXCEÇÃO:**
- `zapiBaseUrl` tem default `'https://api.z-api.io'` (correto, é URL padrão)

---

## 6️⃣ MAPEAR AUTENTICAÇÃO E CONTEXTO DO USUÁRIO

### **6.1 Como o JWT É Criado**

**Arquivo:** `backend/src/server.ts:212-215`

```typescript
const token = fastify.jwt.sign({
  id: user.id,
  tenantId: user.tenantId,
});
```

**Campos no Token:**
- `id`: ID do usuário (UUID)
- `tenantId`: ID do tenant (UUID)
- `iat`: Timestamp de criação (automático)
- `exp`: Timestamp de expiração (automático, baseado em `JWT_EXPIRES_IN`)

**⚠️ IMPORTANTE:**
- Token NÃO contém `email`
- Token NÃO contém outros dados do usuário
- Apenas `id` e `tenantId` são incluídos

### **6.2 Como request.user É Montado**

**Arquivo:** `backend/src/middleware/auth.ts:29-72`

**Fluxo:**
1. Extrai token do header: `Authorization: Bearer {token}`
2. Verifica token: `fastify.jwt.verify(token)`
3. Valida `tenantId` existe no token (retorna 401 se não)
4. Monta `request.user`:
   ```typescript
   request.user = {
     id: decoded.id,
     tenantId: decoded.tenantId,
   };
   ```

**⚠️ VALIDAÇÃO CRÍTICA:**
- Se `decoded.tenantId` não existe, retorna 401
- Isso previne chamadas Prisma com `tenantId` undefined

### **6.3 Verificação de Reutilização de Dados do Usuário**

**✅ NÃO ENCONTRADO USO DE DADOS DO USUÁRIO EM IntegrationConfig**

- `request.user` contém apenas `id` e `tenantId`
- Não há acesso a `user.email` no middleware
- Não há fallback para `user.email` em campos de integração
- Todos os campos de `IntegrationConfig` vêm do `request.body` (frontend)

**⚠️ PONTO DE ATENÇÃO:**
- Se o frontend enviar dados incorretos no `body`, eles serão salvos
- Não há validação de formato (ex: `zapiInstanceId` deve ser UUID, não email)

---

## 7️⃣ VERIFICAR POSSÍVEIS SOBRESCRITAS VIA ENV

### **7.1 Campos de IntegrationConfig Podem Ser Sobrescritos por ENV?**

**❌ NÃO - CAMPOS DO BANCO NÃO SÃO SOBRESCRITOS POR ENV**

**Análise:**

1. **Z-API:**
   - `ZAPI_INSTANCE_ID` (env) vs `zapiInstanceId` (banco) - **SÃO DIFERENTES**
   - `ZApiService` usa `process.env.ZAPI_INSTANCE_ID` (não lê do banco)
   - `IntegrationConfig.zapiInstanceId` é salvo no banco mas **NÃO é usado pelo serviço**
   - **RISCO:** Dados salvos no banco podem não ser usados pelo serviço

2. **Evolution API:**
   - `EVOLUTION_INSTANCE` (env) vs `evolutionInstance` (banco) - **SÃO DIFERENTES**
   - `WhatsAppService` usa `process.env.EVOLUTION_INSTANCE` (não lê do banco)
   - `IntegrationConfig.evolutionInstance` é salvo no banco mas **NÃO é usado pelo serviço**

3. **OpenAI:**
   - `OPENAI_API_KEY` (env) vs `openaiApiKey` (banco) - **AMBOS SÃO USADOS**
   - `AgentService.getOpenAIApiKey()` prioriza banco sobre env (correto)
   - Se banco tem valor, usa banco; senão, usa env

### **7.2 Valores Hardcoded**

**✅ NÃO HÁ VALORES HARDCODED PERIGOSOS**

- `zapiBaseUrl` tem default `'https://api.z-api.io'` (correto, é URL oficial)
- Não há emails hardcoded
- Não há IDs hardcoded

### **7.3 Especial Atenção: zapiInstanceId e evolutionInstance**

**⚠️ PROBLEMA IDENTIFICADO:**

**Z-API:**
- Frontend salva `zapiInstanceId` no banco (`IntegrationConfig.zapiInstanceId`)
- Backend **NÃO lê** do banco, usa `process.env.ZAPI_INSTANCE_ID`
- **Resultado:** Dados salvos no banco não são usados pelo serviço

**Evolution API:**
- Frontend salva `evolutionInstance` no banco (`IntegrationConfig.evolutionInstance`)
- Backend **NÃO lê** do banco, usa `process.env.EVOLUTION_INSTANCE`
- **Resultado:** Dados salvos no banco não são usados pelo serviço

**✅ OpenAI (Correto):**
- Frontend salva `openaiApiKey` no banco
- Backend **LÊ** do banco primeiro, depois usa env como fallback
- **Resultado:** Dados salvos no banco são usados

---

## 8️⃣ SAÍDA OBRIGATÓRIA - RELATÓRIO ESTRUTURADO

### **8.1 Backend Esperado vs Backend Real**

**✅ BACKEND ESPERADO (Pelo Código):**
- Framework: Fastify v4.28.1
- Porta: 3001 (ou `PORT` env var)
- Entrypoint: `src/server.ts`
- Start: `prisma migrate deploy && prisma generate && tsx src/server.ts`
- Database: PostgreSQL via `DATABASE_URL`

**❓ BACKEND REAL (Railway):**
- **NÃO PODE SER DETERMINADO SEM ACESSO AO RAILWAY DASHBOARD**
- Requer verificação manual de:
  - Service name
  - Porta configurada
  - Variáveis de ambiente
  - Status do deploy
  - Logs de startup

### **8.2 Lista de Variáveis de Ambiente Esperadas**

**Obrigatórias:**
1. `DATABASE_URL` - URL do PostgreSQL (obrigatória)
2. `JWT_SECRET` - Secret para JWT, mínimo 32 caracteres (obrigatória)

**Opcionais (com fallback):**
3. `JWT_EXPIRES_IN` - Expiração do token (default: `'7d'`)
4. `PORT` - Porta do servidor (default: `3001`)
5. `NODE_ENV` - Ambiente (default: `'development'`)
6. `CORS_ORIGIN` - Origin permitido (default: `'http://localhost:5173'`)

**Opcionais (integrações):**
7. `OPENAI_API_KEY` - Chave OpenAI (fallback: `null`)
8. `OPENAI_MODEL` - Modelo OpenAI (fallback: `'gpt-4o-mini'`)
9. `ZAPI_INSTANCE_ID` - ID da instância Z-API (fallback: `''`)
10. `ZAPI_TOKEN` - Token Z-API (fallback: `''`)
11. `ZAPI_BASE_URL` - URL base Z-API (fallback: `'https://api.z-api.io'`)
12. `EVOLUTION_API_URL` - URL Evolution API (fallback: `''`)
13. `EVOLUTION_API_KEY` - Key Evolution API (fallback: `''`)
14. `EVOLUTION_INSTANCE` - Nome da instância Evolution (fallback: `''`)

### **8.3 Pontos de Risco Identificados**

#### **🔴 RISCO CRÍTICO 1: Desconexão Entre Banco e Serviços**

**Problema:**
- `IntegrationConfig.zapiInstanceId` é salvo no banco
- `ZApiService` usa `process.env.ZAPI_INSTANCE_ID` (não lê do banco)
- Dados salvos no banco **não são usados** pelo serviço

**Impacto:**
- Usuário salva `zapiInstanceId` no frontend
- Dados são salvos no banco corretamente
- Mas o serviço continua usando variável de ambiente
- Pode causar confusão: dados "salvos" mas não "usados"

**Localização:**
- `backend/src/services/zapi.service.ts:49`
- `backend/src/api/integrations.routes.ts:235-237`

#### **🔴 RISCO CRÍTICO 2: Desconexão Evolution API**

**Problema:**
- `IntegrationConfig.evolutionInstance` é salvo no banco
- `WhatsAppService` usa `process.env.EVOLUTION_INSTANCE` (não lê do banco)
- Mesmo problema do Z-API

**Localização:**
- `backend/src/services/whatsapp.service.ts:71`
- `backend/src/api/integrations.routes.ts:231-233`

#### **🟡 RISCO MÉDIO 1: Falta de Validação de Formato**

**Problema:**
- `zapiInstanceId` não tem validação de formato
- Aceita qualquer string (incluindo emails)
- Não valida se é UUID ou formato esperado

**Impacto:**
- Usuário pode salvar email no lugar de ID
- Backend aceita e salva no banco
- Não há validação que impeça isso

**Localização:**
- `backend/src/api/integrations.routes.ts:235-237`

#### **🟡 RISCO MÉDIO 2: Fallbacks Vazios**

**Problema:**
- `ZAPI_INSTANCE_ID` e `ZAPI_TOKEN` têm fallback `''` (string vazia)
- Se não configurado, usa string vazia em vez de `null`
- Pode causar erros silenciosos

**Localização:**
- `backend/src/services/zapi.service.ts:49-50`

#### **🟢 RISCO BAIXO 1: Auto-Create Sem Validação de Tenant**

**Problema:**
- Auto-create de `IntegrationConfig` usa `tenantId` do JWT
- Não valida se `tenantId` existe no banco antes de criar
- Se JWT tiver `tenantId` inválido, cria registro órfão

**Localização:**
- `backend/src/api/integrations.routes.ts:64-76`

### **8.4 Hipóteses Concretas de Onde o Erro Pode Estar Ocorrendo**

#### **HIPÓTESE 1: Email no Lugar de ID (Mais Provável)**

**Cenário:**
1. Usuário preenche campo "Z-API Instance ID" com email (`kesiawnandi@gmail.com`)
2. Frontend envia no `body.zapiInstanceId`
3. Backend aceita e salva no banco
4. **Não há validação de formato**

**Evidência:**
- Imagem mostra `zapiInstanceId: "kesiawnandi@gmail.com"` no frontend
- Código não valida formato de `zapiInstanceId`
- Aceita qualquer string

**Localização do Problema:**
- `backend/src/api/integrations.routes.ts:235-237` - Não valida formato
- `src/components/settings/IntegrationsSettings.tsx:647` - Input aceita qualquer valor

#### **HIPÓTESE 2: Variável de Ambiente Sobrescrevendo (Improvável)**

**Cenário:**
1. Variável `ZAPI_INSTANCE_ID` no Railway tem valor incorreto (email)
2. Serviço `ZApiService` usa variável de ambiente
3. Dados salvos no banco são ignorados

**Evidência:**
- `ZApiService` não lê do banco, apenas de env
- Se env tiver valor incorreto, serviço usa valor incorreto

**Localização do Problema:**
- `backend/src/services/zapi.service.ts:49` - Usa `process.env.ZAPI_INSTANCE_ID`

#### **HIPÓTESE 3: Frontend Enviando Dados Incorretos**

**Cenário:**
1. Frontend tem lógica que preenche campos automaticamente
2. Usa dados do usuário (email) como fallback
3. Envia dados incorretos no payload

**Evidência:**
- **NÃO ENCONTRADA** - Frontend não usa `user.email` para preencher campos
- Frontend apenas envia o que usuário digita

**Localização Verificada:**
- `src/components/settings/IntegrationsSettings.tsx` - Não usa `user.email`

#### **HIPÓTESE 4: Cache ou Dados Antigos**

**Cenário:**
1. Dados antigos no banco (de testes anteriores)
2. Frontend carrega dados antigos
3. Usuário não percebe e salva novamente

**Evidência:**
- Frontend carrega do backend no `useEffect`
- Se backend retornar dados antigos, frontend mostra

**Localização:**
- `src/components/settings/IntegrationsSettings.tsx:84-142` - Carrega do backend

---

## 📊 RESUMO EXECUTIVO

### **✅ O Que Está Correto:**

1. **Autenticação:** JWT contém apenas `id` e `tenantId` (não email)
2. **Auto-Create:** Cria `IntegrationConfig` com valores `null` (correto)
3. **OpenAI:** Prioriza banco sobre env (correto)
4. **Validação de TenantId:** Middleware valida antes de qualquer operação
5. **Tratamento de Erros:** Logs detalhados e mensagens claras

### **⚠️ O Que Precisa Atenção:**

1. **Z-API e Evolution:** Dados salvos no banco não são usados pelos serviços
2. **Validação de Formato:** Campos não validam formato (aceitam emails como IDs)
3. **Fallbacks Vazios:** Variáveis env com fallback `''` em vez de `null`

### **🔴 Problemas Críticos Identificados:**

1. **Desconexão Banco ↔ Serviços:**
   - `IntegrationConfig.zapiInstanceId` salvo mas não usado
   - `IntegrationConfig.evolutionInstance` salvo mas não usado
   - Serviços usam apenas variáveis de ambiente

2. **Falta de Validação:**
   - `zapiInstanceId` aceita qualquer string (incluindo emails)
   - `evolutionInstance` aceita qualquer string
   - Não há validação de formato antes de salvar

### **🎯 Hipótese Mais Provável:**

**Email sendo salvo no lugar de ID porque:**
1. Usuário digita email no campo "Z-API Instance ID"
2. Frontend envia no payload
3. Backend aceita sem validação
4. Dados são salvos no banco
5. **Mas serviço não usa dados do banco** (usa env var)

**Solução Sugerida (para implementação futura):**
1. Adicionar validação de formato em `zapiInstanceId` e `evolutionInstance`
2. Fazer serviços lerem do banco em vez de apenas env vars
3. Ou remover campos do banco se não serão usados

---

## 📝 Limitações da Auditoria

**Não Pode Ser Determinado Sem Acesso ao Railway Dashboard:**

1. ✅ Variáveis de ambiente realmente configuradas
2. ✅ Valores das variáveis (especialmente `ZAPI_INSTANCE_ID`)
3. ✅ Service name e configuração
4. ✅ Status de migrations aplicadas
5. ✅ Logs de runtime
6. ✅ Dados reais salvos no banco

**Requer Verificação Manual:**
- Railway Dashboard → Backend Service → Variables
- Railway Dashboard → Backend Service → Logs
- Railway Dashboard → Postgres → Query (verificar dados salvos)

---

**Status:** ✅ Auditoria completa - Diagnóstico finalizado  
**Próximo Passo:** Verificar dados reais no Railway e implementar correções baseadas nas hipóteses
