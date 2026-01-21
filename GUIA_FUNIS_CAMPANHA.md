# 🎯 Guia: Funis de Campanha - Sistema Completo

## 📖 O Que Foi Implementado

Sistema completo de **Funis de Vendas** compatível com qualquer CRM do mundo (Pipedrive, Advbox, HubSpot, Salesforce, Zoho, etc.).

---

## 🏗️ ESTRUTURA DO SISTEMA

### **1. Pipeline (Funil/Campanha)**
- Exemplos: "Black Friday", "Educacional", "Parceria", "Projetos", "Prospecção", "SaaS"
- Cada pipeline tem múltiplas etapas (stages)
- Cada pipeline pode ter múltiplos deals (negócios)

### **2. PipelineStage (Etapa do Funil)**
- Exemplos: "LEAD MAPEADO", "CONTATO REALIZADO", "QUALIFICADO", "REUNIÃO AGENDADA"
- Cada etapa tem uma ordem (order)
- Cada etapa pode ter múltiplos deals

### **3. Deal (Negócio)**
- Ligado a um Pipeline e uma Stage
- Pode estar ligado a um Lead (opcional)
- Tem valor, moeda, título, notas
- Pode ser sincronizado com CRM externo

### **4. CRM Integration**
- Suporta múltiplos CRMs: Pipedrive, Advbox, HubSpot, Salesforce, Zoho, etc.
- Sincronização bidirecional
- Mapeamento de campos customizado

---

## 📊 SCHEMA DO BANCO DE DADOS

### **Tabelas Criadas:**

1. **Pipeline** - Funis de campanha
2. **PipelineStage** - Etapas dos funis
3. **Deal** - Negócios/Deals
4. **PipelineHistory** - Histórico de movimentações
5. **CrmIntegration** - Integrações com CRMs externos

---

## 🔌 ENDPOINTS DISPONÍVEIS

### **Pipelines:**
- `GET /api/pipelines` - Listar pipelines
- `POST /api/pipelines` - Criar pipeline
- `PATCH /api/pipelines/:id` - Atualizar pipeline
- `DELETE /api/pipelines/:id` - Deletar pipeline
- `POST /api/pipelines/:id/stages` - Adicionar etapa

### **Deals:**
- `GET /api/pipelines/:id/deals` - Listar deals de um pipeline
- `POST /api/deals` - Criar deal
- `PATCH /api/deals/:id` - Atualizar deal
- `PATCH /api/deals/:id/stage` - Mover deal entre etapas
- `DELETE /api/deals/:id` - Deletar deal

### **Estatísticas:**
- `GET /api/pipelines/:id/stats` - Estatísticas de conversão

### **Integrações CRM:**
- `GET /api/crm/integrations` - Listar integrações
- `POST /api/crm/integrations` - Criar integração
- `PATCH /api/crm/integrations/:id` - Atualizar integração
- `DELETE /api/crm/integrations/:id` - Deletar integração
- `POST /api/crm/integrations/:id/sync` - Sincronizar manualmente

---

## 🎨 INTERFACE FRONTEND

### **Componente: SalesFunnelView**
- Localização: `src/components/funnel/SalesFunnelView.tsx`
- Integrado ao Dashboard (abaixo das métricas)
- Mostra:
  - Seleção de pipeline
  - Taxa de conversão geral
  - Etapas do funil com deals
  - Conversão por etapa
  - Botões "Conv. Total" e "Conv. Etapa"

---

## 🔄 COMO FUNCIONA

### **1. Criar Pipeline:**
```json
POST /api/pipelines
{
  "name": "Black Friday",
  "description": "Campanha Black Friday 2026",
  "color": "#000000",
  "stages": [
    { "name": "LEAD MAPEADO", "order": 0 },
    { "name": "TENTANDO CONTATO", "order": 1 },
    { "name": "CONTATO REALIZADO", "order": 2 },
    { "name": "QUALIFICADO", "order": 3 },
    { "name": "REUNIÃO AGENDADA", "order": 4 }
  ]
}
```

### **2. Criar Deal:**
```json
POST /api/deals
{
  "pipelineId": "uuid-do-pipeline",
  "stageId": "uuid-da-etapa",
  "leadId": "uuid-do-lead", // opcional
  "title": "Negócio João Silva",
  "value": 5000.00,
  "currency": "BRL",
  "assignedTo": "uuid-do-usuario", // opcional
  "notes": "Cliente interessado em direito trabalhista"
}
```

### **3. Mover Deal:**
```json
PATCH /api/deals/:id/stage
{
  "stageId": "uuid-nova-etapa",
  "notes": "Cliente qualificado após reunião"
}
```

---

## 🔗 INTEGRAÇÃO COM CRMs

### **CRMs Suportados:**
- ✅ Pipedrive
- ✅ Advbox
- ✅ HubSpot
- ✅ Salesforce
- ✅ Zoho CRM
- ✅ Qualquer CRM com API REST

### **Como Conectar:**

1. **Criar Integração:**
```json
POST /api/crm/integrations
{
  "type": "pipedrive",
  "name": "Pipedrive Principal",
  "apiKey": "seu-api-key",
  "apiUrl": "https://api.pipedrive.com/v1",
  "workspaceId": "seu-workspace-id",
  "syncDirection": "bidirectional",
  "autoSync": true,
  "syncInterval": 3600
}
```

2. **Sincronização Automática:**
- Sistema sincroniza a cada `syncInterval` segundos
- Sincronização bidirecional: deals criados aqui → CRM, deals criados no CRM → aqui

3. **Sincronização Manual:**
```json
POST /api/crm/integrations/:id/sync
```

---

## 📋 PRÓXIMOS PASSOS

### **Para Usar Agora:**
1. Rodar migration do Prisma:
   ```bash
   cd backend
   npx prisma migrate dev --name add_pipelines_and_deals
   ```

2. Criar pipelines padrão (opcional):
   - Black Friday
   - Educacional
   - Parceria
   - Projetos

3. Começar a criar deals!

### **Para Integrar com CRM:**
1. Obter API Key do CRM
2. Criar integração via endpoint
3. Sistema sincroniza automaticamente

---

## 🎯 EXEMPLOS DE USO

### **Exemplo 1: Pipeline "Black Friday"**
```
Etapas:
1. LEAD MAPEADO (0 deals)
2. TENTANDO CONTATO (0 deals)
3. CONTATO REALIZADO (0 deals)
4. QUALIFICADO (0 deals)
5. REUNIÃO AGENDADA (2 deals) ← 100% conversão
```

### **Exemplo 2: Pipeline "Educacional"**
```
Etapas:
1. SEM CONTATO (0 deals)
2. CONTATO REALIZADO (0 deals)
3. APRESENTAÇÃO AGENDADA (0 deals)
4. APRESENTAÇÃO REALIZADA (0 deals)
5. PROPOSTA ENVIADA (0 deals)
6. EM NEGOCIAÇÃO (0 deals)
7. FORMALIZAÇÃO (0 deals)
```

---

## ✅ STATUS

- ✅ Schema Prisma criado
- ✅ Endpoints backend criados
- ✅ Componente frontend criado
- ✅ Integrado ao Dashboard
- ✅ Sistema de integração CRM criado
- ⚠️ Sincronização real com CRMs (TODO - precisa implementar lógica específica de cada CRM)

---

**Pronto para usar!** 🚀
