# 🔧 Corrigir HTTP Request para Evolution API

## 🎯 Problema Identificado

**Erro:**
```
Bad request - please check your parameters
Missing or invalid lead_id
```

**O que está acontecendo:**
- ❌ O node "HTTP Request" está enviando para `/api/agent/intake` (backend)
- ❌ Mas deveria enviar para Evolution API (`/message/send`)
- ❌ O payload está errado (está usando formato do backend)

---

## ✅ SOLUÇÃO: Corrigir Node "HTTP Request" (Evolution API)

### **Problema:**
Você tem **2 nodes HTTP Request diferentes**:

1. **"POST - Inbound Message (Backend)"** ✅ (funcionando)
   - URL: `https://api.sdrjuridico.com.br/api/agent/intake`
   - Payload: `{ lead_id, mensagem, canal, clienteId }`

2. **"HTTP Request"** ❌ (erro - Evolution API)
   - URL: Deveria ser Evolution API
   - Payload: Deveria ser `{ number, textMessage: { text } }`

---

## 🔧 Passo a Passo para Corrigir

### **Passo 1: Verificar Qual Node Está com Erro**

Na imagem, o erro está no node **"HTTP Request"** que vem **DEPOIS** de "EDIT_FIELDS_EVOLUTION".

Este node deve enviar para **Evolution API**, não para o backend!

---

### **Passo 2: Corrigir URL**

1. Clique no node **"HTTP Request"** (o que está dando erro)
2. No campo **"URL"**, altere de:
   ```
   https://api.sdrjuridico.com.br/api/agent/intake
   ```
   
   Para:
   ```
   https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
   ```
   
   (Ou a URL da sua Evolution API)

---

### **Passo 3: Corrigir Payload (JSON Body)**

**O payload atual está ERRADO:**
```json
{
  "lead_id": "...",
  "mensagem": "...",
  "canal": "whatsapp",
  "clienteId": "escritorio-abc-123"
}
```

**O payload CORRETO para Evolution API:**
```json
{
  "number": "{{ $('EDIT_FIELDS_EVOLUTION').item.json.number }}",
  "textMessage": {
    "text": "{{ $('EDIT_FIELDS_EVOLUTION').item.json.texto }}"
  }
}
```

**OU se usar expressões diretas:**
```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.texto }}"
  }
}
```

---

### **Passo 4: Verificar Authentication**

1. No node "HTTP Request"
2. Campo **"Authentication"**
3. Se a Evolution API precisar de API Key:
   - Selecione: **"Header Auth"** ou **"Generic Credential Type"**
   - Configure:
     - Name: `apikey` (ou `Authorization`)
     - Value: Sua API key da Evolution API

---

### **Passo 5: Verificar Node "EDIT_FIELDS_EVOLUTION"**

O node "EDIT_FIELDS_EVOLUTION" deve ter:

**Campos:**
- `number`: Número do WhatsApp (ex: `5527998597005`)
- `texto`: Texto da mensagem (ex: `"Eu vendo agentes..."`)

**Verifique se está assim:**
- ✅ `number`: `{{ $('Dados Lead').item.json.Telefone }}`
- ✅ `texto`: `{{ $('POST - Inbound Message (Backend)').item.json.analise.mensagem }}` (ou a resposta do agente IA)

---

## 📋 Configuração Correta Final

### **Node: "HTTP Request" (Evolution API)**

**Method:** `POST`

**URL:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
```
(Substitua pela URL real da sua Evolution API)

**Authentication:** 
- `Header Auth` (se necessário)
- Name: `apikey`
- Value: Sua API key

**Send Body:** `ON`

**Body Content Type:** `JSON`

**JSON:**
```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.texto }}"
  }
}
```

---

## 🔍 Verificar Fluxo Completo

**Ordem correta dos nodes:**

1. ✅ "POST - Inbound Message (Backend)"
   - Envia para: `https://api.sdrjuridico.com.br/api/agent/intake`
   - Payload: `{ lead_id, mensagem, canal, clienteId }`

2. ✅ "EDIT_FIELDS_EVOLUTION"
   - Prepara dados para Evolution API
   - Campos: `number`, `texto`

3. ✅ "HTTP Request" (Evolution API)
   - Envia para: `https://drybee-evolution.cloudfy.live/message/sendText/...`
   - Payload: `{ number, textMessage: { text } }`

---

## ✅ Resumo

**Problema:**
- Node "HTTP Request" está usando payload do backend
- Deveria usar payload da Evolution API

**Solução:**
1. ✅ Corrigir URL para Evolution API
2. ✅ Corrigir payload para `{ number, textMessage: { text } }`
3. ✅ Configurar authentication (se necessário)
4. ✅ Verificar node "EDIT_FIELDS_EVOLUTION"

---

**Pronto! Corrija o node "HTTP Request" e teste novamente!** 🚀
