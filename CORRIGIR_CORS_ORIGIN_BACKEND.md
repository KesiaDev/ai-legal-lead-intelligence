# 🔧 Corrigir CORS_ORIGIN no Backend

## 🔴 PROBLEMA IDENTIFICADO

**`CORS_ORIGIN`** está com valor antigo:
```
https://legal-lead-scout.verce1.app
```

**Problemas:**
1. ❌ URL antiga do Vercel (com typo: `verce1` ao invés de `vercel`)
2. ❌ Frontend agora está no Railway, não no Vercel
3. ⚠️ **MAS:** O backend está configurado com `origin: true`, então essa variável **NÃO está sendo usada**

---

## ✅ SOLUÇÃO

### **Opção 1: Remover CORS_ORIGIN (Recomendado)**

**Como o backend está com `origin: true`, o `CORS_ORIGIN` não é usado!**

1. Railway → Backend → **Variables**
2. Encontre `CORS_ORIGIN`
3. Clique nos **três pontinhos** (⋮) à direita
4. Clique em **"Delete"** ou **"Remove"**
5. Confirme a remoção

**Isso é SEGURO porque o código usa `origin: true`!**

---

### **Opção 2: Atualizar CORS_ORIGIN (Se Quiser Restringir)**

**Se quiser restringir CORS para domínios específicos:**

1. Railway → Backend → **Variables**
2. Encontre `CORS_ORIGIN`
3. Clique nos **três pontinhos** (⋮) → **"Edit"**
4. Atualize para o domínio do frontend no Railway:
   ```
   https://legal-lead-scout-production.up.railway.app
   ```
   OU se tiver domínio customizado:
   ```
   https://sdrjuridico.com.br,https://www.sdrjuridico.com.br
   ```
5. **MAS:** Você precisaria modificar o código para usar `env.CORS_ORIGIN` ao invés de `origin: true`

---

## 📋 VERIFICAÇÃO DAS OUTRAS VARIÁVEIS

### ✅ **CORRETAS:**

- ✅ `DATABASE_URL` = `postgresql://...` ✅
- ✅ `JWT_EXPIRES_IN` = `7d` ✅
- ✅ `JWT_SECRET` = `[tem valor]` ✅
- ✅ `PORT` = `3001` ✅
- ✅ `NODE_ENV` = `production` (mascarado) ✅

### ⚠️ **OPCIONAL:**

- ⚠️ `OPENAI_API_KEY` = `sua-chave-aqui` (placeholder)
  - Se não usar OpenAI, pode deixar assim
  - Se usar, precisa colocar a chave real

---

## 🔍 VERIFICAR CÓDIGO DO BACKEND

**O backend está configurado assim:**

```typescript
await fastify.register(cors, {
  origin: true,  // ← Aceita QUALQUER origem
  credentials: true,
});
```

**Isso significa:**
- ✅ Aceita requisições de **qualquer domínio**
- ✅ `CORS_ORIGIN` **NÃO está sendo usado**
- ✅ Pode remover `CORS_ORIGIN` sem problemas

---

## ✅ RECOMENDAÇÃO

**Remover `CORS_ORIGIN`** porque:
1. ✅ Não está sendo usado (`origin: true` no código)
2. ✅ Está com valor antigo/errado
3. ✅ Simplifica a configuração

**OU deixar como está** porque:
- ✅ Não está causando problemas (não é usado)
- ✅ Pode ser útil no futuro se quiser restringir

---

## 🧪 TESTAR APÓS CORRIGIR

1. **Teste Backend:**
   ```
   https://api.sdrjuridico.com.br/health
   ```
   Deve retornar JSON ✅

2. **Teste Frontend:**
   - Acesse o frontend
   - Abra Console (F12)
   - Tente fazer login
   - Verifique se não há erros CORS

---

## ✅ RESUMO

**Problema:** `CORS_ORIGIN` com valor antigo

**Solução:**
- ✅ **Recomendado:** Remover `CORS_ORIGIN` (não está sendo usado)
- ✅ **Alternativa:** Deixar como está (não causa problemas)

**Outras variáveis:** ✅ Todas corretas!

**Próximo passo:** Verificar se o **FRONTEND** está configurado corretamente! 🚀
