# 🚀 Guia de Migração: Frontend para Vercel

## 📋 Por que Vercel?

- ✅ Otimizado para SPAs React/Vite
- ✅ Deploy automático do GitHub
- ✅ CDN global
- ✅ Sem problemas de proxy (502)
- ✅ Gratuito para projetos pequenos/médios
- ✅ Configuração simples

---

## 🎯 Passo a Passo

### 1️⃣ Preparar o Projeto

O projeto já está pronto! Não precisa de `server.js` ou Dockerfile para Vercel.

**Arquivos que Vercel usa:**
- ✅ `package.json` (já tem script `build`)
- ✅ `vite.config.ts` (já configurado)
- ✅ `dist/` (gerado pelo `npm run build`)

**Arquivos que NÃO precisa:**
- ❌ `server.js` (Vercel serve automaticamente)
- ❌ `Dockerfile` (Vercel usa build próprio)
- ❌ `railway.json` (não usado no Vercel)

---

### 2️⃣ Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Autorize o acesso ao repositório

---

### 3️⃣ Importar Projeto

1. No Vercel Dashboard, clique em **"Add New Project"**
2. Selecione o repositório: `KesiaDev/legal-lead-scout`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

### 4️⃣ Configurar Variáveis de Ambiente

No Vercel, vá em **Settings → Environment Variables** e adicione:

```
VITE_API_URL=https://sdradvogados.up.railway.app
VITE_WS_URL=wss://sdradvogados.up.railway.app
```

⚠️ **IMPORTANTE:** Variáveis `VITE_*` precisam ser adicionadas ANTES do primeiro deploy.

---

### 5️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (alguns minutos)
3. Vercel vai gerar uma URL: `legal-lead-scout.vercel.app`

---

### 6️⃣ Configurar Domínio Customizado (Opcional)

1. Vá em **Settings → Domains**
2. Adicione seu domínio customizado (se tiver)
3. Configure DNS conforme instruções

---

## 🔧 Configuração Avançada (Opcional)

### `vercel.json` (se necessário)

Crie na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Nota:** Geralmente não é necessário, Vercel detecta Vite automaticamente.

---

## ✅ Após o Deploy

### Testar:
1. Acesse a URL do Vercel
2. Verifique se a página carrega
3. Teste se consegue fazer login
4. Teste se consegue acessar o backend

### Verificar:
- ✅ Build completou sem erros
- ✅ Variáveis de ambiente estão configuradas
- ✅ Frontend consegue se conectar ao backend
- ✅ WebSocket funciona (se aplicável)

---

## 🔄 Atualizar Variáveis do Backend

No Railway (Backend), atualize `CORS_ORIGIN`:

```
CORS_ORIGIN=https://legal-lead-scout.vercel.app
```

Ou se usar domínio customizado:
```
CORS_ORIGIN=https://seu-dominio.com
```

---

## 📊 Comparação: Railway vs Vercel

| Aspecto | Railway | Vercel |
|---------|---------|--------|
| SPAs React | ❌ Problemas conhecidos | ✅ Otimizado |
| Deploy automático | ✅ Sim | ✅ Sim |
| CDN | ❌ Não | ✅ Sim (global) |
| Configuração | ⚠️ Complexa | ✅ Simples |
| Custo | 💰 Pago | 💰 Gratis (hobby) |
| Proxy/502 | ❌ Problemas | ✅ Sem problemas |

---

## 🎯 Resultado Esperado

Após migrar para Vercel:
- ✅ Frontend acessível sem 502
- ✅ Deploy automático a cada push
- ✅ CDN global (carregamento rápido)
- ✅ Backend continua no Railway (funcionando)
- ✅ Arquitetura profissional e escalável

---

## 🚨 Importante

**NÃO precisa deletar o serviço do Railway ainda!**

Mantenha ambos rodando até confirmar que Vercel está funcionando 100%.

Depois, pode:
- Desativar o serviço "SDR Advogados Frontend" no Railway
- Ou mantê-lo como backup

---

**Tempo estimado:** 15-20 minutos
**Dificuldade:** ⭐ Fácil
