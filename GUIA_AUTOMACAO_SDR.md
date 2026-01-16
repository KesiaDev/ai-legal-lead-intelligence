# 🚀 Guia de Automação para SDR Advogados

## 📊 Comparação Rápida: n8n vs Alternativas

| Plataforma | Dificuldade | Custo | Tempo Setup | Melhor Para |
|------------|-------------|-------|-------------|-------------|
| **Zapier** | ⭐ Muito Fácil | 💰 Pago (~$20/mês) | ⚡ 5 min | Começar rápido |
| **Make** | ⭐⭐ Fácil | 💰 Pago (~$9/mês) | ⚡ 10 min | Workflows complexos |
| **Pipedream** | ⭐⭐⭐ Médio | 🆓 Gratuito | ⚡ 15 min | Desenvolvedores |
| **n8n** | ⭐⭐⭐⭐ Técnico | 🆓 Gratuito (self-host) | ⏱️ 30 min | Controle total |

---

## 🎯 Recomendação para SDR Advogados

### ✅ **OPÇÃO 1: Zapier (Mais Rápido)**
**Por quê?**
- Interface drag-and-drop super simples
- Conectores prontos para WhatsApp, Email, Google Sheets
- Setup em 5 minutos
- Suporte em português

**Como configurar:**
1. Acesse: https://zapier.com
2. Crie conta gratuita
3. Crie novo "Zap"
4. Trigger: WhatsApp (quando recebe mensagem)
5. Action: Webhook (POST para seu endpoint)

**URL do Webhook:**
```
https://sdradvogados.up.railway.app/api/agent/intake
```

**Body do Webhook (JSON):**
```json
{
  "lead_id": "{{zapier_meta_human_now}}",
  "mensagem": "{{message_text}}",
  "canal": "whatsapp"
}
```

**Custo:** ~$20/mês (plano Starter - 750 tasks)

---

### ✅ **OPÇÃO 2: Make (Melhor Custo-Benefício)**
**Por quê?**
- Mais barato que Zapier
- Mais flexível para workflows complexos
- Interface visual poderosa
- 1.000 operações grátis/mês

**Como configurar:**
1. Acesse: https://www.make.com
2. Crie conta gratuita
3. Crie novo "Scenario"
4. Adicione módulo: WhatsApp → Webhook
5. Configure HTTP Request para seu endpoint

**URL:** `https://sdradvogados.up.railway.app/api/agent/intake`

**Custo:** Grátis até 1.000 ops/mês, depois ~$9/mês

---

### ✅ **OPÇÃO 3: Pipedream (Gratuito + Código)**
**Por quê?**
- Totalmente gratuito (geroso)
- Permite código customizado
- Webhooks nativos
- Ideal para desenvolvedores

**Como configurar:**
1. Acesse: https://pipedream.com
2. Crie conta gratuita
3. New → HTTP Trigger
4. Adicione step: Send HTTP Request
5. Configure POST para seu endpoint

**Custo:** 🆓 Gratuito (10.000 invocações/mês)

---

### ✅ **OPÇÃO 4: n8n (Self-Hosted - Atual)**
**Por quê?**
- Totalmente gratuito
- Controle total
- Sem limites
- Já está configurado

**Como usar:**
1. Instale n8n (Docker ou Railway)
2. Crie workflow
3. Adicione Webhook trigger
4. Adicione HTTP Request para seu endpoint

**Custo:** 🆓 Gratuito (você hospeda)

---

## 🔧 Endpoint Pronto para Todas as Plataformas

Seu endpoint já está funcionando e compatível com **todas** as plataformas acima:

**URL:** `POST https://sdradvogados.up.railway.app/api/agent/intake`

**Body (JSON):**
```json
{
  "lead_id": "string",
  "mensagem": "string",
  "canal": "string"
}
```

**Resposta:**
```json
{
  "lead_id": "string",
  "canal": "string",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  },
  "timestamp": "2026-01-15T..."
}
```

---

## 🎬 Setup Rápido: Zapier (5 minutos)

### Passo 1: Criar Zap
1. Login em https://zapier.com
2. "Create Zap"

### Passo 2: Configurar Trigger
- Escolha: **WhatsApp** ou **Webhook** (mais flexível)
- Se Webhook: copie a URL que o Zapier gerar

### Passo 3: Configurar Action
- Escolha: **Webhooks by Zapier** → **POST**
- URL: `https://sdradvogados.up.railway.app/api/agent/intake`
- Method: `POST`
- Data: `JSON`
- Body:
```json
{
  "lead_id": "{{zapier_meta_human_now}}",
  "mensagem": "{{message_text}}",
  "canal": "whatsapp"
}
```

### Passo 4: Testar
- Clique em "Test"
- Verifique resposta no seu backend

---

## 🎬 Setup Rápido: Make (10 minutos)

### Passo 1: Criar Scenario
1. Login em https://www.make.com
2. "Create a new scenario"

### Passo 2: Adicionar Trigger
- Escolha: **Webhooks** → **Custom webhook**
- Copie a URL do webhook

### Passo 3: Adicionar Action
- Escolha: **HTTP** → **Make a request**
- Method: `POST`
- URL: `https://sdradvogados.up.railway.app/api/agent/intake`
- Body type: `Raw`
- Content type: `application/json`
- Request content:
```json
{
  "lead_id": "{{1.id}}",
  "mensagem": "{{1.message}}",
  "canal": "webhook"
}
```

### Passo 4: Testar
- Execute o scenario
- Verifique resposta

---

## 🎬 Setup Rápido: Pipedream (15 minutos)

### Passo 1: Criar Workflow
1. Login em https://pipedream.com
2. "New" → "HTTP/Webhook"

### Passo 2: Configurar Trigger
- Copie a URL do webhook gerada

### Passo 3: Adicionar Step
- "Add step" → "Send HTTP Request"
- Method: `POST`
- URL: `https://sdradvogados.up.railway.app/api/agent/intake`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "lead_id": "{{event.body.lead_id}}",
  "mensagem": "{{event.body.mensagem}}",
  "canal": "{{event.body.canal}}"
}
```

---

## 💡 Qual Escolher?

### 🚀 **Quer começar HOJE?**
→ **Zapier** (5 minutos, pago)

### 💰 **Quer economizar?**
→ **Make** (10 minutos, grátis até 1.000 ops)

### 👨‍💻 **É desenvolvedor?**
→ **Pipedream** (15 minutos, gratuito)

### 🎛️ **Quer controle total?**
→ **n8n** (já configurado, gratuito)

---

## ✅ Próximos Passos

1. **Escolha uma plataforma** (recomendo Zapier para começar)
2. **Configure o webhook** apontando para seu endpoint
3. **Teste enviando uma mensagem**
4. **Verifique a resposta** no seu backend

Seu endpoint já está pronto e funcionando! 🎉
