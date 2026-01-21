# 🔄 Como Funciona Evolution API em SaaS Multi-Tenant

## 🎯 Resposta Rápida

**Você tem 2 opções:**

### **Opção 1: Evolution Compartilhada (Recomendado para Começar)**
- ✅ **Você** gerencia UMA Evolution API
- ✅ **Todos os clientes** usam a mesma instância
- ✅ Cliente **NÃO precisa** configurar nada
- ✅ Você controla tudo

### **Opção 2: Evolution por Cliente (Escalável)**
- ✅ **Cada cliente** tem sua própria Evolution API
- ✅ Cliente **cadastra** e te passa as credenciais
- ✅ Você configura no N8N
- ✅ Isolamento completo

---

## 🤔 Por Que Tem Evolution no N8N E na Plataforma?

### **Evolution API no N8N:**
- ✅ **Onde realmente funciona**
- ✅ N8N usa Evolution para **enviar/receber** mensagens
- ✅ É aqui que a **mágica acontece**

### **Evolution API na Plataforma:**
- ⚠️ **Apenas para referência/documentação**
- ⚠️ Cliente vê suas credenciais (se tiver própria)
- ⚠️ **NÃO é usada diretamente** pela plataforma
- ⚠️ A plataforma **NÃO envia mensagens** via Evolution

**Resumo:** Evolution funciona no **N8N**, não na plataforma. A plataforma apenas **mostra** as configurações.

---

## 📊 Modelo 1: Evolution Compartilhada (Recomendado)

### **Como Funciona:**

```
Você (Provedor SaaS)
├─ Gerencia UMA Evolution API
├─ Cria instâncias para cada cliente
│  ├─ Instância: "SDRAdvogados2" (Cliente A)
│  ├─ Instância: "SDRAdvogados3" (Cliente B)
│  └─ Instância: "SDRAdvogados4" (Cliente C)
└─ Todos usam a mesma URL/API Key
```

### **O Que o Cliente Precisa Fazer:**

**NADA!** ✅

- ❌ Cliente **NÃO precisa** ter Evolution API
- ❌ Cliente **NÃO precisa** cadastrar nada
- ❌ Cliente **NÃO precisa** passar código
- ✅ Cliente apenas **usa a plataforma**

### **O Que Você Faz:**

1. **Criar instância Evolution para cada cliente:**
   - Cliente A → Instância: `SDRAdvogados2`
   - Cliente B → Instância: `SDRAdvogados3`
   - Cliente C → Instância: `SDRAdvogados4`

2. **Configurar no N8N:**
   - Mapear `clienteId` → `instância Evolution`
   - Usar a mesma URL/API Key para todos

3. **Configurar na Plataforma (Opcional):**
   - Mostrar credenciais para referência
   - Cliente vê que está usando Evolution

### **Vantagens:**
- ✅ Cliente não precisa saber nada
- ✅ Você controla tudo
- ✅ Fácil de gerenciar
- ✅ Custo único (você paga)

### **Desvantagens:**
- ⚠️ Você paga por todas as instâncias
- ⚠️ Se Evolution cair, todos os clientes são afetados

---

## 📊 Modelo 2: Evolution por Cliente (Escalável)

### **Como Funciona:**

```
Cliente A
├─ Tem sua própria Evolution API
├─ Cria instância: "EscritorioABC"
├─ Te passa: URL, API Key, Nome da Instância
└─ Você configura no N8N

Cliente B
├─ Tem sua própria Evolution API
├─ Cria instância: "EscritorioXYZ"
├─ Te passa: URL, API Key, Nome da Instância
└─ Você configura no N8N
```

### **O Que o Cliente Precisa Fazer:**

1. **Criar conta na Evolution API:**
   - Acessar: https://evolution-api.com (ou seu provedor)
   - Criar conta
   - Obter URL, API Key

2. **Criar instância:**
   - Criar instância no Evolution API Manager
   - Conectar WhatsApp Business
   - Obter nome da instância

3. **Te passar as credenciais:**
   - URL: `https://seu-evolution.com`
   - API Key: `sua-api-key`
   - Nome da Instância: `EscritorioABC`

### **O Que Você Faz:**

1. **Receber credenciais do cliente:**
   - Cliente te passa URL, API Key, Nome da Instância

2. **Configurar no N8N:**
   - Mapear `clienteId` → credenciais Evolution
   - Configurar HTTP Request com credenciais do cliente

3. **Configurar na Plataforma (Opcional):**
   - Cliente pode ver suas próprias credenciais
   - Apenas para referência

### **Vantagens:**
- ✅ Cliente paga sua própria Evolution
- ✅ Isolamento completo
- ✅ Se Evolution do cliente cair, só ele é afetado
- ✅ Escalável (cada cliente gerencia seu custo)

### **Desvantagens:**
- ⚠️ Cliente precisa saber configurar Evolution
- ⚠️ Você precisa configurar credenciais no N8N
- ⚠️ Mais complexo de gerenciar

---

## 🔧 Como Configurar no N8N

### **Modelo 1: Evolution Compartilhada**

**No N8N, node "HTTP Request" (Evolution API):**

```javascript
// URL (mesma para todos)
URL: https://drybee-evolution.cloudfy.live/message/sendText/{{INSTANCIA}}

// Instância (varia por cliente)
const clienteId = $('Identificar Cliente').item.json.clienteId;

const instancias = {
  "escritorio-abc-123": "SDRAdvogados2",  // Cliente A
  "escritorio-xyz-456": "SDRAdvogados3",  // Cliente B
  "escritorio-123-789": "SDRAdvogados4",  // Cliente C
};

const instancia = instancias[clienteId] || "SDRAdvogados2";

// URL final
const url = `https://drybee-evolution.cloudfy.live/message/sendText/${instancia}`;
```

**Authentication:**
- Type: `Header Auth`
- Name: `apikey`
- Value: `SUA_API_KEY_COMPARTILHADA` (mesma para todos)

---

### **Modelo 2: Evolution por Cliente**

**No N8N, node "HTTP Request" (Evolution API):**

```javascript
// Identificar cliente
const clienteId = $('Identificar Cliente').item.json.clienteId;

// Credenciais por cliente (você configura)
const credenciais = {
  "escritorio-abc-123": {
    url: "https://evolution-cliente-a.com",
    apiKey: "api-key-cliente-a",
    instancia: "EscritorioABC"
  },
  "escritorio-xyz-456": {
    url: "https://evolution-cliente-b.com",
    apiKey: "api-key-cliente-b",
    instancia: "EscritorioXYZ"
  },
};

const creds = credenciais[clienteId];

// URL final
const url = `${creds.url}/message/sendText/${creds.instancia}`;
```

**Authentication:**
- Type: `Header Auth`
- Name: `apikey`
- Value: `{{creds.apiKey}}` (varia por cliente)

---

## 📋 O Que Fazer na Plataforma

### **Opção A: Remover Evolution da Plataforma**

**Por quê:**
- Evolution funciona no N8N, não na plataforma
- Cliente não precisa ver isso
- Evita confusão

**Como fazer:**
- Remover aba "Evolution API" das Integrações
- Manter apenas OpenAI e N8N

---

### **Opção B: Manter Evolution na Plataforma (Referência)**

**Por quê:**
- Cliente vê suas credenciais (se tiver própria)
- Documentação/referência
- Transparência

**Como fazer:**
- Manter aba "Evolution API"
- Adicionar aviso: "Configure no N8N, não aqui"
- Mostrar credenciais apenas para referência

---

## 🎯 Recomendação: Modelo Híbrido

### **Para Começar:**
- ✅ Use **Evolution Compartilhada**
- ✅ Você gerencia tudo
- ✅ Cliente não precisa saber nada

### **Para Escalar:**
- ✅ Ofereça **Evolution por Cliente** (opcional)
- ✅ Cliente paga sua própria Evolution
- ✅ Você configura no N8N

### **Na Plataforma:**
- ✅ Remover Evolution (ou deixar apenas referência)
- ✅ Focar em OpenAI e N8N
- ✅ Explicar que Evolution é configurada no N8N

---

## 📝 Exemplo Prático

### **Cenário: 3 Clientes**

**Cliente A (Pequeno):**
- Usa Evolution Compartilhada
- Instância: `SDRAdvogados2`
- Você gerencia tudo
- Cliente não sabe nada sobre Evolution

**Cliente B (Médio):**
- Usa Evolution Compartilhada
- Instância: `SDRAdvogados3`
- Você gerencia tudo
- Cliente não sabe nada sobre Evolution

**Cliente C (Grande):**
- Tem Evolution própria
- Instância: `EscritorioGrande`
- Te passou credenciais
- Você configurou no N8N
- Cliente paga sua própria Evolution

**No N8N:**
```javascript
const instancias = {
  "escritorio-abc-123": "SDRAdvogados2",      // Compartilhada
  "escritorio-xyz-456": "SDRAdvogados3",      // Compartilhada
  "escritorio-grande": "EscritorioGrande",   // Própria
};
```

---

## ✅ Resumo Executivo

### **Pergunta: "Meus clientes precisam ter Evolution e me passar código?"**

**Resposta: DEPENDE do modelo!**

### **Modelo 1: Evolution Compartilhada (Recomendado)**
- ❌ Cliente **NÃO precisa** ter Evolution
- ❌ Cliente **NÃO precisa** passar código
- ✅ **Você** gerencia tudo
- ✅ Cliente apenas usa a plataforma

### **Modelo 2: Evolution por Cliente**
- ✅ Cliente **precisa** ter Evolution
- ✅ Cliente **precisa** te passar credenciais
- ✅ Você configura no N8N
- ✅ Cliente paga sua própria Evolution

### **Por Que Tem Evolution no N8N E na Plataforma?**

**N8N:**
- ✅ **Onde realmente funciona**
- ✅ N8N usa Evolution para enviar/receber

**Plataforma:**
- ⚠️ **Apenas referência/documentação**
- ⚠️ **NÃO é usada** pela plataforma
- ⚠️ Pode remover ou deixar apenas para referência

---

## 🎯 Próximos Passos

1. **Decidir modelo:**
   - Compartilhada (recomendado para começar)
   - Por cliente (escalável)

2. **Configurar no N8N:**
   - Mapear clienteId → instância Evolution
   - Configurar HTTP Request

3. **Na Plataforma:**
   - Remover Evolution (ou deixar referência)
   - Focar em OpenAI e N8N

4. **Documentar para clientes:**
   - Se usar compartilhada: "Não precisa configurar nada"
   - Se usar por cliente: "Como obter credenciais Evolution"

---

**Pronto! Agora está claro como funciona!** 🚀
