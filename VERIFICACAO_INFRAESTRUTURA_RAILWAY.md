# Verificação de Infraestrutura Railway - Backend e Frontend

## 📋 OBJETIVO
Garantir que o frontend esteja chamando o backend correto e atualizado no Railway.

---

## 1. ✅ CONFIGURAÇÃO DO FRONTEND

### Arquivo: `src/api/client.ts`
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
```

**Status:** ✅ Configurado corretamente
- Usa variável de ambiente `VITE_API_URL`
- Fallback para `https://api.sdrjuridico.com.br`

### Variáveis de Ambiente Necessárias no Vercel:
```
VITE_API_URL=https://api.sdrjuridico.com.br
VITE_WS_URL=wss://api.sdrjuridico.com.br
```

**⚠️ AÇÃO NECESSÁRIA:**
1. Acessar Vercel Dashboard
2. Ir em Settings → Environment Variables
3. Verificar se `VITE_API_URL` está configurada como `https://api.sdrjuridico.com.br`
4. Se não estiver, adicionar e fazer redeploy

---

## 2. ✅ CONFIGURAÇÃO DO BACKEND

### Arquivo: `backend/package.json`
```json
"start": "prisma migrate deploy && prisma generate && tsx src/server.ts"
```

**Status:** ✅ Script correto
- Aplica migrations antes de iniciar
- Regenera Prisma Client
- Inicia servidor

### Variáveis de Ambiente Necessárias no Railway (Backend):
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3000 (ou variável do Railway)
CORS_ORIGIN=https://www.sdrjuridico.com.br,https://sdrjuridico.com.br
```

**⚠️ AÇÃO NECESSÁRIA:**
1. Acessar Railway Dashboard
2. Selecionar o service do backend
3. Ir em Variables
4. Verificar se `CORS_ORIGIN` inclui o domínio do frontend

---

## 3. 🔍 VERIFICAÇÃO DE SERVIÇOS NO RAILWAY

### Passos para Verificar:

1. **Acessar Railway Dashboard:**
   - https://railway.app/dashboard
   - Selecionar o projeto

2. **Identificar Services:**
   - **Backend Service:** Deve ter:
     - Nome: `legal-lead-scout-backend` ou similar
     - Runtime: Node.js
     - Port: 3000 (ou variável PORT)
     - Domínio: `api.sdrjuridico.com.br` (custom domain)
     - URL Railway: `xxx-production.up.railway.app`

   - **Frontend Service:** (se houver no Railway)
     - Nome: `legal-lead-scout-frontend` ou similar
     - Runtime: Node.js (Vite)
     - Port: 8080
     - Domínio: `www.sdrjuridico.com.br` (custom domain)
     - URL Railway: `xxx-production.up.railway.app`

3. **Verificar Domínios Customizados:**
   - Backend: `api.sdrjuridico.com.br` → Deve apontar para o service backend
   - Frontend: `www.sdrjuridico.com.br` → Deve apontar para Vercel (não Railway)

---

## 4. 🔄 FORÇAR RESTART DO BACKEND

### Via Railway Dashboard:
1. Acessar o service do backend
2. Ir em **Deployments**
3. Clicar nos **3 pontos** do deployment mais recente
4. Selecionar **Restart**

### Via Railway CLI (se instalado):
```bash
railway restart
```

### Verificar Logs Após Restart:
Os logs devem mostrar:
```
✅ prisma migrate deploy
✅ prisma generate
✅ Server listening on port 3000
```

**⚠️ AÇÃO NECESSÁRIA:**
1. Fazer restart manual do backend no Railway
2. Verificar logs para confirmar que:
   - Migrations foram aplicadas
   - Prisma Client foi regenerado
   - Servidor iniciou corretamente

---

## 5. 🧪 TESTE DIRETO DOS ENDPOINTS

### Teste 1: Endpoint sem autenticação (deve retornar 401)
```bash
curl -X GET https://api.sdrjuridico.com.br/api/integrations
```

**Resultado Esperado:**
```json
{
  "error": "Não autenticado",
  "message": "Token de autenticação não fornecido"
}
```
**Status:** 401 ✅

### Teste 2: Endpoint com token inválido (deve retornar 401)
```bash
curl -X GET https://api.sdrjuridico.com.br/api/integrations \
  -H "Authorization: Bearer token_invalido"
```

**Resultado Esperado:**
```json
{
  "error": "Não autenticado",
  "message": "Token inválido ou expirado"
}
```
**Status:** 401 ✅

### Teste 3: Endpoint com token válido (deve retornar 200)
```bash
# Obter token fazendo login primeiro
TOKEN=$(curl -X POST https://api.sdrjuridico.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"sua_senha"}' \
  | jq -r '.token')

# Testar endpoint
curl -X GET https://api.sdrjuridico.com.br/api/integrations \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado:**
```json
{
  "openaiApiKey": null,
  "n8nWebhookUrl": null,
  ...
}
```
**Status:** 200 ✅

### Teste 4: Verificar se auto-create funciona
```bash
# Primeiro acesso deve criar IntegrationConfig automaticamente
curl -X GET https://api.sdrjuridico.com.br/api/integrations \
  -H "Authorization: Bearer $TOKEN"
```

**Resultado Esperado:**
- Primeira chamada: Cria registro automaticamente
- Segunda chamada: Retorna registro existente
- **Nunca retorna 500** ✅

---

## 6. 📊 CHECKLIST DE VERIFICAÇÃO

### Frontend (Vercel):
- [ ] `VITE_API_URL` configurada como `https://api.sdrjuridico.com.br`
- [ ] `VITE_WS_URL` configurada como `wss://api.sdrjuridico.com.br`
- [ ] Frontend fazendo deploy após mudanças
- [ ] Domínio `www.sdrjuridico.com.br` apontando para Vercel

### Backend (Railway):
- [ ] Service backend identificado e ativo
- [ ] Domínio `api.sdrjuridico.com.br` apontando para service backend
- [ ] Variável `CORS_ORIGIN` inclui domínio do frontend
- [ ] Variável `DATABASE_URL` configurada corretamente
- [ ] Variável `JWT_SECRET` configurada
- [ ] Script `start` correto no `package.json`
- [ ] Backend reiniciado após mudanças
- [ ] Logs mostram migrations aplicadas
- [ ] Logs mostram Prisma Client regenerado

### Testes:
- [ ] GET `/api/integrations` sem token → 401
- [ ] GET `/api/integrations` com token inválido → 401
- [ ] GET `/api/integrations` com token válido → 200
- [ ] GET `/api/agent/config` com token válido → 200
- [ ] GET `/api/voice/config` com token válido → 200
- [ ] PATCH `/api/integrations` salva OpenAI Key → 200
- [ ] Nenhum endpoint retorna 500

---

## 7. 🚨 PROBLEMAS COMUNS E SOLUÇÕES

### Problema: Frontend retorna 500 ao salvar OpenAI Key
**Causa:** Backend não reconhece tabelas (Prisma Client desatualizado)
**Solução:**
1. Reiniciar backend no Railway
2. Verificar logs para confirmar `prisma generate` executado
3. Verificar se migrations foram aplicadas

### Problema: CORS Error no frontend
**Causa:** `CORS_ORIGIN` não inclui domínio do frontend
**Solução:**
1. Adicionar domínio do frontend em `CORS_ORIGIN` no Railway
2. Reiniciar backend

### Problema: 401 em todas as requisições
**Causa:** Token inválido ou expirado
**Solução:**
1. Fazer logout e login novamente
2. Verificar se `JWT_SECRET` está configurado no Railway

### Problema: Frontend chamando URL errada
**Causa:** `VITE_API_URL` não configurada no Vercel
**Solução:**
1. Configurar `VITE_API_URL=https://api.sdrjuridico.com.br` no Vercel
2. Fazer redeploy do frontend

---

## 8. 📝 PRÓXIMOS PASSOS

1. **Verificar Railway Dashboard:**
   - Identificar service backend
   - Verificar domínios customizados
   - Verificar variáveis de ambiente

2. **Verificar Vercel Dashboard:**
   - Verificar variáveis de ambiente
   - Verificar domínios

3. **Fazer Restart do Backend:**
   - Via Railway Dashboard
   - Verificar logs

4. **Testar Endpoints:**
   - Usar curl ou Postman
   - Verificar respostas 401/200 (nunca 500)

5. **Testar no Frontend:**
   - Fazer login
   - Acessar Configurações
   - Tentar salvar OpenAI Key
   - Verificar se funciona sem erro 500

---

## 9. 🔗 LINKS ÚTEIS

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Backend URL:** https://api.sdrjuridico.com.br
- **Frontend URL:** https://www.sdrjuridico.com.br

---

**Última Atualização:** $(date)
**Status:** Aguardando verificação manual no Railway/Vercel
