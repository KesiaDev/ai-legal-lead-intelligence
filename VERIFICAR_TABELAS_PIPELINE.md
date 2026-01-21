# 🔍 Verificar se Tabelas Pipeline Foram Criadas

## 🎯 Problema

Erro 500 ao acessar `/api/pipelines` - Tabela `Pipeline` não existe.

---

## ✅ Passo 1: Verificar se as Tabelas Existem

### **No Railway Dashboard:**

1. Vá em **Data** → **Postgres** → **Query**
2. Execute este SQL para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Pipeline', 'PipelineStage', 'Deal', 'CrmIntegration')
ORDER BY table_name;
```

**Resultado esperado:**
```
Pipeline
PipelineStage
Deal
CrmIntegration
```

Se **NÃO aparecer** essas 4 tabelas, você precisa executar o SQL de criação.

---

## ✅ Passo 2: Se as Tabelas NÃO Existem - Criar Agora

Execute este SQL completo no Railway:

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
END $$;
```

---

## ✅ Passo 3: Se as Tabelas JÁ Existem - Regenerar Prisma Client

Se as tabelas existem mas o erro persiste, o Prisma Client pode estar desatualizado.

### **No Railway:**

1. Vá no serviço do **backend**
2. Vá em **Deployments** → **Redeploy**

Ou execute via terminal (se tiver acesso):

```bash
cd backend
npx prisma generate
```

---

## ✅ Passo 4: Verificar Logs do Backend

No Railway Dashboard → **Backend** → **Deploy Logs**, verifique se há erros relacionados ao Prisma.

---

## 🆘 Checklist

- [ ] Executei o SQL de verificação (Passo 1)
- [ ] As 4 tabelas aparecem no resultado?
  - [ ] Se NÃO → Executei o SQL de criação (Passo 2)
  - [ ] Se SIM → Fiz redeploy do backend (Passo 3)
- [ ] Recarreguei a página da plataforma
- [ ] O erro ainda aparece?

---

**Me diga o resultado do Passo 1 (verificação) e eu te ajudo a resolver!** 🔍
