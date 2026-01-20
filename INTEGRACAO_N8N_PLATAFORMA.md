# 🔗 Integração N8N + Plataforma SDR Advogados

Guia completo para integrar o N8N com a plataforma SDR Advogados e atender múltiplos clientes.

---

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE 1 (Escritório A)                 │
│  WhatsApp → N8N Workflow → API SDR → Plataforma → Banco     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE 2 (Escritório B)                 │
│  Site → N8N Workflow → API SDR → Plataforma → Banco        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE 3 (Escritório C)                 │
│  Instagram → N8N Workflow → API SDR → Plataforma → Banco    │
└─────────────────────────────────────────────────────────────┘
```

**Todos os clientes compartilham:**
- ✅ Mesma API (`https://sdradvogados.up.railway.app`)
- ✅ Mesmo banco de dados (com isolamento por `tenantId`)
- ✅ Mesmo agente IA (Super SDR Advogados)
- ✅ Mesma plataforma web

**Cada cliente tem:**
- ✅ Seu próprio `clienteId` (tenantId)
- ✅ Seus próprios leads (isolados no banco)
- ✅ Seus próprios usuários (login na plataforma)
- ✅ Seu próprio workflow N8N (ou compartilhado)

---

## 🎯 Dois Modelos de Integração

### **Modelo 1: Workflow N8N Compartilhado (Recomendado)**

Um único workflow N8N que atende todos os clientes usando `clienteId` para filtrar.

**Vantagens:**
- ✅ Manutenção mais fácil (1 workflow para todos)
- ✅ Atualizações centralizadas
- ✅ Menor custo de infraestrutura

**Como funciona:**
1. N8N recebe mensagem de qualquer fonte (WhatsApp, Site, etc.)
2. N8N identifica o `clienteId` (via webhook, variável, ou configuração)
3. N8N chama API `/leads` com `clienteId`
4. API cria/atualiza lead no tenant correto
5. Plataforma mostra lead apenas para o cliente correto

### **Modelo 2: Workflow N8N Individual por Cliente**

Cada cliente tem seu próprio workflow N8N.

**Vantagens:**
- ✅ Personalização total por cliente
- ✅ Isolamento completo
- ✅ Configurações específicas

**Como funciona:**
1. Cada cliente configura seu próprio N8N
2. Cada workflow tem `clienteId` hardcoded
3. Resto do fluxo é igual ao Modelo 1

---

## 🚀 Configuração Passo a Passo

### **Passo 1: Criar Cliente na Plataforma**

#### Opção A - Via Interface Web (Recomendado)

1. Acesse a plataforma: `https://seu-frontend.vercel.app`
2. Faça login como admin
3. Vá em **Configurações → Clientes**
4. Clique em **"Novo Cliente"**
5. Preencha:
   - Nome do Escritório
   - Email do responsável
   - Plano (free, basic, premium)
6. Anote o **ID do Cliente** gerado (esse é o `clienteId`)

#### Opção B - Via API (Automático)

Quando você envia um lead com `clienteId` que não existe, o sistema cria automaticamente:

```bash
POST https://sdradvogados.up.railway.app/leads
Content-Type: application/json

{
  "nome": "Teste",
  "telefone": "11999999999",
  "email": "teste@example.com",
  "origem": "site",
  "clienteId": "escritorio-abc-123"
}
```

**Resposta:**
```json
{
  "success": true,
  "leadId": "uuid",
  "clienteId": "escritorio-abc-123",
  "message": "Lead criado com sucesso"
}
```

O `clienteId` "escritorio-abc-123" será criado automaticamente como um novo tenant.

---

### **Passo 2: Configurar N8N Workflow**

#### 2.1 Criar Workflow Base

1. Acesse seu N8N
2. Crie novo workflow: `SDR Advogados - Universal`
3. Adicione node **Webhook** (Trigger)
   - **HTTP Method**: `POST`
   - **Path**: `/webhook/leads`
   - **Response Mode**: `Response Node`

#### 2.2 Identificar ClienteId

Você tem 3 opções para identificar o `clienteId`:

**Opção A - Via Webhook Body:**
```
{{ $json.body.clienteId }}
```

**Opção B - Via Variável de Ambiente (N8N):**
Configure variável de ambiente no N8N:
- Nome: `CLIENTE_ID`
- Valor: `escritorio-abc-123`

Use no workflow:
```
{{ $env.CLIENTE_ID }}
```

**Opção C - Via Configuração do Node:**
Adicione node **"Set"** antes de chamar a API:
- Campo: `clienteId`
- Valor: `"escritorio-abc-123"` (fixo para este workflow)

#### 2.3 Chamar API SDR Advogados

Adicione node **HTTP Request**:

**Configuração:**
- **Method**: `POST`
- **URL**: `https://sdradvogados.up.railway.app/leads`
- **Authentication**: None
- **Body Content Type**: `JSON`
- **Body**:
```json
{
  "nome": "{{ $json.body.nome || $json.nome }}",
  "telefone": "{{ $json.body.telefone || $json.telefone }}",
  "email": "{{ $json.body.email || $json.email }}",
  "origem": "{{ $json.body.origem || $json.origem || 'n8n' }}",
  "clienteId": "{{ $json.body.clienteId || $env.CLIENTE_ID || 'seu-cliente-id' }}"
}
```

#### 2.4 Processar Resposta e Roteamento

A API retorna `routing.destino` e `routing.urgencia`. Use um **Switch** node:

**Switch Configuration:**
- **Mode**: Rules
- **Rules**:
  1. `{{ $json.routing.destino }}` equals `"whatsapp_humano"`
  2. `{{ $json.routing.destino }}` equals `"sdr_ia"`
  3. `{{ $json.routing.destino }}` equals `"nutricao"`

**Rota 1 - WhatsApp Humano:**
- Adicione node **HTTP Request** para sua API WhatsApp
- Envie mensagem imediata

**Rota 2 - SDR IA:**
- Adicione node **HTTP Request** para `/api/agent/conversation`
- Inicie conversa com agente IA

**Rota 3 - Nutrição:**
- Adicione lead à sequência de emails/mensagens
- Ou salve em CRM externo

---

### **Passo 3: Integrar com Agente IA (Opcional)**

Se `routing.destino = "sdr_ia"`, você pode iniciar conversa com o agente:

**HTTP Request para Agente IA:**
- **Method**: `POST`
- **URL**: `https://sdradvogados.up.railway.app/api/agent/conversation`
- **Body**:
```json
{
  "lead_id": "{{ $json.leadId }}",
  "message": "{{ $json.body.mensagem || 'Olá, preciso de ajuda' }}",
  "conversation_data": null
}
```

**Resposta:**
```json
{
  "lead_id": "uuid",
  "state": "greeting",
  "message": "Olá! Sou o Super SDR Advogados...",
  "conversation_data": { ... }
}
```

---

## 🔐 Gerenciamento de Clientes

### **Listar Todos os Clientes**

```bash
GET https://sdradvogados.up.railway.app/tenants
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "escritorio-abc-123",
    "name": "Escritório ABC",
    "plan": "premium",
    "createdAt": "2025-01-16T10:00:00Z"
  },
  {
    "id": "escritorio-xyz-456",
    "name": "Escritório XYZ",
    "plan": "basic",
    "createdAt": "2025-01-15T14:30:00Z"
  }
]
```

### **Obter Cliente Específico**

```bash
GET https://sdradvogados.up.railway.app/tenants/{clienteId}
Authorization: Bearer {token}
```

### **Criar Cliente Manualmente**

```bash
POST https://sdradvogados.up.railway.app/tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": "escritorio-novo-789",
  "name": "Escritório Novo",
  "plan": "free"
}
```

---

## 📊 Fluxo Completo: Cliente → N8N → Plataforma

### **Exemplo Real: Cliente recebe mensagem no WhatsApp**

```
1. WhatsApp → N8N Webhook
   {
     "from": "+5511999999999",
     "message": "Preciso de ajuda com processo trabalhista",
     "clienteId": "escritorio-abc-123"
   }

2. N8N → API /leads
   POST /leads
   {
     "nome": "João Silva",
     "telefone": "+5511999999999",
     "origem": "whatsapp",
     "clienteId": "escritorio-abc-123"
   }

3. API → Banco de Dados
   - Cria/atualiza lead no tenant "escritorio-abc-123"
   - Classifica lead (quente/morno/frio)
   - Roteia (whatsapp_humano/sdr_ia/nutricao)

4. API → N8N (Resposta)
   {
     "success": true,
     "leadId": "uuid",
     "clienteId": "escritorio-abc-123",
     "routing": {
       "destino": "whatsapp_humano",
       "urgencia": "imediata"
     }
   }

5. N8N → WhatsApp (Envio de mensagem)
   Envia mensagem automática para o lead

6. Plataforma Web
   - Cliente "escritorio-abc-123" faz login
   - Vê apenas seus próprios leads
   - Pode gerenciar, conversar, agendar
```

---

## 🎛️ Configuração Avançada

### **Múltiplos Workflows N8N (Um por Cliente)**

Se você quer workflows separados:

1. **Workflow 1: Cliente A**
   - Webhook: `/webhook/cliente-a`
   - `clienteId`: `"escritorio-abc-123"` (hardcoded)

2. **Workflow 2: Cliente B**
   - Webhook: `/webhook/cliente-b`
   - `clienteId`: `"escritorio-xyz-456"` (hardcoded)

3. **Workflow 3: Cliente C**
   - Webhook: `/webhook/cliente-c`
   - `clienteId`: `"escritorio-novo-789"` (hardcoded)

Cada workflow é independente e pode ter lógica diferente.

### **Workflow Compartilhado com Filtro Dinâmico**

1. **Webhook único** recebe todas as mensagens
2. **Node IF** identifica `clienteId` do body
3. **Switch** direciona para lógica específica (se necessário)
4. **HTTP Request** chama API com `clienteId` correto

---

## ✅ Checklist de Integração

### **Para Cada Novo Cliente:**

- [ ] Cliente criado na plataforma (ou via API)
- [ ] `clienteId` anotado e documentado
- [ ] Workflow N8N configurado com `clienteId` correto
- [ ] Webhook testado (envio de lead de teste)
- [ ] Verificação na plataforma (lead aparece para o cliente correto)
- [ ] Roteamento testado (whatsapp_humano/sdr_ia/nutricao)
- [ ] Agente IA testado (se aplicável)
- [ ] Documentação atualizada

---

## 🔧 Troubleshooting

### **Problema: Lead não aparece na plataforma**

**Solução:**
1. Verifique se `clienteId` está correto
2. Verifique se o cliente fez login com o tenant correto
3. Verifique logs da API: `https://sdradvogados.up.railway.app/health`

### **Problema: Cliente vê leads de outros clientes**

**Solução:**
1. Verifique se o `tenantId` do usuário está correto
2. Verifique se o `clienteId` está sendo enviado corretamente
3. Verifique se o filtro de tenant está funcionando no frontend

### **Problema: N8N não consegue chamar API**

**Solução:**
1. Verifique URL da API: `https://sdradvogados.up.railway.app`
2. Verifique se o CORS está configurado
3. Teste com Postman/Insomnia primeiro
4. Verifique logs do N8N

---

## 📞 Suporte

- **API Docs**: Veja endpoints em `README.md`
- **Logs**: Acesse Railway dashboard
- **Issues**: Abra issue no GitHub

---

## 🎉 Pronto!

Agora você tem:
- ✅ Plataforma SDR Advogados funcionando
- ✅ N8N integrado e configurado
- ✅ Suporte a múltiplos clientes
- ✅ Isolamento completo de dados por cliente
- ✅ Agente IA funcionando
- ✅ Roteamento inteligente de leads

**Cada novo cliente pode ser adicionado em minutos!** 🚀

---

**Última atualização**: Janeiro 2025
