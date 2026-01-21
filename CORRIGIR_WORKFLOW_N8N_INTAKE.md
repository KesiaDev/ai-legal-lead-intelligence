# 🔧 Corrigir Workflow N8N - Endpoint `/api/agent/intake`

## 🎯 Problema Identificado

O endpoint `/api/agent/intake` está retornando erro:
```
"Missing or invalid mensagem"
```

## 📋 Formato Correto do Backend

O endpoint espera **EXATAMENTE** este JSON:

```json
{
  "lead_id": "string",
  "mensagem": "string",
  "canal": "string (opcional)",
  "clienteId": "string (opcional)"
}
```

⚠️ **IMPORTANTE:**
- Campo é `mensagem` (não `message`)
- Campo `mensagem` é **OBRIGATÓRIO** e deve ser uma **string válida**
- Não usar `||` ou fallbacks que possam resultar em `undefined` ou string vazia

---

## 🔍 Análise do Código do Backend

O endpoint valida assim:

```typescript
if (!mensagem || typeof mensagem !== 'string') {
  return reply.status(400).send({ 
    error: 'Missing or invalid mensagem',
    message: 'mensagem is required and must be a string'
  });
}
```

**Isso significa:**
- ❌ `mensagem: undefined` → ERRO
- ❌ `mensagem: ""` → ERRO (string vazia)
- ❌ `mensagem: null` → ERRO
- ✅ `mensagem: "texto válido"` → OK

---

## ✅ SOLUÇÃO: Configuração Correta do N8N

### **Passo 1: Identificar o Node com a Mensagem Final**

No seu workflow, identifique qual node contém a **mensagem consolidada final** do usuário. Pode ser:
- Node `Mensagem` (após processar texto/áudio/imagem)
- Node `Redis Buffer` (após consolidar mensagens)
- Node `Set` que prepara dados finais

**Exemplo:** Se você tem um node chamado `Mensagem Final` que contém `{{ $json.mensagens }}` ou `{{ $json.texto }}`, esse é o campo correto.

---

### **Passo 2: Criar Node "Edit Fields" ANTES do HTTP Request**

Adicione um node **"Edit Fields"** (ou **"Set"**) **IMEDIATAMENTE ANTES** do node `POST – Inbound Message (Backend)`.

**Configuração do Node "Edit Fields":**

**Mode:** `Manually`
**Keep Other Fields:** `No`

**Fields to Set:**

| Name | Type | Value |
|------|------|-------|
| `lead_id` | String | `={{ Date.now().toString() }}` |
| `number` | String | `={{ $('Dados Lead').item.json.Telefone }}` |
| `mensagem` | String | `={{ $('Mensagem Final').item.json.mensagens }}` |

⚠️ **IMPORTANTE:**
- Substitua `'Mensagem Final'` pelo nome real do seu node que contém a mensagem
- Se a mensagem está em `$json.texto`, use `={{ $('Node').item.json.texto }}`
- Se a mensagem está em `$json.mensagens`, use `={{ $('Node').item.json.mensagens }}`
- **NÃO use** `|| ""` ou qualquer fallback

---

### **Passo 3: Configurar Node HTTP Request**

**Node:** `POST – Inbound Message (Backend)`

**Configuração:**

**Method:** `POST`

**URL:**
```
https://sdradvogados.up.railway.app/api/agent/intake
```

**Authentication:** `None`

**Send Body:** `Yes`

**Body Content Type:** `JSON`

**Specify Body:** `Using JSON`

**JSON Body:**
```json
{
  "lead_id": "{{ $json.lead_id }}",
  "mensagem": "{{ $json.mensagem }}",
  "canal": "whatsapp"
}
```

⚠️ **CRÍTICO:**
- Use **APENAS** `{{ $json.lead_id }}` e `{{ $json.mensagem }}`
- **NÃO use** `{{ $json.mensagem || "" }}`
- **NÃO use** `{{ $json.messages }}` (plural)
- **NÃO adicione** texto fora do JSON

---

## 🔄 Exemplo de Fluxo Correto

```
1. Gatilho (Webhook)
   ↓
2. Dados Lead (extrai telefone)
   ↓
3. Processamento de Mensagem
   ├─ Texto → Mensagem Texto
   ├─ Áudio → Transcrever → Mensagem
   └─ Imagem → Analisar → Mensagem
   ↓
4. Redis Buffer (consolida mensagens)
   ↓
5. [NOVO] Edit Fields (prepara JSON final)
   {
     "lead_id": "{{ Date.now().toString() }}",
     "number": "{{ $('Dados Lead').item.json.Telefone }}",
     "mensagem": "{{ $('Redis Buffer').item.json.mensagens }}"
   }
   ↓
6. POST – Inbound Message (Backend)
   Body: {
     "lead_id": "{{ $json.lead_id }}",
     "mensagem": "{{ $json.mensagem }}",
     "canal": "whatsapp"
   }
```

---

## 🚨 Erros Comuns a Evitar

### ❌ **ERRO 1: Campo errado**
```json
{
  "message": "{{ $json.mensagens }}"  // ERRADO! Deve ser "mensagem"
}
```

### ❌ **ERRO 2: Usar fallback**
```json
{
  "mensagem": "{{ $json.mensagens || '' }}"  // ERRADO! Pode resultar em string vazia
}
```

### ❌ **ERRO 3: Campo plural**
```json
{
  "mensagem": "{{ $json.messages }}"  // ERRADO! Campo não existe
}
```

### ❌ **ERRO 4: Texto fora do JSON**
```
Body: texto antes do JSON {{ $json.mensagem }}  // ERRADO! Apenas JSON válido
```

### ✅ **CORRETO:**
```json
{
  "lead_id": "{{ $json.lead_id }}",
  "mensagem": "{{ $json.mensagem }}",
  "canal": "whatsapp"
}
```

---

## 📝 Checklist de Correção

- [ ] Identifiquei o node que contém a mensagem final consolidada
- [ ] Criei node "Edit Fields" ANTES do HTTP Request
- [ ] Configurei `lead_id` com `Date.now().toString()`
- [ ] Configurei `mensagem` usando o campo correto do node de mensagem
- [ ] **NÃO usei** `||` ou fallbacks
- [ ] Configurei HTTP Request com Body Content Type: JSON
- [ ] Usei **APENAS** `{{ $json.lead_id }}` e `{{ $json.mensagem }}` no body
- [ ] **NÃO adicionei** texto fora do JSON

---

## 🧪 Teste Rápido

Após configurar, teste o workflow:

1. Envie uma mensagem de teste
2. Verifique o output do node "Edit Fields"
3. Deve mostrar:
   ```json
   {
     "lead_id": "1234567890",
     "number": "5511999999999",
     "mensagem": "Texto da mensagem do usuário"
   }
   ```
4. Verifique o output do HTTP Request
5. Deve retornar status `200` com:
   ```json
   {
     "lead_id": "1234567890",
     "canal": "whatsapp",
     "analise": { ... }
   }
   ```

---

## 🎯 Explicação Final

### **Qual era o erro raiz?**
O workflow estava enviando:
- Campo `message` (errado) ao invés de `mensagem` (correto)
- Ou campo `mensagem` com valor `undefined` ou string vazia devido a fallbacks `||`
- Ou usando campo `messages` (plural) que não existe

### **Onde estava o campo quebrado?**
Provavelmente no node HTTP Request, onde o body estava configurado com:
- `{{ $json.messages }}` (campo inexistente)
- `{{ $json.mensagem || "" }}` (fallback que resulta em string vazia)
- Ou campo `message` ao invés de `mensagem`

### **Por que agora o backend aceitará o payload?**
Porque agora:
1. ✅ O campo está correto: `mensagem` (não `message`)
2. ✅ O valor vem diretamente do node de mensagem, sem fallbacks
3. ✅ O JSON está no formato exato que o backend espera
4. ✅ Não há texto fora do JSON
5. ✅ O campo `mensagem` sempre terá uma string válida (nunca `undefined` ou vazio)

---

## 🆘 Se Ainda Der Erro

1. **Verifique os logs do backend** no Railway
2. **Veja o output do node "Edit Fields"** no N8N
3. **Confirme que `mensagem` não está vazio** antes de enviar
4. **Verifique o nome do node** que contém a mensagem (pode ser diferente de `Mensagem Final`)

Me avise qual erro apareceu e eu te ajudo a resolver!
