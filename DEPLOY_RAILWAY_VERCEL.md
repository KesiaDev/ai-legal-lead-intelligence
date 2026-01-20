# 🚀 Deploy Railway + Vercel - Guia Completo

## ✅ Status Atual

**Último commit:** `17b2503` - "fix: corrigir endpoint /me e adicionar documentacao"

---

## 🔄 Deploy Automático

Ambos Railway e Vercel fazem deploy **automaticamente** quando há push para a branch `main`.

### ✅ O que já foi feito:
- ✅ Todos os commits foram enviados para GitHub
- ✅ Railway detectará automaticamente
- ✅ Vercel detectará automaticamente

---

## 🚂 Railway (Backend)

### Status:
- **URL:** https://sdradvogados.up.railway.app
- **Deploy:** Automático via GitHub

### Como verificar:
1. Acesse: https://railway.app/dashboard
2. Clique no projeto "SDR Advogados"
3. Veja o deploy em andamento ou concluído

### Se não fizer deploy automático:
1. No dashboard do Railway
2. Clique em **"Settings"**
3. Vá em **"Source"**
4. Clique em **"Redeploy"**

### Endpoints para testar:
```bash
# Health Check
curl https://sdradvogados.up.railway.app/health

# Login
curl -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"sua-senha"}'
```

---

## ▲ Vercel (Frontend)

### Status:
- **URL:** https://legal-lead-scout.vercel.app
- **Deploy:** Automático via GitHub

### Como verificar:
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto "legal-lead-scout"
3. Vá em **"Deployments"**
4. Veja o deploy mais recente

### Se não fizer deploy automático:
1. No dashboard do Vercel
2. Vá em **"Deployments"**
3. Clique nos **3 pontos** (⋮) do último deploy
4. Selecione **"Redeploy"**

### Forçar deploy via Git:
```bash
# Criar commit vazio para forçar deploy
git commit --allow-empty -m "chore: forçar deploy"
git push
```

---

## ⏱️ Tempo de Deploy

- **Railway:** 2-5 minutos
- **Vercel:** 1-3 minutos

---

## 🧪 Testar Após Deploy

### 1. Backend (Railway)
```bash
# Health Check
curl https://sdradvogados.up.railway.app/health

# Deve retornar: {"status":"ok","timestamp":"..."}
```

### 2. Frontend (Vercel)
1. Acesse: https://legal-lead-scout.vercel.app
2. Faça login
3. Teste as novas funcionalidades:
   - Configurações → Informações Pessoais
   - Configurações → Empresa
   - Configurações → Usuários
   - Configurações → Notificações
   - Conversas → Chat ao Vivo

---

## 🔍 Verificar Logs

### Railway:
1. Dashboard → Projeto → **"Deploy Logs"**
2. Veja se há erros no build

### Vercel:
1. Dashboard → Projeto → **"Deployments"**
2. Clique no deploy → **"Build Logs"**
3. Veja se há erros no build

---

## 🐛 Se Houver Erros

### Railway:
- Verifique variáveis de ambiente (DATABASE_URL)
- Veja logs do deploy
- Verifique se o build está passando

### Vercel:
- Verifique variáveis de ambiente (VITE_API_URL)
- Veja logs do build
- Verifique se `vercel.json` está correto

---

## ✅ Checklist de Deploy

- [ ] Commits enviados para GitHub
- [ ] Railway detectou o push
- [ ] Vercel detectou o push
- [ ] Deploy do Railway concluído (status: "Ready")
- [ ] Deploy do Vercel concluído (status: "Ready")
- [ ] Health check do backend funcionando
- [ ] Frontend carregando corretamente
- [ ] Login funcionando
- [ ] Configurações acessíveis

---

**Status:** ⏳ **Aguardando deploys automáticos**
