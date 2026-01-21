# 🔧 Resolver Erro "Invalid URL" no N8N

## 🎯 Problema Identificado

**Erro no N8N:**
```
Invalid URL: https://api.sdrjuridico.com.br/api/agent/intake.
URL must start with "http" or "https".
```

**Também há:**
- Timeout exceeded

---

## ✅ SOLUÇÃO: Limpar e Reinserir a URL

### **Problema Comum:**
A URL pode ter:
- ❌ Espaços invisíveis no início ou fim
- ❌ Caracteres especiais ocultos
- ❌ Quebras de linha
- ❌ Formatação incorreta

---

## 🔧 Passo a Passo para Corrigir

### **Passo 1: Limpar o Campo URL**

1. No node **"POST - Inbound Message (Backend)"**
2. Vá no campo **"URL"**
3. **Selecione TODO o texto** (Ctrl+A ou Cmd+A)
4. **Delete** (Backspace ou Delete)
5. **Digite novamente** (não cole, digite):
   ```
   https://api.sdrjuridico.com.br/api/agent/intake
   ```
6. **NÃO adicione espaços** no início ou fim
7. **NÃO pressione Enter** (pode criar quebra de linha)

---

### **Passo 2: Verificar Formato do JSON**

No campo **"JSON"**, verifique se está assim:

```json
{
  "lead_id": "{{ $json.lead_id }}",
  "mensagem": "{{ $json.mensagem }}",
  "canal": "{{ $json.canal }}"
}
```

**⚠️ IMPORTANTE:**
- Use **expressões N8N** com `{{ }}`
- **NÃO** use `"string"` literal
- **NÃO** adicione vírgulas extras
- **NÃO** adicione quebras de linha desnecessárias

---

### **Passo 3: Verificar Configurações**

1. **Method:** `POST` ✅
2. **Authentication:** `None` ✅
3. **Send Body:** `ON` (verde) ✅
4. **Body Content Type:** `JSON` ✅
5. **Specify Body:** `Using JSON` ✅

---

### **Passo 4: Testar a URL Diretamente**

Antes de testar no N8N, teste a URL diretamente:

**No navegador:**
```
https://api.sdrjuridico.com.br/api/agent/intake
```

**Com curl:**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste",
    "canal": "whatsapp"
  }'
```

**Se funcionar:** URL está correta, problema é no N8N
**Se não funcionar:** Problema é no servidor/domínio

---

## 🔍 Soluções Alternativas

### **Solução 1: Usar URL Railway Direta**

Se o domínio customizado não funcionar, use a URL Railway:

**No campo URL, digite:**
```
https://legal-lead-scout-production.up.railway.app/api/agent/intake
```

(Substitua pela URL real do seu serviço backend no Railway)

---

### **Solução 2: Verificar DNS**

O domínio pode não estar propagado ainda:

1. Acesse: https://dnschecker.org
2. Digite: `api.sdrjuridico.com.br`
3. Verifique se está apontando para Railway

**Se não estiver:**
- Aguarde propagação DNS (pode levar até 24h)
- Ou use URL Railway direta temporariamente

---

### **Solução 3: Verificar Timeout**

O erro de timeout pode indicar:
- ❌ Servidor não está respondendo
- ❌ Porta incorreta
- ❌ Firewall bloqueando

**Verifique:**
1. Railway → Serviço "SDR Advogados Backend"
2. Status: **"Online"**?
3. Logs: Backend está rodando?

---

## ✅ Configuração Correta Final

### **Node: "POST - Inbound Message (Backend)"**

**Method:** `POST`

**URL:** (digite sem espaços)
```
https://api.sdrjuridico.com.br/api/agent/intake
```

**Authentication:** `None`

**Send Body:** `ON`

**Body Content Type:** `JSON`

**Specify Body:** `Using JSON`

**JSON:**
```json
{
  "lead_id": "{{ $json.lead_id }}",
  "mensagem": "{{ $json.mensagem }}",
  "canal": "{{ $json.canal }}",
  "clienteId": "{{ $json.clienteId }}"
}
```

---

## 🧪 Teste Após Correção

1. **Salve o node**
2. **Execute o workflow**
3. **Verifique o OUTPUT**

**Resultado esperado:**
- ✅ Status: `200 OK`
- ✅ JSON com `analise`, `lead_id`, etc.

**Se ainda der erro:**
- Verifique logs do backend no Railway
- Teste a URL com curl/Postman
- Verifique se o domínio está propagado

---

## 📝 Checklist

- [ ] URL digitada manualmente (não colada)
- [ ] Sem espaços no início ou fim
- [ ] Sem quebras de linha
- [ ] JSON usa expressões `{{ }}`
- [ ] Method: POST
- [ ] Send Body: ON
- [ ] Body Content Type: JSON
- [ ] Testou URL diretamente (curl/Postman)?
- [ ] Backend está Online no Railway?
- [ ] DNS propagado?

---

**Pronto! Após seguir esses passos, o erro deve ser resolvido!** 🚀
