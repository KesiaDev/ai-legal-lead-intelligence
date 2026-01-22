# 🔧 Resolver Erro: Tabela Pipeline Não Existe

## 🔴 PROBLEMA

**Erro no Dashboard:**
```
Erro ao carregar funis
Invalid `prisma.pipeline.findMany()` invocation: 
The table 'public.Pipeline' does not exist in the current database.
```

**Causa:** As tabelas do Pipeline não foram criadas no banco de dados.

---

## ✅ SOLUÇÃO: Criar Tabelas no Railway

### **Passo 1: Acessar o Postgres no Railway**

1. Railway Dashboard → **Data** → **Postgres**
2. Clique em **"Query"** ou **"SQL Editor"**

---

### **Passo 2: Executar Este SQL**

**Copie e cole o SQL abaixo e execute:**

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

-- Criar índices
CREATE INDEX IF NOT EXISTS "Pipeline_tenantId_idx" ON "Pipeline"("tenantId");
CREATE INDEX IF NOT EXISTS "Pipeline_isActive_idx" ON "Pipeline"("isActive");
CREATE INDEX IF NOT EXISTS "PipelineStage_pipelineId_idx" ON "PipelineStage"("pipelineId");
CREATE INDEX IF NOT EXISTS "PipelineStage_order_idx" ON "PipelineStage"("order");
CREATE INDEX IF NOT EXISTS "Deal_tenantId_idx" ON "Deal"("tenantId");
CREATE INDEX IF NOT EXISTS "Deal_pipelineId_idx" ON "Deal"("pipelineId");
CREATE INDEX IF NOT EXISTS "Deal_stageId_idx" ON "Deal"("stageId");
CREATE INDEX IF NOT EXISTS "Deal_leadId_idx" ON "Deal"("leadId");
CREATE INDEX IF NOT EXISTS "CrmIntegration_tenantId_idx" ON "CrmIntegration"("tenantId");

-- Criar foreign keys
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Pipeline_tenantId_fkey'
    ) THEN
        ALTER TABLE "Pipeline" 
        ADD CONSTRAINT "Pipeline_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PipelineStage_pipelineId_fkey'
    ) THEN
        ALTER TABLE "PipelineStage" 
        ADD CONSTRAINT "PipelineStage_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Deal_tenantId_fkey'
    ) THEN
        ALTER TABLE "Deal" 
        ADD CONSTRAINT "Deal_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Deal_pipelineId_fkey'
    ) THEN
        ALTER TABLE "Deal" 
        ADD CONSTRAINT "Deal_pipelineId_fkey" 
        FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Deal_stageId_fkey'
    ) THEN
        ALTER TABLE "Deal" 
        ADD CONSTRAINT "Deal_stageId_fkey" 
        FOREIGN KEY ("stageId") REFERENCES "PipelineStage"("id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Deal_leadId_fkey'
    ) THEN
        ALTER TABLE "Deal" 
        ADD CONSTRAINT "Deal_leadId_fkey" 
        FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'CrmIntegration_tenantId_fkey'
    ) THEN
        ALTER TABLE "CrmIntegration" 
        ADD CONSTRAINT "CrmIntegration_tenantId_fkey" 
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Criar unique constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Pipeline_tenantId_name_key'
    ) THEN
        ALTER TABLE "Pipeline" 
        ADD CONSTRAINT "Pipeline_tenantId_name_key" 
        UNIQUE ("tenantId", "name");
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'PipelineStage_pipelineId_name_key'
    ) THEN
        ALTER TABLE "PipelineStage" 
        ADD CONSTRAINT "PipelineStage_pipelineId_name_key" 
        UNIQUE ("pipelineId", "name");
    END IF;
END $$;
```

---

### **Passo 3: Verificar se Funcionou**

**Execute este SQL para verificar:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Pipeline', 'PipelineStage', 'Deal', 'CrmIntegration')
ORDER BY table_name;
```

**Esperado:**
```
Pipeline
PipelineStage
Deal
CrmIntegration
```

---

### **Passo 4: Recarregar o Frontend**

1. Volte para o frontend: `legal-lead-scout-production.up.railway.app`
2. Recarregue a página (F5)
3. O erro deve desaparecer!

---

## ✅ RESUMO

1. ✅ Railway → Data → Postgres → Query
2. ✅ Copie e cole o SQL completo acima
3. ✅ Execute
4. ✅ Verifique se as tabelas foram criadas
5. ✅ Recarregue o frontend

**Pronto! O erro deve desaparecer!** 🚀
