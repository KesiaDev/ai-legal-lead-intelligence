# 🎯 CONTROLE DE EXECUÇÃO: CORREÇÃO DE MIGRATIONS

**Data:** 2026-01-27  
**Status:** ⏳ **AGUARDANDO CONFIRMAÇÕES**

---

## 📊 STATUS ATUAL DOS PASSOS

| Passo | Tipo | Status | Confirmação Necessária |
|-------|------|--------|----------------------|
| **PASSO 0** | Manual | ✅ **CONCLUÍDO** | "PASSO 0 concluído" ✓ |
| **PASSO 1** | Manual | ⏳ **AGUARDANDO** | "PASSO 1 concluído - SQL executado com sucesso" |
| **PASSO 2** | Automático (CLI) | 🔒 **BLOQUEADO** | Aguardar PASSO 0 e PASSO 1 |
| **PASSO 3** | Automático (CLI) | 🔒 **BLOQUEADO** | Aguardar PASSO 2 |
| **PASSO 4** | Manual | ⏳ **AGUARDANDO** | Aguardar PASSO 3 |
| **PASSO 5** | Manual | ⏳ **AGUARDANDO** | Aguardar PASSO 4 |

---

## ✅ PASSO 0: LINKAR RAILWAY CLI (MANUAL - VOCÊ FAZ)

**Status:** ⏳ **AGUARDANDO SUA EXECUÇÃO**

**⚠️ LIMITAÇÃO OPERACIONAL:**
- Este passo requer ação manual no terminal
- Cursor não possui capacidade de executar `railway link` interativamente
- **NÃO é um erro** - é limitação operacional esperada
- O fluxo continuará normalmente após sua confirmação

**Ação Necessária:**

1. Abrir terminal/PowerShell
2. Navegar para o diretório:
   ```bash
   cd c:\Users\User\SdrAdvogados\legal-lead-scout
   ```

3. Executar comando:
   ```bash
   railway link
   ```

4. Selecionar o projeto correto (SDR Advogados)
5. Confirmar que o service "backend" está disponível

**Após completar, informe EXATAMENTE:**
```
PASSO 0 concluído
```

**⚠️ IMPORTANTE:** Nenhum comando CLI será executado antes desta confirmação.

---

## ✅ PASSO 1: EXECUTAR SQL NO RAILWAY (MANUAL - VOCÊ FAZ)

**Status:** ⏳ **AGUARDANDO SUA EXECUÇÃO**

**⚠️ LIMITAÇÃO OPERACIONAL:**
- Este passo requer ação manual no Railway Dashboard
- Cursor não possui acesso ao Railway Dashboard para executar SQL
- **NÃO é um erro** - é limitação operacional esperada
- O fluxo continuará normalmente após sua confirmação

**Ação Necessária:**

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

**Após completar, informe EXATAMENTE:**
```
PASSO 1 concluído - SQL executado com sucesso
```

**⚠️ IMPORTANTE:** Nenhum comando CLI será executado antes desta confirmação.

---

## ⚙️ PASSO 2: RESOLVER MIGRATION (AUTOMÁTICO - EU EXECUTO)

**Status:** 🔒 **BLOQUEADO - Aguardando PASSO 0 e PASSO 1**

**Comando que será executado automaticamente:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**Quando será executado:**
- ✅ Após receber confirmação EXATA: "PASSO 0 concluído"
- ✅ Após receber confirmação EXATA: "PASSO 1 concluído - SQL executado com sucesso"

**O que será feito automaticamente:**
- ✅ Executar comando via CLI (Cursor tem capacidade para isso)
- ✅ Registrar saída completa no relatório
- ✅ Marcar como OK ou ERRO conforme resultado
- ✅ Prosseguir automaticamente para PASSO 3 se bem-sucedido

---

## ⚙️ PASSO 3: VERIFICAR STATUS PRISMA (AUTOMÁTICO - EU EXECUTO)

**Status:** 🔒 **BLOQUEADO - Aguardando PASSO 2**

**Comando que será executado automaticamente:**
```bash
railway run --service backend npx prisma migrate status
```

**Quando será executado:**
- ✅ Após PASSO 2 ser concluído com sucesso

**O que será feito:**
- Executar comando via CLI
- Registrar saída completa no relatório
- Verificar se contém "Database schema is up to date!"
- Marcar como OK ou ERRO conforme resultado

---

## ✅ PASSO 4: REDEPLOY BACKEND (MANUAL - VOCÊ FAZ)

**Status:** ⏳ **AGUARDANDO PASSO 3**

**Ação Necessária (após PASSO 3):**

1. Railway Dashboard → Projeto
2. Serviço **"SDR Advogados"** (Backend)
3. Aba **"Deployments"**
4. 3 pontinhos (⋮) → **"Redeploy"**
5. Aguardar 3-5 minutos

**Verificar Logs:**
- Railway → Backend → Deploy Logs
- Deve aparecer: `No pending migrations to apply.`
- Deve aparecer: `Server listening at http://0.0.0.0:3001`

**Após completar, informe:**
```
PASSO 4 concluído - Backend reiniciado
```

---

## ✅ PASSO 5: VALIDAÇÃO FUNCIONAL (MANUAL - VOCÊ FAZ)

**Status:** ⏳ **AGUARDANDO PASSO 4**

**Ação Necessária (após PASSO 4):**

### **5.1 Testar `/api/pipelines`**
- URL: `https://api.sdrjuridico.com.br/api/pipelines`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`
- **Informar:** Status HTTP retornado

### **5.2 Testar `/api/deals`**
- URL: `https://api.sdrjuridico.com.br/api/deals`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`
- **Informar:** Status HTTP retornado

**Após completar, informe:**
```
PASSO 5 concluído - /api/pipelines: [STATUS], /api/deals: [STATUS]
```

---

## 🚨 REGRAS DE EXECUÇÃO

**✅ FAZER:**
- ✅ Aguardar confirmações explícitas antes de executar comandos CLI
- ✅ Registrar todas as saídas no relatório
- ✅ Seguir ordem exata dos passos
- ✅ Validar cada passo antes de prosseguir

**❌ NÃO FAZER:**
- ❌ NÃO executar comandos CLI antes das confirmações
- ❌ NÃO pular etapas
- ❌ NÃO improvisar soluções
- ❌ NÃO alterar SQL ou migrations

---

## 📋 PRÓXIMAS AÇÕES

**AÇÃO IMEDIATA NECESSÁRIA:**

1. **Execute PASSO 0:**
   ```bash
   railway link
   ```
   **Informe:** "PASSO 0 concluído"

2. **Execute PASSO 1:**
   - SQL no Railway Dashboard
   **Informe:** "PASSO 1 concluído - SQL executado com sucesso"

**Após essas confirmações, os passos 2 e 3 serão executados automaticamente.**

---

**Status:** ⏳ **AGUARDANDO PASSO 0 E PASSO 1**
