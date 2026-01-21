# 🔧 Refatorar Workflow N8N - Separar Payloads SDR e Evolution API

## 🎯 Objetivo

Separar completamente os payloads de duas APIs diferentes:
1. **Backend SDR** (`/api/agent/intake`) → Apenas `{ lead_id, mensagem, canal }`
2. **Evolution API** (`/message/send`) → Apenas `{ number, textMessage.text }`

---

## 📋 Estrutura do Fluxo Refatorado

```
1. Gatilho (Webhook)
   ↓
2. Dados Lead (extrai telefone e nome)
   ↓
3. Processamento de Mensagem
   ├─ Texto → Mensagem Texto
   ├─ Áudio → Transcrever → Mensagem
   └─ Imagem → Analisar → Mensagem
   ↓
4. Redis Buffer (consolida mensagens)
   ↓
5. [NOVO] EDIT_FIELDS_SDR
   {
     "lead_id": "...",
     "mensagem": "...",
     "canal": "whatsapp"
   }
   ↓
6. POST /api/agent/intake (Backend SDR)
   ↓
7. [NOVO] EDIT_FIELDS_EVOLUTION
   {
     "number": "...",
     "textMessage": {
       "text": "..."
     }
   }
   ↓
8. POST /message/send (Evolution API)
```

---

## ✅ Node 1: EDIT_FIELDS_SDR

### **Configuração:**

**Node Type:** `Edit Fields` (ou `Set`)

**Position:** **ANTES** do node `POST /api/agent/intake`

**Mode:** `Manually`

**Keep Other Fields:** `No` ⚠️ **IMPORTANTE: Não manter outros campos**

**Fields to Set:**

| Name | Type | Value | Description |
|------|------|-------|-------------|
| `lead_id` | String | `={{ Date.now().toString() }}` | ID único do lead |
| `mensagem` | String | `={{ $('Redis Buffer').item.json.mensagens }}` | Mensagem consolidada |
| `canal` | String | `"whatsapp"` | Canal de origem |

⚠️ **CRÍTICO:**
- **NÃO inclua** `number` aqui
- **NÃO inclua** `text` aqui
- **NÃO use** fallbacks `||`
- **Apenas** estes 3 campos

**Output Esperado:**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Preciso de ajuda com processo trabalhista",
  "canal": "whatsapp"
}
```

---

## ✅ Node 2: POST /api/agent/intake (Backend SDR)

### **Configuração:**

**Node Type:** `HTTP Request`

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
  "canal": "{{ $json.canal }}"
}
```

⚠️ **CRÍTICO:**
- **APENAS** estes 3 campos
- **NÃO adicione** `number`
- **NÃO adicione** `text`
- **NÃO use** `||` ou fallbacks

**Resposta Esperada:**
```json
{
  "lead_id": "1705849200000",
  "canal": "whatsapp",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  },
  "timestamp": "2026-01-21T..."
}
```

---

## ✅ Node 3: EDIT_FIELDS_EVOLUTION

### **Configuração:**

**Node Type:** `Edit Fields` (ou `Set`)

**Position:** **ANTES** do node `POST /message/send`

**Mode:** `Manually`

**Keep Other Fields:** `No` ⚠️ **IMPORTANTE: Não manter outros campos**

**Fields to Set:**

| Name | Type | Value | Description |
|------|------|-------|-------------|
| `number` | String | `={{ $('Dados Lead').item.json.Telefone }}` | Número do WhatsApp |
| `textMessage` | Object | `{ "text": "{{ $('Agente IA').item.json.output.mensagens }}" }` | Resposta do agente |

⚠️ **CRÍTICO:**
- **NÃO inclua** `lead_id` aqui
- **NÃO inclua** `mensagem` aqui
- **NÃO inclua** `canal` aqui
- **NÃO use** fallbacks `||`
- **Apenas** estes 2 campos

**Nota sobre `textMessage`:**
- Evolution API espera um objeto `textMessage` com propriedade `text`
- O valor vem da resposta do agente IA (node anterior)

**Output Esperado:**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Olá! Entendo que você precisa de ajuda com processo trabalhista..."
  }
}
```

---

## ✅ Node 4: POST /message/send (Evolution API)

### **Configuração:**

**Node Type:** `HTTP Request`

**Method:** `POST`

**URL:**
```
https://{{SEU-DOMINIO-EVOLUTION}}/message/sendText/{{SUA-INSTANCIA-EVOLUTION}}
```

**Authentication:** `Generic Credential Type` → `HTTP Header Auth`

**Send Body:** `Yes`

**Body Content Type:** `JSON`

**Specify Body:** `Using JSON`

**JSON Body:**
```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.textMessage.text }}"
  }
}
```

⚠️ **CRÍTICO:**
- **APENAS** estes 2 campos
- **NÃO adicione** `lead_id`
- **NÃO adicione** `mensagem`
- **NÃO adicione** `canal`
- **NÃO use** `||` ou fallbacks

---

## 🔄 Fluxo Completo com Exemplo Real

### **Passo 1: Dados Lead**
```json
{
  "Nome": "João Silva",
  "Telefone": "5511999999999"
}
```

### **Passo 2: Redis Buffer (Mensagem Consolidada)**
```json
{
  "mensagens": "Preciso de ajuda com processo trabalhista. Fui demitido sem justa causa."
}
```

### **Passo 3: EDIT_FIELDS_SDR**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Preciso de ajuda com processo trabalhista. Fui demitido sem justa causa.",
  "canal": "whatsapp"
}
```

### **Passo 4: POST /api/agent/intake → Resposta**
```json
{
  "lead_id": "1705849200000",
  "canal": "whatsapp",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 90,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  }
}
```

### **Passo 5: Agente IA (Processa e Gera Resposta)**
```json
{
  "output": {
    "mensagens": "Olá João! Entendo sua situação. Vou te ajudar com o processo trabalhista..."
  }
}
```

### **Passo 6: EDIT_FIELDS_EVOLUTION**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Olá João! Entendo sua situação. Vou te ajudar com o processo trabalhista..."
  }
}
```

### **Passo 7: POST /message/send → Envia para WhatsApp**

---

## 🚨 Regras Obrigatórias

### ✅ **O QUE FAZER:**

1. **EDIT_FIELDS_SDR:**
   - ✅ Apenas `lead_id`, `mensagem`, `canal`
   - ✅ `Keep Other Fields: No`
   - ✅ Valores diretos, sem fallbacks

2. **POST /api/agent/intake:**
   - ✅ Body com apenas `{{ $json.lead_id }}`, `{{ $json.mensagem }}`, `{{ $json.canal }}`
   - ✅ Sem campos extras

3. **EDIT_FIELDS_EVOLUTION:**
   - ✅ Apenas `number`, `textMessage.text`
   - ✅ `Keep Other Fields: No`
   - ✅ Valores diretos, sem fallbacks

4. **POST /message/send:**
   - ✅ Body com apenas `{{ $json.number }}`, `{{ $json.textMessage.text }}`
   - ✅ Sem campos extras

### ❌ **O QUE NÃO FAZER:**

1. ❌ **NÃO reutilizar** campos entre APIs
2. ❌ **NÃO usar** `Keep Other Fields: Yes` (pode passar campos indesejados)
3. ❌ **NÃO usar** fallbacks `|| ""` ou `|| "default"`
4. ❌ **NÃO adicionar** campos extras "por segurança"
5. ❌ **NÃO misturar** payloads (ex: enviar `number` para SDR ou `lead_id` para Evolution)

---

## 📝 Checklist de Validação

### **EDIT_FIELDS_SDR:**
- [ ] Mode: `Manually`
- [ ] Keep Other Fields: `No`
- [ ] Apenas 3 campos: `lead_id`, `mensagem`, `canal`
- [ ] `mensagem` vem do node de mensagem consolidada
- [ ] Sem fallbacks `||`
- [ ] Output mostra apenas os 3 campos esperados

### **POST /api/agent/intake:**
- [ ] Body Content Type: `JSON`
- [ ] Body com apenas `lead_id`, `mensagem`, `canal`
- [ ] Usa `{{ $json.lead_id }}`, `{{ $json.mensagem }}`, `{{ $json.canal }}`
- [ ] Sem campos extras
- [ ] Resposta retorna status `200`

### **EDIT_FIELDS_EVOLUTION:**
- [ ] Mode: `Manually`
- [ ] Keep Other Fields: `No`
- [ ] Apenas 2 campos: `number`, `textMessage.text`
- [ ] `number` vem do node "Dados Lead"
- [ ] `textMessage.text` vem da resposta do agente IA
- [ ] Sem fallbacks `||`
- [ ] Output mostra apenas os 2 campos esperados

### **POST /message/send:**
- [ ] Body Content Type: `JSON`
- [ ] Body com apenas `number`, `textMessage.text`
- [ ] Usa `{{ $json.number }}`, `{{ $json.textMessage.text }}`
- [ ] Sem campos extras
- [ ] Resposta retorna status `200`

---

## 🧪 Teste Completo

### **1. Teste EDIT_FIELDS_SDR:**

Execute o workflow até o node `EDIT_FIELDS_SDR` e verifique o output:

✅ **Correto:**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Texto da mensagem",
  "canal": "whatsapp"
}
```

❌ **Errado (tem campos extras):**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Texto da mensagem",
  "canal": "whatsapp",
  "number": "5511999999999",  // ❌ Não deve estar aqui
  "text": "..."  // ❌ Não deve estar aqui
}
```

### **2. Teste POST /api/agent/intake:**

Verifique a requisição enviada (no log do backend ou no N8N):

✅ **Correto:**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Texto da mensagem",
  "canal": "whatsapp"
}
```

❌ **Errado:**
```json
{
  "lead_id": "1705849200000",
  "mensagem": "Texto da mensagem",
  "canal": "whatsapp",
  "number": "5511999999999"  // ❌ Não deve estar aqui
}
```

### **3. Teste EDIT_FIELDS_EVOLUTION:**

Execute o workflow até o node `EDIT_FIELDS_EVOLUTION` e verifique o output:

✅ **Correto:**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Resposta do agente IA"
  }
}
```

❌ **Errado (tem campos extras):**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Resposta do agente IA"
  },
  "lead_id": "1705849200000",  // ❌ Não deve estar aqui
  "mensagem": "..."  // ❌ Não deve estar aqui
}
```

### **4. Teste POST /message/send:**

Verifique a requisição enviada:

✅ **Correto:**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Resposta do agente IA"
  }
}
```

❌ **Errado:**
```json
{
  "number": "5511999999999",
  "textMessage": {
    "text": "Resposta do agente IA"
  },
  "lead_id": "1705849200000"  // ❌ Não deve estar aqui
}
```

---

## 🎯 Explicação da Refatoração

### **Por que separar os payloads?**

1. **Isolamento de responsabilidades:**
   - Cada API recebe apenas os campos que precisa
   - Reduz risco de enviar dados desnecessários
   - Facilita manutenção e debug

2. **Prevenção de erros:**
   - Evita conflitos de nomes de campos
   - Previne envio acidental de campos errados
   - Garante que cada API receba formato exato esperado

3. **Clareza no fluxo:**
   - Fica explícito quais dados vão para cada API
   - Facilita entender o fluxo do workflow
   - Reduz confusão sobre origem dos dados

### **Por que usar `Keep Other Fields: No`?**

- **Garante isolamento:** Apenas os campos definidos são passados adiante
- **Evita vazamento:** Campos de uma API não vazam para outra
- **Previne erros:** APIs não recebem campos inesperados

### **Por que não usar fallbacks?**

- **Validação explícita:** Se um campo não existe, o erro aparece claramente
- **Debug mais fácil:** Identifica rapidamente qual campo está faltando
- **Comportamento previsível:** Sem lógica oculta de fallbacks

---

## 🆘 Troubleshooting

### **Erro: "Missing or invalid mensagem"**

**Causa:** O campo `mensagem` está vazio ou `undefined` no `EDIT_FIELDS_SDR`.

**Solução:**
1. Verifique o output do node anterior (Redis Buffer ou Mensagem)
2. Confirme que o campo `mensagens` existe e tem valor
3. Ajuste a expressão no `EDIT_FIELDS_SDR`:
   ```
   {{ $('Nome do Node').item.json.mensagens }}
   ```

### **Erro: "Invalid request body" na Evolution API**

**Causa:** O payload não está no formato esperado.

**Solução:**
1. Verifique o output do `EDIT_FIELDS_EVOLUTION`
2. Confirme que `textMessage` é um objeto com propriedade `text`
3. Verifique que `number` está no formato correto (sem caracteres especiais)

### **Campos extras aparecendo no payload**

**Causa:** `Keep Other Fields` está como `Yes` ou há múltiplos Edit Fields.

**Solução:**
1. Configure `Keep Other Fields: No` em ambos os Edit Fields
2. Remova Edit Fields desnecessários
3. Verifique se não há nodes Set extras no fluxo

---

## ✅ Resultado Final

Após a refatoração:

1. ✅ **EDIT_FIELDS_SDR** prepara payload limpo para Backend SDR
2. ✅ **POST /api/agent/intake** recebe apenas `{ lead_id, mensagem, canal }`
3. ✅ **EDIT_FIELDS_EVOLUTION** prepara payload limpo para Evolution API
4. ✅ **POST /message/send** recebe apenas `{ number, textMessage.text }`
5. ✅ Nenhum campo é reutilizado entre APIs
6. ✅ Nenhum fallback é usado
7. ✅ Fluxo claro e isolado

---

## 📚 Referências

- Backend SDR: `POST /api/agent/intake` → Aceita `{ lead_id, mensagem, canal }`
- Evolution API: `POST /message/send` → Aceita `{ number, textMessage: { text } }`

---

**Pronto! Agora o workflow está completamente separado e cada API recebe apenas o que precisa!** 🚀
