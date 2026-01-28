# 🚀 EXECUTAR AGORA: ORIENTAÇÃO IMEDIATA

**Data:** 2026-01-27  
**Status:** 🔴 **EXECUTAR NA ORDEM**

---

## ⚠️ PASSO 0: LINKAR RAILWAY CLI (OBRIGATÓRIO)

**Status Atual:** ❌ Railway CLI NÃO está linkado ao projeto

**Ação Necessária:**

1. **Abrir terminal/PowerShell**
2. **Navegar para o diretório do projeto:**
   ```bash
   cd c:\Users\User\SdrAdvogados\legal-lead-scout
   ```

3. **Executar comando de link:**
   ```bash
   railway link
   ```

4. **Seguir as instruções:**
   - Selecionar o projeto correto (SDR Advogados)
   - Confirmar que o service "backend" está disponível

5. **Verificar se funcionou:**
   ```bash
   railway status
   ```
   - Deve mostrar informações do projeto linkado

**Após completar, informe:** "PASSO 0 concluído"

---

## 📋 PASSO 1: EXECUTAR SQL NO RAILWAY (MANUAL)

**Ação no Dashboard Railway:**

1. **Abrir arquivo SQL:**
   - Arquivo: `SQL_MIGRATION_PIPELINES_DEALS.sql`
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

4. **Verificar Sucesso:**
   - ✅ Mensagem: "Query executed successfully"
   - ✅ Railway → Postgres → Database → Data
   - ✅ Verificar tabelas: `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration`

**Após completar, informe:** "PASSO 1 concluído - SQL executado com sucesso"

---

## 📋 PASSO 2: RESOLVER MIGRATION (VIA CLI)

**Aguardando PASSO 0 e PASSO 1 serem concluídos.**

**Comando será executado automaticamente após link:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**Você será informado do resultado automaticamente.**

---

## 📋 PASSO 3: VERIFICAR STATUS PRISMA (VIA CLI)

**Aguardando PASSO 2 ser concluído.**

**Comando será executado automaticamente:**
```bash
railway run --service backend npx prisma migrate status
```

**Você será informado do resultado automaticamente.**

---

## 📋 PASSO 4: REDEPLOY DO BACKEND (MANUAL)

**Aguardando PASSO 3 ser concluído.**

**Ação no Dashboard Railway:**

1. Railway Dashboard → Projeto
2. Serviço **"SDR Advogados"** (Backend)
3. Aba **"Deployments"**
4. 3 pontinhos (⋮) → **"Redeploy"**
5. Aguardar 3-5 minutos

**Verificar Logs:**
- Railway → Backend → Deploy Logs
- Deve aparecer: `No pending migrations to apply.`
- Deve aparecer: `Server listening at http://0.0.0.0:3001`

**Após completar, informe:** "PASSO 4 concluído - Backend reiniciado"

---

## 📋 PASSO 5: VALIDAÇÃO FUNCIONAL (MANUAL)

**Aguardando PASSO 4 ser concluído.**

**Testar Endpoints:**

### **5.1 `/api/pipelines`**
- URL: `https://api.sdrjuridico.com.br/api/pipelines`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`
- **Informar:** Status HTTP retornado (200, 500, etc.)

### **5.2 `/api/deals`**
- URL: `https://api.sdrjuridico.com.br/api/deals`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`
- **Informar:** Status HTTP retornado (200, 404, 500, etc.)

**Após completar, informe:** "PASSO 5 concluído - Status: [200/500/etc]"

---

## 🎯 ORDEM DE EXECUÇÃO

1. ✅ **PASSO 0:** Linkar Railway CLI (você faz)
2. ✅ **PASSO 1:** Executar SQL no Dashboard (você faz)
3. ⏳ **PASSO 2:** Resolver migration (eu executo via CLI)
4. ⏳ **PASSO 3:** Verificar status (eu executo via CLI)
5. ✅ **PASSO 4:** Redeploy backend (você faz)
6. ✅ **PASSO 5:** Testar endpoints (você faz)

---

## 📝 COMO INFORMAR PROGRESSO

**Após cada passo manual, informe:**
- "PASSO X concluído" ou
- "PASSO X concluído - [detalhes adicionais]"

**Exemplo:**
- "PASSO 0 concluído"
- "PASSO 1 concluído - SQL executado com sucesso, todas as tabelas criadas"
- "PASSO 4 concluído - Backend reiniciado, logs OK"
- "PASSO 5 concluído - /api/pipelines retornou 200, /api/deals retornou 404"

---

**Status:** ⏳ **Aguardando PASSO 0 e PASSO 1**
