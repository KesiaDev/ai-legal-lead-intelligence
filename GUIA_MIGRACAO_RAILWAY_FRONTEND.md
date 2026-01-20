# 🚀 Guia Completo: Migrar Frontend para Railway

## 📋 Pré-requisitos

✅ Conta no Railway (https://railway.app)  
✅ Backend já rodando no Railway (`sdradvogados.up.railway.app`)  
✅ Repositório GitHub conectado ao Railway  

---

## 🎯 Passo 1: Criar Novo Serviço no Railway

1. Acesse: **https://railway.app/dashboard**
2. Abra seu projeto (onde está o backend "SDR Advogados")
3. Clique em **"+ New"** → **"GitHub Repo"**
4. Selecione o repositório: **`KesiaDev/legal-lead-scout`**
5. Clique em **"Deploy Now"**

---

## 🎯 Passo 2: Configurar o Serviço

### **2.1. Root Directory**

1. No serviço recém-criado, vá em **Settings**
2. Role até **"Root Directory"**
3. Configure: **`.`** (raiz do projeto)
4. Clique em **"Save"**

### **2.2. Build Command**

1. Em **Settings → Build**, configure:
   - **Build Command:** `npm run build`
   - Ou deixe vazio (o Dockerfile já faz o build)

### **2.3. Start Command**

1. Em **Settings → Deploy**, configure:
   - **Start Command:** `npm start`
   - Ou deixe vazio (o Dockerfile já define o CMD)

---

## 🎯 Passo 3: Configurar Variáveis de Ambiente

1. No serviço, vá em **Variables**
2. Clique em **"+ New Variable"**
3. Adicione as seguintes variáveis:

### **Variáveis Necessárias:**

```
VITE_API_URL=https://sdradvogados.up.railway.app
```

**⚠️ IMPORTANTE:**
- Variáveis `VITE_*` precisam ser adicionadas **ANTES** do build
- Se você já fez deploy, precisa fazer um **redeploy** após adicionar

---

## 🎯 Passo 4: Configurar Dockerfile (Já está pronto!)

O `Dockerfile` já está configurado corretamente:
- ✅ Build stage com todas as dependências
- ✅ Production stage otimizado
- ✅ Serve arquivos estáticos via Express
- ✅ Health check endpoint

**Não precisa alterar nada!**

---

## 🎯 Passo 5: Configurar Railway.json (Já está pronto!)

O `railway.json` já está configurado:
- ✅ Usa Dockerfile
- ✅ Política de restart configurada

**Não precisa alterar nada!**

---

## 🎯 Passo 6: Configurar Networking (Gerar URL Pública)

1. No serviço, vá em **Settings → Networking**
2. Clique em **"Generate Domain"** ou **"Gerar Domínio"**
3. O Railway vai gerar uma URL automática (ex: `legal-lead-scout-production.up.railway.app`)
4. **Copie essa URL** - você vai precisar dela para:
   - Testar a aplicação
   - Configurar CORS no backend

**⚠️ IMPORTANTE:**
- O networking é criado automaticamente, mas você precisa gerar o domínio
- A URL é gerada automaticamente, mas você pode personalizar depois
- Sem gerar o domínio, o serviço não fica acessível publicamente

---

## 🎯 Passo 7: Fazer Deploy

1. Após configurar tudo, o Railway vai fazer deploy automaticamente
2. Ou clique em **"Deploy"** manualmente
3. Aguarde o build completar (pode levar 5-10 minutos)

---

## 🎯 Passo 8: Verificar Deploy

### **7.1. Verificar Logs**

1. Vá em **Deployments** → Clique no deploy mais recente
2. Verifique **Build Logs:**
   - ✅ Deve aparecer: `✓ built in Xs`
   - ✅ Deve aparecer: `dist/index.html`
3. Verifique **Deploy Logs:**
   - ✅ Deve aparecer: `🚀 Server running on http://0.0.0.0:PORT`
   - ✅ Deve aparecer: `✅ Health check available at: http://0.0.0.0:PORT/health`

### **7.2. Testar Health Check**

1. Vá em **Settings → Networking**
2. Copie a URL pública (ex: `legal-lead-scout-production.up.railway.app`)
3. Acesse: `https://SUA-URL/health`
4. Deve retornar: `{"status":"ok","port":8080,...}`

### **7.3. Testar Aplicação**

1. Acesse a URL pública no navegador
2. Deve carregar a tela de login
3. Teste a rota `/login` (deve funcionar sem 404)

---

## 🎯 Passo 9: Configurar CORS no Backend

Se o frontend não conseguir se conectar ao backend:

1. No serviço **"SDR Advogados"** (backend), vá em **Variables**
2. Adicione/atualize:
   ```
   CORS_ORIGIN=https://SUA-URL-FRONTEND.up.railway.app
   ```
3. Faça um redeploy do backend

---

## 🔧 Troubleshooting

### **Problema: 502 Bad Gateway**

**Solução:**
1. Verifique se o servidor está rodando (logs)
2. Verifique se a porta está correta (deve usar `process.env.PORT`)
3. Verifique se o `dist/` foi gerado corretamente
4. Tente fazer um redeploy

### **Problema: Erro de Build**

**Solução:**
1. Verifique os **Build Logs**
2. Verifique se todas as dependências estão no `package.json`
3. Verifique se o `Dockerfile` está correto

### **Problema: Variáveis de Ambiente não funcionam**

**Solução:**
1. Variáveis `VITE_*` precisam ser adicionadas **ANTES** do build
2. Faça um **redeploy** após adicionar variáveis
3. Verifique se o formato está correto: `VITE_API_URL=https://...`

### **Problema: Erro 404 nas rotas**

**Solução:**
1. O `server.js` já tem fallback para SPA
2. Verifique se o `dist/index.html` existe
3. Verifique os logs do servidor

---

## ✅ Checklist Final

Após migrar para Railway, verifique:

- [ ] Serviço criado e online
- [ ] Root Directory configurado: `.`
- [ ] Variável `VITE_API_URL` configurada
- [ ] Build completou sem erros
- [ ] Health check funciona (`/health`)
- [ ] URL pública carrega a aplicação
- [ ] Rota `/login` funciona
- [ ] Frontend consegue se conectar ao backend
- [ ] CORS configurado no backend

---

## 🎉 Pronto!

Seu frontend está rodando no Railway junto com o backend!

**Arquitetura Final:**
- 🟢 **Frontend (React SPA)** → Railway
- 🟢 **Backend (Fastify API)** → Railway
- 🟢 **PostgreSQL** → Railway

Tudo em um lugar só! 🚀

---

## 📞 Se Precisar de Ajuda

Se encontrar algum problema:
1. Verifique os logs do deploy
2. Verifique as variáveis de ambiente
3. Verifique se o `server.js` está rodando
4. Me avise que eu ajudo a resolver!
