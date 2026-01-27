# 🚨 CORREÇÃO URGENTE: Frontend Usando URL Antiga

## ❌ Problema Identificado

O console do navegador mostra que o frontend está tentando acessar:
```
sdradvogados.up.railway.app/api/integrations
```

**Isso está ERRADO!** Deve ser:
```
https://api.sdrjuridico.com.br/api/integrations
```

---

## 🔍 Por Que Isso Acontece?

O código está correto, mas o **frontend em produção** não está usando a variável de ambiente correta. Isso pode acontecer por:

1. ❌ Variável `VITE_API_URL` não configurada no Railway (Frontend)
2. ❌ Frontend não foi redeployado após configurar a variável
3. ❌ Cache do navegador usando código antigo

---

## ✅ Solução: Configurar Variável no Railway

### **Passo 1: Verificar Variável no Railway**

1. Acesse **Railway Dashboard**
2. Vá para o **service do Frontend** (provavelmente "SDR Advogados Front" ou similar)
3. Clique em **Variables** (Variáveis)
4. Procure por `VITE_API_URL`

### **Passo 2: Configurar/Corrigir Variável**

**Se a variável NÃO existe:**
1. Clique em **"New Variable"**
2. Nome: `VITE_API_URL`
3. Valor: `https://api.sdrjuridico.com.br`
4. Clique em **"Add"**

**Se a variável EXISTE mas está errada:**
1. Clique nos **3 pontinhos (⋮)** ao lado da variável
2. Selecione **"Edit"**
3. Altere o valor para: `https://api.sdrjuridico.com.br`
4. Clique em **"Save"**

### **Passo 3: Forçar Redeploy**

Após configurar a variável, **force um redeploy**:

**Opção A: Via Railway Dashboard (Recomendado)**
1. No service do Frontend
2. Vá em **Deployments**
3. Clique nos **3 pontinhos (⋮)** do último deployment
4. Selecione **"Redeploy"**
5. Aguarde 3-5 minutos

**Opção B: Via Git (Commit vazio)**
```bash
git commit --allow-empty -m "fix: force frontend redeploy to use correct API URL"
git push origin main
```

### **Passo 4: Limpar Cache do Navegador**

Após o redeploy:

1. **Limpe o cache do navegador:**
   - Chrome/Edge: `Ctrl + Shift + Delete` → Marque "Imagens e arquivos em cache" → Limpar
   - Ou use **Modo Anônimo** para testar

2. **Recarregue a página:**
   - `Ctrl + Shift + R` (hard refresh)

---

## 🧪 Como Verificar se Funcionou

### **1. Verificar Console do Navegador**

Abra o console (F12) e procure por:

```
🔍 API Client Config: {
  VITE_API_URL: "https://api.sdrjuridico.com.br",
  API_URL_USED: "https://api.sdrjuridico.com.br",
  isCorrect: true
}
```

**Se aparecer:**
- ✅ `isCorrect: true` → **Tudo certo!**
- ❌ `isCorrect: false` ou URL antiga → **Ainda está errado**

### **2. Verificar Network Tab**

1. Abra **DevTools** (F12)
2. Vá em **Network**
3. Tente salvar uma integração
4. Procure pela requisição `PATCH /api/integrations`
5. Verifique a **URL completa**:
   - ✅ Deve ser: `https://api.sdrjuridico.com.br/api/integrations`
   - ❌ NÃO deve ser: `sdradvogados.up.railway.app/api/integrations`

### **3. Testar Salvamento**

1. Acesse **Configurações → Integrações → OpenAI**
2. Cole a API Key
3. Clique em **"Salvar"**
4. **Deve aparecer:** "Configurações salvas!" (verde)
5. **NÃO deve aparecer:** "Erro no servidor" (vermelho)

---

## 🔧 Verificação Rápida no Código

O código em `src/api/client.ts` está correto:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
```

Isso significa:
- Se `VITE_API_URL` estiver configurada → usa ela
- Se não estiver → usa `https://api.sdrjuridico.com.br` (fallback)

**O problema é que o Railway não está passando a variável corretamente!**

---

## 📋 Checklist de Correção

- [ ] Verificar se `VITE_API_URL` existe no Railway (Frontend)
- [ ] Configurar `VITE_API_URL=https://api.sdrjuridico.com.br`
- [ ] Forçar redeploy do Frontend
- [ ] Limpar cache do navegador
- [ ] Verificar console: `isCorrect: true`
- [ ] Verificar Network: URL correta
- [ ] Testar salvamento: deve funcionar

---

## 🚨 Se Ainda Não Funcionar

### **Verificar Logs do Railway (Frontend)**

1. Railway → Frontend Service → **Logs**
2. Procure por erros durante o build
3. Verifique se `VITE_API_URL` aparece nos logs

### **Verificar Build do Frontend**

O Vite precisa que variáveis comecem com `VITE_` para serem incluídas no build. Certifique-se de que:

- ✅ Nome da variável: `VITE_API_URL` (não `API_URL`)
- ✅ Valor: `https://api.sdrjuridico.com.br` (sem espaços, sem aspas)

---

## ✅ Resultado Esperado

Após corrigir:

1. ✅ Console mostra URL correta
2. ✅ Network mostra requisições para `api.sdrjuridico.com.br`
3. ✅ Salvamento funciona sem erro 500
4. ✅ Tokens são salvos no banco de dados

---

## 📝 Nota Importante

**O código já está correto!** O problema é **infraestrutura** (variável de ambiente no Railway). Não precisa alterar código, apenas configurar a variável e fazer redeploy.
