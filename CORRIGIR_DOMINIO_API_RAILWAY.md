# 🔧 Corrigir Domínio API no Railway

## 🎯 Problema Identificado

**Erro:**
```
Error: Cannot POST /api/agent/intake
The resource you are requesting could not be found
```

**Causa:**
O domínio `api.sdrjuridico.com.br` está apontando para o serviço **ERRADO** no Railway.

---

## 📊 Estrutura dos Serviços no Railway

### **Serviços no Projeto:**

1. **"SDR Advogados"** (Frontend)
   - URL Railway: `sdradvogados.up.railway.app`
   - Função: Frontend React
   - ❌ **NÃO tem** `/api/agent/intake`

2. **"legal-lead-scout"** (Backend)
   - URL Railway: `legal-lead-scout-production.up.railway.app` (ou similar)
   - Função: Backend Fastify API
   - ✅ **TEM** `/api/agent/intake`

---

## ✅ SOLUÇÃO: Apontar Domínio para o Serviço Correto

### **Passo 1: Verificar Onde o Domínio Está Apontando**

1. Acesse **Railway Dashboard**
2. Vá em **Project** → Seu projeto
3. Clique no serviço **"SDR Advogados"** (frontend)
4. Vá em **Settings** → **Networking**
5. Verifique se `api.sdrjuridico.com.br` está listado aqui

**Se estiver aqui:** ❌ **ERRADO!** O domínio está apontando para o frontend.

---

### **Passo 2: Remover Domínio do Serviço Errado**

1. No serviço **"SDR Advogados"** → **Settings** → **Networking**
2. Se `api.sdrjuridico.com.br` estiver listado:
   - Clique nos **3 pontos** ao lado do domínio
   - Selecione **"Remove"** ou **"Delete"**
   - Confirme a remoção

---

### **Passo 3: Adicionar Domínio ao Serviço Correto (Backend)**

1. Acesse o serviço **"legal-lead-scout"** (backend)
2. Vá em **Settings** → **Networking**
3. Clique em **"Custom Domain"** ou **"Add Domain"**
4. Digite: `api.sdrjuridico.com.br`
5. Clique em **"Add"** ou **"Save"**

**⚠️ IMPORTANTE:**
- O Railway vai pedir para configurar DNS
- Você precisa configurar o DNS no seu provedor de domínio
- Siga as instruções do Railway

---

### **Passo 4: Configurar DNS (Se Necessário)**

Se o Railway pedir configuração de DNS:

1. Acesse seu provedor de domínio (ex: GoDaddy, Namecheap, etc.)
2. Vá em **DNS Management** ou **DNS Settings**
3. Adicione um registro **CNAME**:
   - **Name/Host:** `api`
   - **Value/Target:** O valor fornecido pelo Railway (ex: `cname.railway.app`)
   - **TTL:** 3600 (ou padrão)

**OU** adicione um registro **A**:
- **Name/Host:** `api`
- **Value/Target:** O IP fornecido pelo Railway
- **TTL:** 3600 (ou padrão)

4. Salve as alterações
5. Aguarde propagação DNS (pode levar até 24h, geralmente 5-30 minutos)

---

### **Passo 5: Verificar Configuração**

1. No Railway → Serviço **"legal-lead-scout"** → **Settings** → **Networking**
2. Verifique se `api.sdrjuridico.com.br` está listado
3. Status deve ser: **"Setup complete"** ou **"Active"** (verde)

---

### **Passo 6: Testar a Rota**

**Teste 1: No Navegador**
```
https://api.sdrjuridico.com.br/api/agent/intake
```

**Resultado esperado:**
- ❌ `404 Cannot GET` → ✅ **OK!** (rota é POST, não GET)
- ❌ `405 Method Not Allowed` → ✅ **OK!** (rota existe, mas método errado)
- ❌ JSON de erro do Fastify → ✅ **OK!** (rota existe)

**Resultado ERRADO:**
- ❌ Página HTML (frontend)
- ❌ Redirecionamento
- ❌ Página de erro do frontend

---

**Teste 2: Com curl/Postman**

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste de mensagem",
    "canal": "whatsapp"
  }'
```

**Resposta esperada:**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "analise": {
    "area": "...",
    "urgencia": "...",
    "score": 85,
    ...
  },
  "timestamp": "..."
}
```

**Se retornar 200:** ✅ **FUNCIONANDO!**

**Se retornar 404:** ❌ Domínio ainda não está apontando corretamente

---

## 🔍 Verificação Rápida (30 Segundos)

### **Checklist:**

- [ ] Domínio `api.sdrjuridico.com.br` está no serviço **"legal-lead-scout"** (backend)?
- [ ] Status do domínio: **"Setup complete"** ou **"Active"**?
- [ ] DNS configurado corretamente (se necessário)?
- [ ] Teste no navegador retorna erro de método (não página HTML)?
- [ ] Teste com curl retorna JSON (não 404)?

---

## 📝 Configuração Final Correta

### **Railway - Estrutura de Domínios:**

```
Project: legal-lead-scout
├─ Serviço: "SDR Advogados" (Frontend)
│  └─ Domínio: (nenhum ou outro domínio)
│
└─ Serviço: "legal-lead-scout" (Backend)
   └─ Domínio: api.sdrjuridico.com.br ✅
```

### **URLs Finais:**

**Backend API:**
```
https://api.sdrjuridico.com.br/api/agent/intake
```

**Frontend:**
```
https://sdradvogados.up.railway.app
(ou outro domínio se configurado)
```

---

## 🎯 Atualizar N8N

Depois de corrigir o domínio, atualize o N8N:

**URL no N8N:**
```
POST https://api.sdrjuridico.com.br/api/agent/intake
```

**Antes (errado):**
```
POST https://api.sdrjuridico.com.br/api/agent/intake
(apontando para frontend → 404)
```

**Depois (correto):**
```
POST https://api.sdrjuridico.com.br/api/agent/intake
(apontando para backend → 200)
```

---

## ✅ Resumo

### **Problema:**
- Domínio `api.sdrjuridico.com.br` apontando para frontend (errado)

### **Solução:**
1. Remover domínio do serviço "SDR Advogados" (frontend)
2. Adicionar domínio ao serviço "legal-lead-scout" (backend)
3. Configurar DNS (se necessário)
4. Testar rota

### **Resultado:**
- ✅ `api.sdrjuridico.com.br` aponta para backend
- ✅ Rota `/api/agent/intake` funciona
- ✅ N8N consegue enviar requisições

---

## 🆘 Se Ainda Não Funcionar

### **Verificar:**

1. **Backend está rodando?**
   - Railway → Serviço "legal-lead-scout" → Status: "Online"?

2. **Rota está registrada?**
   - Verifique logs do backend
   - Procure por: `Route registered: /api/agent/intake`

3. **DNS propagou?**
   - Use: https://dnschecker.org
   - Verifique se `api.sdrjuridico.com.br` aponta para Railway

4. **Porta correta?**
   - Backend deve estar na porta configurada no Railway
   - Geralmente: `3001` ou `PORT` (variável de ambiente)

---

**Pronto! Após seguir esses passos, o domínio estará apontando para o serviço correto!** 🚀
