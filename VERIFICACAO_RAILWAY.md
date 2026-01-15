# 🔍 Guia de Verificação - Railway (Backend e Frontend)

## 📋 CHECKLIST GERAL

### ✅ Backend (SDR Advogados)
- [ ] Serviço está "Online"
- [ ] Root Directory = `backend`
- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL conectado
- [ ] Build passou
- [ ] Servidor iniciou corretamente
- [ ] URL acessível

### ✅ Frontend (SDR Advogados Frontend)
- [ ] Serviço está "Online"
- [ ] Root Directory = `.` (raiz) ou vazio
- [ ] Variáveis de ambiente configuradas
- [ ] Build passou
- [ ] Servidor iniciou corretamente
- [ ] URL acessível

---

## 🔧 VERIFICAÇÃO PASSO A PASSO

### 1️⃣ BACKEND - Verificar Status

**No Railway Dashboard:**
1. Clique no serviço **"SDR Advogados"**
2. Verifique se está **"Online"** (bolinha verde)
3. Se estiver offline, vá para a aba **"Deployments"** e veja o último deploy

**O que verificar:**
- ✅ Status: Online
- ❌ Status: Failed / Offline → Ver logs

---

### 2️⃣ BACKEND - Verificar Root Directory

**No serviço "SDR Advogados":**
1. Vá em **Settings**
2. Procure por **"Root Directory"**
3. Deve estar: `backend`

**Se estiver errado:**
- Altere para: `backend`
- Clique em **"Apply changes"** ou **"Deploy"**

---

### 3️⃣ BACKEND - Verificar Variáveis de Ambiente

**No serviço "SDR Advogados" → Aba "Variables":**

Verifique se TODAS estas variáveis existem:

```
✅ DATABASE_URL=postgresql://postgres:...@postgres.railway.internal:5432/railway
✅ JWT_SECRET=uma-chave-super-segura-com-mais-de-32-caracteres-123456789
✅ JWT_EXPIRES_IN=7d
✅ PORT=3001
✅ NODE_ENV=production
✅ CORS_ORIGIN=https://sdr-advogados-frontend-production.up.railway.app
✅ OPENAI_API_KEY= (pode estar vazio)
```

**Se faltar alguma:**
- Clique em **"+ New Variable"**
- Adicione a variável faltante
- Salve

---

### 4️⃣ BACKEND - Verificar PostgreSQL

**No serviço "SDR Advogados":**
1. Vá em **Settings**
2. Procure por **"Connected Services"** ou **"Database"**
3. Deve mostrar: **"Postgres"** conectado

**Se não estiver conectado:**
- Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- Ou conecte o serviço **"Postgres"** existente

---

### 5️⃣ BACKEND - Verificar Logs de Deploy

**No serviço "SDR Advogados" → Aba "Deployments":**
1. Clique no deploy mais recente
2. Vá na aba **"Deploy Logs"**

**O que procurar:**

✅ **Build bem-sucedido:**
```
npm install
npm run db:generate
npm run build
npm start
🚀 Server running on http://localhost:3001
```

❌ **Erros comuns:**
- `Error: Cannot find module` → Dependências não instaladas
- `P1001: Can't reach database` → DATABASE_URL errada
- `Port already in use` → Porta conflitante
- `JWT_SECRET is required` → Variável faltando

**Se houver erro:**
- Copie a mensagem de erro completa
- Verifique qual etapa falhou (build, start, etc.)

---

### 6️⃣ BACKEND - Testar URL

**Acesse no navegador:**
```
https://sdradvogados.up.railway.app/
```

**Deve retornar:**
```json
{
  "message": "SDR Jurídico API",
  "version": "1.0.0",
  "status": "online",
  ...
}
```

**Se der erro:**
- ❌ 404 → Rota não encontrada (verificar se servidor iniciou)
- ❌ 500 → Erro interno (ver logs)
- ❌ Connection refused → Servidor não está rodando

---

### 7️⃣ FRONTEND - Verificar Status

**No Railway Dashboard:**
1. Clique no serviço **"SDR Advogados Frontend"**
2. Verifique se está **"Online"** (bolinha verde)
3. Se estiver offline, vá para a aba **"Deployments"**

---

### 8️⃣ FRONTEND - Verificar Root Directory

**No serviço "SDR Advogados Frontend":**
1. Vá em **Settings**
2. Procure por **"Root Directory"**
3. Deve estar: `.` (ponto) ou **vazio**

**Se estiver errado:**
- Altere para: `.` ou deixe vazio
- Clique em **"Apply changes"**

---

### 9️⃣ FRONTEND - Verificar Variáveis de Ambiente

**No serviço "SDR Advogados Frontend" → Aba "Variables":**

Verifique se estas variáveis existem:

```
✅ VITE_API_URL=https://sdradvogados.up.railway.app
✅ VITE_WS_URL=wss://sdradvogados.up.railway.app
```

**⚠️ IMPORTANTE:**
- Variáveis `VITE_*` precisam ser adicionadas ANTES do build
- Se você adicionou depois do build, precisa fazer um novo deploy

**Se faltar:**
- Clique em **"+ New Variable"**
- Adicione as variáveis
- Salve
- **Faça um novo deploy** (ou aguarde deploy automático)

---

### 🔟 FRONTEND - Verificar Logs de Deploy

**No serviço "SDR Advogados Frontend" → Aba "Deployments":**
1. Clique no deploy mais recente
2. Vá na aba **"Build Logs"** (primeiro)
3. Depois vá em **"Deploy Logs"** (segundo)

**Build Logs - O que procurar:**

✅ **Build bem-sucedido:**
```
npm install
npm run build
✓ built in Xs
```

❌ **Erros comuns:**
- `Could not find root directory` → Root Directory errado
- `Module not found` → Dependências faltando
- `Build failed` → Erro de compilação

**Deploy Logs - O que procurar:**

✅ **Servidor iniciou:**
```
npm start
🚀 Server running on http://0.0.0.0:PORT
```

❌ **Erros comuns:**
- `Application failed to respond` → Servidor não iniciou
- `Port already in use` → Porta conflitante
- `Cannot find module 'express'` → Dependência faltando
- `EADDRINUSE` → Porta já em uso

---

### 1️⃣1️⃣ FRONTEND - Testar URL

**Acesse no navegador:**
```
https://sdr-advogados-frontend-production.up.railway.app
```

**Deve mostrar:**
- ✅ Interface do app (tela de login ou dashboard)
- ❌ Erro "Application failed to respond" → Ver logs
- ❌ Erro "Blocked request" → Configuração do Vite
- ❌ Tela branca → Erro no JavaScript (ver console do navegador)

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Backend não inicia
1. Verificar `DATABASE_URL` (deve usar `postgres.railway.internal`)
2. Verificar `JWT_SECRET` (mínimo 32 caracteres)
3. Verificar logs para erro específico

### Frontend não inicia
1. Verificar se `express` está no `package.json`
2. Verificar se `server.js` existe na raiz
3. Verificar se build gerou a pasta `dist/`

### Frontend mostra erro de conexão
1. Verificar `VITE_API_URL` aponta para o backend correto
2. Verificar `CORS_ORIGIN` no backend aponta para o frontend correto
3. Verificar se backend está online

### Variáveis não funcionam
1. Variáveis `VITE_*` precisam de novo build
2. Variáveis do backend precisam de restart do serviço

---

## 📝 PRÓXIMOS PASSOS

1. Siga este checklist na ordem
2. Para cada item, marque ✅ ou ❌
3. Se encontrar um ❌, anote o erro exato
4. Compartilhe os erros encontrados para corrigirmos
