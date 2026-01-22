# 🔴 CORRIGIR LOGIN: Frontend Usando URL Antiga

## 🔴 PROBLEMA IDENTIFICADO

**No console do navegador, vejo que o frontend está fazendo requisições para:**
- ❌ `sdradvogados.up.railway.app/login` (URL ANTIGA!)
- ❌ `sdradvogados.up.railway.app/register` (URL ANTIGA!)

**Deveria ser:**
- ✅ `api.sdrjuridico.com.br/login`
- ✅ `api.sdrjuridico.com.br/register`

**Erros no console:**
- `401 Unauthorized` (credenciais inválidas)
- `400 Bad Request` (erro no registro)

**Causa:**
A variável `VITE_API_URL` não está configurada no Railway ou não foi aplicada após o deploy.

---

## ✅ SOLUÇÃO: Configurar VITE_API_URL no Railway

### **Passo 1: Verificar Variável no Railway**

1. **Railway Dashboard** → **"SDR Advogados Front"** (Frontend)
2. Aba **"Variables"** (Variáveis)
3. Procure por: `VITE_API_URL`

**Se NÃO existir:**
- Continue para o Passo 2

**Se existir:**
- Verifique o valor
- Deve ser: `https://api.sdrjuridico.com.br`
- Se estiver diferente, edite e corrija

---

### **Passo 2: Adicionar/Editar VITE_API_URL**

1. **Ainda na aba "Variables"**
2. Se não existir, clique em **"+ New Variable"**
3. Se existir, clique no **ícone de editar** (lápis) ao lado
4. Configure:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.sdrjuridico.com.br`
5. Clique em **"Add"** ou **"Save"**

---

### **Passo 3: Verificar VITE_WS_URL (Opcional, mas Recomendado)**

**Se você usa WebSocket (chat ao vivo):**

1. Procure por: `VITE_WS_URL`
2. Se não existir, adicione:
   - **Key:** `VITE_WS_URL`
   - **Value:** `wss://api.sdrjuridico.com.br`
3. Salve

---

### **Passo 4: Fazer Redeploy**

**⚠️ IMPORTANTE:** Após adicionar/modificar variáveis de ambiente, é **OBRIGATÓRIO** fazer redeploy!

1. **Railway Dashboard** → **"SDR Advogados Front"**
2. Aba **"Deployments"**
3. Clique no **último deploy**
4. Clique em **"Redeploy"** ou **"Deploy"**
5. Aguarde o deploy completar (2-5 minutos)

---

### **Passo 5: Verificar se Funcionou**

**Após o redeploy:**

1. Abra o navegador
2. Acesse: `https://www.sdrjuridico.com.br`
3. Abra o **Console do navegador** (F12 → Console)
4. Procure por requisições:
   - ✅ Deve aparecer: `api.sdrjuridico.com.br/login`
   - ❌ NÃO deve aparecer: `sdradvogados.up.railway.app/login`

**Se ainda aparecer a URL antiga:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Ou faça hard refresh (Ctrl+Shift+R)

---

## 🧪 TESTAR LOGIN

**Após corrigir:**

1. Acesse: `https://www.sdrjuridico.com.br`
2. Tente fazer login com suas credenciais
3. Deve funcionar normalmente! ✅

---

## 📋 CHECKLIST

- [ ] Verificar `VITE_API_URL` no Railway
- [ ] Adicionar/Editar `VITE_API_URL` = `https://api.sdrjuridico.com.br`
- [ ] Adicionar/Editar `VITE_WS_URL` = `wss://api.sdrjuridico.com.br` (se usar WebSocket)
- [ ] Fazer redeploy do frontend
- [ ] Verificar console do navegador (deve mostrar `api.sdrjuridico.com.br`)
- [ ] Testar login

---

## ✅ RESUMO

**Problema:**
- Frontend usando URL antiga: `sdradvogados.up.railway.app`

**Solução:**
- Configurar `VITE_API_URL=https://api.sdrjuridico.com.br` no Railway
- Fazer redeploy

**Resultado:**
- Frontend vai usar: `api.sdrjuridico.com.br`
- Login vai funcionar! ✅

---

## 🚀 PRÓXIMOS PASSOS

1. **Agora:** Configurar `VITE_API_URL` no Railway
2. **Agora:** Fazer redeploy
3. **Depois:** Testar login

**Depois disso, tudo vai funcionar!** 🎉
