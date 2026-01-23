# 📱 Integração Z-API - WhatsApp para Clientes

## ✅ Status: **IMPLEMENTADO**

A integração completa do Z-API foi implementada! Agora a plataforma pode receber e enviar mensagens do WhatsApp via Z-API.

---

## 📋 O Que Foi Implementado

### **1. Backend - Serviço Z-API**
- ✅ **ZApiService** (`backend/src/services/zapi.service.ts`)
  - Recebe webhooks do Z-API
  - Processa mensagens (texto, áudio, imagem)
  - Envia mensagens via Z-API
  - Integra com agente IA
  - Suporta envio de áudio (ElevenLabs)

### **2. Backend - Rotas**
- ✅ **Rotas de API** (`backend/src/api/zapi.routes.ts`)
  - `POST /api/webhooks/zapi` - Recebe webhooks do Z-API
  - `POST /api/zapi/send` - Envia mensagem manualmente
  - `GET /api/zapi/health` - Health check

### **3. Integração com Agente IA**
- ✅ Processa mensagens recebidas
- ✅ Cria/atualiza leads automaticamente
- ✅ Integra com agente IA para respostas
- ✅ Suporta respostas em áudio (ElevenLabs)

---

## 🔧 Como Configurar

### **1. Obter Credenciais do Z-API**

Na página do Z-API que você mostrou, você tem:
- **ID da instância:** `3EDAA0991A2272AFA1183EBEF7B316F4`
- **Token da instância:** `147E1F8CFCAACFFE1799DFAE`
- **API URL:** `https://api.z-api.io`

### **2. Configurar no Railway**

No Railway → Backend → Variables, adicione:

```
ZAPI_INSTANCE_ID=3EDAA0991A2272AFA1183EBEF7B316F4
ZAPI_TOKEN=147E1F8CFCAACFFE1799DFAE
ZAPI_BASE_URL=https://api.z-api.io
```

### **3. Configurar Webhook no Z-API**

1. Acesse a página do Z-API
2. Vá em **"Webhooks e configurações gerais"**
3. Configure o webhook:
   - **URL:** `https://api.sdrjuridico.com.br/api/webhooks/zapi`
   - **Eventos:** Marque "Mensagens recebidas"
4. Salve

---

## 🔄 Fluxo de Funcionamento

### **1. Cliente Envia Mensagem**
1. Cliente envia mensagem via WhatsApp
2. Z-API recebe a mensagem
3. Z-API envia webhook para nossa plataforma
4. Plataforma processa mensagem

### **2. Plataforma Processa**
1. Cria/atualiza lead no banco
2. Cria/atualiza conversa
3. Salva mensagem recebida
4. Processa com agente IA

### **3. Agente Responde**
1. Agente IA gera resposta
2. Plataforma envia resposta via Z-API
3. Cliente recebe mensagem no WhatsApp

---

## 📡 Endpoints Disponíveis

### **Webhook (Z-API → Plataforma)**
```
POST /api/webhooks/zapi
```

**Payload esperado:**
```json
{
  "phone": "5511999999999",
  "message": "Olá, preciso de ajuda",
  "type": "text",
  "timestamp": 1234567890,
  "instanceId": "3EDAA0991A2272AFA1183EBEF7B316F4"
}
```

### **Enviar Mensagem (Plataforma → Z-API)**
```
POST /api/zapi/send
```

**Payload:**
```json
{
  "to": "5511999999999",
  "message": "Olá! Como posso ajudar?",
  "tenantId": "opcional"
}
```

### **Health Check**
```
GET /api/zapi/health
```

**Resposta:**
```json
{
  "configured": true,
  "zapiInstanceId": "configured",
  "zapiToken": "configured",
  "zapiBaseUrl": "https://api.z-api.io"
}
```

---

## 🎯 Próximos Passos

1. **Configurar Variáveis no Railway:**
   - Adicione `ZAPI_INSTANCE_ID`
   - Adicione `ZAPI_TOKEN`
   - Adicione `ZAPI_BASE_URL` (opcional, padrão: `https://api.z-api.io`)

2. **Configurar Webhook no Z-API:**
   - URL: `https://api.sdrjuridico.com.br/api/webhooks/zapi`
   - Eventos: Mensagens recebidas

3. **Testar:**
   - Envie uma mensagem do WhatsApp
   - Verifique se chegou na plataforma
   - Verifique se o agente respondeu

---

## ✅ Checklist

- [ ] Variáveis configuradas no Railway
- [ ] Webhook configurado no Z-API
- [ ] Teste de recebimento de mensagem
- [ ] Teste de envio de mensagem
- [ ] Teste de resposta do agente IA

---

## 🚀 Pronto!

A integração Z-API está completa e pronta para uso! Configure as variáveis no Railway e o webhook no Z-API para começar a receber mensagens.
