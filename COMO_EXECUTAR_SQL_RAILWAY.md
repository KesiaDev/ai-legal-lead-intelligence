# 📝 Como Executar SQL no Railway - Passo a Passo

## 🎯 Método 1: Via Interface Web do Railway (Mais Fácil)

### **Passo 1: Acessar o Query Editor**

1. **No Railway Dashboard:**
   - Vá no serviço **"SDR Advogados"** (backend)
   - Clique na aba **"Data"** (ou "Database")
   - Você verá as tabelas listadas

2. **Encontrar o Query Editor:**
   - Procure por um botão **"Query"** ou **"SQL Editor"** no topo
   - Ou clique em uma tabela (ex: `_prisma_migrations`) e procure por **"Run Query"**
   - Ou procure por um campo de texto grande com placeholder "Enter SQL query..."

### **Passo 2: Executar o SQL**

1. **Cole o SQL completo** (todo o conteúdo do arquivo `migration_safe.sql`)
2. **Clique em "Run"** ou **"Execute"** ou pressione `Ctrl+Enter`
3. **Aguarde a execução** (pode levar alguns segundos)

### **Passo 3: Verificar Resultado**

- Se der certo: Você verá mensagens de sucesso ou "Query executed successfully"
- Se der erro: Leia a mensagem de erro e me avise

---

## 🎯 Método 2: Via Railway CLI (Alternativa)

Se não encontrar o Query Editor na interface:

### **Instalar Railway CLI:**
```bash
npm i -g @railway/cli
```

### **Fazer Login:**
```bash
railway login
```

### **Conectar ao Projeto:**
```bash
railway link
```

### **Executar SQL:**
```bash
cd backend
railway run psql $DATABASE_URL -f prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql
```

---

## 🎯 Método 3: Via psql Direto (Avançado)

Se você tem as credenciais do banco:

1. **Obter DATABASE_URL:**
   - Railway Dashboard → Backend → Variables
   - Copie o valor de `DATABASE_URL`

2. **Conectar via psql:**
   ```bash
   psql "postgresql://user:password@host:port/database"
   ```

3. **Executar SQL:**
   - Cole o SQL completo
   - Pressione Enter

---

## 📋 SQL Completo para Copiar

```sql
-- Migration Segura: Cria tabelas apenas se não existirem
-- Deletar migration falhada do histórico
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;

-- Criar Pipeline se não existir
CREATE TABLE IF NOT EXISTS "Pipeline" (
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

-- Criar PipelineStage se não existir
CREATE TABLE IF NOT EXISTS "PipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PipelineStage_pkey" PRIMARY KEY ("id")
);

-- Criar Deal se não existir
CREATE TABLE IF NOT EXISTS "Deal" (
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

-- Criar CrmIntegration se não existir
CREATE TABLE IF NOT EXISTS "CrmIntegration" (
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

-- Adicionar colunas ao PipelineHistory se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PipelineHistory' AND column_name = 'dealId') THEN
        ALTER TABLE "PipelineHistory" ADD COLUMN "dealId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'PipelineHistory' AND column_name = 'pipelineStageId') THEN
        ALTER TABLE "PipelineHistory" ADD COLUMN "pipelineStageId" TEXT;
    END IF;
END $$;

-- Criar índices
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Pipeline_tenantId_name_key') THEN
        CREATE UNIQUE INDEX "Pipeline_tenantId_name_key" ON "Pipeline"("tenantId", "name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Pipeline_tenantId_idx') THEN
        CREATE INDEX "Pipeline_tenantId_idx" ON "Pipeline"("tenantId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Pipeline_isActive_idx') THEN
        CREATE INDEX "Pipeline_isActive_idx" ON "Pipeline"("isActive");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PipelineStage_pipelineId_name_key') THEN
        CREATE UNIQUE INDEX "PipelineStage_pipelineId_name_key" ON "PipelineStage"("pipelineId", "name");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PipelineStage_pipelineId_idx') THEN
        CREATE INDEX "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PipelineStage_order_idx') THEN
        CREATE INDEX "PipelineStage_order_idx" ON "PipelineStage"("order");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Deal_tenantId_idx') THEN
        CREATE INDEX "Deal_tenantId_idx" ON "Deal"("tenantId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Deal_pipelineId_idx') THEN
        CREATE INDEX "Deal_pipelineId_idx" ON "Deal"("pipelineId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Deal_stageId_idx') THEN
        CREATE INDEX "Deal_stageId_idx" ON "Deal"("stageId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Deal_leadId_idx') THEN
        CREATE INDEX "Deal_leadId_idx" ON "Deal"("leadId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Deal_crmId_crmType_idx') THEN
        CREATE INDEX "Deal_crmId_crmType_idx" ON "Deal"("crmId", "crmType");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CrmIntegration_tenantId_type_workspaceId_key') THEN
        CREATE UNIQUE INDEX "CrmIntegration_tenantId_type_workspaceId_key" ON "CrmIntegration"("tenantId", "type", "workspaceId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CrmIntegration_tenantId_idx') THEN
        CREATE INDEX "CrmIntegration_tenantId_idx" ON "CrmIntegration"("tenantId");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CrmIntegration_type_idx') THEN
        CREATE INDEX "CrmIntegration_type_idx" ON "CrmIntegration"("type");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CrmIntegration_isActive_idx') THEN
        CREATE INDEX "CrmIntegration_isActive_idx" ON "CrmIntegration"("isActive");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'PipelineHistory_dealId_idx') THEN
        CREATE INDEX "PipelineHistory_dealId_idx" ON "PipelineHistory"("dealId");
    END IF;
END $$;

-- Adicionar foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Pipeline_tenantId_fkey') THEN
        ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineStage_pipelineId_fkey') THEN
        ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_tenantId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_pipelineId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_stageId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_stageId_fkey" 
        FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_leadId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" 
        FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'CrmIntegration_tenantId_fkey') THEN
        ALTER TABLE "CrmIntegration" ADD CONSTRAINT "CrmIntegration_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineHistory_dealId_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_dealId_fkey" 
        FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineHistory_pipelineStageId_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_pipelineStageId_fkey" 
        FOREIGN KEY ("pipelineStageId") REFERENCES "PipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Marcar migration como aplicada
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT 
  gen_random_uuid(),
  '',
  NOW(),
  '20250120000000_add_pipelines_and_deals',
  NULL,
  NULL,
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" 
  WHERE migration_name = '20250120000000_add_pipelines_and_deals'
);
```

---

## ✅ Após Executar

1. **Verificar se funcionou:**
   - Volte na aba "Data" e veja se as tabelas `Pipeline`, `Deal`, `CrmIntegration` aparecem

2. **Reiniciar o serviço:**
   - Vá em "Settings" → "Redeploy"
   - Ou aguarde o próximo deploy automático

3. **Verificar logs:**
   - Vá em "Deploy Logs"
   - Não deve mais aparecer erro de migration

---

## 🆘 Se Não Encontrar o Query Editor

Me avise e eu te ajudo a encontrar ou usar outro método!
