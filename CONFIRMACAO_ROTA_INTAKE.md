# ✅ Confirmação da Rota `/api/agent/intake`

## 🔍 Verificação no Código

### **Rota Registrada:**

**Arquivo:** `backend/src/api/agent/intake.ts` (linha 85)

```typescript
export async function registerIntakeRoute(fastify: FastifyInstance) {
  fastify.post('/api/agent/intake', async (request: any, reply: any) => {
    // ... código da rota
  });
}
```

**✅ Rota confirmada:** `/api/agent/intake`

---

### **Registro no Server:**

**Arquivo:** `backend/src/server.ts` (linha 447)

```typescript
await registerIntakeRoute(fastify);
```

**✅ Rota registrada no Fastify**

---

## 🌐 URL Completa Correta

### **Backend URL (Railway):**

**⚠️ IMPORTANTE:** O backend está no serviço **"legal-lead-scout"**, NÃO em "SDR Advogados"!

**Opção 1: Domínio Customizado (se configurado):**
- **URL Base:** `https://api.sdrjuridico.com.br`
- **Rota:** `/api/agent/intake`
- **URL Completa:** `https://api.sdrjuridico.com.br/api/agent/intake`
- ⚠️ **Verifique se o domínio está apontando para o serviço "legal-lead-scout" (backend)**

**Opção 2: URL Railway Direta:**
- **URL Base:** `https://legal-lead-scout-production.up.railway.app` (ou similar)
- **Rota:** `/api/agent/intake`
- **URL Completa:** `https://legal-lead-scout-production.up.railway.app/api/agent/intake`
- ✅ **Use esta se não tiver domínio customizado configurado**

---

## ✅ URL CORRETA PARA N8N

**Se você tem domínio customizado configurado:**
```
POST https://api.sdrjuridico.com.br/api/agent/intake
```
⚠️ **Verifique se `api.sdrjuridico.com.br` está apontando para o serviço "legal-lead-scout" (backend)**

**Se você NÃO tem domínio customizado:**
```
POST https://legal-lead-scout-production.up.railway.app/api/agent/intake
```
(Substitua `legal-lead-scout-production.up.railway.app` pela URL real do seu serviço backend no Railway)

**⚠️ IMPORTANTE:**
- ✅ Usa `/api/agent/intake` (com `/api` no início)
- ✅ Método: `POST`
- ✅ Sem autenticação (rota pública)
- ✅ Body: JSON com `lead_id`, `mensagem`, `canal`, `clienteId`

---

## 🔍 Por Que Pode Estar Dando 404?

### **Possíveis Causas:**

1. **Backend não está rodando:**
   - Verifique se o serviço está "Online" no Railway
   - Verifique os logs do backend

2. **Rota não foi registrada:**
   - Verifique se `registerIntakeRoute(fastify)` está sendo chamado
   - Verifique se não há erro no build

3. **URL errada no N8N:**
   - Se usar domínio customizado: `https://api.sdrjuridico.com.br/api/agent/intake`
   - ⚠️ **IMPORTANTE:** Verifique se `api.sdrjuridico.com.br` está apontando para o serviço **"legal-lead-scout"** (backend), NÃO para "SDR Advogados" (frontend)
   - Se usar URL Railway direta: `https://legal-lead-scout-production.up.railway.app/api/agent/intake`
   - **NÃO** use: `https://sdradvogados.up.railway.app/api/agent/intake` (esse é o frontend)

4. **Problema de deploy:**
   - O código pode não ter sido deployado
   - Faça um novo deploy do backend

---

## 🧪 Como Testar

### **1. Testar Diretamente (curl ou Postman):**

```bash
# Se tiver domínio customizado:
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \

# OU se usar URL Railway direta:
curl -X POST https://legal-lead-scout-production.up.railway.app/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste de mensagem",
    "canal": "whatsapp",
    "clienteId": "test-tenant"
  }'
```

**Resposta esperada:**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "clienteId": "test-tenant",
  "analise": {
    "area": "...",
    "urgencia": "...",
    "score": 85,
    "acao": "...",
    "etapa_funil": "...",
    "prioridade": "..."
  },
  "timestamp": "2026-01-20T..."
}
```

**Se retornar 404:**
- ❌ Backend não está rodando OU
- ❌ Rota não foi registrada OU
- ❌ URL está errada

**Se retornar 200:**
- ✅ Rota está funcionando!
- ✅ Problema está no N8N (configuração)

---

### **2. Verificar Logs do Backend (Railway):**

1. Acesse Railway Dashboard
2. Vá no serviço "SDR Advogados" (backend)
3. Aba "Deployments" → Último deploy → "View Logs"
4. Procure por:
   - ✅ `Server running on port...`
   - ✅ `Route registered: /api/agent/intake`
   - ❌ Erros de build ou inicialização

---

### **3. Verificar Rota no Backend:**

Se você tem acesso SSH ao Railway, pode testar:

```bash
# Listar todas as rotas registradas
# (isso depende de como o Fastify está configurado)
```

Ou verificar nos logs se a rota foi registrada.

---

## ✅ CONFIRMAÇÃO FINAL

### **URL CORRETA:**

```
POST https://sdradvogados.up.railway.app/api/agent/intake
```

### **Payload Correto:**

```json
{
  "lead_id": "string",
  "mensagem": "string",
  "canal": "whatsapp",
  "clienteId": "string (opcional)"
}
```

### **Headers:**

```
Content-Type: application/json
```

### **Sem Autenticação:**

✅ Esta rota é **pública** (não precisa de token)

---

## 🔧 Se Ainda Estiver Dando 404

### **Checklist:**

- [ ] Backend está "Online" no Railway?
- [ ] URL no N8N está correta?
  - Domínio customizado: `https://api.sdrjuridico.com.br/api/agent/intake` (verifique se aponta para backend)
  - URL Railway: `https://legal-lead-scout-production.up.railway.app/api/agent/intake`
- [ ] Método é `POST`?
- [ ] Content-Type é `application/json`?
- [ ] Body tem `lead_id` e `mensagem`?
- [ ] Testou com curl/Postman diretamente?
- [ ] Verificou logs do backend no Railway?

---

## 📝 Resumo

**✅ Rota confirmada no código:** `/api/agent/intake`

**✅ URL completa (domínio customizado):** `https://api.sdrjuridico.com.br/api/agent/intake`
**✅ URL completa (Railway direta):** `https://legal-lead-scout-production.up.railway.app/api/agent/intake`
**⚠️ IMPORTANTE:** Verifique qual serviço o domínio está apontando no Railway!

**✅ Método:** `POST`

**✅ Sem autenticação:** Rota pública

**Se ainda der 404:**
1. Verifique se backend está rodando
2. Verifique se a URL no N8N está correta
3. Teste diretamente com curl/Postman
4. Verifique logs do backend
