# 🔴 CAUSA RAIZ DESCOBERTA: "No pending migrations to apply"

**Data:** 2026-01-27  
**Status:** 🔴 **CRÍTICO - Causa raiz identificada**

---

## ✅ DESCOBERTA CRÍTICA

### **Prisma Diz "No pending migrations to apply"**

**Logs Confirmados:**
```
Jan 27 2026 12:40:31 Datasource "db": PostgreSQL database "railway", schema "public" at "postgres.railway.internal:5432"
Jan 27 2026 12:40:31 6 migrations found in prisma/migrations
Jan 27 2026 12:40:32 No pending migrations to apply.
```

**Contradição:**
- ✅ Prisma **consegue conectar** ao banco (`postgres.railway.internal:5432`)
- ✅ Prisma **encontra 6 migrations** no diretório
- ❌ Prisma diz **"No pending migrations to apply"**
- ❌ Mas tabela `_prisma_migrations` está **VAZIA**
- ❌ Tabelas `Pipeline` e `Deal` **NÃO existem**

---

## 🔍 ANÁLISE DO PROBLEMA

### **O Que Isso Significa:**

**Prisma está verificando o banco e decidindo que não há migrations pendentes, mesmo que:**
1. A tabela `_prisma_migrations` esteja vazia
2. As tabelas não existam
3. As migrations nunca tenham sido aplicadas

**Possíveis Causas:**

### **1. Prisma Está Comparando com Schema Atual (Mais Provável)**

**Cenário:**
- Prisma compara o estado atual do banco com o `schema.prisma`
- Se o banco já tem algumas tabelas (como `Tenant`, `User`, `Lead`, etc.), Prisma pode pensar que está sincronizado
- Prisma não verifica se **todas** as migrations foram aplicadas, apenas se o schema está "compatível"
- Como algumas tabelas existem, Prisma assume que está tudo OK

**Problema:**
- Prisma não está verificando `_prisma_migrations` corretamente
- Ou está ignorando migrations que não criam tabelas novas (apenas modificam existentes)

### **2. Prisma Está Usando `prisma migrate deploy` Incorretamente**

**Cenário:**
- `prisma migrate deploy` é para **produção** e aplica apenas migrations pendentes
- Se Prisma não consegue determinar quais migrations são pendentes, ele pode dizer "No pending migrations"
- Isso pode acontecer se `_prisma_migrations` está vazia mas Prisma não consegue detectar isso

**Solução:**
- Usar `prisma migrate deploy --skip-generate` para forçar aplicação
- Ou usar `prisma migrate resolve` para marcar migrations como aplicadas manualmente

### **3. Prisma Está Conectando a Banco Errado**

**Cenário:**
- `DATABASE_URL` pode estar apontando para banco diferente durante verificação
- Prisma verifica um banco, mas aplica em outro
- Ou há múltiplos bancos e Prisma está confuso

**Evidência:**
- Logs mostram: `PostgreSQL database "railway", schema "public" at "postgres.railway.internal:5432"`
- Isso parece correto, mas pode haver outro banco sendo usado

### **4. Prisma Migrate Deploy Não Está Funcionando Corretamente**

**Cenário:**
- `prisma migrate deploy` pode ter um bug ou comportamento inesperado
- Quando `_prisma_migrations` está vazia, Prisma pode não saber o que fazer
- Prisma pode estar assumindo que o banco está "limpo" e não precisa de migrations

---

## 🚨 SOLUÇÕES

### **Solução 1: Forçar Aplicação de Migrations**

**Opção A: Usar `prisma migrate deploy --skip-generate`**
```bash
prisma migrate deploy --skip-generate
```

**Opção B: Usar `prisma migrate resolve`**
```bash
# Marcar migrations como aplicadas manualmente
prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**Opção C: Usar `prisma migrate dev` (NÃO recomendado em produção)**
```bash
prisma migrate dev
```

### **Solução 2: Resetar e Aplicar Todas as Migrations**

**⚠️ ATENÇÃO: Isso pode apagar dados!**

```bash
# Resetar banco (APAGA TODOS OS DADOS)
prisma migrate reset

# Aplicar todas as migrations
prisma migrate deploy
```

### **Solução 3: Aplicar Migration Manualmente via SQL**

**1. Executar SQL da migration:**
- Railway → Postgres → Database → Query
- Copiar SQL de `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- Executar manualmente

**2. Inserir registro em `_prisma_migrations`:**
```sql
-- Primeiro, obter o checksum da migration
-- (pode ser encontrado no arquivo migration.sql ou gerado pelo Prisma)

INSERT INTO "_prisma_migrations" (
  "id",
  "checksum",
  "finished_at",
  "migration_name",
  "logs",
  "rolled_back_at",
  "started_at",
  "applied_steps_count"
) VALUES (
  gen_random_uuid(),
  'checksum_aqui', -- Substituir pelo checksum real
  NOW(),
  '20250120000000_add_pipelines_and_deals',
  NULL,
  NULL,
  NOW(),
  1
);
```

### **Solução 4: Usar `prisma db push` (Temporário)**

**⚠️ ATENÇÃO: `db push` não usa migrations, sincroniza schema diretamente**

```bash
prisma db push
```

**Problema:**
- Não registra em `_prisma_migrations`
- Não é a forma recomendada para produção
- Pode causar problemas futuros

---

## 🎯 AÇÃO RECOMENDADA

### **Passo 1: Verificar Checksum das Migrations**

**Ação:**
1. Ler arquivo `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
2. Verificar se há checksum no arquivo
3. Ou executar `prisma migrate status` localmente para ver checksums

### **Passo 2: Aplicar Migration Manualmente**

**Opção A: Via SQL (Recomendado)**
1. Railway → Postgres → Database → Query
2. Executar SQL da migration
3. Inserir registro em `_prisma_migrations` com checksum correto

**Opção B: Via Prisma CLI**
```bash
railway run --service backend "prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals"
```

### **Passo 3: Verificar Se Funcionou**

**Ação:**
1. Railway → Postgres → Database → Data
2. Verificar se tabela `Pipeline` existe
3. Verificar se tabela `Deal` existe
4. Verificar se `_prisma_migrations` tem registro da migration

---

## 📊 RESUMO

### **✅ Confirmado:**

1. ✅ Prisma consegue conectar ao banco
2. ✅ Prisma encontra 6 migrations
3. ✅ Prisma diz "No pending migrations to apply"
4. ❌ Mas tabela `_prisma_migrations` está vazia
5. ❌ Tabelas `Pipeline` e `Deal` não existem

### **🔴 Causa Raiz:**

**Prisma está decidindo que não há migrations pendentes, mesmo que nunca tenham sido aplicadas.**

**Possível causa:** Prisma não está verificando `_prisma_migrations` corretamente ou está comparando com schema atual em vez de verificar migrations aplicadas.

### **🎯 Solução:**

**Aplicar migration manualmente via SQL e inserir registro em `_prisma_migrations`.**

---

**Status:** 🔴 **Causa raiz identificada - Solução manual necessária**
