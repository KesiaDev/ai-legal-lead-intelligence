# 🧪 Guia de Testes - Plataforma SDR Advogados

## 📋 Checklist de Testes

Use este guia para testar todas as funcionalidades da plataforma antes da publicação oficial.

---

## 🔧 Pré-requisitos

### **1. URLs da Plataforma**
- **Backend API:** `https://sdradvogados.up.railway.app`
- **Frontend:** `https://legal-lead-scout.vercel.app` (ou sua URL do Vercel)

### **2. Ferramentas Necessárias**
- Navegador web (Chrome, Firefox, Edge)
- Postman ou Insomnia (para testar APIs)
- Ou terminal com `curl` (opcional)

---

## ✅ TESTE 1: Health Check (Backend)

**Objetivo:** Verificar se o backend está online

### **Via Navegador:**
```
https://sdradvogados.up.railway.app/health
```

### **Via curl:**
```bash
curl https://sdradvogados.up.railway.app/health
```

### **Resultado Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-16T..."
}
```

**✅ Passou se:** Retorna status 200 e JSON com `status: "ok"`

---

## ✅ TESTE 2: Registro de Novo Usuário

**Objetivo:** Criar uma nova conta e escritório

### **Via Frontend:**
1. Acesse: `https://legal-lead-scout.vercel.app/login`
2. Clique na aba **"Criar Conta"**
3. Preencha:
   - Nome: `Teste Usuário`
   - Email: `teste@example.com` (use um email único)
   - Nome do Escritório: `Escritório Teste`
   - Senha: `123456` (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**

### **Resultado Esperado:**
- ✅ Toast de sucesso: "Conta criada com sucesso!"
- ✅ Redirecionamento para dashboard
- ✅ Nome do usuário aparece no header

### **Via API (Postman/curl):**
```bash
curl -X POST https://sdradvogados.up.railway.app/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuário",
    "email": "teste@example.com",
    "password": "123456",
    "tenantName": "Escritório Teste"
  }'
```

### **Resultado Esperado:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "teste@example.com",
    "name": "Teste Usuário",
    "role": "admin"
  },
  "tenant": {
    "id": "uuid",
    "name": "Escritório Teste"
  }
}
```

**✅ Passou se:** Conta criada, token retornado, redirecionamento funcionou

---

## ✅ TESTE 3: Login

**Objetivo:** Fazer login com credenciais válidas

### **Via Frontend:**
1. Acesse: `https://legal-lead-scout.vercel.app/login`
2. Preencha:
   - Email: `teste@example.com` (o que você criou)
   - Senha: `123456`
3. Clique em **"Entrar"**

### **Resultado Esperado:**
- ✅ Toast de sucesso: "Login realizado com sucesso!"
- ✅ Redirecionamento para dashboard
- ✅ Dados do usuário carregados

### **Via API:**
```bash
curl -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "123456"
  }'
```

**✅ Passou se:** Login funciona, token retornado, dashboard carrega

---

## ✅ TESTE 4: Criar Lead via Webhook

**Objetivo:** Testar o endpoint `/leads` que recebe leads de webhooks

### **Via API (Postman/curl):**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "telefone": "(11) 99999-9999",
    "email": "joao@example.com",
    "origem": "site",
    "clienteId": "escritorio-teste-123"
  }'
```

### **Resultado Esperado:**
```json
{
  "success": true,
  "leadId": "uuid",
  "clienteId": "escritorio-teste-123",
  "message": "Lead criado com sucesso",
  "classification": {
    "score": 70,
    "classificacao": "lead_quente",
    "prioridade": "alta",
    "proximaAcao": "chamar_whatsapp",
    "motivo": "..."
  },
  "routing": {
    "destino": "whatsapp_humano",
    "urgencia": "imediata"
  }
}
```

### **Teste com Telefone em Diferentes Formatos:**
```bash
# Formato 1: Com parênteses e hífen
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria", "telefone": "(11) 99999-9999", "origem": "whatsapp"}'

# Formato 2: Apenas números
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{"nome": "Pedro", "telefone": "11999999999", "origem": "site"}'

# Formato 3: Com espaços
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana", "telefone": "11 99999 9999", "origem": "indicacao"}'
```

**✅ Passou se:** 
- Lead criado com sucesso
- Telefone normalizado para `+5511999999999`
- `routing.destino` e `routing.urgencia` presentes
- `clienteId` retornado

---

## ✅ TESTE 5: Ver Leads no Dashboard

**Objetivo:** Verificar se os leads aparecem na plataforma web

### **Via Frontend:**
1. Faça login na plataforma
2. Vá para a página de **Leads** (ou Dashboard)
3. Verifique se o lead criado aparece na lista

### **Resultado Esperado:**
- ✅ Lead aparece na lista
- ✅ Nome, telefone, email corretos
- ✅ Status correto
- ✅ Área jurídica (se detectada)

**✅ Passou se:** Lead visível no dashboard

---

## ✅ TESTE 6: Multi-Tenancy (Isolamento)

**Objetivo:** Verificar se cada cliente vê apenas seus próprios leads

### **Passo 1: Criar Lead para Cliente A**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Lead Cliente A",
    "telefone": "11988888888",
    "clienteId": "cliente-a-123"
  }'
```

### **Passo 2: Criar Lead para Cliente B**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Lead Cliente B",
    "telefone": "11977777777",
    "clienteId": "cliente-b-456"
  }'
```

### **Passo 3: Verificar Isolamento**
- Faça login como Cliente A
- Verifique que só vê leads do Cliente A
- Faça login como Cliente B
- Verifique que só vê leads do Cliente B

**✅ Passou se:** Cada cliente vê apenas seus próprios leads

---

## ✅ TESTE 7: Agente IA - Intake

**Objetivo:** Testar análise de mensagem do lead

### **Via API:**
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

### **Resultado Esperado:**
```json
{
  "lead_id": "test-lead-123",
  "canal": "whatsapp",
  "clienteId": "escritorio-teste-123",
  "analise": {
    "area": "Direito Trabalhista",
    "urgencia": "alta",
    "score": 85,
    "acao": "agendar_consulta",
    "etapa_funil": "qualificado",
    "prioridade": "alta"
  },
  "timestamp": "2025-01-16T..."
}
```

**✅ Passou se:** Análise retornada com área, urgência e score

---

## ✅ TESTE 8: Agente IA - Conversação

**Objetivo:** Testar conversa interativa com o agente

### **Passo 1: Iniciar Conversa**
```bash
curl -X GET "https://sdradvogados.up.railway.app/api/agent/conversation/test-lead-123?clienteId=escritorio-teste-123"
```

### **Resultado Esperado:**
```json
{
  "lead_id": "test-lead-123",
  "clienteId": "escritorio-teste-123",
  "state": "lgpd_consent",
  "message": "Olá! Sou o Super SDR Advogados...",
  "options": ["Sim, concordo", "Não concordo"],
  "conversation_data": { ... }
}
```

### **Passo 2: Enviar Resposta**
```bash
curl -X POST https://sdradvogados.up.railway.app/api/agent/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-lead-123",
    "message": "Sim, concordo",
    "conversation_data": { ... },
    "clienteId": "escritorio-teste-123"
  }'
```

**✅ Passou se:** Agente responde corretamente, estado avança

---

## ✅ TESTE 9: Endpoints de Tenants (Autenticados)

**Objetivo:** Testar gerenciamento de tenants com autenticação

### **Passo 1: Fazer Login e Obter Token**
```bash
TOKEN=$(curl -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"123456"}' \
  | jq -r '.token')
```

### **Passo 2: Listar Tenants (deve retornar apenas o seu)**
```bash
curl -X GET https://sdradvogados.up.railway.app/tenants \
  -H "Authorization: Bearer $TOKEN"
```

### **Resultado Esperado:**
```json
[
  {
    "id": "uuid-do-seu-tenant",
    "name": "Escritório Teste",
    "plan": "free",
    "createdAt": "...",
    "updatedAt": "...",
    "_count": {
      "leads": 1,
      "users": 1
    }
  }
]
```

### **Passo 3: Obter Tenant Específico**
```bash
curl -X GET "https://sdradvogados.up.railway.app/tenants/SEU-TENANT-ID" \
  -H "Authorization: Bearer $TOKEN"
```

### **Passo 4: Tentar Acessar Sem Token (deve falhar)**
```bash
curl -X GET https://sdradvogados.up.railway.app/tenants
```

### **Resultado Esperado:**
```json
{
  "error": "Não autenticado",
  "message": "Token de autenticação não fornecido"
}
```

**✅ Passou se:** 
- Com token: retorna dados do tenant
- Sem token: retorna erro 401
- Só vê seu próprio tenant

---

## ✅ TESTE 10: Classificação e Roteamento

**Objetivo:** Verificar se leads são classificados e roteados corretamente

### **Teste 1: Lead Quente**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Urgente",
    "telefone": "11999999999",
    "email": "urgente@example.com",
    "origem": "whatsapp"
  }'
```

**Verificar:**
- ✅ `classification.classificacao` = `"lead_quente"`
- ✅ `routing.destino` = `"whatsapp_humano"`
- ✅ `routing.urgencia` = `"imediata"`

### **Teste 2: Lead Morno**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cliente Interessado",
    "telefone": "11988888888",
    "origem": "site"
  }'
```

**Verificar:**
- ✅ `routing.destino` = `"sdr_ia"` ou `"nutricao"`
- ✅ `routing.urgencia` presente

**✅ Passou se:** Routing sempre presente e valores corretos

---

## ✅ TESTE 11: Deduplicação de Leads

**Objetivo:** Verificar se leads duplicados são detectados

### **Passo 1: Criar Lead**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Duplicado",
    "telefone": "11999999999",
    "email": "joao@example.com"
  }'
```

### **Passo 2: Tentar Criar Novamente (mesmo telefone)**
```bash
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Duplicado",
    "telefone": "11999999999",
    "email": "joao@example.com"
  }'
```

### **Resultado Esperado:**
```json
{
  "success": true,
  "leadId": "mesmo-uuid-do-primeiro",
  "message": "Lead já existente",
  "routing": { ... }
}
```

**✅ Passou se:** Retorna "Lead já existente" com o mesmo `leadId`

---

## ✅ TESTE 12: Normalização de Dados

**Objetivo:** Verificar se dados são normalizados corretamente

### **Teste de Telefone:**
```bash
# Enviar telefone em formato diferente
curl -X POST https://sdradvogados.up.railway.app/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste Normalização",
    "telefone": "(11) 99999-9999"
  }'
```

**Verificar no banco ou resposta:**
- ✅ Telefone salvo como `+5511999999999`
- ✅ Nome capitalizado corretamente
- ✅ Email em lowercase

**✅ Passou se:** Dados normalizados corretamente

---

## 📊 Checklist Final

Marque cada teste conforme for realizando:

- [ ] Teste 1: Health Check
- [ ] Teste 2: Registro de Usuário
- [ ] Teste 3: Login
- [ ] Teste 4: Criar Lead via Webhook
- [ ] Teste 5: Ver Leads no Dashboard
- [ ] Teste 6: Multi-Tenancy (Isolamento)
- [ ] Teste 7: Agente IA - Intake
- [ ] Teste 8: Agente IA - Conversação
- [ ] Teste 9: Endpoints de Tenants
- [ ] Teste 10: Classificação e Roteamento
- [ ] Teste 11: Deduplicação
- [ ] Teste 12: Normalização

---

## 🐛 Troubleshooting

### **Erro 500 no Backend**
- Verifique logs no Railway
- Confirme que DATABASE_URL está configurada
- Verifique se JWT_SECRET está configurado

### **Erro 404 no Frontend**
- Verifique se `vercel.json` está configurado
- Confirme que rotas estão corretas

### **Leads não aparecem**
- Verifique se está logado com o tenant correto
- Confirme que `clienteId` está sendo usado
- Verifique filtros no frontend

### **Token inválido**
- Faça logout e login novamente
- Verifique se token não expirou
- Confirme JWT_SECRET no backend

---

## 🎉 Pronto para Produção!

Se todos os testes passaram, a plataforma está pronta para publicação oficial! 🚀
