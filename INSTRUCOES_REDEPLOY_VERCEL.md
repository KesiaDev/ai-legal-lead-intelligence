# 🚀 Instruções: Redeploy Manual no Vercel

## 🐛 Problema

O Vercel está usando commit **`0940758`** (antigo) ao invés de **`46b4c9f`** (atual).

---

## ✅ Solução: Redeploy Manual

### Opção 1: Redeploy Simples (Tentar Primeiro)

1. **No Vercel Dashboard:**
   - Vá em **"Deployments"**
   - Clique nos **3 pontos** (⋮) do deploy mais recente
   - Selecione **"Redeploy"**
   - Clique em **"Redeploy"** na confirmação
   - Aguarde 2-3 minutos

2. **Verifique os Logs:**
   - Após o redeploy, veja os Build Logs
   - Procure por: `Commit: 46b4c9f` ou mais recente
   - Se ainda aparecer `0940758`, use a Opção 2

### Opção 2: Redeploy com Seleção de Commit (Se Opção 1 Não Funcionar)

1. **No Vercel Dashboard:**
   - Vá em **"Deployments"**
   - Clique nos **3 pontos** (⋮) do deploy mais recente
   - Selecione **"Redeploy"**
   - **Procure por uma opção de selecionar commit/branch**
   - Se houver, selecione o commit `46b4c9f` ou branch `main` mais recente
   - Clique em **"Redeploy"**

### Opção 3: Desconectar e Reconectar (Último Recurso)

Se nada funcionar:

1. **Vercel Dashboard → Settings → Git**
2. Clique em **"Disconnect"**
3. Clique em **"Connect Git Repository"**
4. Selecione: `KesiaDev/legal-lead-scout`
5. Autorize o acesso
6. Isso vai forçar um novo deploy com o código mais recente

---

## 🔍 Como Verificar se Funcionou

Após o redeploy:

1. Veja os **Build Logs**
2. Procure por: `Commit: 46b4c9f` ou mais recente
3. Se aparecer `0940758`, o problema persiste

---

## 📋 Checklist

- [ ] Redeploy manual feito
- [ ] Build Logs mostram commit `46b4c9f` ou mais recente
- [ ] Build passou (✓ built successfully)
- [ ] Site atualizado (teste Configurações e Conversas)

---

**Próximo passo:** Faça o redeploy manual e me diga qual commit aparece nos logs!
