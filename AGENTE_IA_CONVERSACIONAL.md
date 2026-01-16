# 🧠 Agente IA Conversacional - SDR Advogados

## ✅ **Correção: Agente IA Precisa Ser Conversacional**

Você está **100% correto**! O agente IA não pode apenas analisar uma mensagem e agendar. Ele precisa:

1. ✅ **Fazer perguntas** para entender o cliente
2. ✅ **Coletar informações** progressivamente
3. ✅ **Qualificar o lead** durante a conversa
4. ✅ **Decidir quando agendar** vs coletar mais info
5. ✅ **Gerenciar estado da conversa**

---

## 🏗️ Arquitetura: Dois Endpoints

### **1. `/api/agent/intake` (Análise Simples)**
- Recebe uma mensagem
- Retorna análise (área, urgência, score)
- **Uso:** Quando já tem a mensagem completa

### **2. `/api/agent/conversation` (Conversacional) ⭐ NOVO**
- Gerencia conversa completa
- Faz perguntas progressivas
- Coleta informações passo a passo
- **Uso:** Conversa interativa com o cliente

---

## 🔄 Fluxo Conversacional Completo

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE ENVIA MENSAGEM                                 │
│  "Olá, preciso de ajuda"                                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: SAUDAÇÃO + LGPD                             │
│  "Olá! Bem-vindo... Você concorda com LGPD?"             │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "Sim, concordo"                                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: COLETA NOME                                  │
│  "Qual é o seu nome completo?"                         │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "João Silva"                                   │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: COLETA ÁREA                                  │
│  "Olá, João! Qual área do Direito?"                      │
│  [Opções: Trabalhista, Previdenciário, etc.]            │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "Trabalhista"                                  │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: COLETA DEMANDA                               │
│  "Descreva brevemente sua demanda..."                    │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "Fui demitido sem justa causa"                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: ANALISA + PERGUNTA URGÊNCIA                  │
│  "Entendi. Qual a urgência?"                            │
│  [Análise: Trabalhista, Score: 85, Urgência: Média]     │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "Média"                                        │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: COLETA LOCALIZAÇÃO                           │
│  "Em qual cidade você está?"                             │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "São Paulo, SP"                                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: COLETA CONTATO                               │
│  "Qual sua preferência de contato?"                     │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "WhatsApp"                                     │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: DECIDE AGENDAR (Score alto)                 │
│  "Perfeito! Gostaria de agendar uma conversa?"          │
│  [Análise: Score: 90, Ação: ready_to_schedule]          │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  CLIENTE: "Sim, gostaria"                                │
└───────────────┬─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────┐
│  AGENTE IA: CONFIRMA                                     │
│  "Perfeito! Seus dados foram registrados..."            │
│  [Estado: complete, Ação: scheduled]                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 Endpoint: `/api/agent/conversation`

### **POST: Continuar Conversa**

**Request:**
```json
POST /api/agent/conversation
{
  "lead_id": "lead-123",
  "message": "Sim, concordo",
  "conversation_data": {
    "lead_id": "lead-123",
    "state": "lgpd_consent",
    "conversation_history": [...]
  }
}
```

**Response:**
```json
{
  "lead_id": "lead-123",
  "state": "collecting_name",
  "message": "Obrigado! Qual é o seu nome completo?",
  "options": null,
  "conversation_data": {
    "lead_id": "lead-123",
    "state": "collecting_name",
    "lgpd_consent": true,
    "name": null,
    "conversation_history": [...]
  },
  "analysis": null,
  "requires_human": false,
  "timestamp": "2026-01-15T..."
}
```

### **GET: Iniciar Nova Conversa**

**Request:**
```
GET /api/agent/conversation/lead-123
```

**Response:**
```json
{
  "lead_id": "lead-123",
  "state": "lgpd_consent",
  "message": "Olá! Bem-vindo... Você concorda com LGPD?",
  "options": ["Sim, concordo", "Não concordo"],
  "conversation_data": {
    "lead_id": "lead-123",
    "state": "lgpd_consent",
    "conversation_history": [...]
  },
  "timestamp": "2026-01-15T..."
}
```

---

## 🎯 Estados da Conversa

| Estado | Descrição | Próximo Estado |
|--------|-----------|----------------|
| `greeting` | Início | `lgpd_consent` |
| `lgpd_consent` | Pedindo consentimento LGPD | `collecting_name` ou `rejected` |
| `collecting_name` | Coletando nome | `collecting_area` |
| `collecting_area` | Coletando área jurídica | `collecting_demand` |
| `collecting_demand` | Coletando descrição da demanda | `collecting_urgency` |
| `collecting_urgency` | Coletando urgência | `collecting_location` |
| `collecting_location` | Coletando localização | `collecting_contact` |
| `collecting_contact` | Coletando preferência de contato | `scheduling` |
| `scheduling` | Oferecendo agendamento | `complete` |
| `complete` | Conversa finalizada | - |
| `rejected` | Cliente rejeitou LGPD | - |

---

## 🧠 Lógica de Decisão do Agente

### **Quando Agendar?**
```typescript
if (score >= 80 && tem_demanda && tem_area) {
  // Agendar imediatamente
  action = 'ready_to_schedule';
} else if (score < 50) {
  // Coletar mais informações
  action = 'need_more_info';
} else {
  // Continuar qualificando
  action = 'continue_qualifying';
}
```

### **Análise em Tempo Real**
- A cada mensagem, o agente analisa:
  - Área jurídica detectada
  - Urgência detectada
  - Score de viabilidade
  - Ação sugerida

### **Personalização**
- Usa o nome do cliente nas perguntas
- Ajusta tom baseado na urgência
- Adapta perguntas ao contexto

---

## 🔄 Integração com Zapier

### **Fluxo Completo:**

```
1. Cliente envia: "Olá, preciso de ajuda"
   ↓
2. Zapier detecta (WhatsApp)
   ↓
3. Zapier: GET /api/agent/conversation/lead-123
   ↓
4. Backend retorna: "Olá! Bem-vindo... LGPD?"
   ↓
5. Zapier envia resposta para cliente
   ↓
6. Cliente responde: "Sim, concordo"
   ↓
7. Zapier: POST /api/agent/conversation
   {
     "lead_id": "lead-123",
     "message": "Sim, concordo",
     "conversation_data": {...}
   }
   ↓
8. Backend retorna: "Qual é o seu nome?"
   ↓
9. Zapier envia para cliente
   ↓
10. Repete até completar qualificação
```

---

## 📊 Dados Coletados

Ao final da conversa, você terá:

```json
{
  "lead_id": "lead-123",
  "lgpd_consent": true,
  "name": "João Silva",
  "area": "Direito Trabalhista",
  "demand": "Fui demitido sem justa causa",
  "urgency": "media",
  "location": "São Paulo, SP",
  "contact_preference": "WhatsApp",
  "wants_schedule": true,
  "analysis": {
    "area": "Direito Trabalhista",
    "urgency": "media",
    "score": 90,
    "action": "scheduled"
  }
}
```

---

## ✅ Vantagens do Agente Conversacional

✅ **Coleta informações progressivamente**
✅ **Qualifica lead durante a conversa**
✅ **Decide quando agendar vs coletar mais info**
✅ **Personaliza perguntas baseado no contexto**
✅ **Analisa em tempo real**
✅ **Gerencia estado da conversa**
✅ **Histórico completo da conversa**

---

## 🚀 Próximos Passos

1. ✅ Endpoint criado: `/api/agent/conversation`
2. 🔜 Integrar OpenAI para análise real (substituir mock)
3. 🔜 Adicionar persistência no banco (salvar conversas)
4. 🔜 Integrar com Zapier para WhatsApp
5. 🔜 Adicionar escalação para humano quando necessário

---

## 💡 Resumo

**Antes:** Endpoint só analisava mensagem única
**Agora:** Endpoint conversacional que:
- Faz perguntas
- Coleta informações
- Qualifica progressivamente
- Decide quando agendar

**O agente IA agora é verdadeiramente conversacional!** 🎉
