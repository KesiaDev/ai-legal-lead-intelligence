# 🔧 Corrigir Frontend Após Mudar Domínio do Backend

## 🔴 PROBLEMA

**Após mudar o domínio do backend para `api.sdrjuridico.com.br`, o frontend não está funcionando!**

**Causa:** O frontend ainda está usando a URL antiga (`https://sdradvogados.up.railway.app`) como fallback.

---

## ✅ SOLUÇÃO

### **1️⃣ Configurar Variável de Ambiente no Frontend (Railway)**

1. Acesse o **Railway Dashboard**
2. Vá no serviço **"SDR Advogados"** (Frontend)
3. Clique em **"Variables"** (ou **"Settings" → "Variables"**)
4. Procure por `VITE_API_URL`
5. Se **NÃO existir**, clique em **"+ New Variable"**
6. Configure:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.sdrjuridico.com.br`
7. Clique em **"Add"** ou **"Save"**

---

### **2️⃣ Verificar Outras Variáveis**

Certifique-se de que estas variáveis também estão configuradas:

- ✅ `VITE_API_URL` = `https://api.sdrjuridico.com.br`
- ✅ `VITE_WS_URL` = `wss://api.sdrjuridico.com.br` (se usar WebSocket)

---

### **3️⃣ Fazer Redeploy do Frontend**

**IMPORTANTE:** Após adicionar/modificar variáveis de ambiente, é necessário fazer um **redeploy** para que as mudanças tenham efeito!

**Opções:**

#### **Opção A: Redeploy Automático (Recomendado)**
1. No Railway, vá em **"Settings"** do serviço frontend
2. Clique em **"Redeploy"** ou **"Deploy"**
3. Aguarde o deploy completar

#### **Opção B: Redeploy via Git**
1. Faça um commit vazio:
   ```bash
   git commit --allow-empty -m "trigger: redeploy frontend"
   git push origin main
   ```
2. O Railway detectará o push e fará deploy automático

---

### **4️⃣ Verificar CORS no Backend**

O backend já está configurado com `origin: true`, o que permite qualquer origem. **Isso está correto!**

Se quiser restringir (opcional), edite `backend/src/server.ts`:

```typescript
await fastify.register(cors, {
  origin: env.CORS_ORIGIN.split(','), // Aceita múltiplas origens
  credentials: true,
});
```

E configure `CORS_ORIGIN` no backend:
```
CORS_ORIGIN=https://sdrjuridico.com.br,https://www.sdrjuridico.com.br
```

**Mas isso é OPCIONAL!** O `origin: true` já funciona.

---

## 🧪 TESTAR

### **1. Verificar Variável de Ambiente**

No Railway → Frontend → **"Deployments"** → Clique no último deploy → **"View Logs"**

Procure por:
```
VITE_API_URL=https://api.sdrjuridico.com.br
```

---

### **2. Testar Frontend**

1. Acesse o frontend no Railway
2. Abra o **Console do Navegador** (F12)
3. Vá em **"Network"** (Rede)
4. Tente fazer login
5. Verifique se as requisições estão indo para `https://api.sdrjuridico.com.br`

**Se aparecer `api.sdrjuridico.com.br` nas requisições:** ✅ Funcionando!

**Se aparecer `sdradvogados.up.railway.app`:** ❌ Variável não foi aplicada, faça redeploy!

---

### **3. Testar Backend Diretamente**

No navegador, acesse:
```
https://api.sdrjuridico.com.br/health
```

**Esperado:**
```json
{"status":"ok","timestamp":"2025-01-20T..."}
```

**Se retornar 404:** ❌ Domínio não está apontando para o backend correto

**Se retornar JSON:** ✅ Backend funcionando!

---

## 📋 CHECKLIST

- [ ] Variável `VITE_API_URL` configurada no frontend (Railway)
- [ ] Valor: `https://api.sdrjuridico.com.br`
- [ ] Redeploy do frontend feito
- [ ] Frontend acessível
- [ ] Console do navegador mostra requisições para `api.sdrjuridico.com.br`
- [ ] Backend `/health` retorna JSON
- [ ] Login funciona no frontend

---

## ⚠️ IMPORTANTE

**Após mudar variáveis de ambiente, SEMPRE faça redeploy!**

As variáveis de ambiente são injetadas no **build time** (durante o build), não no runtime. Por isso, é necessário fazer um novo build (redeploy) para que as mudanças tenham efeito.

---

## ✅ RESUMO

1. ✅ Configure `VITE_API_URL=https://api.sdrjuridico.com.br` no frontend (Railway)
2. ✅ Faça redeploy do frontend
3. ✅ Teste no navegador
4. ✅ Verifique o console para confirmar que está usando a URL correta

**Pronto!** 🚀
