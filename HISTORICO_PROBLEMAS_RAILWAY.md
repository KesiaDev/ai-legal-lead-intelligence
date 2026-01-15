# 📋 Histórico Completo - Problemas no Deploy do Frontend no Railway

## 🎯 Objetivo
Fazer o frontend React (Vite) funcionar no Railway, acessível via `sdr-advogados-frontend-production.up.railway.app`.

---

## ✅ O QUE ESTÁ FUNCIONANDO

### Backend (SDR Advogados)
- ✅ Serviço Online
- ✅ Root Directory: `/backend`
- ✅ URL: `https://sdradvogados.up.railway.app` - **FUNCIONANDO**
- ✅ Retorna JSON da API corretamente
- ✅ Todas as variáveis de ambiente configuradas
- ✅ PostgreSQL conectado
- ✅ Servidor iniciando corretamente

### Frontend (SDR Advogados Frontend)
- ✅ Serviço Online
- ✅ Root Directory: `/` (raiz)
- ✅ Variáveis de ambiente configuradas:
  - `VITE_API_URL=https://sdradvogados.up.railway.app`
  - `VITE_WS_URL=wss://sdradvogados.up.railway.app`
- ✅ Build completando com sucesso
- ✅ Servidor iniciando corretamente nos logs
- ❌ **PROBLEMA**: URL retorna **502 Bad Gateway**

---

## 🔴 PROBLEMA ATUAL

**URL:** `https://sdr-advogados-frontend-production.up.railway.app`

**Erro:** `502 Bad Gateway` (Application failed to respond)

**Status nos Logs:**
- ✅ Servidor inicia: `🚀 Server running on http://0.0.0.0:8080`
- ✅ Porta correta: `Environment PORT: 8080`
- ✅ Pasta dist existe: `dist exists: true`
- ❌ HTTP Logs mostram: `GET /` → `502 Bad Gateway`

---

## 🔧 TENTATIVAS REALIZADAS

### 1️⃣ Tentativa: Configurar Vite Preview
**Problema:** Vite preview bloqueava o host do Railway
**Solução tentada:**
- Adicionado `preview.allowedHosts` no `vite.config.ts`
- Configurado para aceitar `.railway.app` e `.up.railway.app`
**Resultado:** ❌ Ainda dava erro "Blocked request"

---

### 2️⃣ Tentativa: Usar Servidor Express
**Problema:** Vite preview não funcionava bem no Railway
**Solução tentada:**
- Criado `server.js` com Express para servir arquivos estáticos
- Configurado para usar porta dinâmica do Railway (`process.env.PORT`)
**Resultado:** ❌ Servidor inicia, mas Railway retorna 502

---

### 3️⃣ Tentativa: Corrigir Root Directory
**Problema:** Railway não encontrava o diretório raiz
**Solução tentada:**
- Alterado Root Directory de `.(raiz)` para `.` (ponto)
**Resultado:** ✅ Build passou, mas ainda 502

---

### 4️⃣ Tentativa: Usar Dockerfile ao invés de Nixpacks
**Problema:** Nixpacks dava timeout ao baixar nixpkgs do GitHub (504 Gateway Timeout)
**Solução tentada:**
- Criado `Dockerfile` com build multi-stage
- Usa Node.js 18 Alpine
- Build em estágio separado, produção em outro
**Resultado:** ✅ Build passou, mas ainda 502

---

### 5️⃣ Tentativa: Adicionar axios ao package.json
**Problema:** Build falhava com "Rollup failed to resolve import 'axios'"
**Solução tentada:**
- Adicionado `"axios": "^1.6.0"` ao `package.json`
- Atualizado `package-lock.json`
**Resultado:** ✅ Build passou, mas ainda 502

---

### 6️⃣ Tentativa: Adicionar server.js ao Git
**Problema:** Dockerfile não encontrava `server.js` durante o build
**Solução tentada:**
- Adicionado `server.js` ao repositório Git
- Copiado explicitamente no Dockerfile
**Resultado:** ✅ Build passou, mas ainda 502

---

### 7️⃣ Tentativa: Corrigir ES Modules
**Problema:** `server.js` usava `require()` mas projeto é ES module
**Solução tentada:**
- Substituído `require('fs')` por `import { existsSync } from 'fs'`
**Resultado:** ✅ Servidor inicia sem erros, mas ainda 502

---

### 8️⃣ Tentativa: Adicionar Health Check e Logs
**Problema:** Não sabíamos se o servidor estava respondendo
**Solução tentada:**
- Adicionado endpoint `/health`
- Adicionados logs de debug
- Adicionado tratamento de erros
**Resultado:** ✅ Servidor inicia, logs mostram tudo OK, mas ainda 502

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

### Arquivos Criados:
1. `server.js` - Servidor Express para servir arquivos estáticos
2. `Dockerfile` - Build multi-stage para produção
3. `railway.json` - Configuração do Railway (usando Dockerfile)
4. `VERIFICACAO_RAILWAY.md` - Guia de verificação
5. `DEBUG_FRONTEND.md` - Guia de debug

### Arquivos Modificados:
1. `package.json` - Adicionado `express`, `axios`, script `start`
2. `vite.config.ts` - Adicionado `preview.allowedHosts`
3. `server.js` - Várias correções (ES modules, logs, health check)

---

## 📊 CONFIGURAÇÃO ATUAL

### `server.js`:
```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

// Servir arquivos estáticos
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html');
    const indexHtml = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error loading index.html:', error);
    res.status(500).send(`Error loading index.html: ${error.message}`);
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
```

### `Dockerfile`:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
COPY server.js ./server.js
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
```

### `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🔍 LOGS ATUAIS (Deploy Logs)

```
Starting Container
Environment PORT: 8080
Using PORT: 8080
__dirname: /app
dist exists: true
🚀 Server running on http://0.0.0.0:8080
```

**Status:** Servidor inicia corretamente, mas Railway retorna 502.

---

## 🔍 HTTP LOGS

```
GET / → 502 Bad Gateway (58ms)
GET /favicon.ico → 502 Bad Gateway (2ms)
```

**Status:** Requisições chegam, mas retornam 502.

---

## 🤔 HIPÓTESES NÃO TESTADAS

1. **Railway pode estar esperando health check em outro path**
   - Tentamos: `/health`
   - Não testamos: Configurar health check path nas Settings do Railway

2. **Railway pode estar fazendo proxy para porta diferente**
   - Servidor escuta em `8080`
   - Railway pode estar esperando outra porta

3. **Pode haver problema com o roteamento do Railway**
   - Servidor está rodando internamente
   - Railway não está conseguindo fazer proxy

4. **Pode ser necessário configurar variável de ambiente específica**
   - Não testamos: Variáveis específicas do Railway para health check

5. **Pode ser problema com o Dockerfile EXPOSE**
   - Atualmente: `EXPOSE 8080`
   - Pode precisar: Usar variável dinâmica

---

## 📝 INFORMAÇÕES TÉCNICAS

### Stack:
- **Frontend:** React + Vite + TypeScript
- **Servidor:** Express.js
- **Build:** Docker (multi-stage)
- **Deploy:** Railway.app
- **Node.js:** 18-alpine

### Estrutura do Projeto:
```
legal-lead-scout/
├── src/              # Código fonte React
├── dist/              # Build gerado pelo Vite
├── server.js          # Servidor Express
├── Dockerfile         # Build Docker
├── railway.json       # Config Railway
├── package.json       # Dependências
└── vite.config.ts     # Config Vite
```

### Variáveis de Ambiente (Frontend):
- `VITE_API_URL=https://sdradvogados.up.railway.app`
- `VITE_WS_URL=wss://sdradvogados.up.railway.app`

---

## 🎯 O QUE PRECISAMOS RESOLVER

**Problema Principal:** 
O servidor Express está rodando corretamente (logs confirmam), mas o Railway retorna **502 Bad Gateway** quando tentamos acessar a URL pública.

**Perguntas:**
1. Por que o Railway não consegue se conectar ao servidor que está rodando?
2. Há alguma configuração específica do Railway que estamos perdendo?
3. O problema pode ser com o roteamento/proxy do Railway?
4. Precisamos configurar algo nas Settings do serviço?

---

## 📞 PRÓXIMOS PASSOS SUGERIDOS

1. Verificar Settings do Railway para health check path
2. Testar se o servidor responde internamente (via curl dentro do container)
3. Verificar se há alguma configuração de networking no Railway
4. Considerar usar um servidor HTTP mais simples (serve, http-server)
5. Verificar documentação do Railway sobre servidores Node.js

---

**Data:** 15/01/2026
**Status:** 🔴 Problema não resolvido - Servidor roda, mas Railway retorna 502
