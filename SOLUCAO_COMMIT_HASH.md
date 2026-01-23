# 🔧 Solução: Erro "A commit author is required"

## 🐛 Problema

O Vercel está pedindo um **commit author** quando você tenta fazer deploy da branch `deploy-vercel-fix`.

**Erro:** "A commit author is required"

---

## ✅ Solução: Usar Hash do Commit

Ao invés de usar a URL da branch, use o **hash do commit**.

### Passo 1: Limpar o Campo

1. **No campo "Commit or Branch Reference":**
   - Apague tudo que está lá
   - Deixe o campo vazio

### Passo 2: Digitar o Hash do Commit

1. **Digite apenas o hash do commit:**
   - `8d47087`
   - Ou o hash mais recente que aparecer

2. **Ou digite o nome da branch:**
   - `deploy-vercel-fix`
   - (sem a URL completa)

### Passo 3: Criar Deploy

1. Clique em **"Create Deployment"**

---

## 🔍 Alternativa: Usar Branch Name Direto

Se o hash não funcionar:

1. **No campo, digite apenas:**
   ```
   deploy-vercel-fix
   ```
   (sem `https://github.com/...`)

2. Clique em **"Create Deployment"**

---

## 📋 Me Diga

1. **Conseguiu limpar o campo e digitar apenas `8d47087` ou `deploy-vercel-fix`?**
2. **O erro desapareceu?**
3. **O deploy foi criado?**

---

**Tente primeiro digitar apenas `deploy-vercel-fix` (sem a URL). Se não funcionar, use o hash `8d47087`!**
