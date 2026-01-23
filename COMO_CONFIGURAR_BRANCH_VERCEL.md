# 🔧 Como Configurar Branch no Vercel

## 📍 Onde Encontrar a Configuração de Branch

### Opção 1: Settings → Git → Production Branch

1. **Vercel Dashboard:**
   - Clique em **Settings** (Configurações)
   - No menu à esquerda, clique em **Git**
   - Procure por uma seção chamada:
     - **"Production Branch"**
     - **"Branch de Produção"**
     - **"Production"**
     - **"Branch"**

2. **Se não aparecer:**
   - Pode estar em **"Build and Deployment Settings"**
   - Ou em **"General"**

### Opção 2: Build and Deployment Settings

1. **Vercel Dashboard:**
   - Settings → **Build and Deployment Settings**
   - Procure por:
     - **"Production Branch"**
     - **"Git Branch"**
     - **"Branch"**

### Opção 3: Durante o Deploy Manual

1. **Vercel Dashboard:**
   - Vá em **Deployments**
   - Clique nos **3 pontos (...)** de qualquer deploy
   - Selecione **"Redeploy"**
   - Na tela de redeploy, pode haver opção de escolher branch

---

## 🔍 Alternativa: Deploy Manual da Nova Branch

Se não encontrar a configuração, podemos fazer deploy manual:

### Passo 1: Fazer Deploy Manual via CLI

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Fazer deploy da branch:**
   ```bash
   git checkout deploy-vercel-fix
   vercel --prod
   ```

### Passo 2: Ou Criar Deploy via Dashboard

1. **Vercel Dashboard:**
   - Vá em **Deployments**
   - Clique em **"Create Deployment"** ou **"Criar Deploy"**
   - Escolha:
     - **Repository:** `KesiaDev/legal-lead-scout`
     - **Branch:** `deploy-vercel-fix`
     - **Framework:** Vite (ou auto-detect)
   - Clique em **"Deploy"**

---

## 📋 Me Diga

1. **No Settings → Git, o que você vê?**
   - Há alguma opção de branch?
   - Há alguma seção "Production"?
   - Há alguma seção "Build"?

2. **Tire um print da tela Settings → Git** (se possível)

3. **Ou prefere fazer deploy manual da branch `deploy-vercel-fix`?**

---

**Me diga o que você vê na tela Settings → Git para eu te guiar melhor!**
