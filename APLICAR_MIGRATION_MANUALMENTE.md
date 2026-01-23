# Aplicar Migration Manualmente

## Problema
Os erros 500 estão ocorrendo porque a migration `20250125000000_add_agent_config` ainda não foi aplicada no Railway.

## Solução Temporária

### Opção 1: Via API (Recomendado)

1. **Acesse o endpoint de aplicar migrations:**
   ```
   POST https://api.sdrjuridico.com.br/api/apply-migrations
   ```

2. **Body (JSON):**
   ```json
   {
     "secret": "fix-migration-2026"
   }
   ```

3. **Usando curl:**
   ```bash
   curl -X POST https://api.sdrjuridico.com.br/api/apply-migrations \
     -H "Content-Type: application/json" \
     -d '{"secret": "fix-migration-2026"}'
   ```

4. **Ou usando o navegador (console):**
   ```javascript
   fetch('https://api.sdrjuridico.com.br/api/apply-migrations', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ secret: 'fix-migration-2026' })
   })
   .then(r => r.json())
   .then(console.log)
   ```

### Opção 2: Via Railway Console

1. Acesse o Railway Dashboard
2. Vá para o serviço do backend
3. Abra o console do PostgreSQL
4. Execute o SQL da migration manualmente:

```sql
-- Criar tabela AgentConfig
CREATE TABLE IF NOT EXISTS "AgentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "communicationConfig" JSONB,
    "followUpConfig" JSONB,
    "scheduleConfig" JSONB,
    "humanizationConfig" JSONB,
    "knowledgeBase" JSONB,
    "intentions" JSONB,
    "templates" JSONB,
    "funnelStages" JSONB,
    "lawyers" JSONB,
    "rotationRules" JSONB,
    "reminders" JSONB,
    "eventConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS "AgentConfig_tenantId_key" ON "AgentConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "AgentConfig_tenantId_idx" ON "AgentConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "AgentConfig_isActive_idx" ON "AgentConfig"("isActive");

-- Adicionar foreign key
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Verificar se Funcionou

Após aplicar a migration, teste:

1. **Recarregue a página de Integrações**
2. **Tente salvar a chave da OpenAI novamente**
3. **Verifique o console do navegador** - não deve ter mais erros 500

## Nota

A migration deveria ser aplicada automaticamente no deploy, mas pode ter falhado. O endpoint `/api/apply-migrations` é uma solução temporária para aplicar manualmente.
