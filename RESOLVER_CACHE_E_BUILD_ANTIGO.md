# 🔧 Resolver: Cache e Build Antigo do Frontend

## ✅ Configuração Está Correta!

A variável `VITE_API_URL` está configurada corretamente no Railway:
- ✅ `VITE_API_URL`: `https://api.sdrjuridico.com.br`
- ✅ `VITE_WS_URL`: `wss://api.sdrjuridico.com.br`

**O problema não é a configuração, mas sim:**
1. ⚠️ **Build antigo** - Frontend foi buildado antes de configurar a variável
2. ⚠️ **Cache do navegador** - Navegador usando código antigo em cache

---

## 🚨 Por Que Ainda Usa URL Antiga?

### **Como o Vite Funciona:**

1. **Variáveis de ambiente são embutidas no build:**
   - Quando o Vite faz build, ele substitui `import.meta.env.VITE_API_URL` pelo valor da variável
   - Se a variável não existia no momento do build, usa o fallback do código
   - **O valor fica "hardcoded" no JavaScript compilado**

2. **Se você configurou a variável DEPOIS do build:**
   - O código JavaScript já foi compilado com a URL antiga (ou fallback)
   - Mesmo que a variável esteja correta agora, o código compilado ainda tem a URL antiga
   - **Precisa fazer novo build (redeploy)**

3. **Cache do navegador:**
   - Navegador baixou o JavaScript antigo
   - Mesmo que o servidor tenha código novo, navegador usa cache
   - **Precisa limpar cache**

---

## ✅ Solução: Redeploy + Limpar Cache

### **PASSO 1: Forçar Redeploy do Frontend**

**Opção A: Via Railway Dashboard (Recomendado)**

1. Railway Dashboard → **"SDR Advogados Front"**
2. Vá em **"Deployments"** (aba no topo)
3. Clique nos **3 pontinhos (⋮)** do último deployment
4. Selecione **"Redeploy"**
5. Aguarde 3-5 minutos para o build completar

**Opção B: Via Git (Commit vazio)**

```bash
git commit --allow-empty -m "fix: force frontend redeploy to use VITE_API_URL"
git push origin main
```

**Por quê?**
- O redeploy vai fazer um novo build
- O novo build vai usar a variável `VITE_API_URL` que está configurada
- O JavaScript compilado terá a URL correta

---

### **PASSO 2: Limpar Cache do Navegador**

**⚠️ CRÍTICO:** Mesmo após redeploy, o navegador pode usar cache antigo!

**Método 1: Limpar Cache Completamente**

1. **Chrome/Edge:**
   - `Ctrl + Shift + Delete`
   - Marque: "Imagens e arquivos em cache"
   - Período: "Todo o período"
   - Clique em "Limpar dados"

2. **Firefox:**
   - `Ctrl + Shift + Delete`
   - Marque: "Cache"
   - Clique em "Limpar agora"

**Método 2: Modo Anônimo (Mais Rápido)**

1. Abra janela anônima:
   - Chrome: `Ctrl + Shift + N`
   - Edge: `Ctrl + Shift + P`
   - Firefox: `Ctrl + Shift + P`

2. Acesse o site em modo anônimo
3. Teste o salvamento

**Método 3: Hard Refresh**

1. Com a página aberta, pressione:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. Isso força recarregar sem usar cache

---

## 🧪 Como Verificar se Funcionou

### **1. Verificar Console (F12)**

Após redeploy e limpar cache, abra console (F12):

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

1. Tente salvar a chave OpenAI
2. Procure requisição `PATCH /api/integrations`
3. Verifique:
   - **URL:** `https://api.sdrjuridico.com.br/api/integrations`
   - **Status:** `200 OK` (não `500`)
   - **Response:** `{ success: true }`

### **3. Verificar Timestamp do Build**

1. Railway Dashboard → Frontend → **Deployments**
2. Verifique o timestamp do último deployment
3. Deve ser **DEPOIS** de você ter configurado `VITE_API_URL`

---

## 🔍 Por Que Isso Acontece?

### **Timeline do Problema:**

```
1. Frontend foi buildado (antes de configurar VITE_API_URL)
   └─> JavaScript compilado tem URL antiga ou fallback

2. Você configurou VITE_API_URL no Railway
   └─> Variável está correta, mas código já foi compilado

3. Navegador baixou JavaScript antigo
   └─> Cache do navegador tem código antigo

4. Mesmo que servidor tenha código novo, navegador usa cache
   └─> Continua usando URL antiga
```

### **Solução:**

```
1. Redeploy do Frontend
   └─> Novo build com VITE_API_URL correto

2. Limpar cache do navegador
   └─> Navegador baixa JavaScript novo

3. Testar
   └─> Agora usa URL correta ✅
```

---

## 📋 Checklist de Correção

- [x] Variável `VITE_API_URL` configurada corretamente no Railway
- [ ] Frontend: Redeploy realizado (DEPOIS de configurar variável)
- [ ] Navegador: Cache limpo completamente
- [ ] Console: Mostra `isCorrect: true`
- [ ] Network: Mostra URL correta (`api.sdrjuridico.com.br`)
- [ ] Teste: Salvamento funciona sem erro 500

---

## 🎯 Resultado Esperado

Após redeploy + limpar cache:

1. ✅ Console mostra `isCorrect: true`
2. ✅ Network mostra requisições para `api.sdrjuridico.com.br`
3. ✅ Salvamento funciona sem erro 500
4. ✅ Tokens são salvos no banco de dados

---

## 🚨 Se Ainda Não Funcionar

### **Verificar Logs do Build (Railway)**

1. Railway Dashboard → Frontend → **Logs**
2. Procure pelo build mais recente
3. Verifique se `VITE_API_URL` aparece nos logs do build
4. Procure por erros durante o build

### **Verificar se Variável Está Disponível no Build**

O Vite só inclui variáveis que:
- ✅ Começam com `VITE_`
- ✅ Estão disponíveis no momento do build
- ✅ Não são `undefined`

Se a variável não aparecer nos logs do build, pode ser que:
- Variável foi configurada em outro service (não no Frontend)
- Variável tem nome errado
- Build foi feito antes de configurar variável

---

## 📝 Nota Importante

**A configuração está correta há tempo!** O problema é que:

1. **Build foi feito antes** de configurar a variável (ou variável não estava disponível no build)
2. **Cache do navegador** está usando código antigo

**Solução:** Redeploy + Limpar cache = Funciona! ✅

---

**Status:** ⚠️ Configuração correta, mas precisa de redeploy + limpar cache

**Tempo estimado:** 5 minutos (redeploy) + 1 minuto (limpar cache)
