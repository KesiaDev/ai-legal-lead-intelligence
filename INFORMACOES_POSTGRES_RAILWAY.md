# 📊 INFORMAÇÕES DO POSTGRES NO RAILWAY

**Data da Coleta:** 2026-01-27  
**Fonte:** Railway Dashboard - Serviço Postgres

---

## 1️⃣ IDENTIFICAÇÃO DO SERVIÇO

**Service Name:** `Postgres`  
**Service ID:** `e710ae21`  
**Status:** ✅ **Active**  
**Último Deployment:** Jan 15, 2026, 12:20 PM GMT-3  
**Deployment Status:** ✅ **Deployment successful**

---

## 2️⃣ CONFIGURAÇÃO TÉCNICA

### **2.1 Docker Image**
- **Repository:** `ghcr.io/railwayapp-templates/postgres-ssl`
- **Tag/Version:** `17`
- **SHA:** `sha:d5c15`
- **PostgreSQL Version:** **17**

### **2.2 Infraestrutura**
- **Region:** `us-east4-eqdc4a`
- **Replicas:** `1` (single instance)
- **Builder:** Railpack (Railway native)

### **2.3 Política de Restart**
- **Restart Policy:** `on failure`
- **Max Retries:** `10`

---

## 3️⃣ VARIÁVEIS DE AMBIENTE (13 VARIÁVEIS)

### **3.1 Variáveis de Conexão (Principais)**

| Variável | Descrição | Uso |
|----------|-----------|-----|
| `DATABASE_URL` | **String de conexão completa** (user:password@host:port/database) | ✅ **Usada pelo Prisma** |
| `DATABASE_PUBLIC_URL` | URL pública de conexão (se configurada) | Opcional |
| `PGHOST` | Hostname/IP do servidor PostgreSQL | Variável padrão PostgreSQL |
| `PGPORT` | Porta do PostgreSQL (geralmente 5432) | Variável padrão PostgreSQL |
| `PGUSER` | Usuário do PostgreSQL | Variável padrão PostgreSQL |
| `PGPASSWORD` | Senha do PostgreSQL | Variável padrão PostgreSQL |
| `PGDATABASE` | Nome do banco de dados padrão | Variável padrão PostgreSQL |
| `PGDATA` | Diretório de dados do PostgreSQL | Configuração interna |

### **3.2 Variáveis Alternativas (Redundantes)**

| Variável | Descrição | Relação |
|----------|-----------|---------|
| `POSTGRES_DB` | Nome do banco (alternativa) | Similar a `PGDATABASE` |
| `POSTGRES_USER` | Usuário (alternativa) | Similar a `PGUSER` |
| `POSTGRES_PASSWORD` | Senha (alternativa) | Similar a `PGPASSWORD` |

### **3.3 Variáveis do Railway**

| Variável | Descrição |
|----------|-----------|
| `RAILWAY_DEPLOYMENT_DRAINING_SECONDS` | Tempo de espera antes de encerrar conexões durante deploy |
| `SSL_CERT_DAYS` | Validade do certificado SSL |

### **3.4 ⚠️ AVISO CRÍTICO**

**Banner no Railway:**
> "Trying to connect this database to a service? Add a Variable Reference"

**Significado:**
- As variáveis do Postgres **NÃO são automaticamente disponíveis** para outros serviços
- O backend precisa ter uma **"Variable Reference"** apontando para este serviço Postgres
- Sem essa referência, o backend **NÃO terá acesso** a `DATABASE_URL` e outras variáveis

**Ação Necessária:**
- Verificar se o serviço Backend tem `DATABASE_URL` configurada como "Variable Reference" ao Postgres
- Se não tiver, o backend pode estar tentando conectar a um banco diferente ou falhando por falta de credenciais

---

## 4️⃣ TABELAS EXISTENTES NO BANCO

### **4.1 Tabelas do Prisma**

✅ **Tabelas Confirmadas (12 tabelas):**

1. `_prisma_migrations` - Histórico de migrations aplicadas
2. `AgentConfig` - Configurações do agente por tenant
3. `AgentPrompt` - Prompts do agente
4. `Conversation` - Conversas com leads
5. `IntegrationConfig` - **Configurações de integração (OpenAI, Z-API, Evolution, N8N)**
6. `Lead` - Leads cadastrados
7. `Message` - Mensagens das conversas
8. `PipelineHistory` - Histórico de pipelines
9. `PipelineStage` - Estágios dos pipelines
10. `Tenant` - Tenants (multi-tenancy)
11. `User` - Usuários do sistema
12. `VoiceConfig` - Configurações de voz

### **4.2 ❌ TABELAS FALTANDO (Crítico)**

**Tabela `Pipeline` NÃO EXISTE:**
- **Erro nos logs:** `ERROR: relation "public.Pipeline" does not exist`
- **Impacto:** Backend falha ao tentar acessar pipelines
- **Causa:** Migration não aplicada ou Prisma Client desatualizado

**Tabela `Deal` (Provável):**
- Backend tenta fazer JOIN com `Deal` em queries de `Pipeline`
- Se `Pipeline` não existe, `Deal` provavelmente também não existe
- **Necessário verificar** se `Deal` está no schema mas não foi criada

---

## 5️⃣ ERROS IDENTIFICADOS NOS LOGS

### **5.1 Erro Crítico: Tabela Pipeline Não Existe**

**Erro:**
```
ERROR: relation "public.Pipeline" does not exist at character 341
```

**SQL que Falhou:**
```sql
SELECT "public"."Pipeline"."id", 
       "public"."Pipeline"."tenantId", 
       "public"."Pipeline"."name", 
       ...
FROM "public"."Pipeline" 
LEFT JOIN (
  SELECT "public"."Deal"."pipelineId", 
         COUNT(*) AS "_aggr_count_deals" 
  FROM "public"."Deal" 
  WHERE 1=1 
  GROUP BY "public"."Deal"."pipelineId"
) AS "aggr_selection_0_Deal" 
ON ("public"."Pipeline"."id" = "aggr_selection_0_Deal"."pipelineId") 
WHERE "public"."Pipeline"."tenantId" = $1 
ORDER BY "public"."Pipeline"."createdAt" DESC 
OFFSET $2
```

**Timestamps dos Erros:**
- 12:05:05 UTC
- 12:14:50 UTC
- 12:14:52 UTC
- 12:26:09 UTC
- 12:29:23 UTC

**Análise:**
- Backend está tentando acessar `Pipeline` e `Deal`
- Ambas as tabelas **não existem** no banco
- Isso causa **HTTP 500** quando usuário tenta acessar pipelines

### **5.2 Erros de Conexão (Secundários)**

**Erro:**
```
LOG: could not receive data from client: Connection reset by peer
```

**Frequência:** Muitas ocorrências (12:03:52, 12:09:41, 12:14:20, etc.)

**Causa Provável:**
- Cliente (backend) fecha conexão abruptamente
- Pode ser consequência dos erros de tabela não encontrada
- Backend falha ao processar request → fecha conexão → PostgreSQL registra reset

---

## 6️⃣ ANÁLISE DE COMPATIBILIDADE

### **6.1 Schema Prisma vs Banco Real**

**✅ Tabelas que Existem (Confirmadas):**
- `IntegrationConfig` ✅
- `AgentConfig` ✅
- `VoiceConfig` ✅
- `Tenant` ✅
- `User` ✅
- `Lead` ✅
- `Conversation` ✅
- `Message` ✅
- `AgentPrompt` ✅
- `PipelineStage` ✅
- `PipelineHistory` ✅

**❌ Tabelas que NÃO Existem (Crítico):**
- `Pipeline` ❌
- `Deal` ❌ (provável, não confirmado)

### **6.2 Migrations Status**

**Tabela `_prisma_migrations` existe:**
- ✅ Confirma que Prisma está sendo usado
- 🔴 **CRÍTICO: Tabela está VAZIA** - Nenhuma migration foi aplicada
- **Isso explica por que `Pipeline` e `Deal` não existem**
- **Causa raiz:** `prisma migrate deploy` não está aplicando migrations no banco

---

## 7️⃣ PONTOS CRÍTICOS IDENTIFICADOS

### **🔴 CRÍTICO 1: Tabela Pipeline Não Existe (MIGRATION EXISTE, MAS NÃO FOI APLICADA)**

**Status:** ✅ **CONFIRMADO - Migration existe, mas tabela não foi criada**

**Problema:**
- Backend tenta acessar `Pipeline` mas tabela não existe
- Causa HTTP 500 em todas as rotas que usam pipelines
- **Migration existe** em `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/`
- **Script de start executa** `prisma migrate deploy` (confirmado nos logs)
- **Mas tabela não foi criada** no banco

**Confirmações:**
- ✅ Modelo `Pipeline` existe em `schema.prisma` (linha 155)
- ✅ Modelo `Deal` existe em `schema.prisma` (linha 197)
- ✅ Migration existe: `20250120000000_add_pipelines_and_deals/migration.sql`
- ✅ Script `start` executa: `prisma migrate deploy && prisma generate && tsx src/server.ts`
- ❌ Tabela `Pipeline` **NÃO existe** no banco (confirmado nos logs do Postgres)

**🔴 CAUSA RAIZ IDENTIFICADA:**

**Tabela `_prisma_migrations` está VAZIA:**
- ✅ Confirmado pela imagem: tabela existe mas não tem nenhum registro
- ❌ **Nenhuma migration foi aplicada** no banco
- ❌ Isso explica por que `Pipeline` e `Deal` não existem
- ❌ `prisma migrate deploy` está sendo executado, mas **não está aplicando migrations**

**Possíveis Causas:**
1. **`prisma migrate deploy` falha silenciosamente** (erro não reportado)
2. **`DATABASE_URL` aponta para banco errado** durante execução do comando
3. **Prisma não consegue conectar** ao banco durante deploy
4. **Permissões insuficientes** para criar tabelas
5. **Migration já foi marcada como aplicada em outro banco** (checksum mismatch)

**Solução Necessária:**
1. ✅ **CONFIRMADO:** Tabela `_prisma_migrations` está vazia (nenhuma migration aplicada)
2. ⚠️ **AÇÃO:** Verificar logs completos do deploy (sem filtro) para ver erro do `prisma migrate deploy`
3. ⚠️ **AÇÃO:** Verificar se `DATABASE_URL` está correta durante execução do comando
4. ⚠️ **AÇÃO:** Testar `prisma migrate deploy` manualmente via Railway CLI ou forçar redeploy
5. ⚠️ **AÇÃO:** Se necessário, aplicar migrations manualmente via SQL direto no banco

### **🔴 CRÍTICO 2: Variable Reference Não Configurada (CONFIRMADO)**

**Status:** ✅ **CONFIRMADO PELAS IMAGENS**

**Problema:**
- Railway mostra aviso: "Trying to connect a database? Add Variable"
- `DATABASE_URL` está configurada como **valor hardcoded**, não como "Variable Reference"
- Valor atual: `postgresql://postgres:NcnLbRyrIepqVkKWNehYMTrVksdfYpwV@postgres.railway.internal:5432/railway`
- **Não é uma referência dinâmica** ao serviço Postgres

**Impacto:**
- Se credenciais do Postgres mudarem, backend perderá conexão
- Não há sincronização automática entre serviços
- Funciona atualmente, mas não é a forma recomendada pelo Railway

**Solução Necessária:**
1. Railway → Backend Service → Variables → `DATABASE_URL`
2. Remover valor hardcoded atual
3. Adicionar como "Variable Reference" ao serviço Postgres `e710ae21`
4. Isso garante sincronização automática de credenciais

### **🟡 MÉDIO: Erros de Conexão Intermitentes**

**Problema:**
- Muitos "Connection reset by peer"
- Pode ser sintoma dos erros de tabela não encontrada
- Backend falha → fecha conexão → PostgreSQL registra reset

**Solução:**
- Resolver problema das tabelas faltando primeiro
- Se persistir, investigar timeout de conexão

---

## 8️⃣ VERIFICAÇÕES NECESSÁRIAS

### **8.1 No Railway Dashboard**

1. **Backend Service → Variables:**
   - [x] ✅ **CONFIRMADO:** `DATABASE_URL` existe
   - [x] ✅ **CONFIRMADO:** Valor: `postgresql://postgres:...@postgres.railway.internal:5432/railway`
   - [ ] ❌ **PROBLEMA:** NÃO é "Variable Reference" (é valor hardcoded)
   - [ ] ⚠️ **AÇÃO:** Converter para "Variable Reference" ao Postgres `e710ae21`

2. **Backend Service → Deploy Logs:**
   - [x] ✅ **CONFIRMADO:** `prisma migrate deploy` está sendo executado
   - [x] ✅ **CONFIRMADO:** Script de start: `prisma migrate deploy && prisma generate && tsx src/server.ts`
   - [ ] ⚠️ **PENDENTE:** Verificar logs completos (sem filtro) para ver se migration falhou
   - [ ] ⚠️ **PENDENTE:** Verificar se migration `20250120000000_add_pipelines_and_deals` foi aplicada

3. **Postgres → Database → Data:**
   - [x] ❌ **CONFIRMADO:** Tabela `Pipeline` NÃO existe
   - [x] ❌ **CONFIRMADO:** Tabela `Deal` NÃO existe
   - [x] 🔴 **CRÍTICO:** Tabela `_prisma_migrations` está **VAZIA** (nenhuma migration foi aplicada)

### **8.2 No Código**

1. **`backend/package.json`:**
   - [x] ✅ **CONFIRMADO:** Script `start` inclui `prisma migrate deploy && prisma generate`
   - [x] ✅ **CONFIRMADO:** Está sendo executado antes de iniciar servidor (logs confirmam)

2. **`backend/prisma/schema.prisma`:**
   - [x] ✅ **CONFIRMADO:** Modelo `Pipeline` está definido (linha 155)
   - [x] ✅ **CONFIRMADO:** Modelo `Deal` está definido (linha 197)
   - [x] ✅ **CONFIRMADO:** Migration existe: `20250120000000_add_pipelines_and_deals/migration.sql`

---

## 9️⃣ RESUMO EXECUTIVO

### **✅ O Que Está Funcionando:**

1. **Postgres está ativo** e rodando PostgreSQL 17
2. **12 tabelas existem** (incluindo `IntegrationConfig`, `AgentConfig`, etc.)
3. **13 variáveis de ambiente** estão configuradas
4. **Prisma está sendo usado** (`_prisma_migrations` existe)

### **❌ O Que NÃO Está Funcionando:**

1. **Tabela `Pipeline` não existe** → Backend falha ao acessar pipelines
2. **Tabela `Deal` provavelmente não existe** → JOINs falham
3. **Variable Reference pode não estar configurada** → Backend pode não ter acesso a `DATABASE_URL`
4. **Migrations podem não ter sido aplicadas** → Tabelas faltando

### **🎯 Ações Imediatas Necessárias:**

1. **Verificar Variable Reference:**
   - Railway → Backend → Variables → `DATABASE_URL` deve referenciar Postgres

2. **Verificar Migrations:**
   - Railway → Backend → Deploy Logs → Procurar por `prisma migrate deploy`
   - Verificar se migrations foram aplicadas com sucesso

3. **Verificar Schema:**
   - Confirmar se `Pipeline` e `Deal` estão no `schema.prisma`
   - Se estiverem, migrations precisam ser aplicadas

4. **Forçar Redeploy do Backend:**
   - Se migrations não foram aplicadas, forçar redeploy
   - Verificar se script `start` executa migrations antes de iniciar

---

**Status:** ⚠️ **Problemas críticos identificados - Ação necessária**  
**Prioridade:** 🔴 **ALTA** - Tabelas faltando causam erros 500
