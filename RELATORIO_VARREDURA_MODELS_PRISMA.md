# 📊 RELATÓRIO: VARREDURA COMPLETA DOS MODELS PRISMA

**Data:** 2026-01-27  
**Objetivo:** Identificar e documentar os models Pipeline, PipelineStage, Deal e CrmIntegration

---

## ✅ RESUMO EXECUTIVO

| Model | Existe no Schema? | Migration | Código TypeScript | Status |
|-------|-------------------|-----------|-------------------|--------|
| **Pipeline** | ✅ SIM | ✅ SIM | ✅ SIM | **COMPLETO** |
| **PipelineStage** | ✅ SIM | ✅ SIM | ✅ SIM | **COMPLETO** |
| **Deal** | ✅ SIM | ✅ SIM | ✅ SIM | **COMPLETO** |
| **CrmIntegration** | ✅ SIM | ✅ SIM | ✅ SIM | **COMPLETO** |

**Conclusão:** Todos os 4 models estão **completamente definidos** no schema, têm migrations correspondentes e são utilizados no código TypeScript.

---

## 1️⃣ MODEL: Pipeline

### **📍 Localização**
- **Arquivo:** `backend/prisma/schema.prisma`
- **Linhas:** 155-174

### **📋 Definição Completa**

```prisma
model Pipeline {
  id       String @id @default(uuid())
  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  name        String // "Black Friday", "Educacional", "Parceria", "Projetos"
  description String?
  isActive    Boolean @default(true)
  color       String? // Cor do pipeline

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  stages PipelineStage[]
  deals  Deal[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([isActive])
}
```

### **📊 Campos e Tipos**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id` | `String` | ✅ | `uuid()` | Primary Key |
| `tenantId` | `String` | ✅ | - | Foreign Key → Tenant.id |
| `name` | `String` | ✅ | - | Nome do pipeline |
| `description` | `String?` | ❌ | `null` | Descrição opcional |
| `isActive` | `Boolean` | ✅ | `true` | Status ativo/inativo |
| `color` | `String?` | ❌ | `null` | Cor do pipeline |
| `createdAt` | `DateTime` | ✅ | `now()` | Data de criação |
| `updatedAt` | `DateTime` | ✅ | `updatedAt` | Data de atualização |

### **🔗 Relações (Foreign Keys)**

1. **Tenant** (Many-to-One)
   - Campo: `tenantId`
   - Relação: `tenant Tenant @relation(...)`
   - OnDelete: `CASCADE`
   - OnUpdate: `CASCADE`

2. **PipelineStage** (One-to-Many)
   - Campo: `stages PipelineStage[]`
   - Relação reversa: `pipeline Pipeline @relation(...)`

3. **Deal** (One-to-Many)
   - Campo: `deals Deal[]`
   - Relação reversa: `pipeline Pipeline @relation(...)`

### **📌 Índices e Constraints**

- ✅ **Unique:** `@@unique([tenantId, name])` - Não permite pipelines com mesmo nome no mesmo tenant
- ✅ **Index:** `@@index([tenantId])` - Otimiza buscas por tenant
- ✅ **Index:** `@@index([isActive])` - Otimiza filtros por status

### **🗺️ Mapeamento de Tabela**

- ❌ **NÃO há `@@map`** - Tabela no banco: `"Pipeline"` (exatamente como no model)

### **📁 Migration**

- **Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- **Linhas:** 2-13
- **Status:** ✅ Migration existe e cria a tabela corretamente

### **💻 Uso no Código TypeScript**

**Arquivos que utilizam:**
1. `backend/src/api/pipelines/routes.ts` (810 linhas)
   - `prisma.pipeline.findMany()` - Listar pipelines
   - `prisma.pipeline.findFirst()` - Buscar pipeline
   - `prisma.pipeline.create()` - Criar pipeline
   - `prisma.pipeline.update()` - Atualizar pipeline
   - `prisma.pipeline.delete()` - Deletar pipeline

**Endpoints relacionados:**
- `GET /api/pipelines` - Listar todos
- `POST /api/pipelines` - Criar
- `PATCH /api/pipelines/:id` - Atualizar
- `DELETE /api/pipelines/:id` - Deletar
- `GET /api/pipelines/:id/stats` - Estatísticas

---

## 2️⃣ MODEL: PipelineStage

### **📍 Localização**
- **Arquivo:** `backend/prisma/schema.prisma`
- **Linhas:** 176-195

### **📋 Definição Completa**

```prisma
model PipelineStage {
  id String @id @default(uuid())

  pipelineId String
  pipeline   Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  name  String // "LEAD MAPEADO", "CONTATO REALIZADO", etc.
  order Int // Ordem no funil
  color String? // Cor da etapa

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  deals   Deal[]
  history PipelineHistory[]

  @@unique([pipelineId, name])
  @@index([pipelineId])
  @@index([order])
}
```

### **📊 Campos e Tipos**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id` | `String` | ✅ | `uuid()` | Primary Key |
| `pipelineId` | `String` | ✅ | - | Foreign Key → Pipeline.id |
| `name` | `String` | ✅ | - | Nome da etapa |
| `order` | `Int` | ✅ | - | Ordem no funil |
| `color` | `String?` | ❌ | `null` | Cor da etapa |
| `createdAt` | `DateTime` | ✅ | `now()` | Data de criação |
| `updatedAt` | `DateTime` | ✅ | `updatedAt` | Data de atualização |

### **🔗 Relações (Foreign Keys)**

1. **Pipeline** (Many-to-One)
   - Campo: `pipelineId`
   - Relação: `pipeline Pipeline @relation(...)`
   - OnDelete: `CASCADE`
   - OnUpdate: `CASCADE`

2. **Deal** (One-to-Many)
   - Campo: `deals Deal[]`
   - Relação reversa: `stage PipelineStage @relation(...)`

3. **PipelineHistory** (One-to-Many)
   - Campo: `history PipelineHistory[]`
   - Relação reversa: `PipelineStage PipelineStage? @relation(...)`

### **📌 Índices e Constraints**

- ✅ **Unique:** `@@unique([pipelineId, name])` - Não permite etapas com mesmo nome no mesmo pipeline
- ✅ **Index:** `@@index([pipelineId])` - Otimiza buscas por pipeline
- ✅ **Index:** `@@index([order])` - Otimiza ordenação

### **🗺️ Mapeamento de Tabela**

- ❌ **NÃO há `@@map`** - Tabela no banco: `"PipelineStage"` (exatamente como no model)

### **📁 Migration**

- **Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- **Linhas:** 15-26
- **Status:** ✅ Migration existe e cria a tabela corretamente

### **💻 Uso no Código TypeScript**

**Arquivos que utilizam:**
1. `backend/src/api/pipelines/routes.ts`
   - `prisma.pipelineStage.findFirst()` - Buscar última etapa
   - `prisma.pipelineStage.create()` - Criar etapa
   - Acessado via `pipeline.stages` (include)

**Endpoints relacionados:**
- `POST /api/pipelines/:id/stages` - Criar etapa

---

## 3️⃣ MODEL: Deal

### **📍 Localização**
- **Arquivo:** `backend/prisma/schema.prisma`
- **Linhas:** 197-234

### **📋 Definição Completa**

```prisma
model Deal {
  id String @id @default(uuid())

  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  pipelineId String
  pipeline   Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)

  stageId String
  stage   PipelineStage @relation(fields: [stageId], references: [id])

  leadId String?
  lead   Lead?   @relation(fields: [leadId], references: [id], onDelete: SetNull)

  title    String // Título do negócio
  value    Float? // Valor do negócio
  currency String @default("BRL") // BRL, USD, EUR

  // Dados do CRM externo (para sincronização)
  crmId   String? // ID no CRM externo (Pipedrive, Advbox, etc.)
  crmType String? // "pipedrive", "advbox", "hubspot", etc.
  crmData Json? // Dados adicionais do CRM

  assignedTo String? // userId
  notes      String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  history PipelineHistory[]

  @@index([tenantId])
  @@index([pipelineId])
  @@index([stageId])
  @@index([leadId])
  @@index([crmId, crmType])
}
```

### **📊 Campos e Tipos**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id` | `String` | ✅ | `uuid()` | Primary Key |
| `tenantId` | `String` | ✅ | - | Foreign Key → Tenant.id |
| `pipelineId` | `String` | ✅ | - | Foreign Key → Pipeline.id |
| `stageId` | `String` | ✅ | - | Foreign Key → PipelineStage.id |
| `leadId` | `String?` | ❌ | `null` | Foreign Key → Lead.id |
| `title` | `String` | ✅ | - | Título do negócio |
| `value` | `Float?` | ❌ | `null` | Valor do negócio |
| `currency` | `String` | ✅ | `"BRL"` | Moeda (BRL, USD, EUR) |
| `crmId` | `String?` | ❌ | `null` | ID no CRM externo |
| `crmType` | `String?` | ❌ | `null` | Tipo de CRM |
| `crmData` | `Json?` | ❌ | `null` | Dados adicionais do CRM |
| `assignedTo` | `String?` | ❌ | `null` | userId do responsável |
| `notes` | `String?` | ❌ | `null` | Notas (TEXT) |
| `createdAt` | `DateTime` | ✅ | `now()` | Data de criação |
| `updatedAt` | `DateTime` | ✅ | `updatedAt` | Data de atualização |

### **🔗 Relações (Foreign Keys)**

1. **Tenant** (Many-to-One)
   - Campo: `tenantId`
   - Relação: `tenant Tenant @relation(...)`
   - OnDelete: `CASCADE`
   - OnUpdate: `CASCADE`

2. **Pipeline** (Many-to-One)
   - Campo: `pipelineId`
   - Relação: `pipeline Pipeline @relation(...)`
   - OnDelete: `CASCADE`
   - OnUpdate: `CASCADE`

3. **PipelineStage** (Many-to-One)
   - Campo: `stageId`
   - Relação: `stage PipelineStage @relation(...)`
   - OnDelete: `RESTRICT` (não permite deletar se houver deals)
   - OnUpdate: `CASCADE`

4. **Lead** (Many-to-One, Opcional)
   - Campo: `leadId`
   - Relação: `lead Lead? @relation(...)`
   - OnDelete: `SET NULL`
   - OnUpdate: `CASCADE`

5. **PipelineHistory** (One-to-Many)
   - Campo: `history PipelineHistory[]`
   - Relação reversa: `deal Deal? @relation(...)`

### **📌 Índices e Constraints**

- ✅ **Index:** `@@index([tenantId])` - Otimiza buscas por tenant
- ✅ **Index:** `@@index([pipelineId])` - Otimiza buscas por pipeline
- ✅ **Index:** `@@index([stageId])` - Otimiza buscas por etapa
- ✅ **Index:** `@@index([leadId])` - Otimiza buscas por lead
- ✅ **Index:** `@@index([crmId, crmType])` - Otimiza sincronização com CRM

### **🗺️ Mapeamento de Tabela**

- ❌ **NÃO há `@@map`** - Tabela no banco: `"Deal"` (exatamente como no model)

### **📁 Migration**

- **Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- **Linhas:** 28-47
- **Status:** ✅ Migration existe e cria a tabela corretamente

### **💻 Uso no Código TypeScript**

**Arquivos que utilizam:**
1. `backend/src/api/pipelines/routes.ts`
   - `prisma.deal.findMany()` - Listar deals
   - `prisma.deal.findFirst()` - Buscar deal
   - `prisma.deal.create()` - Criar deal
   - `prisma.deal.update()` - Atualizar deal
   - `prisma.deal.delete()` - Deletar deal

**Endpoints relacionados:**
- `GET /api/pipelines/:id/deals` - Listar deals de um pipeline
- `POST /api/deals` - Criar deal
- `PATCH /api/deals/:id/stage` - Mover deal entre etapas
- `PATCH /api/deals/:id` - Atualizar deal
- `DELETE /api/deals/:id` - Deletar deal

---

## 4️⃣ MODEL: CrmIntegration

### **📍 Localização**
- **Arquivo:** `backend/prisma/schema.prisma`
- **Linhas:** 264-296

### **📋 Definição Completa**

```prisma
model CrmIntegration {
  id String @id @default(uuid())

  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  type     String // "pipedrive", "advbox", "hubspot", "salesforce", "zoho", etc.
  name     String // Nome da integração
  isActive Boolean @default(true)

  // Credenciais (criptografadas)
  apiKey      String? // API Key ou Token
  apiSecret   String? // API Secret (se necessário)
  apiUrl      String? // URL base da API
  workspaceId String? // ID do workspace no CRM

  // Configurações
  syncDirection String  @default("bidirectional") // "bidirectional", "to_crm", "from_crm"
  autoSync      Boolean @default(true)
  syncInterval  Int     @default(3600) // Segundos

  // Mapeamento de campos
  fieldMapping Json? // Mapeamento de campos entre sistemas

  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  lastSyncAt DateTime?

  @@unique([tenantId, type, workspaceId])
  @@index([tenantId])
  @@index([type])
  @@index([isActive])
}
```

### **📊 Campos e Tipos**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `id` | `String` | ✅ | `uuid()` | Primary Key |
| `tenantId` | `String` | ✅ | - | Foreign Key → Tenant.id |
| `type` | `String` | ✅ | - | Tipo de CRM |
| `name` | `String` | ✅ | - | Nome da integração |
| `isActive` | `Boolean` | ✅ | `true` | Status ativo/inativo |
| `apiKey` | `String?` | ❌ | `null` | API Key ou Token |
| `apiSecret` | `String?` | ❌ | `null` | API Secret |
| `apiUrl` | `String?` | ❌ | `null` | URL base da API |
| `workspaceId` | `String?` | ❌ | `null` | ID do workspace |
| `syncDirection` | `String` | ✅ | `"bidirectional"` | Direção de sincronização |
| `autoSync` | `Boolean` | ✅ | `true` | Sincronização automática |
| `syncInterval` | `Int` | ✅ | `3600` | Intervalo em segundos |
| `fieldMapping` | `Json?` | ❌ | `null` | Mapeamento de campos |
| `createdAt` | `DateTime` | ✅ | `now()` | Data de criação |
| `updatedAt` | `DateTime` | ✅ | `updatedAt` | Data de atualização |
| `lastSyncAt` | `DateTime?` | ❌ | `null` | Última sincronização |

### **🔗 Relações (Foreign Keys)**

1. **Tenant** (Many-to-One)
   - Campo: `tenantId`
   - Relação: `tenant Tenant @relation(...)`
   - OnDelete: `CASCADE`
   - OnUpdate: `CASCADE`

### **📌 Índices e Constraints**

- ✅ **Unique:** `@@unique([tenantId, type, workspaceId])` - Não permite integrações duplicadas
- ✅ **Index:** `@@index([tenantId])` - Otimiza buscas por tenant
- ✅ **Index:** `@@index([type])` - Otimiza buscas por tipo
- ✅ **Index:** `@@index([isActive])` - Otimiza filtros por status

### **🗺️ Mapeamento de Tabela**

- ❌ **NÃO há `@@map`** - Tabela no banco: `"CrmIntegration"` (exatamente como no model)

### **📁 Migration**

- **Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- **Linhas:** 49-69
- **Status:** ✅ Migration existe e cria a tabela corretamente

### **💻 Uso no Código TypeScript**

**Arquivos que utilizam:**
1. `backend/src/api/crm/routes.ts`
   - `prisma.crmIntegration.findMany()` - Listar integrações
   - `prisma.crmIntegration.findFirst()` - Buscar integração
   - `prisma.crmIntegration.create()` - Criar integração
   - `prisma.crmIntegration.update()` - Atualizar integração
   - `prisma.crmIntegration.delete()` - Deletar integração

**Endpoints relacionados:**
- `GET /api/crm/integrations` - Listar todas
- `POST /api/crm/integrations` - Criar
- `PATCH /api/crm/integrations/:id` - Atualizar
- `DELETE /api/crm/integrations/:id` - Deletar
- `POST /api/crm/integrations/:id/sync` - Sincronizar

---

## 📋 REFERÊNCIAS EM MIGRATIONS

### **Migration Principal:**
- **Arquivo:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
- **Status:** ✅ Existe e está completa
- **Conteúdo:**
  - Cria tabelas: `Pipeline`, `PipelineStage`, `Deal`, `CrmIntegration`
  - Cria índices para todas as tabelas
  - Cria foreign keys
  - Modifica `PipelineHistory` (adiciona `dealId` e `pipelineStageId`)

---

## 📋 REFERÊNCIAS EM CÓDIGO TYPESCRIPT

### **Arquivos Principais:**

1. **`backend/src/api/pipelines/routes.ts`** (810 linhas)
   - Rotas completas para Pipeline, PipelineStage e Deal
   - CRUD completo
   - Estatísticas de conversão

2. **`backend/src/api/crm/routes.ts`**
   - Rotas completas para CrmIntegration
   - CRUD completo
   - Sincronização com CRM externo

3. **`backend/src/server.ts`**
   - Registra rotas: `registerPipelineRoutes()` e `registerCrmRoutes()`

---

## ✅ CONCLUSÃO FINAL

### **Status Geral:**
- ✅ **Todos os 4 models existem** no schema Prisma
- ✅ **Todos têm migrations** correspondentes
- ✅ **Todos são utilizados** no código TypeScript
- ✅ **Todos têm rotas API** implementadas
- ✅ **Nenhum model está faltando**

### **Próximos Passos:**
1. ✅ Executar migration `20250120000000_add_pipelines_and_deals` no banco
2. ✅ Verificar se tabelas foram criadas corretamente
3. ✅ Testar endpoints `/api/pipelines` e `/api/crm/integrations`

---

**Status:** ✅ **VARREDURA COMPLETA - TODOS OS MODELS ENCONTRADOS E DOCUMENTADOS**
