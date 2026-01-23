# 🔧 Solução: Migration Falhada no Railway

## ⚠️ Problema

A migration `20250120000000_add_pipelines_and_deals` falhou com erro:
- `ERROR: relation "PipelineStage" already exists`
- Erro P3018 e P3009 do Prisma

## ✅ Solução: Resolver Migration Falhada

### **Opção 1: Marcar Migration como Resolvida (Recomendado)**

Se as tabelas já existem (criadas manualmente ou parcialmente), marque a migration como resolvida:

1. **Acesse o Railway Dashboard**
2. **Vá no serviço do backend → Data → Postgres → Query**
3. **Execute este SQL:**

```sql
-- Verificar se as tabelas já existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Pipeline', 'PipelineStage', 'Deal', 'CrmIntegration');

-- Se as tabelas existem, marcar a migration como aplicada
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  gen_random_uuid(),
  'migration_checksum_placeholder',
  NOW(),
  '20250120000000_add_pipelines_and_deals',
  NULL,
  NULL,
  NOW(),
  1
)
ON CONFLICT DO NOTHING;
```

### **Opção 2: Deletar Migration Falhada e Recriar**

1. **Deletar registro da migration falhada:**

```sql
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;
```

2. **Verificar se tabelas existem e criar apenas as que faltam:**

```sql
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

-- Criar índices se não existirem (usar CREATE INDEX IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS "Pipeline_tenantId_name_key" ON "Pipeline"("tenantId", "name");
CREATE INDEX IF NOT EXISTS "Pipeline_tenantId_idx" ON "Pipeline"("tenantId");
CREATE INDEX IF NOT EXISTS "Pipeline_isActive_idx" ON "Pipeline"("isActive");
CREATE UNIQUE INDEX IF NOT EXISTS "PipelineStage_pipelineId_name_key" ON "PipelineStage"("pipelineId", "name");
CREATE INDEX IF NOT EXISTS "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");
CREATE INDEX IF NOT EXISTS "PipelineStage_order_idx" ON "PipelineStage"("order");
CREATE INDEX IF NOT EXISTS "Deal_tenantId_idx" ON "Deal"("tenantId");
CREATE INDEX IF NOT EXISTS "Deal_pipelineId_idx" ON "Deal"("pipelineId");
CREATE INDEX IF NOT EXISTS "Deal_stageId_idx" ON "Deal"("stageId");
CREATE INDEX IF NOT EXISTS "Deal_leadId_idx" ON "Deal"("leadId");
CREATE INDEX IF NOT EXISTS "Deal_crmId_crmType_idx" ON "Deal"("crmId", "crmType");
CREATE UNIQUE INDEX IF NOT EXISTS "CrmIntegration_tenantId_type_workspaceId_key" ON "CrmIntegration"("tenantId", "type", "workspaceId");
CREATE INDEX IF NOT EXISTS "CrmIntegration_tenantId_idx" ON "CrmIntegration"("tenantId");
CREATE INDEX IF NOT EXISTS "CrmIntegration_type_idx" ON "CrmIntegration"("type");
CREATE INDEX IF NOT EXISTS "CrmIntegration_isActive_idx" ON "CrmIntegration"("isActive");
CREATE INDEX IF NOT EXISTS "PipelineHistory_dealId_idx" ON "PipelineHistory"("dealId");

-- Adicionar foreign keys se não existirem
DO $$ 
BEGIN
    -- Pipeline -> Tenant
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Pipeline_tenantId_fkey') THEN
        ALTER TABLE "Pipeline" ADD CONSTRAINT "Pipeline_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- PipelineStage -> Pipeline
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineStage_pipelineId_fkey') THEN
        ALTER TABLE "PipelineStage" ADD CONSTRAINT "PipelineStage_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Deal -> Tenant
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_tenantId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Deal -> Pipeline
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_pipelineId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Deal -> PipelineStage
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_stageId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_stageId_fkey" 
        FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    
    -- Deal -> Lead
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'Deal_leadId_fkey') THEN
        ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" 
        FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- CrmIntegration -> Tenant
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'CrmIntegration_tenantId_fkey') THEN
        ALTER TABLE "CrmIntegration" ADD CONSTRAINT "CrmIntegration_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- PipelineHistory -> Deal
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineHistory_dealId_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_dealId_fkey" 
        FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- PipelineHistory -> PipelineStage
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'PipelineHistory_pipelineStageId_fkey') THEN
        ALTER TABLE "PipelineHistory" ADD CONSTRAINT "PipelineHistory_pipelineStageId_fkey" 
        FOREIGN KEY ("pipelineStageId") REFERENCES "PipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
```

### **Opção 3: Usar Prisma Migrate Resolve**

Se você tem acesso ao Railway CLI:

```bash
railway run npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

---

## 🎯 Passo a Passo Rápido (Recomendado)

1. **Acesse Railway Dashboard → Backend → Data → Postgres → Query**
2. **Execute este SQL (seguro, usa IF NOT EXISTS):**

```sql
-- Deletar migration falhada
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;

-- Criar tabelas se não existirem (SQL completo acima)
-- ... (cole o SQL da Opção 2)
```

3. **Marque a migration como aplicada:**

```sql
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

4. **Reinicie o serviço no Railway**

---

## ✅ Verificar se Funcionou

Após resolver, o próximo deploy deve funcionar sem erros de migration.
