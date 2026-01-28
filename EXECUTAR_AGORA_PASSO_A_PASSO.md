# 🚀 EXECUTAR AGORA: PASSO A PASSO COM RELATÓRIO

**Data:** 2026-01-27  
**Status:** 🔴 **EXECUTAR IMEDIATAMENTE**

---

## ⚠️ IMPORTANTE: Railway CLI precisa estar linkado

**Antes de executar os comandos Railway CLI, execute:**
```bash
railway link
```
E selecione o projeto correto.

---

## 📋 PASSO 1: EXECUTAR SQL NO RAILWAY

### **Ação Manual (Dashboard):**

1. **Abrir arquivo SQL:**
   - Abrir: `SQL_MIGRATION_PIPELINES_DEALS.sql`
   - Selecionar TODO (Ctrl + A)
   - Copiar (Ctrl + C)

2. **Acessar Railway:**
   - Abrir: https://railway.app
   - Login → Projeto → Serviço **"Postgres"**
   - Aba **"Database"** → **"Query"**

3. **Executar SQL:**
   - Colar SQL no editor (Ctrl + V)
   - Clicar **"Run"** ou `Ctrl + Enter`
   - Aguardar execução

### **Verificar Sucesso:**

- ✅ Mensagem: "Query executed successfully"
- ✅ Railway → Postgres → Database → Data
- ✅ Verificar tabelas: `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration`

### **📝 REPORTAR RESULTADO:**

**Copie e cole no arquivo `RELATORIO_EXECUCAO_MIGRATIONS.md`:**

```
PASSO 1: [OK/ERRO]
Mensagem: [COLE AQUI A MENSAGEM DO RAILWAY]
Tabelas criadas: [LISTAR QUAIS FORAM CRIADAS]
```

---

## 📋 PASSO 2: RESOLVE MIGRATION

### **Ação via Terminal:**

**1. Linkar Railway (se ainda não fez):**
```bash
railway link
```

**2. Executar comando:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

### **📝 REPORTAR RESULTADO:**

**Copie a saída completa do terminal e cole em `RELATORIO_EXECUCAO_MIGRATIONS.md`:**

```
PASSO 2: [OK/ERRO]
Saída do comando:
[COLE AQUI A SAÍDA COMPLETA]
```

**Verificar em `_prisma_migrations`:**
- Railway → Postgres → Database → Data → `_prisma_migrations`
- Confirmar registro com `migration_name: 20250120000000_add_pipelines_and_deals`

---

## 📋 PASSO 3: STATUS PRISMA

### **Ação via Terminal:**

```bash
railway run --service backend npx prisma migrate status
```

### **📝 REPORTAR RESULTADO:**

**Copie a saída completa e cole em `RELATORIO_EXECUCAO_MIGRATIONS.md`:**

```
PASSO 3: [OK/ERRO]
Saída do comando:
[COLE AQUI A SAÍDA COMPLETA]

Confirmação: [Contém "Database schema is up to date!"? SIM/NÃO]
```

---

## 📋 PASSO 4: RESTART BACKEND

### **Ação Manual (Dashboard):**

1. Railway Dashboard → Projeto
2. Serviço **"SDR Advogados"** (Backend)
3. Aba **"Deployments"**
4. 3 pontinhos (⋮) → **"Redeploy"**
5. Aguardar 3-5 minutos

### **Verificar Logs:**

**Railway → Backend → Deploy Logs:**

**Deve aparecer:**
- ✅ `Prisma schema loaded from prisma/schema.prisma`
- ✅ `No pending migrations to apply.`
- ✅ `Server listening at http://0.0.0.0:3001`

**NÃO deve aparecer:**
- ❌ `ERROR: relation "public.Pipeline" does not exist`

### **📝 REPORTAR RESULTADO:**

**Copie trechos relevantes dos logs e cole em `RELATORIO_EXECUCAO_MIGRATIONS.md`:**

```
PASSO 4: [OK/ERRO]
Logs relevantes:
[COLE AQUI OS TRECHOS DOS LOGS]

Confirmações:
- Prisma schema loaded: [SIM/NÃO]
- No pending migrations: [SIM/NÃO]
- Server listening: [SIM/NÃO]
- Erros de tabela: [SIM/NÃO - se SIM, qual?]
```

---

## 📋 PASSO 5: VALIDAÇÃO FUNCIONAL

### **5.1 Testar `/api/pipelines`**

**Via Browser/Postman/curl:**
- URL: `https://api.sdrjuridico.com.br/api/pipelines`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`

### **5.2 Testar `/api/deals`**

**Via Browser/Postman/curl:**
- URL: `https://api.sdrjuridico.com.br/api/deals`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`

### **📝 REPORTAR RESULTADO:**

**Cole em `RELATORIO_EXECUCAO_MIGRATIONS.md`:**

```
PASSO 5.1 - /api/pipelines:
Status: [200/500/OUTRO]
Response: [COLE AQUI O JSON OU MENSAGEM DE ERRO]

PASSO 5.2 - /api/deals:
Status: [200/404/500/OUTRO]
Response: [COLE AQUI O JSON OU MENSAGEM DE ERRO]
```

---

## 🎯 RESUMO RÁPIDO DE EXECUÇÃO

**Execute nesta ordem:**

1. ✅ **PASSO 1:** SQL no Railway Dashboard (manual)
2. ✅ **PASSO 2:** `railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals`
3. ✅ **PASSO 3:** `railway run --service backend npx prisma migrate status`
4. ✅ **PASSO 4:** Redeploy no Railway Dashboard (manual)
5. ✅ **PASSO 5:** Testar endpoints (manual)

**Após cada passo, reporte o resultado em `RELATORIO_EXECUCAO_MIGRATIONS.md`**

---

## 🚨 COMANDOS PRONTOS PARA COPIAR

```bash
# Linkar Railway (se necessário)
railway link

# PASSO 2
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals

# PASSO 3
railway run --service backend npx prisma migrate status
```

---

**Status:** ✅ **Pronto para execução - Reportar resultados após cada passo**
