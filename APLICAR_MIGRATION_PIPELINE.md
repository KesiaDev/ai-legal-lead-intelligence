# 🔧 APLICAR MIGRATION DA TABELA PIPELINE

## ❌ PROBLEMA

O erro mostra:
```
The table `public.Pipeline` does not exist in the current database.
```

Isso significa que a migration `20250120000000_add_pipelines_and_deals` não foi aplicada no banco de dados.

## ✅ SOLUÇÃO

### OPÇÃO 1: VIA RAILWAY CLI (RECOMENDADO)

1. **Instale o Railway CLI** (se ainda não tiver):
   ```bash
   npm i -g @railway/cli
   ```

2. **Faça login:**
   ```bash
   railway login
   ```

3. **Conecte ao projeto:**
   ```bash
   railway link
   ```

4. **Acesse o PostgreSQL:**
   ```bash
   railway connect postgres
   ```

5. **Execute a migration manualmente:**
   - Copie o conteúdo de `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
   - Cole no terminal do PostgreSQL
   - Execute (pressione Enter)

### OPÇÃO 2: VIA RAILWAY DASHBOARD

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. Vá no service do **PostgreSQL**
4. Clique em **Query**
5. Cole o conteúdo de `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
6. Clique em **Run**

### OPÇÃO 3: FORÇAR RESTART DO BACKEND (AUTO-APPLY)

O backend está configurado para aplicar migrations automaticamente no boot:

1. No Railway, vá no service do **backend**
2. Clique em **Restart**
3. Aguarde o restart (30-60 segundos)
4. Verifique os logs - deve aparecer:
   ```
   prisma migrate deploy
   prisma generate
   server listening
   ```

Se a migration não for aplicada automaticamente, use a **OPÇÃO 1** ou **OPÇÃO 2**.

## 🔍 VERIFICAÇÃO

Após aplicar a migration:

1. Acesse o PostgreSQL (via Railway CLI ou Dashboard)
2. Execute:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('Pipeline', 'PipelineStage', 'Deal');
   ```
3. **Deve retornar 3 linhas:**
   - `Pipeline`
   - `PipelineStage`
   - `Deal`

## ⚠️ SE AINDA NÃO FUNCIONAR

Se após aplicar a migration o erro persistir:

1. **Verifique se o Prisma Client foi regenerado:**
   - No Railway, veja os logs do backend
   - Deve aparecer: `prisma generate`
   - Se não aparecer, force um restart

2. **Verifique se há migrations pendentes:**
   - No Railway, acesse o PostgreSQL
   - Execute:
     ```sql
     SELECT * FROM "_prisma_migrations" 
     ORDER BY finished_at DESC 
     LIMIT 5;
     ```
   - Confirme que `20250120000000_add_pipelines_and_deals` está na lista com `finished_at` preenchido

3. **Se a migration não estiver na lista:**
   - Execute a migration manualmente (OPÇÃO 1 ou 2)
   - Depois, registre na tabela `_prisma_migrations`:
     ```sql
     INSERT INTO "_prisma_migrations" (migration_name, applied_steps_count)
     VALUES ('20250120000000_add_pipelines_and_deals', 1);
     ```

## 📝 NOTA

A migration cria as seguintes tabelas:
- `Pipeline` - Funis de vendas
- `PipelineStage` - Etapas dos funis
- `Deal` - Negócios/oportunidades
- `CrmIntegration` - Integrações com CRMs externos

Todas essas tabelas são **obrigatórias** para o funcionamento do sistema de funis.
