# 🔧 Como Adaptar o Workflow "Master Agent" para Seu Sistema

## 📖 Entendendo o Workflow Original

O workflow "Master Agent" do Rodrigo Alves é um template completo que:
1. Recebe mensagens do WhatsApp (via Evolution API)
2. Filtra e processa diferentes tipos de mensagem (texto, áudio, imagem, PDF)
3. Usa buffer (Redis) para agrupar mensagens
4. Busca/cria cliente no Supabase
5. Usa Agente IA (LangChain) para responder
6. Humaniza a resposta
7. Envia de volta via Evolution API

---

## 🎯 O QUE PRECISA SER MODIFICADO

### **1. Substituir Supabase pelo Seu Backend** ✅

**No workflow original:**
- `Encontrar Cliente` → Busca no Supabase
- `Criar Cliente` → Cria no Supabase

**No seu sistema:**
- Substituir por chamadas para `POST /leads` (que já faz buscar/criar automaticamente)

---

### **2. Substituir Agente IA LangChain pelo Seu Endpoint** ✅

**No workflow original:**
- `Agente IA` → Usa LangChain diretamente no N8N

**No seu sistema:**
- Substituir por `POST /api/agent/conversation` (seu endpoint conversacional)

---

### **3. Manter o Resto (Funciona Igual)** ✅

- ✅ Filtro de Bloqueio
- ✅ Tratamento de Mensagens (texto, áudio, imagem, PDF)
- ✅ Buffer de Mensagens (Redis)
- ✅ Humanização de Resposta
- ✅ Envio de Mensagem (Evolution API)

---

## 🔄 FLUXO ADAPTADO (Passo a Passo)

### **ETAPA 1: Recebimento e Filtros** (Manter Igual)

```
1. Gatilho (Webhook)
   ↓
2. Filtro de Bloqueio (verifica fromMe = false)
   ↓
3. Dados Lead (extrai nome e telefone)
```

**O que fazer:** ✅ **MANTER IGUAL** - Não precisa mudar nada!

---

### **ETAPA 2: Verificar Status do Agente** (Manter Igual)

```
4. Redis (verifica status do agente)
   ↓
5. Bot Desativado?! (IF)
   ├─ SIM → Para o fluxo (humano atende)
   └─ NÃO → Continua
```

**O que fazer:** ✅ **MANTER IGUAL** - Funciona perfeitamente!

---

### **ETAPA 3: Tratamento de Mensagens** (Manter Igual)

```
6. Rotas de Mensagens (Switch)
   ├─ Texto → Mensagem Texto1/2
   ├─ Áudio → Transcrever Audio
   ├─ Imagem → Analisar Imagem
   ├─ PDF → Extrator pdf
   └─ Outro → Mensagem Erro
   ↓
7. Redis Buffer (armazena mensagens)
```

**O que fazer:** ✅ **MANTER IGUAL** - Processamento de mídia funciona!

---

### **ETAPA 4: Buffer de Mensagens** (Manter Igual)

```
8. Redis Buffer1 (pega mensagens)
   ↓
9. Wait (espera X segundos)
   ↓
10. Redis Buffer2 (verifica se chegou nova mensagem)
    ↓
11. Comparando Lista Mensagens (IF)
    ├─ Nova mensagem → Volta para Wait
    └─ Sem nova mensagem → Continua
    ↓
12. Redis1 (deleta buffer)
```

**O que fazer:** ✅ **MANTER IGUAL** - Sistema de buffer funciona!

---

### **ETAPA 5: Criar/Buscar Lead** ⚠️ **MODIFICAR AQUI**

**❌ REMOVER:**
- Node `Encontrar Cliente` (Supabase)
- Node `Cliente existe?` (IF)
- Node `Criar Cliente` (Supabase)
- Node `Merge`

**✅ ADICIONAR:**
- Node `HTTP Request` → `POST https://sdradvogados.up.railway.app/leads`

**Configuração do novo node:**

```json
{
  "method": "POST",
  "url": "https://sdradvogados.up.railway.app/leads",
  "authentication": "none",
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "nome",
        "value": "={{ $('Dados Lead').item.json.Nome }}"
      },
      {
        "name": "telefone",
        "value": "={{ $('Dados Lead').item.json.Telefone }}"
      },
      {
        "name": "origem",
        "value": "whatsapp"
      },
      {
        "name": "clienteId",
        "value": "seu-escritorio-id" // ou deixar vazio para criar automaticamente
      }
    ]
  }
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "leadId": "uuid-do-lead",
  "clienteId": "uuid-do-tenant",
  "classification": {...},
  "routing": {...}
}
```

---

### **ETAPA 6: Agente IA** ⚠️ **MODIFICAR AQUI**

**❌ REMOVER:**
- Node `OpenAI Chat Model`
- Node `Agente IA` (LangChain)
- Node `Postgres Chat Memory`
- Node `Calculadora`
- Node `Desativar Agente` (ou adaptar)

**✅ ADICIONAR:**
- Node `HTTP Request` → `POST /api/agent/conversation`

**Configuração do novo node:**

```json
{
  "method": "POST",
  "url": "https://sdradvogados.up.railway.app/api/agent/conversation",
  "authentication": "none",
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "lead_id",
        "value": "={{ $('Criar Lead').item.json.leadId }}"
      },
      {
        "name": "message",
        "value": "={{ $('Mensagem').item.json.mensagens }}"
      },
      {
        "name": "clienteId",
        "value": "={{ $('Criar Lead').item.json.clienteId }}"
      }
    ]
  }
}
```

**Resposta esperada:**
```json
{
  "lead_id": "uuid",
  "state": "collecting_name",
  "message": "Olá! Qual é o seu nome?",
  "options": [...],
  "conversation_data": {...}
}
```

**⚠️ IMPORTANTE:** Você precisa manter o `conversation_data` entre chamadas! Use Redis ou variáveis do N8N para armazenar.

---

### **ETAPA 7: Humanização** (Manter Igual)

```
13. Basic LLM Chain (quebra mensagem)
    ↓
14. Split Out (separa mensagens)
    ↓
15. Loop Over Items (envia uma por vez)
```

**O que fazer:** ✅ **MANTER IGUAL** - Humanização funciona!

**OU:** Você pode usar a humanização do seu backend (quando implementar) e pular essa etapa.

---

### **ETAPA 8: Envio de Mensagem** (Manter Igual)

```
16. Enviar Mensagem (Evolution API)
    ↓
17. Wait1 (espera 2 segundos)
    ↓
18. Loop Over Items (próxima mensagem)
```

**O que fazer:** ✅ **MANTER IGUAL** - Só ajustar URL da Evolution API!

---

## 📋 CHECKLIST DE MODIFICAÇÕES

### **O que REMOVER:**
- [ ] Node `Encontrar Cliente` (Supabase)
- [ ] Node `Cliente existe?` (IF)
- [ ] Node `Criar Cliente` (Supabase)
- [ ] Node `Merge`
- [ ] Node `OpenAI Chat Model`
- [ ] Node `Agente IA` (LangChain)
- [ ] Node `Postgres Chat Memory`
- [ ] Node `Calculadora`
- [ ] Node `Desativar Agente` (ou adaptar)

### **O que ADICIONAR:**
- [ ] Node `HTTP Request` → `POST /leads` (criar/buscar lead)
- [ ] Node `HTTP Request` → `POST /api/agent/conversation` (agente IA)
- [ ] Node `Set` → Armazenar `conversation_data` (usar Redis ou variáveis)

### **O que MANTER:**
- [x] Gatilho (Webhook)
- [x] Filtro de Bloqueio
- [x] Dados Lead
- [x] Redis (status agente)
- [x] Bot Desativado?!
- [x] Rotas de Mensagens
- [x] Tratamento de Mensagens (texto, áudio, imagem, PDF)
- [x] Buffer de Mensagens
- [x] Humanização (ou usar do backend)
- [x] Envio de Mensagem

---

## 🔧 CONFIGURAÇÃO PASSO A PASSO

### **PASSO 1: Remover Nodes do Supabase**

1. Delete o node `Encontrar Cliente`
2. Delete o node `Cliente existe?`
3. Delete o node `Criar Cliente`
4. Delete o node `Merge`

### **PASSO 2: Adicionar Node "Criar Lead"**

1. Adicione node `HTTP Request`
2. Configure:
   - **Method:** `POST`
   - **URL:** `https://sdradvogados.up.railway.app/leads`
   - **Body:**
     ```json
     {
       "nome": "={{ $('Dados Lead').item.json.Nome }}",
       "telefone": "={{ $('Dados Lead').item.json.Telefone }}",
       "origem": "whatsapp",
       "clienteId": "seu-escritorio-id"
     }
     ```
3. Conecte após `Redis1` (quando buffer estiver pronto)

### **PASSO 3: Adicionar Node "Agente IA"**

1. Adicione node `HTTP Request`
2. Configure:
   - **Method:** `POST`
   - **URL:** `https://sdradvogados.up.railway.app/api/agent/conversation`
   - **Body:**
     ```json
     {
       "lead_id": "={{ $('Criar Lead').item.json.leadId }}",
       "message": "={{ $('Mensagem').item.json.mensagens }}",
       "conversation_data": "={{ $('Conversation Data').item.json.data }}",
       "clienteId": "={{ $('Criar Lead').item.json.clienteId }}"
     }
     ```
3. Conecte após `Criar Lead`

### **PASSO 4: Armazenar Conversation Data**

1. Adicione node `Set` após `Agente IA`
2. Configure para salvar `conversation_data`:
   ```json
   {
     "conversation_data": "={{ $json.conversation_data }}"
   }
   ```
3. Use Redis para armazenar (chave: `{{ $('Dados Lead').item.json.Telefone }}_conversation`)

### **PASSO 5: Conectar ao Humanização**

1. Conecte `Agente IA` → `Basic LLM Chain`
2. Use `message` da resposta do agente IA

---

## 🎯 EXEMPLO DE FLUXO COMPLETO ADAPTADO

```
1. Gatilho (Webhook)
   ↓
2. Parametros do Fluxo
   ↓
3. Filtro de Bloqueio
   ↓
4. Dados Lead
   ↓
5. Redis (status agente)
   ↓
6. Bot Desativado?!
   ├─ SIM → Para (humano)
   └─ NÃO → Continua
   ↓
7. Rotas de Mensagens (Switch)
   ├─ Texto → Buffer Texto
   ├─ Áudio → Transcrever → Buffer Audio
   ├─ Imagem → Analisar → Buffer Imagem
   ├─ PDF → Extrair → Buffer PDF
   └─ Outro → Buffer Erro
   ↓
8. Redis Buffer1 → Wait → Redis Buffer2 → Comparando
   ↓
9. Redis1 (deleta buffer)
   ↓
10. Mensagem (junta todas)
    ↓
11. HTTP Request → POST /leads (CRIAR/BUSCAR LEAD) ⭐ NOVO
    ↓
12. HTTP Request → POST /api/agent/conversation (AGENTE IA) ⭐ NOVO
    ↓
13. Basic LLM Chain (humanizar)
    ↓
14. Split Out → Loop Over Items
    ↓
15. Enviar Mensagem (Evolution API)
    ↓
16. Wait1 → Loop Over Items
```

---

## ⚠️ PONTOS DE ATENÇÃO

### **1. Conversation Data**
- Você precisa armazenar `conversation_data` entre chamadas
- Use Redis: chave `{{ telefone }}_conversation`
- Recupere antes de chamar `/api/agent/conversation`

### **2. Status do Agente**
- O workflow original usa Redis para verificar status
- Você pode manter isso OU usar endpoint do seu backend (quando implementar)

### **3. Humanização**
- O workflow original usa LangChain para humanizar
- Você pode manter isso OU usar do seu backend (quando implementar)

### **4. Desativar Agente**
- O workflow original tem tool "Desativar Agente"
- Você pode manter (usa Redis) OU criar endpoint no backend

---

## 🚀 PRÓXIMOS PASSOS

1. **HOJE:** Remover nodes do Supabase e adicionar `POST /leads`
2. **HOJE:** Adicionar `POST /api/agent/conversation`
3. **HOJE:** Configurar armazenamento de `conversation_data`
4. **DEPOIS:** Testar fluxo completo
5. **DEPOIS:** Implementar humanização no backend (opcional)
6. **DEPOIS:** Implementar endpoint de status do agente (opcional)

---

## 💡 DICA IMPORTANTE

**Você não precisa fazer tudo de uma vez!**

1. **Comece simples:** Só substitua Supabase por `/leads`
2. **Depois:** Substitua LangChain por `/api/agent/conversation`
3. **Por último:** Otimize e adicione funcionalidades extras

---

**Quer que eu crie um workflow JSON adaptado pronto para você importar?** 🚀
