# 🔍 Verificar Serviço Correto no Railway

## 🎯 Problema Identificado

**Logs mostram:**
- ✅ Backend está rodando: `🚀 API rodando na porta 3001`
- ✅ Servidor escutando: `Server listening at http://0.0.0.0:3001`

**Mas o 502 persiste porque:**
- ❌ O domínio `api.sdrjuridico.com.br` está apontando para o serviço **ERRADO**

---

## 🔍 Verificar Qual Serviço Tem o Backend

### **Passo 1: Identificar o Serviço do Backend**

No Railway, você deve ter **2 serviços**:

1. **"SDR Advogados"** (Frontend)
   - URL: `sdradvogados.up.railway.app`
   - Função: Frontend React
   - ❌ **NÃO tem** `/api/agent/intake`

2. **"SDR Advogados Backend"** ou **"legal-lead-scout"** (Backend)
   - URL: `legal-lead-scout-production.up.railway.app` (ou similar)
   - Função: Backend Fastify API
   - ✅ **TEM** `/api/agent/intake`

---

### **Passo 2: Verificar Qual Serviço Tem os Logs do Backend**

1. Acesse **Railway Dashboard**
2. Vá em cada serviço:
   - **"SDR Advogados"**
   - **"SDR Advogados Backend"** (ou outro nome)
3. Em cada um, vá em **"Deploy Logs"**
4. Procure por: `🚀 API rodando na porta 3001`

**O serviço que tiver essa mensagem É o backend!**

---

### **Passo 3: Verificar Onde o Domínio Está Apontando**

1. Acesse o serviço que você identificou como **BACKEND**
2. Vá em **Settings** → **Networking**
3. Verifique se `api.sdrjuridico.com.br` está listado aqui

**Se NÃO estiver:**
- ❌ O domínio está no serviço errado (frontend)
- ✅ Precisa mover para o serviço correto (backend)

---

## ✅ SOLUÇÃO: Mover Domínio para o Serviço Correto

### **Passo 1: Remover Domínio do Serviço Errado**

1. Acesse o serviço **"SDR Advogados"** (frontend)
2. Vá em **Settings** → **Networking**
3. Se `api.sdrjuridico.com.br` estiver listado:
   - Clique nos **3 pontos** ao lado
   - Selecione **"Remove"** ou **"Delete"**
   - Confirme

---

### **Passo 2: Adicionar Domínio ao Serviço Correto**

1. Acesse o serviço que tem os logs `🚀 API rodando na porta 3001` (backend)
2. Vá em **Settings** → **Networking**
3. Clique em **"+ Custom Domain"**
4. Digite: `api.sdrjuridico.com.br`
5. Configure porta: **3001**
6. Clique em **"Add"** ou **"Save"**

---

### **Passo 3: Verificar Configuração**

1. No serviço do backend → **Settings** → **Networking**
2. Verifique se `api.sdrjuridico.com.br` está listado
3. Status deve ser: **"Setup complete"** (verde)
4. Porta deve ser: **3001**

---

## 🧪 Teste Após Correção

### **Aguarde alguns segundos** (propagação)

Depois teste:

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste",
    "canal": "whatsapp"
  }'
```

**Resposta esperada (200 OK):**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "analise": {
    ...
  }
}
```

---

## 📋 Checklist

- [ ] Identifiquei qual serviço tem os logs `🚀 API rodando na porta 3001`
- [ ] Removi `api.sdrjuridico.com.br` do serviço errado (frontend)
- [ ] Adicionei `api.sdrjuridico.com.br` ao serviço correto (backend)
- [ ] Porta configurada: **3001**
- [ ] Status: "Setup complete"
- [ ] Testei a rota e funcionou?

---

## 🎯 Resumo

**Problema:**
- Backend está rodando ✅
- Domínio está no serviço errado ❌

**Solução:**
1. Identifique o serviço do backend (pelos logs)
2. Remova domínio do frontend
3. Adicione domínio ao backend
4. Configure porta 3001
5. Teste

---

**Pronto! Após mover o domínio para o serviço correto, o 502 deve ser resolvido!** 🚀
