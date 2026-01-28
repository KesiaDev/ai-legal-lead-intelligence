# 🚀 EXECUTAR AGORA: CORREÇÃO DE MIGRATIONS

**Data:** 2026-01-27  
**Status:** 🔴 **EXECUTAR IMEDIATAMENTE**

---

## ✅ PRÉ-REQUISITOS CONFIRMADOS

- ✅ Migration `20250120000000_add_pipelines_and_deals` confirmada
- ✅ Arquivo `SQL_MIGRATION_PIPELINES_DEALS.sql` validado
- ✅ SQL idêntico ao original
- ✅ Comandos Prisma preparados
- ✅ Nenhuma pendência técnica

---

## 🎯 PASSO 1: EXECUTAR SQL NO RAILWAY

### **1.1 Abrir Arquivo SQL**
- Abrir: `SQL_MIGRATION_PIPELINES_DEALS.sql`
- Selecionar TODO (Ctrl + A)
- Copiar (Ctrl + C)

### **1.2 Acessar Railway**
1. Abrir: https://railway.app
2. Login → Projeto → Serviço **"Postgres"**
3. Aba **"Database"** → **"Query"**

### **1.3 Executar SQL**
1. Colar SQL no editor (Ctrl + V)
2. Clicar **"Run"** ou `Ctrl + Enter`
3. Aguardar execução

### **1.4 Verificar Sucesso**
- ✅ Mensagem de sucesso
- ✅ Railway → Postgres → Database → Data
- ✅ Verificar tabelas: `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration`

**Se houver erro:** Verificar dependências (`Tenant`, `Lead`, `PipelineHistory`)

---

## 🎯 PASSO 2: MARCAR MIGRATION COMO APLICADA

### **2.1 Abrir Terminal**
- Abrir terminal/PowerShell
- Navegar para diretório do projeto (se necessário)

### **2.2 Executar Comando**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

### **2.3 Verificar Resultado**
- ✅ Comando executado sem erro
- ✅ Railway → Postgres → Database → Data → `_prisma_migrations`
- ✅ Verificar registro com `migration_name: 20250120000000_add_pipelines_and_deals`

---

## 🎯 PASSO 3: VALIDAR ESTADO DO PRISMA

### **3.1 Executar Status**
```bash
railway run --service backend npx prisma migrate status
```

### **3.2 Resultado Obrigatório**
```
Database schema is up to date! All migrations have been applied.
```

**OU lista de migrations todas "Applied"**

**Se não aparecer:** Verificar se PASSO 2 foi executado corretamente

---

## 🎯 PASSO 4: RESTART DO BACKEND

### **4.1 Redeploy**
1. Railway Dashboard → Projeto
2. Serviço **"SDR Advogados"** (Backend)
3. Aba **"Deployments"**
4. 3 pontinhos (⋮) → **"Redeploy"**
5. Aguardar 3-5 minutos

### **4.2 Verificar Logs**
**Railway → Backend → Deploy Logs:**

**Deve aparecer:**
- ✅ `Prisma schema loaded from prisma/schema.prisma`
- ✅ `No pending migrations to apply.`
- ✅ `Server listening at http://0.0.0.0:3001`

**NÃO deve aparecer:**
- ❌ `ERROR: relation "public.Pipeline" does not exist`

---

## 🎯 PASSO 5: VALIDAÇÃO FUNCIONAL

### **5.1 Testar `/api/pipelines`**
- URL: `https://api.sdrjuridico.com.br/api/pipelines`
- Headers: `Authorization: Bearer {token}`
- Método: `GET`

**Resultado:** `200 OK` (não `500`)

### **5.2 Testar `/api/deals`**
- URL: `https://api.sdrjuridico.com.br/api/deals` (ou endpoint correto)
- Headers: `Authorization: Bearer {token}`
- Método: `GET`

**Resultado:** Não retorna `500 Internal Server Error`

---

## 📋 CHECKLIST RÁPIDO

- [ ] **PASSO 1:** SQL executado no Railway
- [ ] **PASSO 1:** Tabelas criadas confirmadas
- [ ] **PASSO 2:** `prisma migrate resolve --applied` executado
- [ ] **PASSO 2:** Registro em `_prisma_migrations` confirmado
- [ ] **PASSO 3:** `prisma migrate status` retorna "up to date"
- [ ] **PASSO 4:** Backend reiniciado
- [ ] **PASSO 4:** Logs mostram "No pending migrations" e "Server listening"
- [ ] **PASSO 5:** `/api/pipelines` retorna `200 OK`
- [ ] **PASSO 5:** `/api/deals` não retorna `500`

---

## 🚨 COMANDOS ESSENCIAIS

```bash
# PASSO 2: Marcar migration como aplicada
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals

# PASSO 3: Validar estado
railway run --service backend npx prisma migrate status
```

---

## ⚠️ REGRAS ABSOLUTAS

**❌ NÃO FAZER:**
- ❌ NÃO usar `prisma migrate dev`
- ❌ NÃO editar SQL
- ❌ NÃO apagar `_prisma_migrations`
- ❌ NÃO recriar banco
- ❌ NÃO executar passos fora da ordem

---

**Status:** ✅ **Pronto para execução - Seguir passos na ordem exata**
