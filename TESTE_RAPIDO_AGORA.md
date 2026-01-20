# 🧪 Teste Rápido - Agora que está Online!

## ✅ Status: Backend Online!

O Railway mostra que o serviço está **Online**. Vamos testar tudo!

---

## 🚀 TESTE 1: Health Check (30 segundos)

**Abra no navegador:**
```
https://sdradvogados.up.railway.app/health
```

**✅ Deve retornar:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T..."
}
```

**Se funcionou:** ✅ Backend está respondendo!

---

## 🔐 TESTE 2: Criar Conta (2 minutos)

### **Via Frontend (Mais Fácil):**

1. Acesse: `https://legal-lead-scout.vercel.app/login`
2. Clique na aba **"Registrar"**
3. Preencha:
   - **Nome:** `Teste Usuário`
   - **Email:** `teste@example.com` (use um email único)
   - **Nome do Escritório:** `Escritório Teste`
   - **Senha:** `123456` (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**

**✅ Deve acontecer:**
- Toast verde: "Conta criada com sucesso!"
- Redirecionamento para dashboard
- Seu nome aparece no header

**Se funcionou:** ✅ Registro funcionando!

---

## 🔑 TESTE 3: Login (1 minuto)

1. Se já criou conta, faça logout
2. Acesse: `https://legal-lead-scout.vercel.app/login`
3. Preencha:
   - **Email:** `teste@example.com`
   - **Senha:** `123456`
4. Clique em **"Entrar"**

**✅ Deve acontecer:**
- Toast verde: "Login realizado com sucesso!"
- Redirecionamento para dashboard
- Dashboard carrega com seus dados

**Se funcionou:** ✅ Login funcionando!

---

## 📝 TESTE 4: Criar Lead via API (1 minuto)

**Abra o terminal ou Postman:**

```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@example.com",
    "origem": "site",
    "clienteId": "escritorio-teste-123"
  }'
```

**✅ Deve retornar:**
```json
{
  "success": true,
  "leadId": "uuid-aqui",
  "clienteId": "escritorio-teste-123",
  "message": "Lead criado com sucesso",
  "routing": {
    "destino": "whatsapp_humano",
    "urgencia": "imediata"
  }
}
```

**Se funcionou:** ✅ Webhook funcionando!

---

## 📊 TESTE 5: Ver Lead no Dashboard (1 minuto)

1. Faça login no frontend
2. Vá para a página de **Leads** (ou Dashboard)
3. Procure pelo lead "João Silva" que você criou

**✅ Deve aparecer:**
- Nome: João Silva
- Telefone: +5511999999999 (normalizado)
- Email: joao@example.com
- Status: novo

**Se funcionou:** ✅ Dashboard funcionando!

---

## 🤖 TESTE 6: Agente IA - Intake (1 minuto)

```bash
curl -X POST https://sdradvogados.up.railway.app/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-lead-123",
    "mensagem": "Preciso de ajuda com processo trabalhista urgente",
    "canal": "whatsapp",
    "clienteId": "escritorio-teste-123"
  }'
```

**✅ Deve retornar:**
```json
{
  "lead_id": "test-lead-123",
  "canal": "whatsapp",
  "clienteId": "escritorio-teste-123",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    ...
  }
}
```

**Se funcionou:** ✅ Agente IA funcionando!

---

## 🔐 TESTE 7: Endpoints Protegidos (1 minuto)

### **Passo 1: Fazer Login e Pegar Token**

```bash
# Fazer login
TOKEN=$(curl -s -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### **Passo 2: Listar Tenants (com token)**

```bash
curl -X GET https://sdradvogados.up.railway.app/tenants \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Deve retornar:**
```json
[
  {
    "id": "uuid-do-seu-tenant",
    "name": "Escritório Teste",
    "plan": "free",
    ...
  }
]
```

### **Passo 3: Tentar Sem Token (deve falhar)**

```bash
curl -X GET https://sdradvogados.up.railway.app/tenants
```

**✅ Deve retornar:**
```json
{
  "error": "Não autenticado",
  "message": "Token de autenticação não fornecido"
}
```

**Se funcionou:** ✅ Autenticação JWT funcionando!

---

## ✅ Checklist Rápido

Marque conforme for testando:

- [ ] ✅ Health Check funciona
- [ ] ✅ Criar conta funciona
- [ ] ✅ Login funciona
- [ ] ✅ Criar lead via API funciona
- [ ] ✅ Lead aparece no dashboard
- [ ] ✅ Agente IA funciona
- [ ] ✅ Endpoints protegidos funcionam

---

## 🎉 Se Todos os Testes Passaram:

**Sua plataforma está 100% funcional e pronta para uso!** 🚀

---

## 🐛 Se Algo Não Funcionar:

### **Erro 404 no Frontend:**
- Aguarde mais 1-2 minutos (Vercel pode estar fazendo deploy)
- Ou faça redeploy manual no Vercel

### **Erro 500 no Backend:**
- Verifique logs no Railway
- Confirme que DATABASE_URL está configurada

### **Login não funciona:**
- Verifique se o email/senha estão corretos
- Veja o console do navegador (F12) para erros

---

**Boa sorte com os testes!** 🎯
