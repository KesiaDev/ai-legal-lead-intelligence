# 🔧 Solução: Forçar Nova Sincronização Vercel ↔ GitHub

## 🐛 Problema

Repositório está conectado, mas Vercel continua usando commit antigo `0940758`.

---

## ✅ Solução: Desconectar e Reconectar

### Passo 1: Desconectar Repositório

1. **Na tela atual (Settings → Git):**
   - Clique no botão **"Disconnect"** (cinza, à direita do repositório)
   - Confirme a desconexão

### Passo 2: Reconectar Repositório

1. **Após desconectar:**
   - Clique em **"Connect Git Repository"**
   - Selecione **GitHub**
   - Autorize o acesso (se necessário)
   - Escolha: `KesiaDev/legal-lead-scout`
   - Configure:
     - **Production Branch:** `main`
     - **Root Directory:** (deixe vazio)
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Clique em **"Save"** ou **"Salvar"**

### Passo 3: Aguardar Deploy Automático

1. **O Vercel vai fazer deploy automaticamente**
2. **Aguarde 2-3 minutos**
3. **Verifique os Build Logs:**
   - Deve aparecer: `Commit: d386c7c` ou mais recente
   - **NÃO** deve aparecer `0940758`

---

## 🔍 Verificar Webhook Após Reconectar

1. **GitHub:**
   - Acesse: https://github.com/KesiaDev/legal-lead-scout/settings/hooks
   - Deve aparecer um webhook do Vercel
   - Status: Verde (ativo) ✅

---

## 📋 Me Diga

1. **Conseguiu desconectar o repositório?**
2. **Conseguiu reconectar?**
3. **Apareceu um novo deploy?**
4. **Qual commit aparece nos Build Logs agora?**

---

**Desconecte e reconecte o repositório para forçar uma nova sincronização!**
