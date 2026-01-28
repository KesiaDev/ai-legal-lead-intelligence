# 🔧 CORREÇÃO: ESTADO INCONSISTENTE DE MIGRATIONS PRISMA (RAILWAY)

**Data:** 2026-01-27  
**Status:** 🔴 **CRÍTICO - Executar imediatamente**

---

## 📋 CONTEXTO CONFIRMADO

- ✅ Banco PostgreSQL no Railway contém tabelas parciais
- ❌ `_prisma_migrations` está vazia
- ❌ Prisma retorna "No pending migrations to apply"
- ❌ Tabelas `Pipeline` e `Deal` não existem
- ✅ Causa raiz identificada: banco criado/modificado fora do Prisma

---

## ✅ ETAPA 1: IDENTIFICAR MIGRATIONS NÃO APLICADAS

### **Migrations Encontradas no Diretório:**

1. `20260116170000_init_super_sdr_juridico` - Migration inicial
2. `20250120000000_add_pipelines_and_deals` - **CRÍTICA - NÃO APLICADA**
3. `20250123000000_add_agent_prompts` - AgentPrompt
4. `20250123000001_add_voice_config` - VoiceConfig
5. `20250124000000_add_integration_config` - IntegrationConfig
6. `20250125000000_add_agent_config` - AgentConfig

### **Migration Crítica Identificada:**

**`20250120000000_add_pipelines_and_deals`**

**Tabelas que esta migration cria:**
- ✅ `Pipeline` - **NÃO EXISTE no banco**
- ✅ `PipelineStage` - **NÃO EXISTE no banco**
- ✅ `Deal` - **NÃO EXISTE no banco**
- ✅ `CrmIntegration` - **NÃO EXISTE no banco**
- ✅ Modifica `PipelineHistory` (adiciona colunas)

**Confirmação:**
- ✅ Migration existe em `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- ❌ Tabelas não existem no banco
- ❌ Migration não está registrada em `_prisma_migrations`

---

## ✅ ETAPA 2: EXTRAIR SQL DA MIGRATION

### **Arquivo:**
`backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`

### **SQL Completo (EXECUTAR EXATAMENTE COMO ESTÁ):**

```sql
-- CreateTable
CREATE TABLE "Pipeline" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "crmId" TEXT,
    "crmType" TEXT,
    "crmData" JSONB,
    "assignedTo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmIntegration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "apiUrl" TEXT,
    "workspaceId" TEXT,
    "syncDirection" TEXT NOT NULL DEFAULT 'bidirectional',
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "syncInterval" INTEGER NOT NULL DEFAULT 3600,
    "fieldMapping" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3),

    CONSTRAINT "CrmIntegration_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "PipelineHistory" ADD COLUMN "dealId" TEXT,
ADD COLUMN "pipelineStageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pipeline_tenantId_name_key" ON "Pipeline"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Pipeline_tenantId_idx" ON "Pipeline"("tenantId");

-- CreateIndex
CREATE INDEX "Pipeline_isActive_idx" ON "Pipeline"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStage_pipelineId_name_key" ON "PipelineStage"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");

-- CreateIndex
CREATE INDEX "PipelineStage_order_idx" ON "PipelineStage"("order");

-- CreateIndex
CREATE INDEX "Deal_tenantId_idx" ON "Deal"("tenantId");

-- CreateIndex
CREATE INDEX "Deal_pipelineId_idx" ON "Deal"("pipelineId");

-- CreateIndex
CREATE INDEX "Deal_stageId_idx" ON "Deal"("stageId");

-- CreateIndex
CREATE INDEX "Deal_leadId_idx" ON "Deal"("leadId");

-- CreateIndex
CREATE INDEX "Deal_crmId_crmType_idx" ON "Deal"("crmId", "crmType");

-- CreateIndex
CREATE UNIQUE INDEX "CrmIntegration_tenantId_type_workspaceId_key" ON "CrmIntegration"("tenantId", "type", "workspaceId");

-- CreateIndex
CREATE INDEX "CrmIntegration_tenantId_idx" ON "CrmIntegration"("tenantId");

-- CreateIndex
CREATE INDEX "CrmIntegration_type_idx" ON "CrmIntegration"("type");

-- CreateIndex
CREATE INDEX "CrmIntegration_isActive_idx" ON "CrmIntegration"("isActive");

-- CreateIndex
CREATE INDEX "PipelineHistory_dealId_idx" ON "PipelineHistory"("dealId");

-- AddForeignKey
ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmIntegration" ADD CONSTRAINT "CrmIntegration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_pipelineStageId_fkey" FOREIGN KEY ("pipelineStageId") REFERENCES "PipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### **Validação:**
- ✅ SQL cria tabela `Pipeline`
- ✅ SQL cria tabela `PipelineStage`
- ✅ SQL cria tabela `Deal`
- ✅ SQL cria tabela `CrmIntegration`
- ✅ SQL modifica `PipelineHistory` (adiciona colunas)
- ✅ SQL cria índices necessários
- ✅ SQL cria foreign keys necessárias

---

## ✅ ETAPA 3: PREPARAR EXECUÇÃO MANUAL SEGURA

### **Instruções para Executar SQL no Railway:**

**1. Acessar Railway Dashboard:**
- Abrir: https://railway.app
- Navegar para o projeto
- Selecionar serviço **"Postgres"** (Service ID: `e710ae21`)

**2. Abrir Query Editor:**
- Clicar na aba **"Database"**
- Clicar na sub-aba **"Query"** (ou "Data" → "Query")

**3. Executar SQL:**
- Copiar o SQL completo da **ETAPA 2** acima
- Colar no editor de query
- Clicar em **"Run"** ou pressionar `Ctrl + Enter`

**4. Verificar Resultado:**
- Deve aparecer mensagem de sucesso
- Se houver erro, verificar:
  - Se tabela `Tenant` existe (foreign key depende)
  - Se tabela `Lead` existe (foreign key depende)
  - Se tabela `PipelineHistory` existe (ALTER TABLE depende)

**5. Confirmar Tabelas Criadas:**
- Railway → Postgres → Database → Data
- Verificar se tabelas aparecem:
  - ✅ `Pipeline`
  - ✅ `PipelineStage`
  - ✅ `Deal`
  - ✅ `CrmIntegration`

---

## ✅ ETAPA 4: MARCAR MIGRATION COMO APLICADA

### **⚠️ IMPORTANTE: NÃO usar INSERT manual em `_prisma_migrations`**

**Usar comando Prisma correto:**

### **Opção A: Via Railway CLI (Recomendado)**

**Pré-requisito:**
- Ter Railway CLI instalado: `npm i -g @railway/cli`
- Estar autenticado: `railway login`
- Estar no diretório do projeto ou especificar projeto

**Comando:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**O que este comando faz:**
- Marca a migration como aplicada em `_prisma_migrations`
- Insere registro com checksum correto
- Não executa SQL (já foi executado manualmente)
- Sincroniza estado do Prisma com banco

### **Opção B: Via Terminal Local (Se tiver acesso ao banco)**

**Pré-requisito:**
- Ter `DATABASE_URL` configurada localmente
- Estar no diretório `backend/`

**Comando:**
```bash
cd backend
npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

### **Verificar se Funcionou:**
- Railway → Postgres → Database → Data
- Abrir tabela `_prisma_migrations`
- Verificar se há registro com:
  - `migration_name`: `20250120000000_add_pipelines_and_deals`
  - `finished_at`: não nulo
  - `applied_steps_count`: 1

---

## ✅ ETAPA 5: VALIDAR ESTADO FINAL

### **5.1 Executar `prisma migrate status`**

**Via Railway CLI:**
```bash
railway run --service backend npx prisma migrate status
```

**Resultado Esperado:**
```
Database schema is up to date! All migrations have been applied.
```

**OU:**
```
Migration status:
- 20260116170000_init_super_sdr_juridico: Applied
- 20250120000000_add_pipelines_and_deals: Applied
- 20250123000000_add_agent_prompts: Applied
- 20250123000001_add_voice_config: Applied
- 20250124000000_add_integration_config: Applied
- 20250125000000_add_agent_config: Applied
```

### **5.2 Confirmar no Banco**

**Railway → Postgres → Database → Data:**

**Verificar Tabelas:**
- ✅ `Pipeline` existe
- ✅ `PipelineStage` existe
- ✅ `Deal` existe
- ✅ `CrmIntegration` existe
- ✅ `PipelineHistory` tem colunas `dealId` e `pipelineStageId`

**Verificar `_prisma_migrations`:**
- ✅ Tabela não está vazia
- ✅ Há registro para `20250120000000_add_pipelines_and_deals`
- ✅ `finished_at` não é nulo
- ✅ `applied_steps_count` é 1

### **5.3 Testar Backend**

**Após reiniciar backend:**
- ✅ Não deve haver erro 500 ao acessar `/api/pipelines`
- ✅ Endpoints que dependem de `Pipeline`/`Deal` devem funcionar
- ✅ Logs não devem mostrar `relation "public.Pipeline" does not exist`

---

## ✅ ETAPA 6: ORIENTAÇÃO FINAL

### **6.1 Reiniciar Backend**

**Ação Necessária:**
- Railway → Backend Service → Deployments
- Clicar em **"Redeploy"** (ou aguardar próximo deploy automático)

**Por quê:**
- Backend precisa recarregar Prisma Client
- Prisma Client precisa reconhecer novas tabelas
- Rotas que dependem de `Pipeline`/`Deal` precisam funcionar

### **6.2 Confirmar Funcionamento**

**Após reiniciar, verificar:**

**1. Logs do Backend:**
- Não deve aparecer: `ERROR: relation "public.Pipeline" does not exist`
- Deve aparecer: `Server listening at http://0.0.0.0:3001`

**2. Endpoints:**
- `GET /api/pipelines` deve retornar `200 OK` (mesmo que array vazio)
- Não deve retornar `500 Internal Server Error`

**3. Prisma Migrate Deploy:**
- Próximo deploy deve mostrar: `No pending migrations to apply.`
- Mas agora com `_prisma_migrations` populado corretamente

### **6.3 Estado Final Esperado**

**Banco:**
- ✅ Todas as tabelas do schema existem
- ✅ `_prisma_migrations` contém todas as migrations aplicadas
- ✅ Foreign keys e índices estão corretos

**Prisma:**
- ✅ `prisma migrate status` retorna "Database schema is up to date"
- ✅ `prisma migrate deploy` não tenta reaplicar migrations
- ✅ Prisma Client reconhece todas as tabelas

**Backend:**
- ✅ Não gera erro 500 por tabelas faltando
- ✅ Endpoints de pipelines funcionam
- ✅ Endpoints de deals funcionam

---

## 📋 CHECKLIST DE EXECUÇÃO

Execute nesta ordem:

- [ ] **ETAPA 1:** Confirmar migration `20250120000000_add_pipelines_and_deals` identificada
- [ ] **ETAPA 2:** SQL extraído e validado
- [ ] **ETAPA 3:** SQL executado no Railway → Postgres → Database → Query
- [ ] **ETAPA 3:** Tabelas `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration` criadas
- [ ] **ETAPA 4:** Comando `prisma migrate resolve --applied` executado
- [ ] **ETAPA 4:** Registro inserido em `_prisma_migrations`
- [ ] **ETAPA 5:** `prisma migrate status` retorna "Database schema is up to date"
- [ ] **ETAPA 5:** Tabelas confirmadas no banco
- [ ] **ETAPA 6:** Backend reiniciado
- [ ] **ETAPA 6:** Endpoints testados e funcionando

---

## 🚨 REGRAS IMPORTANTES

**✅ FAZER:**
- ✅ Executar SQL exatamente como está no arquivo
- ✅ Usar `prisma migrate resolve --applied` para marcar migration
- ✅ Validar estado após cada etapa
- ✅ Reiniciar backend após correção

**❌ NÃO FAZER:**
- ❌ NÃO usar `prisma migrate dev`
- ❌ NÃO apagar `_prisma_migrations`
- ❌ NÃO recriar o banco
- ❌ NÃO fazer INSERT manual em `_prisma_migrations`
- ❌ NÃO modificar o SQL da migration

---

## 📊 RESUMO

**Problema:**
- Banco tem tabelas parciais
- `_prisma_migrations` vazia
- Prisma diz "No pending migrations"
- Tabelas `Pipeline` e `Deal` não existem

**Solução:**
1. Executar SQL da migration manualmente
2. Marcar migration como aplicada via `prisma migrate resolve`
3. Validar estado final
4. Reiniciar backend

**Resultado Esperado:**
- ✅ Banco alinhado com Prisma
- ✅ Migrations corretamente registradas
- ✅ SDR operando sem erros estruturais

---

**Status:** 🔴 **Pronto para execução - Seguir etapas na ordem**
