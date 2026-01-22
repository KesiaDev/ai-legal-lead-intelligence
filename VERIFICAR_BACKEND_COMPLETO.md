# ✅ Verificar Backend Completo

## 📋 CHECKLIST DO BACKEND

### **1️⃣ Configurações Básicas (Railway)**

- [x] **Root Directory:** `/backend` ✅
- [x] **Custom Start Command:** `npx prisma migrate deploy && npm start` ✅
- [x] **Porta:** 3001 ✅
- [x] **Domínio:** `api.sdrjuridico.com.br` → Port 3001 ✅
- [x] **Status:** Online ✅

---

### **2️⃣ Variáveis de Ambiente (Railway → Backend → Variables)**

**Obrigatórias:**

- [ ] `DATABASE_URL` = `postgresql://...` (conexão com Postgres)
- [ ] `JWT_SECRET` = `[chave com pelo menos 32 caracteres]`
- [ ] `JWT_EXPIRES_IN` = `7d` (ou outro valor)
- [ ] `PORT` = `3001` (ou deixar Railway definir)
- [ ] `NODE_ENV` = `production`

**Opcionais:**

- [ ] `OPENAI_API_KEY` = `sk-...` (se usar OpenAI)
- [ ] `CORS_ORIGIN` = `https://sdrjuridico.com.br,https://www.sdrjuridico.com.br` (opcional, já está com `origin: true`)

---

### **3️⃣ Testar Backend**

#### **Teste 1: Health Check**

**No navegador, acesse:**
```
https://api.sdrjuridico.com.br/health
```

**Esperado:**
```json
{"status":"ok","timestamp":"2025-01-20T..."}
```

**Se retornar 404:** ❌ Rota não existe (verificar código)
**Se retornar JSON:** ✅ Backend funcionando!

---

#### **Teste 2: Login (POST)**

**No Console do Navegador (F12 → Console), execute:**

```javascript
fetch('https://api.sdrjuridico.com.br/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'seu-email@exemplo.com',
    password: 'sua-senha'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**Esperado:**
- **200 OK:** `{ token: "...", user: {...}, tenant: {...} }`
- **401:** `{ error: "Credenciais inválidas" }` (normal se credenciais erradas)
- **400:** `{ error: "Campos obrigatórios ausentes" }` (normal se faltar campos)

**Se retornar 404:** ❌ Rota não existe
**Se retornar CORS:** ❌ Problema de CORS (mas já está com `origin: true`)

---

#### **Teste 3: Verificar Rotas Principais**

**Rotas que devem existir:**

- ✅ `GET /health` → Health check
- ✅ `POST /login` → Login
- ✅ `POST /register` → Registro
- ✅ `GET /me` → Dados do usuário autenticado
- ✅ `POST /leads` → Webhook universal (N8N)
- ✅ `POST /api/agent/intake` → Intake do agente IA
- ✅ `GET /api/leads` → Listar leads
- ✅ `GET /api/pipelines` → Listar pipelines

---

### **4️⃣ Verificar Logs do Backend**

**No Railway → Backend → Logs:**

**Procure por:**
```
🚀 API rodando na porta 3001
```

**Se aparecer:** ✅ Backend iniciou corretamente

**Se aparecer erro:** ❌ Verificar erro específico

---

### **5️⃣ Verificar CORS**

**O backend está configurado com:**
```typescript
await fastify.register(cors, {
  origin: true,  // Aceita qualquer origem
  credentials: true,
});
```

**Isso está CORRETO!** ✅ Aceita requisições de qualquer origem.

---

## 🔍 PROBLEMAS COMUNS

### **Problema 1: Backend retorna 404 em todas as rotas**

**Causa:** Domínio não está apontando para o serviço correto

**Solução:**
1. Railway → Backend → **Networking**
2. Verifique se `api.sdrjuridico.com.br` está apontando para **Port 3001**
3. Verifique se o serviço está **Online**

---

### **Problema 2: Backend retorna 500 (Internal Server Error)**

**Causa:** Erro no código ou variáveis de ambiente faltando

**Solução:**
1. Railway → Backend → **Logs**
2. Veja o erro específico
3. Verifique se todas as variáveis obrigatórias estão configuradas

---

### **Problema 3: CORS Error**

**Causa:** CORS não está configurado (mas já está com `origin: true`)

**Solução:**
- Já está configurado com `origin: true`, deve funcionar
- Se persistir, verifique se o backend está realmente rodando

---

## ✅ RESUMO

**Seu backend está configurado assim:**

- ✅ Root Directory: `/backend`
- ✅ Start Command: `npx prisma migrate deploy && npm start`
- ✅ Porta: 3001
- ✅ Domínio: `api.sdrjuridico.com.br` → Port 3001
- ✅ Status: Online
- ✅ CORS: `origin: true` (aceita qualquer origem)

**O que verificar:**

1. ✅ Variáveis de ambiente obrigatórias configuradas
2. ✅ Testar `/health` retorna JSON
3. ✅ Testar `/login` funciona
4. ✅ Logs mostram "API rodando na porta 3001"

**Se tudo estiver OK, o problema está no FRONTEND!** 🚀
