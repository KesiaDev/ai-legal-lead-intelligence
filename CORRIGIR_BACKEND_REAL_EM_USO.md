# 🔧 CORRIGIR BACKEND REAL EM USO PELO FRONTEND

## 📋 OBJETIVO
Garantir que o frontend consuma o backend atualizado e não um service antigo no Railway.

---

## 1. ✅ VERIFICAÇÃO DO CÓDIGO FRONTEND

### Status do Código: ✅ CORRETO

**Arquivo:** `src/api/client.ts`
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
```

**Análise:**
- ✅ Usa variável de ambiente `VITE_API_URL`
- ✅ Fallback correto: `https://api.sdrjuridico.com.br`
- ✅ Não há URLs hardcoded do Railway antigo
- ✅ Todos os componentes usam `import.meta.env.VITE_API_URL`

**Conclusão:** O código está correto. O problema está na **configuração de infraestrutura**.

---

## 2. 🔍 RAILWAY - IDENTIFICAR SERVICES

### Passo 1: Acessar Railway Dashboard
1. Acesse: https://railway.app/dashboard
2. Selecione o projeto **"legal-lead-scout"** (ou nome similar)

### Passo 2: Listar Todos os Services
No dashboard do projeto, você verá uma lista de services. Identifique:

**Service Backend:**
- Nome: `legal-lead-scout-backend` ou `backend` ou similar
- Tipo: Node.js
- Port: 3001 (ou variável PORT)
- Domínio Customizado: `api.sdrjuridico.com.br`
- URL Railway: `xxx-production.up.railway.app` (pode ser diferente de `sdradvogados`)

**Service Frontend (se houver no Railway):**
- Nome: `legal-lead-scout-frontend` ou `frontend` ou similar
- Tipo: Node.js (Vite)
- Port: 8080
- Domínio Customizado: `www.sdrjuridico.com.br` (ou Vercel)

### Passo 3: Verificar Domínio `sdradvogados.up.railway.app`
1. Clique em cada service
2. Vá em **Settings** → **Networking** → **Custom Domain**
3. Verifique qual service possui:
   - Domínio: `api.sdrjuridico.com.br`
   - URL Railway: `sdradvogados.up.railway.app` (ou similar)

**⚠️ IMPORTANTE:**
- O domínio `api.sdrjuridico.com.br` DEVE apontar para o **service backend**
- A URL Railway (`xxx.up.railway.app`) é apenas uma URL temporária
- O frontend DEVE usar `api.sdrjuridico.com.br`, NÃO a URL Railway

---

## 3. 🚀 RAILWAY - VERIFICAR DEPLOY DO BACKEND

### Passo 1: Abrir Deployments do Service Backend
1. Railway Dashboard → Service Backend
2. Aba **Deployments**
3. Clique no deployment mais recente

### Passo 2: Verificar Commit
O commit deve conter:
- ✅ Validação de tenantId (commit: `800a0ec`)
- ✅ Auto-create de configs (commit: `47298a4`)
- ✅ Logs novos (commit: `800a0ec`)

**Verificar no commit message:**
```
feat: validacao robusta de tenantId em todos endpoints de config
feat: implementar auto-create de configuracoes por tenant
```

### Passo 3: Verificar Logs do Deploy
Os logs devem mostrar:
```
✅ prisma migrate deploy
✅ prisma generate
✅ Server listening on port 3001
```

**Se não mostrar:**
1. Clique em **"Redeploy"** no deployment mais recente
2. Ou faça um novo commit para trigger deploy

---

## 4. 🌐 VERCEL - CONFIGURAR VARIÁVEIS DE AMBIENTE

### Passo 1: Acessar Vercel Dashboard
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto **"legal-lead-scout"** (ou nome similar)

### Passo 2: Verificar Environment Variables
1. Vá em **Settings** → **Environment Variables**
2. Procure por: `VITE_API_URL`

**Se NÃO existir:**
- Clique em **"Add New"**
- Key: `VITE_API_URL`
- Value: `https://api.sdrjuridico.com.br`
- Environment: Production, Preview, Development (selecione todos)
- Clique em **"Save"**

**Se existir:**
- Verifique o valor
- Deve ser: `https://api.sdrjuridico.com.br`
- Se estiver diferente (ex: `https://sdradvogados.up.railway.app`), **CORRIJA!**
- Clique em **"Edit"** → Altere para `https://api.sdrjuridico.com.br` → **"Save"**

### Passo 3: Verificar VITE_WS_URL (Opcional)
Se você usa WebSocket:
1. Procure por: `VITE_WS_URL`
2. Se não existir, adicione:
   - Key: `VITE_WS_URL`
   - Value: `wss://api.sdrjuridico.com.br`
   - Environment: Production, Preview, Development
   - Clique em **"Save"**

### Passo 4: Fazer Redeploy do Frontend
**⚠️ CRÍTICO:** Após alterar variáveis, SEMPRE faça redeploy!

1. Vercel Dashboard → Projeto
2. Aba **Deployments**
3. Clique nos **3 pontos** do deployment mais recente
4. Selecione **"Redeploy"**
5. Aguarde o deploy completar (2-5 minutos)

---

## 5. 🧪 TESTE DIRETO NO NAVEGADOR

### Teste 1: Endpoint sem Autenticação (deve retornar 401)
Abra no navegador:
```
https://api.sdrjuridico.com.br/api/integrations
```

**Resultado Esperado:**
```json
{
  "error": "Não autenticado",
  "message": "Token de autenticação não fornecido"
}
```
**Status:** 401 ✅

**Se retornar 500 ou erro de conexão:**
- ❌ Backend não está rodando ou domínio incorreto
- Verifique Railway Dashboard → Service Backend → Logs

### Teste 2: Verificar se Backend está Atualizado
Abra no navegador:
```
https://api.sdrjuridico.com.br/api/integrations
```

Abra o **Console do Navegador** (F12 → Network):
- Verifique o **Response Headers**
- Deve conter: `x-powered-by: Fastify` ou similar
- Se não conter, o backend pode não estar atualizado

### Teste 3: Verificar URL Railway Antiga (se ainda existir)
Se você ainda tem acesso à URL Railway antiga:
```
https://sdradvogados.up.railway.app/api/integrations
```

**Resultado Esperado:**
- Se retornar 401: ✅ Backend antigo ainda funciona (mas não deve ser usado)
- Se retornar 500: ❌ Backend antigo não está atualizado
- **AÇÃO:** Não usar esta URL. Usar apenas `api.sdrjuridico.com.br`

---

## 6. 🔍 VERIFICAR NO FRONTEND (Console do Navegador)

### Passo 1: Acessar Frontend
1. Acesse: https://www.sdrjuridico.com.br (ou URL do Vercel)
2. Abra o **Console do Navegador** (F12)

### Passo 2: Verificar Variável de Ambiente
No Console, execute:
```javascript
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
```

**Resultado Esperado:**
```
VITE_API_URL: https://api.sdrjuridico.com.br
```

**Se aparecer:**
- `undefined`: ❌ Variável não configurada no Vercel
- `https://sdradvogados.up.railway.app`: ❌ URL antiga, corrigir no Vercel
- `https://api.sdrjuridico.com.br`: ✅ Correto!

### Passo 3: Verificar Requisições
1. No Console, vá em **Network** (Rede)
2. Faça login ou acesse Configurações
3. Verifique as requisições:

**✅ CORRETO:**
- Requisições vão para: `api.sdrjuridico.com.br`
- Status: 200 (sucesso) ou 401 (não autorizado)

**❌ ERRADO:**
- Requisições vão para: `sdradvogados.up.railway.app` (URL antiga)
- Status: 500 (erro interno)
- Erro CORS

---

## 7. 📊 CHECKLIST DE VERIFICAÇÃO

### Railway (Backend):
- [ ] Service backend identificado
- [ ] Domínio `api.sdrjuridico.com.br` apontando para service backend
- [ ] Deployment mais recente contém commits de validação/auto-create
- [ ] Logs mostram `prisma migrate deploy` e `prisma generate`
- [ ] Backend reiniciado após mudanças

### Vercel (Frontend):
- [ ] `VITE_API_URL` configurada como `https://api.sdrjuridico.com.br`
- [ ] `VITE_WS_URL` configurada (se usar WebSocket)
- [ ] Frontend fazendo redeploy após mudanças
- [ ] Domínio `www.sdrjuridico.com.br` apontando para Vercel

### Testes:
- [ ] GET `/api/integrations` sem token → 401
- [ ] GET `/api/integrations` com token válido → 200
- [ ] Console do navegador mostra `VITE_API_URL` correto
- [ ] Requisições vão para `api.sdrjuridico.com.br`
- [ ] Nenhum endpoint retorna 500

---

## 8. 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Frontend ainda usa URL Railway antiga
**Sintoma:** Console mostra `VITE_API_URL: https://sdradvogados.up.railway.app`
**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Editar `VITE_API_URL` → `https://api.sdrjuridico.com.br`
3. Fazer redeploy do frontend

### Problema: Variável não está sendo aplicada
**Sintoma:** Console mostra `VITE_API_URL: undefined`
**Solução:**
1. Verificar se variável está configurada no Vercel
2. Verificar se está marcada para "Production"
3. Fazer redeploy do frontend
4. Limpar cache do navegador (Ctrl+Shift+R)

### Problema: Backend retorna 500
**Sintoma:** Requisições retornam erro 500
**Solução:**
1. Railway Dashboard → Service Backend → Logs
2. Verificar se migrations foram aplicadas
3. Verificar se Prisma Client foi regenerado
4. Reiniciar backend no Railway

### Problema: CORS Error
**Sintoma:** Erro de CORS no console
**Solução:**
1. Railway Dashboard → Service Backend → Variables
2. Verificar `CORS_ORIGIN` inclui `https://www.sdrjuridico.com.br`
3. Reiniciar backend

---

## 9. 📝 PRÓXIMOS PASSOS

1. **Verificar Railway:**
   - Identificar service backend
   - Verificar domínio customizado
   - Verificar deployment mais recente

2. **Verificar Vercel:**
   - Configurar `VITE_API_URL`
   - Fazer redeploy

3. **Testar:**
   - Testar endpoints diretamente
   - Verificar no console do navegador
   - Confirmar que não há mais erros 500

---

## 10. 🔗 LINKS ÚTEIS

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Backend URL:** https://api.sdrjuridico.com.br
- **Frontend URL:** https://www.sdrjuridico.com.br

---

**Última Atualização:** 2026-01-23
**Status:** Aguardando verificação manual no Railway/Vercel
