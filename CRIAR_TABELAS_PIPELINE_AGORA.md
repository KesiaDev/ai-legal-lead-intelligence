# ⚡ Criar Tabelas Pipeline - Solução Rápida

## 🎯 Problema

Erro: `The table 'public.Pipeline' does not exist in the current database.`

A migration foi marcada como aplicada, mas as tabelas não foram criadas.

---

## ✅ SOLUÇÃO: Executar SQL no Railway

### **Passo 1: Acessar o Postgres no Railway**

1. Railway Dashboard → **Data** → **Postgres**
2. Clique em **"Query"** ou **"SQL Editor"**

### **Passo 2: Executar Este SQL**

Copie e cole o SQL abaixo e execute:

```sql
-- Criar tabela Pipeline
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

-- Criar tabela PipelineStage
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

-- Criar tabela Deal
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

-- Criar tabela CrmIntegration
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

-- Adicionar colunas ao PipelineHistory (se a tabela existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PipelineHistory') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'PipelineHistory' AND column_name = 'dealId') THEN
            ALTER TABLE "PipelineHistory" ADD COLUMN "dealId" TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'PipelineHistory' AND column_name = 'pipelineStageId') THEN
            ALTER TABLE "PipelineHistory" ADD COLUMN "pipelineStageId" TEXT;
        END IF;
    END IF;
END $$;

-- Criar índices
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
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Lead') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'Deal_leadId_fkey') THEN
            ALTER TABLE "Deal" ADD CONSTRAINT "Deal_leadId_fkey" 
            FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'CrmIntegration_tenantId_fkey') THEN
        ALTER TABLE "CrmIntegration" ADD CONSTRAINT "CrmIntegration_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PipelineHistory') THEN
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
    END IF;
END $$;
```

### **Passo 3: Verificar se Funcionou**

Após executar, recarregue a página da plataforma. O erro deve desaparecer.

---

## ✅ Resultado Esperado

Após executar o SQL:
- ✅ Tabelas `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration` criadas
- ✅ Índices criados
- ✅ Foreign keys adicionadas
- ✅ Erro "table does not exist" desaparece
- ✅ Dashboard carrega normalmente

---

## 🆘 Se Der Erro ao Executar

Se aparecer erro de "já existe", ignore. O `IF NOT EXISTS` garante que não vai dar erro se já existir.

---

**Execute o SQL acima no Railway e recarregue a página!** 🚀
