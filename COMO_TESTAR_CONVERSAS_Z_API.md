# 🧪 Como Testar Conversas do Z-API

## ✅ Sim, as conversas devem aparecer aqui!

As conversas do WhatsApp via Z-API **devem aparecer** na página "Conversas" → "Chat ao Vivo".

---

## 🔍 Por que não está aparecendo?

### **Problema 1: Nenhuma mensagem chegou ainda**
- O webhook do Z-API precisa receber uma mensagem primeiro
- Envie uma mensagem do WhatsApp para o número conectado

### **Problema 2: Webhook não configurado**
- Verifique se o webhook está configurado no Z-API:
  - URL: `https://api.sdrjuridico.com.br/api/webhooks/zapi`
  - Campo: "Ao receber"

### **Problema 3: Variáveis não configuradas no Railway**
- As variáveis `ZAPI_INSTANCE_ID` e `ZAPI_TOKEN` precisam estar configuradas no Railway

### **Problema 4: Tenant não identificado**
- Se a mensagem chegar sem `clienteId`, o sistema tenta identificar pelo número
- Se não encontrar, usa o primeiro tenant disponível

---

## 🧪 Como Testar

### **1. Enviar Mensagem de Teste**

1. **Abra o WhatsApp** no seu celular
2. **Envie uma mensagem** para o número conectado no Z-API
3. **Exemplo:** "Olá, preciso de ajuda com um caso jurídico"

### **2. Verificar se Chegou**

1. **Aguarde alguns segundos** (processamento)
2. **Recarregue a página** "Conversas"
3. **Verifique se apareceu** na lista

### **3. Verificar Logs do Backend**

No Railway → Backend → Logs, você deve ver:
```
Webhook Z-API recebido
Z-API webhook received
Tenant identificado para Z-API
Lead criado/atualizado
Conversa criada
```

---

## 🔧 Checklist

- [ ] Webhook configurado no Z-API
- [ ] Variáveis configuradas no Railway (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`)
- [ ] Backend deployado e funcionando
- [ ] Instância do Z-API conectada ao WhatsApp
- [ ] Mensagem de teste enviada
- [ ] Página "Conversas" recarregada

---

## 📱 Teste Completo

1. **Configure tudo:**
   - ✅ Webhook no Z-API
   - ✅ Variáveis no Railway
   - ✅ Teste de conexão funcionando

2. **Envie uma mensagem:**
   - 📱 WhatsApp → Número conectado
   - 💬 "Olá, preciso de ajuda"

3. **Verifique:**
   - 🔄 Recarregue a página "Conversas"
   - 👀 Veja se apareceu na lista
   - 💬 Clique na conversa para ver as mensagens

---

## 🚨 Se Ainda Não Aparecer

1. **Verifique os logs do backend** no Railway
2. **Verifique o console do navegador** (F12)
3. **Teste o webhook manualmente:**
   ```bash
   curl -X POST https://api.sdrjuridico.com.br/api/webhooks/zapi \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "5511999999999",
       "message": "Teste de mensagem",
       "type": "text"
     }'
   ```

---

## ✅ Próximos Passos

Após as conversas aparecerem:
1. ✅ Teste o agente IA respondendo
2. ✅ Verifique se as mensagens estão sendo salvas
3. ✅ Teste enviar mensagem manualmente pela plataforma
