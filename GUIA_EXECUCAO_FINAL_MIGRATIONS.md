# 🎯 GUIA FINAL DE EXECUÇÃO: CORREÇÃO DE MIGRATIONS

**Data:** 2026-01-27  
**Status:** 🔴 **EXECUTAR AGORA**

---

## ✅ CONFIRMAÇÃO PRÉ-EXECUÇÃO

### **1. Migration Alvo Confirmada:**
- ✅ **Nome:** `20250120000000_add_pipelines_and_deals`
- ✅ **Localização:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- ✅ **Arquivo SQL Preparado:** `SQL_MIGRATION_PIPELINES_DEALS.sql`
- ✅ **Conteúdo:** Idêntico ao original (validado)

### **2. Tabelas que Serão Criadas:**
- ✅ `Pipeline`
- ✅ `PipelineStage`
- ✅ `Deal`
- ✅ `CrmIntegration`
- ✅ Modificação: `PipelineHistory` (adiciona `dealId` e `pipelineStageId`)

### **3. Estado Atual do Banco:**
- ❌ Tabelas acima **NÃO existem**
- ❌ `_prisma_migrations` está **VAZIA**
- ❌ Prisma retorna "No pending migrations to apply"

---

## 🚀 EXECUÇÃO PASSO A PASSO

### **PASSO 1: Executar SQL no Railway**

**1.1. Abrir Railway Dashboard:**
- Acessar: https://railway.app
- Login → Projeto → Serviço **"Postgres"**

**1.2. Abrir Query Editor:**
- Clicar: **"Database"** (aba superior)
- Clicar: **"Query"** (sub-aba)

**1.3. Copiar SQL:**
- Abrir arquivo: `SQL_MIGRATION_PIPELINES_DEALS.sql`
- Selecionar TODO (Ctrl + A)
- Copiar (Ctrl + C)

**1.4. Colar e Executar:**
- Colar no Query Editor (Ctrl + V)
- Clicar **"Run"** ou pressionar `Ctrl + Enter`
- Aguardar execução

**1.5. Verificar Sucesso:**
- Deve aparecer mensagem de sucesso
- Se houver erro, verificar dependências (`Tenant`, `Lead`, `PipelineHistory`)

**1.6. Confirmar Tabelas:**
- Railway → Postgres → Database → Data
- Verificar se aparecem: `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration`

---

### **PASSO 2: Marcar Migration como Aplicada**

**2.1. Abrir Terminal:**
- Abrir terminal/PowerShell
- Navegar para diretório do projeto (se necessário)

**2.2. Executar Comando:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**2.3. Verificar Resultado:**
- Deve aparecer mensagem de sucesso
- Railway → Postgres → Database → Data → `_prisma_migrations`
- Verificar registro com `migration_name: 20250120000000_add_pipelines_and_deals`

---

### **PASSO 3: Validar Estado**

**3.1. Executar Status:**
```bash
railway run --service backend npx prisma migrate status
```

**3.2. Resultado Esperado:**
```
Database schema is up to date! All migrations have been applied.
```

**OU lista de migrations todas "Applied"**

---

### **PASSO 4: Reiniciar Backend**

**4.1. Railway Dashboard:**
- Projeto → Serviço **"SDR Advogados"** (Backend)
- Aba **"Deployments"**
- 3 pontinhos (⋮) → **"Redeploy"**
- Aguardar 3-5 minutos

**4.2. Verificar Logs:**
- Railway → Backend → Deploy Logs
- Não deve aparecer: `ERROR: relation "public.Pipeline" does not exist`
- Deve aparecer: `Server listening at http://0.0.0.0:3001`

**4.3. Testar Endpoints:**
- `GET https://api.sdrjuridico.com.br/api/pipelines`
- Deve retornar `200 OK` (não `500`)

---

## 📋 CHECKLIST RÁPIDO

- [ ] SQL executado no Railway Query Editor
- [ ] Tabelas `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration` criadas
- [ ] Comando `prisma migrate resolve --applied` executado
- [ ] Registro confirmado em `_prisma_migrations`
- [ ] `prisma migrate status` retorna "up to date"
- [ ] Backend reiniciado (redeploy)
- [ ] Logs não mostram erro de tabela
- [ ] Endpoints testados e funcionando

---

## 🚨 COMANDOS ESSENCIAIS

```bash
# Marcar migration como aplicada
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals

# Verificar status
railway run --service backend npx prisma migrate status
```

---

## ⚠️ SE ALGO DER ERRADO

### **Erro ao Executar SQL:**
- Verificar se tabelas `Tenant`, `Lead`, `PipelineHistory` existem
- Verificar logs do Postgres para erro específico
- Tentar executar SQL novamente

### **Erro no `prisma migrate resolve`:**
- Verificar se Railway CLI está instalado e autenticado
- Verificar se está no diretório correto
- Tentar executar novamente

### **`prisma migrate status` ainda mostra pending:**
- Verificar se registro existe em `_prisma_migrations`
- Verificar se `finished_at` não é nulo
- Tentar `prisma migrate resolve` novamente

---

**Status:** ✅ **Tudo preparado - Pronto para execução**
