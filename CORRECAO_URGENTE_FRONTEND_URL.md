# 🚨 CORREÇÃO URGENTE: Frontend Usando URL Antiga

## ❌ Problema Crítico Identificado

O console do navegador mostra:
```
❌ ERRO: Frontend está usando URL antiga! https://sdradvogados.up.railway.app
❌ Configure VITE_API_URL=https://api.sdrjuridico.com.br no Railway
```

**Isso significa que o frontend está tentando acessar a URL antiga, causando erro 500 em todas as requisições!**

---

## ✅ Solução: Configurar Variável no Railway (Frontend)

### **PASSO 1: Acessar Railway Dashboard**

1. Acesse: https://railway.app
2. Faça login na sua conta
3. Selecione o projeto

### **PASSO 2: Abrir Service do Frontend**

1. Procure pelo service **"SDR Advogados Front"** (ou nome similar)
2. Clique nele para abrir

### **PASSO 3: Configurar Variável `VITE_API_URL`**

1. **Clique na aba "Variables"** (no topo)
2. **Procure por `VITE_API_URL`:**
   - Se **NÃO existir:**
     - Clique em **"New Variable"** ou **"Add Variable"**
     - **Nome:** `VITE_API_URL`
     - **Valor:** `https://api.sdrjuridico.com.br`
     - Clique em **"Add"** ou **"Save"**
   
   - Se **EXISTIR mas estiver errada:**
     - Clique nos **3 pontinhos (⋮)** ao lado da variável
     - Selecione **"Edit"**
     - Altere o valor para: `https://api.sdrjuridico.com.br`
     - **IMPORTANTE:** Sem espaços, sem aspas, sem barra no final
     - Clique em **"Save"**

### **PASSO 4: Forçar Redeploy do Frontend**

**⚠️ CRÍTICO:** Após configurar a variável, você **DEVE** fazer redeploy para o frontend usar a nova URL!

**Opção A: Via Railway Dashboard (Recomendado)**

1. No service do Frontend, vá em **"Deployments"** (aba no topo)
2. Clique nos **3 pontinhos (⋮)** do último deployment
3. Selecione **"Redeploy"**
4. Aguarde 3-5 minutos para o deploy completar

**Opção B: Via Git (Commit vazio)**

```bash
git commit --allow-empty -m "fix: force frontend redeploy to use correct API URL"
git push origin main
```

### **PASSO 5: Limpar Cache do Navegador**

**⚠️ CRÍTICO:** O navegador pode estar usando código antigo em cache!

1. **Limpe o cache:**
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Marque: "Imagens e arquivos em cache"
   - Período: "Todo o período"
   - Clique em "Limpar dados"

2. **Ou use Modo Anônimo:**
   - `Ctrl + Shift + N` (Chrome)
   - `Ctrl + Shift + P` (Edge)
   - Teste em modo anônimo

3. **Hard Refresh:**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)

---

## 🧪 Como Verificar se Funcionou

### **1. Verificar Console do Navegador (F12)**

Após o redeploy e limpar cache, abra o console (F12) e procure por:

**✅ Deve aparecer:**
```
🔍 API Client Config: {
  VITE_API_URL: "https://api.sdrjuridico.com.br",
  API_URL_USED: "https://api.sdrjuridico.com.br",
  isCorrect: true
}
```

**❌ NÃO deve aparecer:**
```
❌ ERRO: Frontend está usando URL antiga!
Failed sdradvogados.up.railway.app
```

### **2. Verificar Network Tab (F12 → Network)**

1. Abra **DevTools** (F12)
2. Vá em **Network**
3. Tente salvar a chave OpenAI
4. Procure requisição `PATCH /api/integrations`
5. Verifique:
   - **URL completa:** Deve ser `https://api.sdrjuridico.com.br/api/integrations`
   - **Status:** Deve ser `200 OK` (não `500`)
   - **Response:** Deve ter `{ success: true }`

### **3. Testar Salvamento**

1. Acesse: **Configurações → Integrações → OpenAI**
2. Cole a API Key: `sk-...`
3. Clique em **"Salvar"**
4. **Deve aparecer:** "Configurações salvas!" (verde)
5. **NÃO deve aparecer:** "Erro no servidor" (vermelho)

---

## 🔍 Verificação no Railway

### **Como Verificar se a Variável Está Configurada:**

1. Railway Dashboard → Frontend Service → **Variables**
2. Procure por `VITE_API_URL`
3. **Deve mostrar:**
   - Nome: `VITE_API_URL`
   - Valor: `https://api.sdrjuridico.com.br`

### **Como Verificar se o Redeploy Foi Feito:**

1. Railway Dashboard → Frontend Service → **Deployments**
2. O último deployment deve ter sido feito **DEPOIS** de configurar a variável
3. Status deve ser **"Active"** ou **"Building"**

---

## ⚠️ Problemas Comuns

### **1. Variável Configurada mas Ainda Usa URL Antiga**

**Causa:** Frontend não foi redeployado após configurar variável

**Solução:**
- Force um redeploy (PASSO 4)
- Limpe cache do navegador (PASSO 5)

### **2. Variável com Valor Errado**

**Causa:** Valor tem espaços, aspas ou barra no final

**Solução:**
- Valor deve ser exatamente: `https://api.sdrjuridico.com.br`
- Sem espaços antes/depois
- Sem aspas
- Sem barra (/) no final

### **3. Cache do Navegador**

**Causa:** Navegador usando código antigo em cache

**Solução:**
- Limpe cache completamente (PASSO 5)
- Ou use Modo Anônimo

### **4. Build Antigo em Produção**

**Causa:** Railway pode ter feito build antes de configurar variável

**Solução:**
- Force redeploy após configurar variável
- Aguarde build completar (3-5 minutos)

---

## 📋 Checklist de Correção

- [ ] Railway: Acessei o service do Frontend
- [ ] Railway: Abri aba "Variables"
- [ ] Railway: Configurei `VITE_API_URL=https://api.sdrjuridico.com.br`
- [ ] Railway: Forcei redeploy do Frontend
- [ ] Navegador: Limpei cache completamente
- [ ] Navegador: Console mostra `isCorrect: true`
- [ ] Navegador: Network mostra URL correta
- [ ] Teste: Salvamento funciona sem erro 500

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. ✅ Console mostra `isCorrect: true`
2. ✅ Network mostra requisições para `api.sdrjuridico.com.br`
3. ✅ Salvamento funciona sem erro 500
4. ✅ Tokens são salvos no banco de dados

---

## 🚨 Se Ainda Não Funcionar

### **Verificar Logs do Frontend (Railway)**

1. Railway Dashboard → Frontend Service → **Logs**
2. Procure por erros durante o build
3. Verifique se `VITE_API_URL` aparece nos logs

### **Verificar Build do Frontend**

O Vite precisa que variáveis comecem com `VITE_` para serem incluídas no build. Certifique-se de que:

- ✅ Nome da variável: `VITE_API_URL` (não `API_URL`)
- ✅ Valor: `https://api.sdrjuridico.com.br` (sem espaços, sem aspas)

### **Verificar Domínio Customizado**

Se você tem domínio customizado configurado:

1. Railway Dashboard → Frontend Service → **Settings** → **Domains**
2. Verifique se o domínio está configurado corretamente
3. Verifique se o DNS está apontando corretamente

---

## 📝 Nota Importante

**O código já está correto!** O problema é **infraestrutura** (variável de ambiente no Railway). Não precisa alterar código, apenas:

1. ✅ Configurar `VITE_API_URL` no Railway (Frontend)
2. ✅ Fazer redeploy do Frontend
3. ✅ Limpar cache do navegador

---

**Status:** ⚠️ **URGENTE** - Frontend precisa ser corrigido para funcionar

**Tempo estimado:** 5-10 minutos (configurar variável + redeploy + limpar cache)
