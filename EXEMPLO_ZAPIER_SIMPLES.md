# 🎯 Exemplo Simples: Como Zapier Funciona

## 📱 Cenário Real: Cliente Envia WhatsApp

### **ANTES (Manual):**
```
1. Cliente: "Preciso de ajuda com processo trabalhista"
2. Você: Lê a mensagem
3. Você: Analisa manualmente
4. Você: Decide o que fazer
5. Você: Salva no sistema
```
⏱️ **Tempo:** 5-10 minutos por lead

---

### **DEPOIS (Com Zapier):**
```
1. Cliente: "Preciso de ajuda com processo trabalhista"
2. Zapier: Detecta automaticamente
3. Zapier: Envia para seu backend
4. Backend: Analisa e retorna:
   - Área: Direito Trabalhista
   - Urgência: Alta
   - Score: 85
   - Ação: Agendar consulta
5. Zapier: Salva automaticamente no Google Sheets
```
⚡ **Tempo:** 2-3 segundos (automático)

---

## 🔄 Fluxo Visual Simplificado

```
┌─────────────────────────────────────────┐
│  CLIENTE ENVIA MENSAGEM NO WHATSAPP    │
│  "Preciso de ajuda com processo..."    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  ZAPIER DETECTA (Trigger)                │
│  "Nova mensagem recebida!"              │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  ZAPIER ENVIA PARA SEU BACKEND          │
│  POST /api/agent/intake                 │
│  {                                       │
│    "lead_id": "123",                    │
│    "mensagem": "Preciso de ajuda...",   │
│    "canal": "whatsapp"                  │
│  }                                       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  SEU BACKEND ANALISA                    │
│  Retorna:                                │
│  {                                       │
│    "analise": {                         │
│      "area": "Direito Trabalhista",     │
│      "urgencia": "alta",                │
│      "score": 85,                       │
│      "acao": "agendar_consulta"         │
│    }                                     │
│  }                                       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  ZAPIER SALVA NO GOOGLE SHEETS          │
│  (Automaticamente)                      │
└─────────────────────────────────────────┘
```

---

## 🎬 Como Configurar (Passo a Passo Visual)

### **PASSO 1: Criar Zap**
```
Zapier Dashboard
  └─ [Botão: "Create Zap"]
```

### **PASSO 2: Escolher Trigger**
```
[Quando isso acontecer...]
  └─ WhatsApp
     └─ "New Message"
```

### **PASSO 3: Conectar WhatsApp**
```
[Conectar conta WhatsApp]
  └─ Autorizar acesso
  └─ Testar (enviar mensagem de teste)
```

### **PASSO 4: Adicionar Action**
```
[Então faça isso...]
  └─ Webhooks by Zapier
     └─ POST
```

### **PASSO 5: Configurar Webhook**
```
URL: https://sdradvogados.up.railway.app/api/agent/intake

Method: POST

Body (JSON):
{
  "lead_id": "{{zapier_meta_human_now}}",
  "mensagem": "{{message_text}}",
  "canal": "whatsapp"
}
```

### **PASSO 6: Testar**
```
[Botão: "Test"]
  └─ Zapier envia requisição
  └─ Você vê a resposta do backend
```

### **PASSO 7: Ativar**
```
[Botão: "Turn on Zap"]
  └─ Pronto! Agora funciona automaticamente
```

---

## 📊 O Que Acontece na Prática

### **Mensagem 1:**
```
Cliente: "Preciso de ajuda com processo trabalhista urgente"

Zapier envia:
{
  "lead_id": "2026-01-15T10:30:00.123Z",
  "mensagem": "Preciso de ajuda com processo trabalhista urgente",
  "canal": "whatsapp"
}

Backend retorna:
{
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 90,
    "acao": "agendar_consulta",
    "prioridade": "alta"
  }
}
```

### **Mensagem 2:**
```
Cliente: "Gostaria de saber mais sobre previdência"

Zapier envia:
{
  "lead_id": "2026-01-15T10:35:00.456Z",
  "mensagem": "Gostaria de saber mais sobre previdência",
  "canal": "whatsapp"
}

Backend retorna:
{
  "analise": {
    "area": "Direito Previdenciário",
    "urgencia": "baixa",
    "score": 65,
    "acao": "coletar_mais_info",
    "prioridade": "baixa"
  }
}
```

---

## ✅ Resultado Final

**Google Sheets (preenchido automaticamente):**

| Lead ID | Mensagem | Canal | Área | Urgência | Score | Ação |
|---------|----------|-------|------|----------|-------|------|
| 2026-01-15... | Preciso de ajuda... | whatsapp | Trabalhista | alta | 90 | agendar_consulta |
| 2026-01-15... | Gostaria de saber... | whatsapp | Previdenciário | baixa | 65 | coletar_mais_info |

**Tudo automático!** 🎉

---

## 💡 Outros Exemplos

### **Email → Backend:**
```
Gmail recebe email
  └─ Zapier detecta
  └─ Envia para /api/agent/intake
  └─ Backend analisa
  └─ Zapier cria lead no CRM
```

### **Formulário → Backend:**
```
Cliente preenche formulário no site
  └─ Zapier recebe dados
  └─ Envia para /api/agent/intake
  └─ Backend analisa
  └─ Zapier envia email para time
```

---

## 🎯 Resumo em 3 Pontos

1. **Zapier detecta** quando algo acontece (WhatsApp, Email, Form)
2. **Zapier envia** para seu backend `/api/agent/intake`
3. **Zapier faz algo** com a resposta (salva, notifica, cria lead)

**É isso! Simples assim.** ✨
