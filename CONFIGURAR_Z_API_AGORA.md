# ⚡ Configurar Z-API Agora

## ✅ Integração Implementada!

A integração Z-API foi implementada e está pronta para uso!

---

## 🔧 Passo 1: Configurar Variáveis no Railway

No Railway → Backend → Variables, adicione:

```
ZAPI_INSTANCE_ID=3EDAA0991A2272AFA1183EBEF7B316F4
ZAPI_TOKEN=147E1F8CFCAACFFE1799DFAE
ZAPI_BASE_URL=https://api.z-api.io
```

**Valores da sua instância:**
- **ID da instância:** `3EDAA0991A2272AFA1183EBEF7B316F4`
- **Token da instância:** `147E1F8CFCAACFFE1799DFAE`
- **Base URL:** `https://api.z-api.io` (padrão)

---

## 🔧 Passo 2: Configurar Webhook no Z-API

1. **Acesse a página do Z-API** que você mostrou
2. **Clique em "Webhooks e configurações gerais"** (aba no topo)
3. **Configure o webhook:**
   - **URL do webhook:** `https://api.sdrjuridico.com.br/api/webhooks/zapi`
   - **Eventos:** Marque "Mensagens recebidas"
4. **Salve**

---

## 🧪 Passo 3: Testar

### **3.1. Testar Health Check**
```bash
curl https://api.sdrjuridico.com.br/api/zapi/health
```

**Resposta esperada:**
```json
{
  "configured": true,
  "zapiInstanceId": "configured",
  "zapiToken": "configured",
  "zapiBaseUrl": "https://api.z-api.io"
}
```

### **3.2. Enviar Mensagem de Teste**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/zapi/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Teste de mensagem via Z-API"
  }'
```

### **3.3. Testar Recebimento**
1. Envie uma mensagem do WhatsApp para o número conectado
2. Verifique se chegou na plataforma
3. Verifique se o agente respondeu

---

## 🔄 Como Funciona

### **1. Cliente Envia Mensagem**
- Cliente envia mensagem via WhatsApp
- Z-API recebe a mensagem
- Z-API envia webhook para: `https://api.sdrjuridico.com.br/api/webhooks/zapi`

### **2. Plataforma Processa**
- Plataforma recebe webhook
- Cria/atualiza lead no banco
- Cria/atualiza conversa
- Salva mensagem recebida
- Processa com agente IA

### **3. Agente Responde**
- Agente IA gera resposta
- Plataforma envia resposta via Z-API
- Cliente recebe mensagem no WhatsApp

---

## 📡 Endpoints Disponíveis

### **Webhook (Z-API → Plataforma)**
```
POST /api/webhooks/zapi
```

### **Enviar Mensagem (Plataforma → Z-API)**
```
POST /api/zapi/send
Body: { "to": "5511999999999", "message": "Texto" }
```

### **Health Check**
```
GET /api/zapi/health
```

---

## ✅ Checklist

- [ ] Variáveis configuradas no Railway
- [ ] Webhook configurado no Z-API
- [ ] Health check funcionando
- [ ] Teste de envio de mensagem
- [ ] Teste de recebimento de mensagem
- [ ] Agente IA respondendo

---

## 🚀 Pronto!

A integração Z-API está completa! Configure as variáveis no Railway e o webhook no Z-API para começar a receber mensagens.
