# 🔧 EXECUÇÃO: CORREÇÃO DEFINITIVA DE MIGRATIONS PRISMA

**Data:** 2026-01-27  
**Status:** 🔴 **CRÍTICO - Executar agora**

---

## ✅ ETAPA 1: CONFIRMAR MIGRATION ALVO

### **Migration Identificada:**
- ✅ **Nome:** `20250120000000_add_pipelines_and_deals`
- ✅ **Localização:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- ✅ **Status:** Existe no repositório

### **Tabelas que Esta Migration Cria:**

1. ✅ **`Pipeline`** - Tabela principal de pipelines
2. ✅ **`PipelineStage`** - Estágios dos pipelines
3. ✅ **`Deal`** - Negócios/deals
4. ✅ **`CrmIntegration`** - Integrações com CRM

### **Modificações em Tabelas Existentes:**

- ✅ **`PipelineHistory`** - Adiciona colunas:
  - `dealId` (TEXT)
  - `pipelineStageId` (TEXT)

### **Confirmação:**
- ✅ Migration existe e está correta
- ✅ SQL cria todas as tabelas necessárias
- ✅ SQL cria índices e foreign keys corretamente

---

## ✅ ETAPA 2: PREPARAR EXECUÇÃO MANUAL DO SQL

### **Arquivo Preparado:**
- ✅ **Arquivo:** `SQL_MIGRATION_PIPELINES_DEALS.sql`
- ✅ **Conteúdo:** Idêntico ao `migration.sql` original
- ✅ **Status:** Pronto para execução

### **Validação do SQL:**
- ✅ SQL completo e válido
- ✅ Não foi modificado
- ✅ Pronto para copiar e colar

### **Instruções para Execução no Railway:**

**1. Acessar Railway Dashboard:**
- Abrir: https://railway.app
- Fazer login
- Navegar para o projeto
- Selecionar serviço **"Postgres"** (Service ID: `e710ae21`)

**2. Abrir Query Editor:**
- Clicar na aba **"Database"** (no topo)
- Clicar na sub-aba **"Query"** (ou "Data" → "Query")
- Um editor SQL será aberto

**3. Preparar SQL:**
- Abrir arquivo `SQL_MIGRATION_PIPELINES_DEALS.sql` neste repositório
- Selecionar TODO o conteúdo (Ctrl + A)
- Copiar (Ctrl + C)

---

## ✅ ETAPA 3: EXECUÇÃO MANUAL (GUIADA)

### **Passo 3.1: Colar SQL no Railway**

**Ação:**
1. No Query Editor do Railway (Postgres → Database → Query)
2. Colar o SQL copiado (Ctrl + V)
3. Verificar que todo o SQL foi colado corretamente

### **Passo 3.2: Executar SQL**

**Ação:**
1. Clicar no botão **"Run"** (ou pressionar `Ctrl + Enter`)
2. Aguardar execução (pode levar alguns segundos)

### **Passo 3.3: Verificar Resultado**

**Resultado Esperado:**
- ✅ Mensagem de sucesso (ex: "Query executed successfully")
- ✅ Nenhum erro SQL

**Se Houver Erro:**
- Verificar se tabela `Tenant` existe (foreign key depende)
- Verificar se tabela `Lead` existe (foreign key depende)
- Verificar se tabela `PipelineHistory` existe (ALTER TABLE depende)

### **Passo 3.4: Confirmar Tabelas Criadas**

**Ação:**
1. Railway → Postgres → Database → Data
2. Verificar se as seguintes tabelas aparecem na lista:
   - ✅ `Pipeline`
   - ✅ `PipelineStage`
   - ✅ `Deal`
   - ✅ `CrmIntegration`

**Se as tabelas não aparecerem:**
- Verificar se houve erro na execução
- Verificar logs do Postgres
- Tentar executar SQL novamente

---

## ✅ ETAPA 4: MARCAR MIGRATION COMO APLICADA (MÉTODO OFICIAL)

### **⚠️ IMPORTANTE: NÃO usar INSERT manual em `_prisma_migrations`**

### **Comando Correto do Prisma:**

**Via Railway CLI (Recomendado):**

**Pré-requisito:**
- Ter Railway CLI instalado: `npm i -g @railway/cli`
- Estar autenticado: `railway login`
- Estar no diretório do projeto ou especificar projeto

**Comando:**
```bash
railway run --service backend npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals
```

**O que este comando faz:**
- ✅ Marca a migration como aplicada em `_prisma_migrations`
- ✅ Insere registro com checksum correto automaticamente
- ✅ Não executa SQL (já foi executado manualmente)
- ✅ Sincroniza estado do Prisma com banco

**Execução:**
1. Abrir terminal
2. Navegar para o diretório do projeto (se necessário)
3. Executar o comando acima
4. Aguardar conclusão

### **Verificar se Funcionou:**

**Ação:**
1. Railway → Postgres → Database → Data
2. Abrir tabela `_prisma_migrations`
3. Verificar se há registro com:
   - ✅ `migration_name`: `20250120000000_add_pipelines_and_deals`
   - ✅ `finished_at`: não nulo (timestamp)
   - ✅ `applied_steps_count`: 1
   - ✅ `started_at`: não nulo (timestamp)

**Se o registro não aparecer:**
- Verificar se o comando foi executado corretamente
- Verificar logs do Railway CLI
- Tentar executar novamente

---

## ✅ ETAPA 5: VALIDAR ESTADO FINAL DO PRISMA

### **Passo 5.1: Executar `prisma migrate status`**

**Via Railway CLI:**
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

**Se mostrar "pending migrations":**
- Verificar se `prisma migrate resolve` foi executado corretamente
- Verificar se registro existe em `_prisma_migrations`
- Tentar executar `prisma migrate resolve` novamente

### **Passo 5.2: Confirmar no Banco**

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

## ✅ ETAPA 6: ORIENTAÇÃO FINAL DE EXECUÇÃO

### **Passo 6.1: Reiniciar Backend**

**Ação Necessária:**
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

### **Passo 6.2: Confirmar Funcionamento**

**Após reiniciar, verificar:**

**1. Logs do Backend:**
- Railway → Backend → Deploy Logs
- Não deve aparecer: `ERROR: relation "public.Pipeline" does not exist`
- Deve aparecer: `Server listening at http://0.0.0.0:3001`

**2. Endpoints:**
- Testar: `GET https://api.sdrjuridico.com.br/api/pipelines`
- Deve retornar `200 OK` (mesmo que array vazio)
- Não deve retornar `500 Internal Server Error`

**3. Prisma Migrate Deploy:**
- Próximo deploy deve mostrar: `No pending migrations to apply.`
- Mas agora com `_prisma_migrations` populado corretamente

### **Passo 6.3: Estado Final Esperado**

**Banco:**
- ✅ Todas as tabelas do schema existem
- ✅ `_prisma_migrations` contém todas as migrations aplicadas
- ✅ Foreign keys e índices estão corretos

**Prisma:**
- ✅ `prisma migrate status` retorna "Database schema is up to date"
- ✅ `prisma migrate deploy` não tenta reaplicar migrations
- ✅ Prisma Client reconhece todas as tabelas

**Backend:**
- ✅ Não gera erro 500 por tabelas faltando
- ✅ Endpoints de pipelines funcionam
- ✅ Endpoints de deals funcionam

---

## 📋 CHECKLIST DE EXECUÇÃO

Execute nesta ordem exata:

- [ ] **ETAPA 1:** Migration `20250120000000_add_pipelines_and_deals` confirmada
- [ ] **ETAPA 2:** Arquivo `SQL_MIGRATION_PIPELINES_DEALS.sql` aberto e validado
- [ ] **ETAPA 3.1:** SQL copiado completamente
- [ ] **ETAPA 3.2:** SQL colado no Query Editor do Railway
- [ ] **ETAPA 3.3:** SQL executado com sucesso (sem erros)
- [ ] **ETAPA 3.4:** Tabelas `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration` confirmadas no banco
- [ ] **ETAPA 4:** Comando `prisma migrate resolve --applied` executado
- [ ] **ETAPA 4:** Registro confirmado em `_prisma_migrations`
- [ ] **ETAPA 5.1:** `prisma migrate status` retorna "Database schema is up to date"
- [ ] **ETAPA 5.2:** Tabelas e `_prisma_migrations` confirmadas no banco
- [ ] **ETAPA 6.1:** Backend reiniciado (redeploy)
- [ ] **ETAPA 6.2:** Logs do backend não mostram erros de tabela
- [ ] **ETAPA 6.2:** Endpoints testados e funcionando

---

## 🚨 REGRAS ABSOLUTAS

**✅ FAZER:**
- ✅ Executar SQL exatamente como está no arquivo
- ✅ Usar `prisma migrate resolve --applied` para marcar migration
- ✅ Validar estado após cada etapa
- ✅ Reiniciar backend após correção

**❌ NÃO FAZER:**
- ❌ NÃO usar `prisma migrate dev`
- ❌ NÃO apagar `_prisma_migrations`
- ❌ NÃO recriar o banco
- ❌ NÃO fazer INSERT manual em `_prisma_migrations`
- ❌ NÃO modificar o SQL da migration
- ❌ NÃO pular etapas
- ❌ NÃO executar SQL automaticamente (apenas guiar)

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

**Resultado Esperado:**
- ✅ Banco alinhado com Prisma
- ✅ Migrations corretamente registradas
- ✅ SDR operando sem erros estruturais

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
