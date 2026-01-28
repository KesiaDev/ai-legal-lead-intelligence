# 🎯 EXECUÇÃO FINAL: CORREÇÃO DE MIGRATIONS PRISMA

**Data:** 2026-01-27  
**Status:** 🔴 **EXECUTAR AGORA - Ordem obrigatória**

---

## ✅ ETAPA 1: CONFIRMAÇÃO FINAL

### **1.1 Verificar Migration no Repositório**

**Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`

**✅ CONFIRMADO:**
- ✅ Migration existe no repositório
- ✅ Localização correta: `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/`
- ✅ Arquivo `migration.sql` presente

### **1.2 Confirmar Tabelas que a Migration Cria**

**✅ CONFIRMADO - Migration cria:**

1. ✅ **`Pipeline`** - Tabela principal de pipelines
   - Campos: `id`, `tenantId`, `name`, `description`, `isActive`, `color`, `createdAt`, `updatedAt`
   - Primary Key: `id`
   - Foreign Key: `tenantId` → `Tenant.id`

2. ✅ **`PipelineStage`** - Estágios dos pipelines
   - Campos: `id`, `pipelineId`, `name`, `order`, `color`, `createdAt`, `updatedAt`
   - Primary Key: `id`
   - Foreign Key: `pipelineId` → `Pipeline.id`

3. ✅ **`Deal`** - Negócios/deals
   - Campos: `id`, `tenantId`, `pipelineId`, `stageId`, `leadId`, `title`, `value`, `currency`, `crmId`, `crmType`, `crmData`, `assignedTo`, `notes`, `createdAt`, `updatedAt`
   - Primary Key: `id`
   - Foreign Keys: `tenantId` → `Tenant.id`, `pipelineId` → `Pipeline.id`, `stageId` → `PipelineStage.id`, `leadId` → `Lead.id`

4. ✅ **`CrmIntegration`** - Integrações com CRM
   - Campos: `id`, `tenantId`, `type`, `name`, `isActive`, `apiKey`, `apiSecret`, `apiUrl`, `workspaceId`, `syncDirection`, `autoSync`, `syncInterval`, `fieldMapping`, `createdAt`, `updatedAt`, `lastSyncAt`
   - Primary Key: `id`
   - Foreign Key: `tenantId` → `Tenant.id`

5. ✅ **Modificação em `PipelineHistory`**
   - Adiciona coluna: `dealId` (TEXT)
   - Adiciona coluna: `pipelineStageId` (TEXT)
   - Foreign Keys: `dealId` → `Deal.id`, `pipelineStageId` → `PipelineStage.id`

### **1.3 Validação Final**

**✅ Status:**
- ✅ Migration existe e está correta
- ✅ SQL cria todas as tabelas necessárias
- ✅ SQL cria índices corretamente
- ✅ SQL cria foreign keys corretamente
- ✅ SQL modifica `PipelineHistory` corretamente
- ✅ Arquivo NÃO foi modificado

---

## ✅ ETAPA 2: EXECUÇÃO MANUAL DO SQL (OBRIGATÓRIA)

### **2.1 Abrir Arquivo SQL**

**Arquivo:** `SQL_MIGRATION_PIPELINES_DEALS.sql`

**✅ CONFIRMADO:**
- ✅ Arquivo existe no repositório
- ✅ Conteúdo idêntico ao `migration.sql` original
- ✅ SQL completo e válido
- ✅ Pronto para copiar e colar

### **2.2 Instruções para Execução no Railway**

**PASSO A PASSO:**

**1. Acessar Railway Dashboard:**
- Abrir: https://railway.app
- Fazer login
- Navegar para o projeto
- Selecionar serviço **"Postgres"** (Service ID: `e710ae21`)

**2. Abrir Query Editor:**
- Clicar na aba **"Database"** (no topo)
- Clicar na sub-aba **"Query"** (ou "Data" → "Query")
- Um editor SQL será aberto

**3. Copiar SQL:**
- Abrir arquivo `SQL_MIGRATION_PIPELINES_DEALS.sql` neste repositório
- Selecionar TODO o conteúdo (Ctrl + A)
- Copiar (Ctrl + C)

**4. Colar no Railway:**
- No Query Editor do Railway
- Colar o SQL copiado (Ctrl + V)
- Verificar que todo o SQL foi colado corretamente

**5. Executar SQL:**
- Clicar no botão **"Run"** (ou pressionar `Ctrl + Enter`)
- Aguardar execução (pode levar alguns segundos)

### **2.3 Critério de Sucesso**

**✅ Verificar Resultado:**

**1. Mensagem de Sucesso:**
- Deve aparecer: "Query executed successfully" ou similar
- Nenhum erro SQL deve aparecer

**2. Confirmar Tabelas Criadas:**
- Railway → Postgres → Database → Data
- Verificar se as seguintes tabelas aparecem na lista:
  - ✅ `Pipeline`
  - ✅ `PipelineStage`
  - ✅ `Deal`
  - ✅ `CrmIntegration`

**3. Verificar Modificação em PipelineHistory:**
- Railway → Postgres → Database → Data
- Abrir tabela `PipelineHistory`
- Verificar se tem colunas:
  - ✅ `dealId` (TEXT)
  - ✅ `pipelineStageId` (TEXT)

**❌ Se Houver Erro:**
- Verificar se tabela `Tenant` existe (foreign key depende)
- Verificar se tabela `Lead` existe (foreign key depende)
- Verificar se tabela `PipelineHistory` existe (ALTER TABLE depende)
- Verificar logs do Postgres para erro específico
- Tentar executar SQL novamente

---

## ✅ ETAPA 3: ALINHAR HISTÓRICO DO PRISMA

### **3.1 ⚠️ IMPORTANTE: NÃO usar INSERT manual**

**Regra Absoluta:**
- ❌ NÃO fazer INSERT manual em `_prisma_migrations`
- ✅ Usar exclusivamente o comando Prisma oficial

### **3.2 Executar Comando Prisma**

**Comando Obrigatório:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**Pré-requisitos:**
- Railway CLI instalado: `npm i -g @railway/cli`
- Autenticado: `railway login`
- No diretório do projeto (ou especificar projeto)

**Execução:**
1. Abrir terminal/PowerShell
2. Navegar para diretório do projeto (se necessário)
3. Executar o comando acima
4. Aguardar conclusão

**O que este comando faz:**
- ✅ Marca a migration como aplicada em `_prisma_migrations`
- ✅ Insere registro com checksum correto automaticamente
- ✅ Não executa SQL (já foi executado manualmente)
- ✅ Sincroniza estado do Prisma com banco

### **3.3 Verificar se Funcionou**

**Ação:**
1. Railway → Postgres → Database → Data
2. Abrir tabela `_prisma_migrations`
3. Verificar se há registro com:
   - ✅ `migration_name`: `20250120000000_add_pipelines_and_deals`
   - ✅ `finished_at`: não nulo (timestamp)
   - ✅ `applied_steps_count`: 1
   - ✅ `started_at`: não nulo (timestamp)
   - ✅ `checksum`: não nulo (string)

**Se o registro não aparecer:**
- Verificar se o comando foi executado corretamente
- Verificar logs do Railway CLI
- Tentar executar novamente

---

## ✅ ETAPA 4: VALIDAR ESTADO FINAL

### **4.1 Executar `prisma migrate status`**

**Comando:**
```bash
railway run --service backend npx prisma migrate status
```

**Resultado Esperado:**
```
Database schema is up to date! All migrations have been applied.
```

**OU:**
```
Migration status:
- 20260116170000_init_super_sdr_juridico: Applied
- 20250120000000_add_pipelines_and_deals: Applied
- 20250123000000_add_agent_prompts: Applied
- 20250123000001_add_voice_config: Applied
- 20250124000000_add_integration_config: Applied
- 20250125000000_add_agent_config: Applied
```

**❌ Se mostrar "pending migrations":**
- Verificar se `prisma migrate resolve` foi executado corretamente
- Verificar se registro existe em `_prisma_migrations`
- Verificar se `finished_at` não é nulo
- Tentar executar `prisma migrate resolve` novamente

### **4.2 Confirmar no Banco**

**Railway → Postgres → Database → Data:**

**Verificar Tabelas:**
- ✅ `Pipeline` existe
- ✅ `PipelineStage` existe
- ✅ `Deal` existe
- ✅ `CrmIntegration` existe
- ✅ `PipelineHistory` tem colunas `dealId` e `pipelineStageId`

**Verificar `_prisma_migrations`:**
- ✅ Tabela não está vazia
- ✅ Há registro para `20250120000000_add_pipelines_and_deals`
- ✅ `finished_at` não é nulo
- ✅ `applied_steps_count` é 1

---

## ✅ ETAPA 5: RESTART CONTROLADO

### **5.1 Reiniciar Backend no Railway**

**Ação:**
1. Railway Dashboard → Projeto
2. Selecionar serviço **"SDR Advogados"** (Backend)
3. Aba **"Deployments"**
4. Clicar nos **3 pontinhos (⋮)** do último deployment
5. Selecionar **"Redeploy"**
6. Aguardar deploy completar (3-5 minutos)

**Por quê:**
- Backend precisa recarregar Prisma Client
- Prisma Client precisa reconhecer novas tabelas
- Rotas que dependem de `Pipeline`/`Deal` precisam funcionar

### **5.2 Verificar Logs Durante Startup**

**Railway → Backend → Deploy Logs:**

**Logs Esperados (em ordem):**
1. ✅ `Starting Container`
2. ✅ `Environment variables loaded from .env`
3. ✅ `Prisma schema loaded from prisma/schema.prisma`
4. ✅ `Datasource "db": PostgreSQL database "railway", schema "public" at "postgres.railway.internal:5432"`
5. ✅ `6 migrations found in prisma/migrations`
6. ✅ `No pending migrations to apply.`
7. ✅ `✓ Generated Prisma Client (v5.22.0)`
8. ✅ `Server listening at http://0.0.0.0:3001`

**❌ Logs que NÃO devem aparecer:**
- ❌ `ERROR: relation "public.Pipeline" does not exist`
- ❌ `Migration ... failed`
- ❌ `Could not connect to database`

**Se aparecer erro:**
- Verificar se SQL foi executado corretamente
- Verificar se tabelas existem no banco
- Verificar se `prisma migrate resolve` foi executado

---

## ✅ ETAPA 6: VALIDAÇÃO FUNCIONAL

### **6.1 Testar Endpoint `/api/pipelines`**

**Método 1: Via Browser/Postman**
- URL: `https://api.sdrjuridico.com.br/api/pipelines`
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`

**Resultado Esperado:**
- Status: `200 OK`
- Body: `[]` (array vazio, se não houver pipelines)
- NÃO deve retornar: `500 Internal Server Error`

**Método 2: Via Frontend**
- Acessar aplicação
- Navegar para seção de Pipelines
- Não deve aparecer erro 500

### **6.2 Testar Endpoint `/api/deals`**

**Método 1: Via Browser/Postman**
- URL: `https://api.sdrjuridico.com.br/api/deals` (ou endpoint correto)
- Headers: `Authorization: Bearer {seu_token}`
- Método: `GET`

**Resultado Esperado:**
- Status: `200 OK` ou `404 Not Found` (se endpoint não existir)
- NÃO deve retornar: `500 Internal Server Error`
- NÃO deve aparecer: `relation "public.Deal" does not exist`

### **6.3 Confirmar Ausência de Erros Estruturais**

**Verificar:**
- ✅ Endpoints não retornam erro 500 por tabelas faltando
- ✅ Logs do backend não mostram erros de tabela
- ✅ Prisma Client reconhece todas as tabelas
- ✅ Aplicação funciona normalmente

---

## 📋 CHECKLIST DE EXECUÇÃO FINAL

Execute nesta ordem exata:

- [ ] **ETAPA 1:** Migration confirmada no repositório
- [ ] **ETAPA 1:** Tabelas que serão criadas confirmadas
- [ ] **ETAPA 2.1:** Arquivo `SQL_MIGRATION_PIPELINES_DEALS.sql` aberto
- [ ] **ETAPA 2.2:** SQL copiado completamente
- [ ] **ETAPA 2.2:** SQL colado no Query Editor do Railway
- [ ] **ETAPA 2.2:** SQL executado com sucesso
- [ ] **ETAPA 2.3:** Tabelas `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration` confirmadas
- [ ] **ETAPA 2.3:** Colunas `dealId` e `pipelineStageId` em `PipelineHistory` confirmadas
- [ ] **ETAPA 3.2:** Comando `prisma migrate resolve --applied` executado
- [ ] **ETAPA 3.3:** Registro confirmado em `_prisma_migrations`
- [ ] **ETAPA 4.1:** `prisma migrate status` retorna "Database schema is up to date"
- [ ] **ETAPA 4.2:** Tabelas e `_prisma_migrations` confirmadas no banco
- [ ] **ETAPA 5.1:** Backend reiniciado (redeploy)
- [ ] **ETAPA 5.2:** Logs mostram "No pending migrations to apply" e "Server listening"
- [ ] **ETAPA 6.1:** Endpoint `/api/pipelines` retorna `200 OK`
- [ ] **ETAPA 6.2:** Endpoint `/api/deals` não retorna erro 500
- [ ] **ETAPA 6.3:** Nenhum erro estrutural confirmado

---

## 🚨 REGRAS ABSOLUTAS

**✅ FAZER:**
- ✅ Executar SQL exatamente como está no arquivo
- ✅ Usar `prisma migrate resolve --applied` para marcar migration
- ✅ Validar estado após cada etapa
- ✅ Reiniciar backend após correção
- ✅ Testar endpoints após restart

**❌ NÃO FAZER:**
- ❌ NÃO usar `prisma migrate dev`
- ❌ NÃO apagar `_prisma_migrations`
- ❌ NÃO recriar o banco
- ❌ NÃO fazer INSERT manual em `_prisma_migrations`
- ❌ NÃO modificar o SQL da migration
- ❌ NÃO pular etapas
- ❌ NÃO improvisar soluções alternativas

---

## 📊 RESUMO EXECUTIVO

**Problema:**
- Banco tem tabelas parciais
- `_prisma_migrations` vazia
- Prisma diz "No pending migrations"
- Tabelas `Pipeline` e `Deal` não existem

**Solução:**
1. Executar SQL da migration manualmente no Railway
2. Marcar migration como aplicada via `prisma migrate resolve --applied`
3. Validar estado final
4. Reiniciar backend
5. Testar endpoints

**Resultado Esperado:**
- ✅ Banco alinhado com Prisma
- ✅ Migrations corretamente registradas
- ✅ SDR estável e operacional
- ✅ Sem erros 500 estruturais

---

## 🎯 COMANDOS ESSENCIAIS

```bash
# 1. Marcar migration como aplicada
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals

# 2. Verificar status
railway run --service backend npx prisma migrate status
```

---

**Status:** ✅ **Pronto para execução - Seguir etapas na ordem exata**
