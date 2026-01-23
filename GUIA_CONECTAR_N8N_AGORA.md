# ✅ SIM! Você JÁ PODE Conectar o N8N

## 🎯 Resposta Rápida

**SIM, você pode conectar o N8N AGORA mesmo!** 

Os endpoints essenciais para integração já estão funcionando e prontos para uso.

---

## ✅ O QUE ESTÁ PRONTO PARA N8N

### 1. **Webhook de Leads** ✅ FUNCIONANDO
**Endpoint:** `POST https://sdradvogados.up.railway.app/leads`

**O que faz:**
- ✅ Recebe leads do N8N
- ✅ Normaliza dados (telefone, nome, email)
- ✅ Classifica automaticamente (quente/morno/frio)
- ✅ Roteia inteligentemente (WhatsApp/SDR IA/Nutrição)
- ✅ Cria tenant automaticamente se não existir
- ✅ Retorna `clienteId` para filtros no N8N

**Exemplo de uso no N8N:**
```json
POST https://sdradvogados.up.railway.app/leads
Content-Type: application/json

{
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "email": "joao@example.com",
  "origem": "whatsapp",
  "clienteId": "escritorio-123"
}
```

**Resposta:**
```json
{
  "success": true,
  "leadId": "uuid-do-lead",
  "clienteId": "escritorio-123",
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

### 2. **Agente IA - Intake** ✅ FUNCIONANDO
**Endpoint:** `POST https://sdradvogados.up.railway.app/api/agent/intake`

**O que faz:**
- ✅ Recebe mensagens de leads
- ✅ Analisa área jurídica
- ✅ Define urgência e prioridade
- ✅ Retorna ação sugerida

**Exemplo de uso no N8N:**
```json
POST https://sdradvogados.up.railway.app/api/agent/intake
Content-Type: application/json

{
  "lead_id": "uuid-do-lead",
  "mensagem": "Preciso de ajuda com demissão sem justa causa",
  "canal": "whatsapp",
  "clienteId": "escritorio-123"
}
```

**Resposta:**
```json
{
  "lead_id": "uuid-do-lead",
  "canal": "whatsapp",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  },
  "timestamp": "2026-01-20T..."
}
```

---

### 3. **Agente IA - Conversação** ✅ FUNCIONANDO
**Endpoint:** `POST https://sdradvogados.up.railway.app/api/agent/conversation`

**O que faz:**
- ✅ Gerencia fluxo de qualificação
- ✅ Coleta dados do lead (nome, área, demanda, urgência)
- ✅ Mantém histórico da conversa
- ✅ Retorna respostas do agente

**Exemplo de uso no N8N:**
```json
POST https://sdradvogados.up.railway.app/api/agent/conversation
Content-Type: application/json

{
  "lead_id": "uuid-do-lead",
  "message": "Olá, preciso de ajuda",
  "conversation_data": {...},
  "clienteId": "escritorio-123"
}
```

---

## ⚠️ O QUE AINDA NÃO ESTÁ CONECTADO (mas NÃO impede o N8N)

### 1. **Configurações do Agente** ⚠️
- ❌ Status do agente não persiste no banco
- ❌ Horário de funcionamento não persiste
- ❌ Prompts não estão salvos no banco

**Impacto no N8N:** ⚠️ **NENHUM**
- O N8N apenas **envia dados** para os webhooks
- As configurações do agente são usadas **dentro da plataforma**
- O N8N funciona normalmente sem essas configurações

### 2. **Base de Conhecimento** ⚠️
- ❌ Itens não estão salvos no banco

**Impacto no N8N:** ⚠️ **NENHUM**
- O N8N não precisa acessar a base de conhecimento
- A base é usada apenas internamente pela IA

---

## 🚀 COMO CONECTAR O N8N AGORA (5 minutos)

### Passo 1: Criar Workflow no N8N

1. Acesse seu N8N
2. Clique em **"Add workflow"**
3. Nomeie: `SDR Advogados - Captura de Leads`

### Passo 2: Adicionar Webhook Trigger

1. Clique em **"Add node"**
2. Busque **"Webhook"** → Selecione **"Webhook"**
3. Configure:
   - **HTTP Method:** `POST`
   - **Path:** `/leads` (ou qualquer path)
   - **Response Mode:** `Response Node`
4. Clique em **"Execute Node"** para ativar
5. Copie a **URL do webhook** gerada

### Passo 3: Adicionar HTTP Request (Enviar para API)

1. Após o webhook, adicione node **"HTTP Request"**
2. Configure:
   - **Method:** `POST`
   - **URL:** `https://sdradvogados.up.railway.app/leads`
   - **Authentication:** None
   - **Body Content Type:** JSON
   - **Body:**
   ```json
   {
     "nome": "{{ $json.body.nome }}",
     "telefone": "{{ $json.body.telefone }}",
     "email": "{{ $json.body.email }}",
     "origem": "{{ $json.body.origem }}",
     "clienteId": "seu-escritorio-id"
   }
   ```

### Passo 4: Adicionar Switch (Roteamento)

1. Após o HTTP Request, adicione node **"Switch"**
2. Configure para verificar `routing.destino`:
   - **Rota 1:** `{{ $json.routing.destino }}` = `"whatsapp_humano"`
   - **Rota 2:** `{{ $json.routing.destino }}` = `"sdr_ia"`
   - **Rota 3:** `{{ $json.routing.destino }}` = `"nutricao"`

### Passo 5: Testar

1. Envie um POST para a URL do webhook do N8N:
   ```json
   {
     "nome": "Teste",
     "telefone": "(11) 99999-9999",
     "email": "teste@example.com",
     "origem": "site"
   }
   ```
2. Verifique se o lead aparece na plataforma
3. Verifique se o roteamento funcionou

---

## 📋 Exemplo Completo de Workflow N8N

```
1. Webhook (Trigger)
   ↓
2. HTTP Request → POST /leads (API SDR)
   ↓
3. Switch (routing.destino)
   ├─ Rota 1: "whatsapp_humano"
   │  └─ HTTP Request (WhatsApp API)
   │
   ├─ Rota 2: "sdr_ia"
   │  └─ HTTP Request → POST /api/agent/intake
   │
   └─ Rota 3: "nutricao"
      └─ HTTP Request (Email Marketing)
```

---

## ✅ CHECKLIST: Pronto para N8N?

- [x] Webhook `/leads` funcionando
- [x] Endpoint `/api/agent/intake` funcionando
- [x] Endpoint `/api/agent/conversation` funcionando
- [x] Classificação automática funcionando
- [x] Roteamento inteligente funcionando
- [x] Multi-tenancy funcionando (clienteId)
- [ ] Configurações do agente no banco (não necessário para N8N)
- [ ] Base de conhecimento no banco (não necessário para N8N)

**Resultado:** ✅ **PRONTO PARA CONECTAR N8N AGORA!**

---

## 🎯 Próximos Passos

1. **AGORA:** Conecte o N8N e teste o fluxo completo
2. **DEPOIS:** Conecte as configurações do agente ao banco (melhora interna)
3. **DEPOIS:** Conecte a base de conhecimento (melhora interna)

---

## 💡 Dica Importante

**As configurações do agente não precisam estar no banco para o N8N funcionar!**

O N8N apenas:
- ✅ Recebe dados (webhook)
- ✅ Envia dados para a API (HTTP Request)
- ✅ Processa respostas (Switch/Router)

As configurações do agente são usadas **dentro da plataforma web**, não pelo N8N.

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas na configuração do N8N, me avise! Posso ajudar a montar o workflow completo.
