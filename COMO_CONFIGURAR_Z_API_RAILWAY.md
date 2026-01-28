# 🔧 Como Configurar Z-API no Railway

## ✅ Passo 1: Acessar Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login na sua conta
3. Selecione o projeto **legal-lead-scout**
4. Clique no serviço **Backend**

---

## ✅ Passo 2: Adicionar Variáveis

1. No menu lateral, clique em **"Variables"** (Variáveis)
2. Clique em **"+ New Variable"** (Nova Variável)
3. Adicione as seguintes variáveis:

### **Variável 1: ZAPI_INSTANCE_ID**
- **Name:** `ZAPI_INSTANCE_ID`
- **Value:** Cole o ID da instância que você copiou da interface
- **Exemplo:** `3EDAA0991A2272AFA1183EBEF7B316F4`

### **Variável 2: ZAPI_TOKEN**
- **Name:** `ZAPI_TOKEN`
- **Value:** Cole o Token da instância que você copiou da interface
- **Exemplo:** `147E1F8CFCAACFFE1799DFAE`

### **Variável 3: ZAPI_BASE_URL** (Opcional)
- **Name:** `ZAPI_BASE_URL`
- **Value:** `https://api.z-api.io`
- **Nota:** Esta é opcional, mas recomendada

---

## ✅ Passo 3: Aguardar Deploy

Após adicionar as variáveis:
1. O Railway vai fazer **redeploy automático** do backend
2. Aguarde alguns minutos
3. Verifique os logs para confirmar que não há erros

---

## ✅ Passo 4: Testar Health Check

Após o deploy, teste se está funcionando:

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

---

## ✅ Passo 5: Verificar Webhook no Z-API

Certifique-se de que o webhook está configurado no Z-API:

1. Acesse o painel do Z-API
2. Vá em **"Webhooks e configurações gerais"**
3. No campo **"Ao receber"**, deve estar:
   ```
   https://api.sdrjuridico.com.br/api/webhooks/zapi
   ```
4. Salve se necessário

---

## ✅ Checklist Final

- [ ] Variáveis adicionadas no Railway
- [ ] Deploy do backend concluído
- [ ] Health check retornando `configured: true`
- [ ] Webhook configurado no Z-API
- [ ] Teste de envio de mensagem funcionando

---

## 🚀 Pronto!

Após configurar as variáveis no Railway, a integração Z-API estará totalmente funcional!
