# 🏢 Adaptar Workflow N8N para SaaS Multi-Tenant

## 🎯 Objetivo

Adaptar seu workflow N8N para funcionar com **múltiplos clientes (tenants)** na plataforma SaaS.

**IMPORTANTE:** Você **NÃO precisa de chat no N8N** porque:
- ✅ A plataforma já tem **"Chat ao Vivo"** na interface
- ✅ O N8N apenas **processa e envia** mensagens
- ✅ A plataforma **mostra as conversas** para cada cliente

---

## 🔑 Conceito Chave: `clienteId`

### **O que é `clienteId`?**

É um **identificador único** que diz ao backend **qual cliente (tenant)** está recebendo a mensagem.

**Exemplo:**
- Cliente A: `clienteId = "escritorio-abc-123"`
- Cliente B: `clienteId = "escritorio-xyz-456"`
- Cliente C: `clienteId = "escritorio-123-789"`

### **Como o Backend Usa:**

```javascript
// Backend recebe clienteId
const { clienteId } = body;

// Backend identifica o tenant
const tenantId = await getOrCreateTenantByClienteId(clienteId);

// Backend salva lead no tenant correto
await prisma.lead.create({
  data: {
    tenantId: tenantId, // ← Isolado por cliente!
    nome: "...",
    telefone: "...",
  }
});
```

**Resultado:** Cada cliente vê **APENAS** seus próprios leads!

---

## 📋 Como Identificar o Cliente no N8N

### **Opção 1: Identificar pelo Número do WhatsApp (Recomendado)**

**Como funciona:**
- Cada cliente tem um número de WhatsApp diferente
- Você mapeia: `número → clienteId`
- N8N identifica automaticamente

**Exemplo no N8N:**

```javascript
// Node: "Identificar Cliente"
const telefone = $('Dados Lead').item.json.Telefone;

// Mapeamento de números para clientes
const clientes = {
  "5511999999999": "escritorio-abc-123",  // Cliente A
  "5511888888888": "escritorio-xyz-456",  // Cliente B
  "5511777777777": "escritorio-123-789",  // Cliente C
};

const clienteId = clientes[telefone] || "tenant-padrao";
```

**Vantagens:**
- ✅ Automático
- ✅ Não precisa configurar por workflow
- ✅ Fácil de manter

---

### **Opção 2: Variável de Ambiente no N8N**

**Como funciona:**
- Cada workflow N8N tem uma variável de ambiente
- `CLIENTE_ID = "escritorio-abc-123"`
- Workflow usa essa variável

**Exemplo no N8N:**

```javascript
// Node: "Obter ClienteId"
const clienteId = process.env.CLIENTE_ID || "tenant-padrao";
```

**Vantagens:**
- ✅ Um workflow por cliente
- ✅ Isolamento completo
- ✅ Fácil de gerenciar

---

### **Opção 3: Identificar pela Instância Evolution**

**Como funciona:**
- Cada cliente tem uma instância Evolution diferente
- Você mapeia: `instância → clienteId`

**Exemplo no N8N:**

```javascript
// Node: "Identificar Cliente"
const instancia = "SDRAdvogados2"; // Nome da instância Evolution

const clientes = {
  "SDRAdvogados2": "escritorio-abc-123",
  "SDRAdvogados3": "escritorio-xyz-456",
  "SDRAdvogados4": "escritorio-123-789",
};

const clienteId = clientes[instancia] || "tenant-padrao";
```

**Vantagens:**
- ✅ Baseado na instância Evolution
- ✅ Automático por instância
- ✅ Bom para múltiplos clientes

---

## 🔧 Adaptar o Workflow N8N

### **Passo 1: Adicionar Node "Identificar Cliente"**

**Posição:** **DEPOIS** de "Dados Lead", **ANTES** de "Redis"

**Node Type:** `Set` ou `Code`

**Configuração:**

```javascript
// Node: "Identificar Cliente"
const telefone = $('Dados Lead').item.json.Telefone;

// Mapeamento (ajuste conforme seus clientes)
const clientes = {
  "5511999999999": "escritorio-abc-123",
  "5511888888888": "escritorio-xyz-456",
  // Adicione mais clientes aqui
};

const clienteId = clientes[telefone] || "tenant-padrao";

// Retornar clienteId
return {
  clienteId: clienteId,
  telefone: telefone,
  nome: $('Dados Lead').item.json.Nome,
};
```

---

### **Passo 2: Modificar Node "EDIT_FIELDS_SDR"**

**Adicionar campo `clienteId`:**

**Antes:**
```json
{
  "lead_id": "...",
  "mensagem": "...",
  "canal": "whatsapp"
}
```

**Depois:**
```json
{
  "lead_id": "...",
  "mensagem": "...",
  "canal": "whatsapp",
  "clienteId": "escritorio-abc-123"  // ← NOVO!
}
```

**Configuração no N8N:**

| Name | Type | Value | Description |
|------|------|-------|-------------|
| `lead_id` | String | `={{ Date.now().toString() }}` | ID único do lead |
| `mensagem` | String | `={{ $('Redis Buffer').item.json.mensagens }}` | Mensagem consolidada |
| `canal` | String | `"whatsapp"` | Canal de origem |
| `clienteId` | String | `={{ $('Identificar Cliente').item.json.clienteId }}` | **NOVO: ID do cliente** |

---

### **Passo 3: Verificar Node "POST - Inbound Message (Backend)"**

**URL:**
```
https://sdradvogados.up.railway.app/api/agent/intake
```

**Body (deve incluir `clienteId`):**
```json
{
  "lead_id": "{{ $('EDIT_FIELDS_SDR').item.json.lead_id }}",
  "mensagem": "{{ $('EDIT_FIELDS_SDR').item.json.mensagem }}",
  "canal": "{{ $('EDIT_FIELDS_SDR').item.json.canal }}",
  "clienteId": "{{ $('EDIT_FIELDS_SDR').item.json.clienteId }}"
}
```

**O backend automaticamente:**
1. Recebe `clienteId`
2. Identifica o tenant correto
3. Salva o lead no tenant isolado
4. Retorna análise

---

## 🎯 Fluxo Completo Adaptado

```
1. Gatilho (Webhook)
   ↓
2. Dados Lead (extrai telefone e nome)
   ↓
3. [NOVO] Identificar Cliente
   → Mapeia telefone → clienteId
   ↓
4. Processamento de Mensagem
   ├─ Texto → Mensagem Texto
   ├─ Áudio → Transcrever → Mensagem
   └─ Imagem → Analisar → Mensagem
   ↓
5. Redis Buffer (consolida mensagens)
   ↓
6. EDIT_FIELDS_SDR
   {
     "lead_id": "...",
     "mensagem": "...",
     "canal": "whatsapp",
     "clienteId": "escritorio-abc-123"  // ← NOVO!
   }
   ↓
7. POST /api/agent/intake (Backend SDR)
   → Backend identifica tenant
   → Salva lead no tenant correto
   → Retorna análise
   ↓
8. EDIT_FIELDS_EVOLUTION
   {
     "number": "...",
     "textMessage": {
       "text": "..."
     }
   }
   ↓
9. POST /message/send (Evolution API)
   → Envia resposta para o cliente
   ↓
10. Conversa aparece na Plataforma
    → Cliente faz login
    → Vê APENAS seus leads
    → Conversa aparece no "Chat ao Vivo"
```

---

## 🚫 O Que REMOVER do Workflow

### **1. Nodes de Chat (Não Precisam)**

**Remover:**
- ❌ Nodes de chat direto no N8N
- ❌ Interface de chat no workflow
- ❌ Nodes que simulam chat

**Por quê:**
- ✅ A plataforma já tem **"Chat ao Vivo"**
- ✅ Cliente vê conversas na plataforma
- ✅ N8N apenas processa e envia

---

### **2. Nodes de Memória de Chat (Opcional)**

**Manter se:**
- ✅ Você quer manter contexto no N8N
- ✅ Você quer histórico no workflow

**Remover se:**
- ✅ Você quer apenas processar e enviar
- ✅ A plataforma gerencia o histórico

**Recomendação:** **Manter** para contexto do agente IA, mas **não é obrigatório**.

---

## ✅ O Que MANTER no Workflow

### **1. Processamento de Mensagens**

**Manter:**
- ✅ Tratamento de texto, áudio, imagem, PDF
- ✅ Redis buffers
- ✅ Consolidação de mensagens

**Por quê:**
- Essencial para processar mensagens recebidas

---

### **2. Agente IA**

**Manter:**
- ✅ OpenAI Chat Model
- ✅ Prompt do agente
- ✅ Humanização de texto

**Por quê:**
- Gera respostas inteligentes
- Processa mensagens do cliente

---

### **3. Envio para Backend**

**Manter:**
- ✅ POST /api/agent/intake
- ✅ Envio de `clienteId`

**Por quê:**
- Backend precisa saber qual cliente
- Backend isola os dados

---

### **4. Envio para Evolution API**

**Manter:**
- ✅ POST /message/send
- ✅ Envio de mensagens

**Por quê:**
- Envia respostas para o WhatsApp

---

## 📊 Exemplo Prático: Múltiplos Clientes

### **Cenário: 3 Clientes**

**Cliente A:**
- Número WhatsApp: `5511999999999`
- `clienteId`: `"escritorio-abc-123"`
- Instância Evolution: `SDRAdvogados2`

**Cliente B:**
- Número WhatsApp: `5511888888888`
- `clienteId`: `"escritorio-xyz-456"`
- Instância Evolution: `SDRAdvogados3`

**Cliente C:**
- Número WhatsApp: `5511777777777`
- `clienteId`: `"escritorio-123-789"`
- Instância Evolution: `SDRAdvogados4`

### **Workflow N8N:**

```javascript
// Node: "Identificar Cliente"
const telefone = $('Dados Lead').item.json.Telefone;

const clientes = {
  "5511999999999": "escritorio-abc-123",  // Cliente A
  "5511888888888": "escritorio-xyz-456",  // Cliente B
  "5511777777777": "escritorio-123-789",  // Cliente C
};

const clienteId = clientes[telefone] || "tenant-padrao";

return { clienteId };
```

### **Resultado:**

1. **Cliente A recebe mensagem:**
   - N8N identifica: `clienteId = "escritorio-abc-123"`
   - Backend salva no tenant A
   - Cliente A vê na plataforma

2. **Cliente B recebe mensagem:**
   - N8N identifica: `clienteId = "escritorio-xyz-456"`
   - Backend salva no tenant B
   - Cliente B vê na plataforma

3. **Cliente C recebe mensagem:**
   - N8N identifica: `clienteId = "escritorio-123-789"`
   - Backend salva no tenant C
   - Cliente C vê na plataforma

**Cada cliente vê APENAS seus próprios leads!** ✅

---

## 🎯 Resumo: O Que Fazer

### **✅ ADICIONAR:**

1. **Node "Identificar Cliente"**
   - Mapeia telefone → clienteId
   - Posição: Depois de "Dados Lead"

2. **Campo `clienteId` no EDIT_FIELDS_SDR**
   - Adiciona clienteId ao payload
   - Envia para backend

3. **Mapeamento de Clientes**
   - Lista de telefones → clienteId
   - Fácil de atualizar

---

### **❌ REMOVER (Opcional):**

1. **Nodes de Chat no N8N**
   - Não precisa (plataforma tem chat)

2. **Interface de Chat**
   - Não precisa (plataforma tem interface)

---

### **✅ MANTER:**

1. **Processamento de Mensagens**
   - Texto, áudio, imagem, PDF

2. **Agente IA**
   - OpenAI, prompts, humanização

3. **Envio para Backend**
   - POST /api/agent/intake
   - Com clienteId

4. **Envio para Evolution API**
   - POST /message/send
   - Respostas para WhatsApp

---

## 🔍 Verificar se Está Funcionando

### **Teste 1: Verificar Payload**

**No N8N, após "EDIT_FIELDS_SDR":**

```json
{
  "lead_id": "1705849200000",
  "mensagem": "Preciso de ajuda",
  "canal": "whatsapp",
  "clienteId": "escritorio-abc-123"  // ← Deve aparecer!
}
```

✅ Se `clienteId` aparecer, está correto!

---

### **Teste 2: Verificar Backend**

**No backend, logs devem mostrar:**

```
Tenant identificado para intake: {
  clienteId: "escritorio-abc-123",
  tenantId: "uuid-do-tenant"
}
```

✅ Se aparecer, backend identificou o tenant!

---

### **Teste 3: Verificar Plataforma**

1. **Cliente A faz login**
2. **Vai em "Leads"**
3. **Deve ver APENAS leads do Cliente A**

✅ Se aparecer apenas leads do cliente, isolamento funcionou!

---

## ✅ Checklist Final

- [ ] Adicionar node "Identificar Cliente"
- [ ] Mapear telefones → clienteId
- [ ] Adicionar `clienteId` no EDIT_FIELDS_SDR
- [ ] Verificar POST /api/agent/intake inclui clienteId
- [ ] Testar com mensagem de teste
- [ ] Verificar lead aparece na plataforma
- [ ] Verificar isolamento (cliente vê apenas seus leads)
- [ ] Remover nodes de chat (se houver)
- [ ] Documentar mapeamento de clientes

---

**Pronto! Seu workflow N8N está adaptado para SaaS multi-tenant!** 🚀

**Lembre-se:**
- ✅ N8N processa e envia
- ✅ Plataforma mostra conversas
- ✅ Cada cliente vê apenas seus dados
- ✅ `clienteId` identifica o cliente
