# 🔍 Como Verificar Conexão Vercel ↔ GitHub

## 📍 Onde Verificar

### Passo 1: Vercel Dashboard → Settings → Git

1. **Vercel Dashboard:**
   - Clique em **Settings** (Configurações)
   - No menu à esquerda, clique em **Git**

2. **O que você deve ver:**
   - **Repository:** `KesiaDev/legal-lead-scout`
   - **Status:** Conectado ✅ ou Desconectado ❌
   - **Production Branch:** `main` (ou outra branch)

### Passo 2: Se Estiver Desconectado

1. **Clique em "Connect Git Repository"**
2. **Selecione GitHub**
3. **Autorize o acesso** (se necessário)
4. **Escolha o repositório:** `KesiaDev/legal-lead-scout`
5. **Configure:**
   - Production Branch: `main`
   - Root Directory: (deixe vazio)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Salve**

**O Vercel vai criar o webhook automaticamente!**

---

## 🔍 Verificar Webhook Após Conectar

Após conectar o repositório:

1. **GitHub:**
   - Acesse: https://github.com/KesiaDev/legal-lead-scout/settings/hooks
   - Deve aparecer um webhook do Vercel
   - Status: Verde (ativo) ✅

---

## ⚠️ Importante

**O Vercel NÃO fornece um Payload URL manual.**

O webhook é criado automaticamente através da **integração do GitHub App do Vercel**.

Você não precisa criar o webhook manualmente - o Vercel faz isso quando você conecta o repositório.

---

## 📋 Me Diga

1. **No Vercel Dashboard → Settings → Git:**
   - O repositório está conectado?
   - Qual é o status?

2. **Se estiver desconectado:**
   - Conecte o repositório seguindo os passos acima
   - Aguarde 2-3 minutos
   - Verifique se o webhook aparece no GitHub

---

**Primeiro, verifique se o repositório está conectado no Vercel!**
