# 📝 Resumo Rápido: Adaptar Workflow N8N

## 🎯 O QUE FAZER (3 Passos Simples)

### **PASSO 1: Substituir Supabase pelo Seu Backend**

**❌ REMOVER:**
- `Encontrar Cliente` (Supabase)
- `Cliente existe?` (IF)
- `Criar Cliente` (Supabase)
- `Merge`

**✅ ADICIONAR:**
- `HTTP Request` → `POST https://sdradvogados.up.railway.app/leads`

**Configuração:**
```
URL: https://sdradvogados.up.railway.app/leads
Method: POST
Body:
{
  "nome": "={{ $('Dados Lead').item.json.Nome }}",
  "telefone": "={{ $('Dados Lead').item.json.Telefone }}",
  "origem": "whatsapp"
}
```

---

### **PASSO 2: Substituir LangChain pelo Seu Endpoint**

**❌ REMOVER:**
- `OpenAI Chat Model`
- `Agente IA` (LangChain)
- `Postgres Chat Memory`
- `Calculadora`
- `Desativar Agente` (opcional)

**✅ ADICIONAR:**
- `HTTP Request` → `POST /api/agent/conversation`

**Configuração:**
```
URL: https://sdradvogados.up.railway.app/api/agent/conversation
Method: POST
Body:
{
  "lead_id": "={{ $('Criar Lead').item.json.leadId }}",
  "message": "={{ $('Mensagem').item.json.mensagens }}",
  "clienteId": "={{ $('Criar Lead').item.json.clienteId }}"
}
```

**⚠️ IMPORTANTE:** Precisa armazenar `conversation_data` no Redis!

---

### **PASSO 3: Manter o Resto (Funciona Igual)**

✅ **MANTER:**
- Gatilho (Webhook)
- Filtro de Bloqueio
- Dados Lead
- Redis (status agente)
- Bot Desativado?!
- Rotas de Mensagens
- Tratamento de Mensagens
- Buffer de Mensagens
- Humanização
- Envio de Mensagem

---

## 🔄 FLUXO VISUAL SIMPLIFICADO

```
[Gatilho] → [Filtro] → [Dados Lead] → [Redis Status]
                                              ↓
                                    [Bot Desativado?!]
                                              ↓
                                    [Rotas Mensagens]
                                              ↓
                                    [Buffer Mensagens]
                                              ↓
                                    [POST /leads] ⭐ NOVO
                                              ↓
                                    [POST /api/agent/conversation] ⭐ NOVO
                                              ↓
                                    [Humanização]
                                              ↓
                                    [Enviar Mensagem]
```

---

## ⚠️ ATENÇÃO: Conversation Data

Você precisa armazenar `conversation_data` entre chamadas!

**Solução:**
1. Após `POST /api/agent/conversation`, salve `conversation_data` no Redis
2. Antes de chamar novamente, recupere do Redis
3. Chave: `{{ telefone }}_conversation`

**Exemplo:**
```json
// Salvar (após agente IA)
{
  "key": "={{ $('Dados Lead').item.json.Telefone }}_conversation",
  "value": "={{ $json.conversation_data }}"
}

// Recuperar (antes de agente IA)
{
  "key": "={{ $('Dados Lead').item.json.Telefone }}_conversation"
}
```

---

## ✅ CHECKLIST RÁPIDO

- [ ] Remover nodes do Supabase
- [ ] Adicionar `POST /leads`
- [ ] Remover nodes do LangChain
- [ ] Adicionar `POST /api/agent/conversation`
- [ ] Configurar armazenamento de `conversation_data`
- [ ] Testar fluxo completo

---

## 🚀 PRONTO!

Agora você tem um workflow adaptado para seu sistema! 🎉
