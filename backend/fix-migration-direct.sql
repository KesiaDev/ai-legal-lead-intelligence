-- Script SQL para resolver migration falhada
-- Execute este SQL diretamente no banco

-- 1. Remover migration falhada do histórico
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;

-- 2. Criar tabelas se não existirem
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

-- 3. Adicionar colunas ao PipelineHistory
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

-- 4. Criar índices
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

-- 5. Adicionar foreign keys
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

-- 6. Marcar migration como aplicada (resolvida)
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
  WHERE migration_name = '20250120000000_add_pipelines_and_deals' AND finished_at IS NOT NULL
);
