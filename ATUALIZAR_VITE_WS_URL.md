# 🔧 Atualizar VITE_WS_URL

## ✅ O QUE ESTÁ CORRETO

- ✅ `VITE_API_URL` = `https://api.sdrjuridico.com.br` ← **CORRETO!**

## ❌ O QUE PRECISA CORRIGIR

- ❌ `VITE_WS_URL` = `wss://sdradvogados.up.railway.app` ← **URL ANTIGA!**

---

## 🔧 COMO CORRIGIR

### **1️⃣ Editar VITE_WS_URL**

1. No Railway, na tela de **Variables** do frontend
2. Encontre a variável `VITE_WS_URL`
3. Clique nos **três pontinhos** (⋮) à direita
4. Clique em **"Edit"** ou **"Update"**
5. Altere o valor para:
   ```
   wss://api.sdrjuridico.com.br
   ```
6. Clique em **"Save"** ou **"Update"**

---

### **2️⃣ Fazer Redeploy**

**IMPORTANTE:** Após atualizar variáveis, faça redeploy!

1. No Railway, vá em **"Settings"** do serviço frontend
2. Clique em **"Redeploy"**
3. Aguarde o deploy completar

---

## ✅ CONFIGURAÇÃO FINAL

Após corrigir, você deve ter:

- ✅ `VITE_API_URL` = `https://api.sdrjuridico.com.br`
- ✅ `VITE_WS_URL` = `wss://api.sdrjuridico.com.br`

---

## 🧪 TESTAR

1. Após o redeploy, acesse o frontend
2. Abra o Console do Navegador (F12)
3. Vá em **"Network"** → Filtre por **"WS"** (WebSocket)
4. Verifique se as conexões WebSocket estão indo para `wss://api.sdrjuridico.com.br`

---

## ✅ RESUMO

1. ✅ Edite `VITE_WS_URL` para `wss://api.sdrjuridico.com.br`
2. ✅ Salve
3. ✅ Faça redeploy do frontend
4. ✅ Teste

**Pronto!** 🚀
