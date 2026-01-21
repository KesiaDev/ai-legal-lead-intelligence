# 🔧 Resolver Erro 502 Bad Gateway

## 🎯 Problema Identificado

**Erro:**
```
502 Bad Gateway
{
  "status": "error",
  "code": 502,
  "message": "Application failed to respond"
}
```

**O que significa:**
- ✅ O domínio está correto (`api.sdrjuridico.com.br`)
- ✅ A rota está sendo encontrada
- ❌ **O backend não está respondendo**

---

## 🔍 Diagnóstico: Verificar Backend

### **Passo 1: Verificar Status do Backend no Railway**

1. Acesse **Railway Dashboard**
2. Vá no serviço **"SDR Advogados Backend"**
3. Verifique o status:
   - ✅ **"Online"** (bolinha verde) → Backend está rodando
   - ❌ **"Offline"** ou **"Failed"** → Backend não está rodando

**Se estiver offline:**
- Vá em **"Deployments"**
- Veja o último deploy
- Verifique se há erros

---

### **Passo 2: Verificar Logs do Backend**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba **"Deployments"** → Último deploy → **"View Logs"**
3. Procure por:

**✅ Logs esperados (sucesso):**
```
🚀 API rodando na porta 3001
```

**❌ Logs de erro (problema):**
```
Error: Cannot connect to database
Error: Port already in use
Error: Module not found
```

**Se houver erros:**
- Anote o erro
- Corrija o problema
- Faça redeploy

---

### **Passo 3: Verificar Variáveis de Ambiente**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba **"Variables"**
3. Verifique se TODAS estas variáveis existem:

```
✅ DATABASE_URL=postgresql://...
✅ JWT_SECRET=...
✅ JWT_EXPIRES_IN=7d
✅ PORT=3001
✅ NODE_ENV=production
✅ CORS_ORIGIN=...
```

**Se faltar alguma:**
- Adicione a variável faltante
- Salve
- Faça redeploy

---

### **Passo 4: Verificar Porta**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba **"Settings"** → **"Networking"**
3. Verifique se a porta do domínio `api.sdrjuridico.com.br` é **3001**

**Se não for:**
- Edite o domínio
- Altere a porta para **3001**
- Salve

---

## ✅ Soluções Comuns

### **Solução 1: Backend Não Está Rodando**

**Sintomas:**
- Status: "Offline" ou "Failed"
- Logs mostram erro de inicialização

**Solução:**
1. Verifique logs para identificar o erro
2. Corrija o erro
3. Faça redeploy:
   - Railway → Deployments → "Redeploy"

---

### **Solução 2: Erro de Conexão com Banco**

**Sintomas:**
- Logs mostram: `Error: Can't reach database server`
- `P1001: Can't reach database server`

**Solução:**
1. Verifique se PostgreSQL está conectado ao serviço
2. Verifique variável `DATABASE_URL`
3. Teste conexão com banco

---

### **Solução 3: Porta Incorreta**

**Sintomas:**
- Backend está rodando
- Porta no Networking não corresponde

**Solução:**
1. Verifique qual porta o backend está usando (logs)
2. Altere porta no Networking para corresponder
3. Salve

---

### **Solução 4: Backend Travado/Crash**

**Sintomas:**
- Status: "Online" mas não responde
- Logs param de aparecer

**Solução:**
1. Faça redeploy:
   - Railway → Deployments → "Redeploy"
2. Ou reinicie o serviço:
   - Railway → Settings → "Restart Service"

---

## 🧪 Teste Após Correção

### **Teste 1: Verificar Health Check**

Se o backend tiver endpoint `/health`:

```bash
curl https://api.sdrjuridico.com.br/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "port": 3001
}
```

**Se retornar 502:** Backend ainda não está respondendo

---

### **Teste 2: Testar Rota Diretamente**

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

**Se retornar 502:** Backend ainda não está respondendo

---

## 📋 Checklist de Diagnóstico

- [ ] Backend está "Online" no Railway?
- [ ] Logs mostram: `🚀 API rodando na porta 3001`?
- [ ] Variável `PORT=3001` está configurada?
- [ ] Porta no Networking é **3001**?
- [ ] Variável `DATABASE_URL` está configurada?
- [ ] PostgreSQL está conectado ao serviço?
- [ ] Não há erros nos logs?
- [ ] Testou health check (se existir)?

---

## 🆘 Se Nada Funcionar

### **Última Solução: Redeploy Completo**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba **"Deployments"**
3. Clique em **"Redeploy"** ou **"Deploy"**
4. Aguarde build completar
5. Verifique logs
6. Teste novamente

---

## 📝 Resumo

**Erro 502 Bad Gateway significa:**
- Railway recebe a requisição ✅
- Backend não está respondendo ❌

**Causas comuns:**
1. Backend não está rodando
2. Erro de inicialização
3. Porta incorreta
4. Erro de conexão com banco
5. Backend travado

**Solução:**
1. Verifique logs do backend
2. Identifique o erro
3. Corrija o problema
4. Faça redeploy
5. Teste novamente

---

**Pronto! Siga esses passos para diagnosticar e resolver o 502!** 🚀
