# 🔧 Exemplo de Configuração dos Nodes no N8N

## 📋 Node 1: Criar/Buscar Lead

### **Tipo:** HTTP Request

### **Configuração:**

**URL:**
```
https://sdradvogados.up.railway.app/leads
```

**Method:**
```
POST
```

**Authentication:**
```
None
```

**Send Body:**
```
✅ Yes
```

**Body Content Type:**
```
JSON
```

**Body Parameters:**
```json
{
  "nome": "={{ $('Dados Lead').item.json.Nome }}",
  "telefone": "={{ $('Dados Lead').item.json.Telefone }}",
  "origem": "whatsapp",
  "clienteId": ""
}
```

**Onde conectar:**
- **Entrada:** Após `Redis1` (quando buffer estiver pronto)
- **Saída:** Para `Agente IA` (próximo node)

**Resposta esperada:**
```json
{
  "success": true,
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "clienteId": "tenant-uuid",
  "message": "Lead criado com sucesso",
  "classification": {
    "score": 85,
    "classificacao": "lead_quente",
    "prioridade": "alta"
  },
  "routing": {
    "destino": "whatsapp_humano",
    "urgencia": "alta"
  }
}
```

---

## 📋 Node 2: Agente IA Conversacional

### **Tipo:** HTTP Request

### **Configuração:**

**URL:**
```
https://sdradvogados.up.railway.app/api/agent/conversation
```

**Method:**
```
POST
```

**Authentication:**
```
None
```

**Send Body:**
```
✅ Yes
```

**Body Content Type:**
```
JSON
```

**Body Parameters:**
```json
{
  "lead_id": "={{ $('Criar Lead').item.json.leadId }}",
  "message": "={{ $('Mensagem').item.json.mensagens }}",
  "conversation_data": "={{ $('Conversation Data').item.json.data }}",
  "clienteId": "={{ $('Criar Lead').item.json.clienteId }}"
}
```

**Onde conectar:**
- **Entrada:** Após `Criar Lead`
- **Saída:** Para `Humanização` ou `Basic LLM Chain`

**Resposta esperada:**
```json
{
  "lead_id": "550e8400-e29b-41d4-a716-446655440000",
  "state": "collecting_name",
  "message": "Olá! Qual é o seu nome completo?",
  "options": null,
  "conversation_data": {
    "lead_id": "550e8400-e29b-41d4-a716-446655440000",
    "state": "collecting_name",
    "conversation_history": [
      {
        "role": "user",
        "message": "Olá, preciso de ajuda",
        "timestamp": "2026-01-20T..."
      },
      {
        "role": "bot",
        "message": "Olá! Qual é o seu nome completo?",
        "timestamp": "2026-01-20T..."
      }
    ]
  },
  "timestamp": "2026-01-20T..."
}
```

---

## 📋 Node 3: Salvar Conversation Data (Redis)

### **Tipo:** Redis

### **Configuração:**

**Operation:**
```
Set
```

**Key:**
```
={{ $('Dados Lead').item.json.Telefone }}_conversation
```

**Value:**
```
={{ $('Agente IA').item.json.conversation_data }}
```

**Expire:**
```
✅ Yes
```

**TTL (segundos):**
```
3600
```

**Onde conectar:**
- **Entrada:** Após `Agente IA`
- **Saída:** Para `Humanização` ou `Basic LLM Chain`

---

## 📋 Node 4: Recuperar Conversation Data (Redis)

### **Tipo:** Redis

### **Configuração:**

**Operation:**
```
Get
```

**Key:**
```
={{ $('Dados Lead').item.json.Telefone }}_conversation
```

**Onde conectar:**
- **Entrada:** Antes de `Agente IA`
- **Saída:** Para `Set` (preparar dados) → `Agente IA`

---

## 📋 Node 5: Preparar Dados para Agente IA

### **Tipo:** Set

### **Configuração:**

**Assignments:**
```json
{
  "conversation_data": "={{ $('Recuperar Conversation Data').item.json.value }}"
}
```

**Onde conectar:**
- **Entrada:** Após `Recuperar Conversation Data`
- **Saída:** Para `Agente IA`

---

## 🔄 FLUXO COMPLETO COM OS NOVOS NODES

```
[Redis1] (deleta buffer)
    ↓
[Mensagem] (junta todas)
    ↓
[HTTP Request: POST /leads] ⭐ NOVO
    ↓
[Recuperar Conversation Data] (Redis Get) ⭐ NOVO
    ↓
[Set: Preparar Dados] ⭐ NOVO
    ↓
[HTTP Request: POST /api/agent/conversation] ⭐ NOVO
    ↓
[Salvar Conversation Data] (Redis Set) ⭐ NOVO
    ↓
[Basic LLM Chain] (humanização)
    ↓
[Split Out] → [Loop Over Items]
    ↓
[Enviar Mensagem] (Evolution API)
```

---

## ⚠️ IMPORTANTE: Primeira Vez vs Próximas Vezes

### **Primeira Vez (Lead Novo):**
- `conversation_data` será `null` ou `undefined`
- Seu endpoint `/api/agent/conversation` cria novo `conversation_data`
- Salve no Redis após receber resposta

### **Próximas Vezes (Lead Existente):**
- Recupere `conversation_data` do Redis
- Envie junto com a mensagem
- Seu endpoint atualiza o `conversation_data`
- Salve novamente no Redis

---

## 🧪 TESTE RÁPIDO

### **1. Teste do Node "Criar Lead":**

**Envie manualmente:**
```json
{
  "nome": "João Silva",
  "telefone": "5527999999999",
  "origem": "whatsapp"
}
```

**Resultado esperado:**
- Status: `201 Created`
- Body: `{ "success": true, "leadId": "...", ... }`

### **2. Teste do Node "Agente IA":**

**Envie manualmente:**
```json
{
  "lead_id": "uuid-do-lead",
  "message": "Olá, preciso de ajuda",
  "conversation_data": null,
  "clienteId": "uuid-do-tenant"
}
```

**Resultado esperado:**
- Status: `200 OK`
- Body: `{ "message": "Olá! Qual é o seu nome?", ... }`

---

## 💡 DICAS

1. **Use `$json` para acessar dados do node anterior**
2. **Use `$('Nome do Node')` para acessar nodes específicos**
3. **Teste cada node individualmente antes de conectar tudo**
4. **Use `console.log` ou `Set` para debugar valores**

---

## 🆘 PROBLEMAS COMUNS

### **Erro: "conversation_data is required"**
- **Solução:** Envie `null` na primeira vez, depois recupere do Redis

### **Erro: "lead_id not found"**
- **Solução:** Verifique se `POST /leads` retornou `leadId` corretamente

### **Erro: "clienteId is required"**
- **Solução:** Use `clienteId` da resposta de `POST /leads`

---

**Pronto! Agora você tem todos os exemplos de configuração!** 🚀
