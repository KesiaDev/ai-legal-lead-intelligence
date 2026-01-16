# 🧠 Arquitetura do Agente IA do SDR Advogados

## ❌ **Zapier NÃO é o Agente IA**

**Zapier = Conector/Integrador** (mensageiro)
- Conecta canais (WhatsApp, Email) ao backend
- Não faz análise, não tem IA
- Apenas transporta dados

**Backend = Agente IA** (cérebro)
- Faz a análise jurídica
- Detecta área, urgência, score
- Decide ações e prioridades
- **AQUI está a inteligência**

---

## 🏗️ Arquitetura Correta

```
┌─────────────────────────────────────────────────────────┐
│                    CANAIS DE ENTRADA                    │
│  WhatsApp  │  Email  │  Formulário  │  Chat do Site    │
└────────────┬─────────┬──────────────┬───────────────────┘
             │         │              │
             ▼         ▼              ▼
┌─────────────────────────────────────────────────────────┐
│              ZAPIER (Conector/Integrador)               │
│  • Detecta mensagens                                    │
│  • Formata dados                                        │
│  • Envia para backend                                   │
│  ⚠️ NÃO faz análise, NÃO tem IA                        │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              SEU BACKEND (Railway)                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ENDPOINT: /api/agent/intake                      │  │
│  │  • Recebe: { lead_id, mensagem, canal }          │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  FUNÇÃO: analyzeLead(mensagem)                    │  │
│  │  🧠 AQUI ESTÁ O AGENTE IA                         │  │
│  │                                                    │  │
│  │  Atualmente: Mock (detecção básica)              │  │
│  │  Futuro: OpenAI GPT-4 (análise real)            │  │
│  │                                                    │  │
│  │  Retorna:                                         │  │
│  │  • Área jurídica                                  │  │
│  │  • Urgência                                       │  │
│  │  • Score de viabilidade                           │  │
│  │  • Ação sugerida                                  │  │
│  │  • Etapa do funil                                 │  │
│  │  • Prioridade                                     │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                   │
│                      ▼                                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  RESPOSTA JSON                                    │  │
│  │  { analise: { area, urgencia, score, ... } }     │  │
│  └───────────────────┬───────────────────────────────┘  │
└──────────────────────┼───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              ZAPIER (Ações Opcionais)                   │
│  • Salva no Google Sheets                               │
│  • Envia notificação no Slack                           │
│  • Cria lead no CRM                                     │
│  • Envia email para time                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 Onde Está o Agente IA?

### **LOCALIZAÇÃO: `backend/src/api/agent/intake.ts`**

```typescript
// Função que faz a análise (AGENTE IA)
function analyzeLead(mensagem: string) {
  // 🧠 AQUI está a inteligência
  // Atualmente: Mock (detecção básica)
  // Futuro: OpenAI GPT-4
  
  // Detecta área jurídica
  // Detecta urgência
  // Calcula score
  // Define ação
  // Retorna análise completa
}
```

### **ESTADO ATUAL:**
- ✅ Função criada e funcionando
- ⚠️ Usando análise mock (detecção básica por palavras-chave)
- 🔜 Pronto para integrar OpenAI GPT-4

### **FUTURO (Com OpenAI):**
```typescript
async function analyzeLead(mensagem: string) {
  // Chamada real para OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Você é um assistente jurídico especializado em análise de leads..."
      },
      {
        role: "user",
        content: `Analise esta mensagem: "${mensagem}"`
      }
    ]
  });
  
  // Extrai área, urgência, score, etc. da resposta da IA
  return analise;
}
```

---

## 🔄 Fluxo Completo com IA Real

### **1. Cliente envia mensagem:**
```
WhatsApp: "Preciso de ajuda com processo trabalhista urgente"
```

### **2. Zapier detecta e envia:**
```json
POST /api/agent/intake
{
  "lead_id": "123",
  "mensagem": "Preciso de ajuda com processo trabalhista urgente",
  "canal": "whatsapp"
}
```

### **3. Backend chama AGENTE IA:**
```typescript
// backend/src/api/agent/intake.ts
const analise = await analyzeLead(mensagem);
// ↑ AQUI está o agente IA (OpenAI GPT-4)
```

### **4. Agente IA analisa:**
```typescript
// OpenAI GPT-4 analisa a mensagem
// Retorna:
{
  area: "Direito Trabalhista",
  urgencia: "alta",
  score: 92,
  acao: "agendar_consulta",
  etapa_funil: "qualificado",
  prioridade: "alta",
  razao: "Menciona processo trabalhista e urgência, indicando necessidade imediata"
}
```

### **5. Backend retorna análise:**
```json
{
  "lead_id": "123",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 92,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  }
}
```

### **6. Zapier faz ações:**
- Salva no Google Sheets
- Notifica time no Slack
- Cria lead no CRM

---

## 📊 Comparação: Zapier vs Agente IA

| Aspecto | Zapier | Agente IA (Backend) |
|---------|--------|---------------------|
| **Função** | Conector/Integrador | Análise e Decisão |
| **Tem IA?** | ❌ Não | ✅ Sim (OpenAI) |
| **Faz análise?** | ❌ Não | ✅ Sim |
| **Detecta área jurídica?** | ❌ Não | ✅ Sim |
| **Calcula score?** | ❌ Não | ✅ Sim |
| **Onde está?** | Plataforma externa | Seu backend (Railway) |
| **Custo** | ~$20/mês | OpenAI API (~$0.01/request) |

---

## ✅ Resumo

### **Zapier:**
- 🔌 **Conector** - Liga canais ao backend
- 📨 **Transportador** - Envia dados
- ⚙️ **Automatizador** - Faz ações após análise
- ❌ **NÃO é agente IA**

### **Backend (Seu código):**
- 🧠 **Agente IA** - Faz análise jurídica
- 🎯 **Decisor** - Define área, urgência, ação
- 📊 **Analisador** - Calcula score e prioridade
- ✅ **AQUI está a inteligência**

---

## 🚀 Próximos Passos para IA Real

### **1. Integrar OpenAI no Backend:**
```typescript
// Substituir função mock por chamada real
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeLead(mensagem: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Você é um assistente jurídico..."
      },
      {
        role: "user",
        content: `Analise: "${mensagem}"`
      }
    ]
  });
  
  // Processar resposta e retornar análise estruturada
}
```

### **2. Adicionar variável de ambiente:**
```env
OPENAI_API_KEY=sk-...
```

### **3. Testar:**
- Enviar mensagem via Zapier
- Verificar análise real da IA
- Comparar com mock

---

## 💡 Conclusão

**Zapier = Mensageiro** (conecta canais ao backend)
**Backend = Agente IA** (faz análise e decisão)

**Eles trabalham juntos:**
- Zapier traz as mensagens
- Backend (agente IA) analisa
- Zapier executa ações baseadas na análise

**O agente IA está no seu backend, não no Zapier!** 🧠
