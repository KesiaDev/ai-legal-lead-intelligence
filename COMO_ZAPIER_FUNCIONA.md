# 🔄 Como o Zapier Funciona no SDR Advogados

## 📚 Conceito Básico do Zapier

**Zapier = Automações sem código**

Um **"Zap"** é uma automação que conecta 2 ou mais apps:
```
[APP 1] → [ZAPIER] → [APP 2]
```

**Exemplo simples:**
```
[Gmail recebe email] → [ZAPIER] → [Salva no Google Sheets]
```

---

## 🎯 Como Funciona no SDR Advogados

### Fluxo Completo:

```
[WhatsApp/Email/Form] → [ZAPIER] → [Seu Backend] → [Análise IA] → [Resposta]
```

### Exemplo Prático:

1. **Cliente envia mensagem no WhatsApp**
   - "Preciso de ajuda com processo trabalhista urgente"

2. **Zapier detecta a mensagem** (Trigger)
   - Captura: texto, número, horário

3. **Zapier envia para seu backend** (Action)
   - POST para: `https://sdradvogados.up.railway.app/api/agent/intake`
   - Body: `{ lead_id, mensagem, canal }`

4. **Seu backend analisa** (já implementado)
   - Detecta área: "Direito Trabalhista"
   - Detecta urgência: "alta"
   - Calcula score: 85
   - Define ação: "agendar_consulta"

5. **Zapier recebe resposta** (opcional)
   - Pode salvar no banco
   - Pode enviar notificação
   - Pode criar lead no CRM

---

## 🎬 Exemplo Visual: Zap Completo

### **ZAP 1: WhatsApp → Backend → Google Sheets**

```
┌─────────────────┐
│  WhatsApp       │
│  (Trigger)      │
│                 │
│  Nova mensagem  │
│  recebida       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Zapier         │
│  (Processa)     │
│                 │
│  Extrai:        │
│  - Texto        │
│  - Número       │
│  - Horário      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Webhook        │
│  (Action)       │
│                 │
│  POST para:     │
│  /api/agent/    │
│  intake         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Seu Backend    │
│  (Railway)      │
│                 │
│  Analisa lead   │
│  Retorna JSON   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheets  │
│  (Action)       │
│                 │
│  Salva lead     │
│  com análise    │
└─────────────────┘
```

---

## 📋 Passo a Passo: Criar Zap no Zapier

### **CENÁRIO 1: WhatsApp → Backend**

#### **PASSO 1: Criar Novo Zap**
1. Acesse: https://zapier.com
2. Login ou crie conta
3. Clique em **"Create Zap"**

#### **PASSO 2: Configurar Trigger (WhatsApp)**
1. Procure por: **"WhatsApp"** ou **"Webhooks by Zapier"**
2. Escolha: **"New Message"** (WhatsApp) ou **"Catch Hook"** (Webhook)
3. Conecte sua conta WhatsApp (se usar WhatsApp Business API)
4. **Teste** o trigger (envie uma mensagem de teste)

**Dados capturados:**
```json
{
  "message_text": "Preciso de ajuda com processo trabalhista",
  "phone_number": "+5511999999999",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

#### **PASSO 3: Configurar Action (Webhook para seu Backend)**
1. Clique em **"Add Step"**
2. Procure por: **"Webhooks by Zapier"**
3. Escolha: **"POST"**
4. Configure:

**URL:**
```
https://sdradvogados.up.railway.app/api/agent/intake
```

**Method:**
```
POST
```

**Data Pass-Through:**
```
No (desmarcado)
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "lead_id": "{{zapier_meta_human_now}}",
  "mensagem": "{{message_text}}",
  "canal": "whatsapp"
}
```

**Explicação dos campos:**
- `{{zapier_meta_human_now}}` = Gera ID único automático
- `{{message_text}}` = Texto da mensagem do WhatsApp
- `"whatsapp"` = Fixo, indica o canal

#### **PASSO 4: Testar**
1. Clique em **"Test"**
2. Zapier vai enviar uma requisição para seu backend
3. Verifique a resposta:

**Resposta esperada:**
```json
{
  "lead_id": "2026-01-15T10:30:00.123Z",
  "canal": "whatsapp",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  },
  "timestamp": "2026-01-15T10:30:01.456Z"
}
```

#### **PASSO 5: Adicionar Action Opcional (Salvar no Google Sheets)**
1. Clique em **"Add Step"**
2. Procure por: **"Google Sheets"**
3. Escolha: **"Create Spreadsheet Row"**
4. Configure:
   - **Spreadsheet:** Escolha ou crie uma planilha
   - **Worksheet:** Escolha a aba
   - **Colunas:**
     - `Lead ID`: `{{1.lead_id}}`
     - `Mensagem`: `{{1.mensagem}}`
     - `Canal`: `{{1.canal}}`
     - `Área`: `{{1.analise.area}}`
     - `Urgência`: `{{1.analise.urgencia}}`
     - `Score`: `{{1.analise.score}}`
     - `Ação`: `{{1.analise.acao}}`
     - `Prioridade`: `{{1.analise.prioridade}}`

#### **PASSO 6: Ativar Zap**
1. Clique em **"Turn on Zap"**
2. Pronto! Agora toda mensagem do WhatsApp será processada automaticamente

---

## 🎯 Outros Cenários Práticos

### **CENÁRIO 2: Formulário Web → Backend**

**Trigger:** Google Forms / Typeform / Webhook
**Action:** Webhook para seu backend

**Body exemplo:**
```json
{
  "lead_id": "{{form_response_id}}",
  "mensagem": "{{form_message}}",
  "canal": "formulario"
}
```

---

### **CENÁRIO 3: Email → Backend → Notificação**

**Trigger:** Gmail (nova mensagem)
**Action 1:** Webhook para seu backend
**Action 2:** Slack (enviar notificação com análise)

**Body exemplo:**
```json
{
  "lead_id": "{{email_id}}",
  "mensagem": "{{email_body}}",
  "canal": "email"
}
```

---

### **CENÁRIO 4: Chat do Site → Backend → CRM**

**Trigger:** Webhook (chat widget envia para Zapier)
**Action 1:** Webhook para seu backend
**Action 2:** HubSpot/Pipedrive (criar lead com dados da análise)

---

## 🔧 Variáveis do Zapier

O Zapier permite usar dados de steps anteriores:

**Sintaxe:**
```
{{step_number.campo}}
```

**Exemplos:**
- `{{1.message_text}}` = Texto da mensagem do step 1
- `{{2.analise.area}}` = Área jurídica da resposta do step 2
- `{{zapier_meta_human_now}}` = Timestamp atual (ID único)

---

## 📊 Exemplo Completo: Multi-Step Zap

### **ZAP: WhatsApp → Backend → Sheets → Slack**

```
Step 1: WhatsApp (Trigger)
  └─ Captura mensagem

Step 2: Webhook POST (Action)
  └─ Envia para /api/agent/intake
  └─ Recebe análise

Step 3: Google Sheets (Action)
  └─ Salva lead + análise

Step 4: Slack (Action)
  └─ Notifica time com:
     "Novo lead: Direito Trabalhista
      Urgência: Alta
      Score: 85
      Ação: Agendar consulta"
```

---

## 💰 Custos do Zapier

### **Plano Gratuito:**
- 100 tasks/mês
- 5 Zaps ativos
- ⚠️ **Limitado para produção**

### **Plano Starter ($19.99/mês):**
- 750 tasks/mês
- Zaps ilimitados
- ✅ **Ideal para começar**

### **Plano Professional ($49/mês):**
- 2.000 tasks/mês
- Filtros avançados
- ✅ **Para uso profissional**

---

## ✅ Vantagens do Zapier

✅ **Muito fácil** - Interface visual drag-and-drop
✅ **Rápido** - Setup em 5 minutos
✅ **Conectores prontos** - WhatsApp, Email, Sheets, CRM
✅ **Confiável** - Uptime de 99.9%
✅ **Suporte** - Documentação em português

---

## ⚠️ Limitações do Zapier

⚠️ **Custo** - Pago após plano gratuito
⚠️ **Limite de tasks** - Pode estourar com muito volume
⚠️ **Menos flexível** - Comparado a código customizado

---

## 🚀 Próximos Passos

1. **Criar conta no Zapier** (grátis para testar)
2. **Criar Zap de teste** (WhatsApp → Webhook)
3. **Testar com mensagem real**
4. **Verificar resposta no backend**
5. **Adicionar actions extras** (Sheets, Slack, etc.)

---

## 📝 Checklist de Setup

- [ ] Conta Zapier criada
- [ ] Trigger configurado (WhatsApp/Email/Form)
- [ ] Webhook action apontando para seu backend
- [ ] Body JSON configurado corretamente
- [ ] Zap testado e funcionando
- [ ] Zap ativado
- [ ] Monitoramento configurado (opcional)

---

## 🎯 Resumo

**Zapier = Automação visual que conecta apps**

**Para SDR Advogados:**
1. Cliente envia mensagem (WhatsApp/Email/Form)
2. Zapier captura automaticamente
3. Zapier envia para seu backend `/api/agent/intake`
4. Backend analisa e retorna dados estruturados
5. Zapier pode salvar, notificar, criar lead, etc.

**Tempo total de setup: 5-10 minutos** ⚡
