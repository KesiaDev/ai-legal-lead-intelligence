# 🚀 Como Integrar Seu Escritório em 10 Minutos

Guia rápido para integrar seu escritório jurídico com o SDR Advogados usando N8N.

---

## 📋 Pré-requisitos

- N8N instalado (self-hosted ou cloud) - [Baixar N8N](https://n8n.io/)
- URL da API: `https://sdradvogados.up.railway.app`
- WhatsApp Business configurado (opcional, para automação completa)

---

## ⚡ Passo 1: Configurar Webhook no N8N (2 minutos)

### 1.1 Criar Novo Workflow

1. Acesse seu N8N (local ou cloud)
2. Clique em **"Add workflow"**
3. Nomeie: `SDR Advogados - Captura de Leads`

### 1.2 Adicionar Trigger (Webhook)

1. Clique em **"Add node"**
2. Busque por **"Webhook"** → Selecione **"Webhook"**
3. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `/leads` (ou qualquer path de sua escolha)
   - **Response Mode**: `Response Node`
4. Clique em **"Execute Node"** para ativar
5. Copie a **URL do webhook** gerada (ex: `https://seu-n8n.com/webhook/leads`)

---

## ⚡ Passo 2: Configurar Filtro por Cliente (3 minutos)

### 2.1 Adicionar Filtro

1. Após o webhook, adicione node **"IF"** (Conditional)
2. Configure o filtro para verificar `clienteId`:

```
{{ $json.body.clienteId }} = "seu-escritorio-id"
```

**Exemplo de condição no N8N:**
- **Condition**: `{{ $json.body.clienteId }}` equals `"escritorio-123"`
- **True Output**: Continua o fluxo
- **False Output**: Para o fluxo (ou envia para outro node)

### 2.2 Obter seu ClienteID

O `clienteId` é o ID único do seu escritório. Você pode:

**Opção A - Usar ID existente:**
- Se já tem um tenant criado, use o ID do tenant

**Opção B - Criar novo:**
- Envie um POST para `/leads` com `clienteId` personalizado
- O sistema criará automaticamente um tenant para você
- Use esse ID nos próximos webhooks

**Exemplo de request:**
```json
POST https://sdradvogados.up.railway.app/leads
Content-Type: application/json

{
  "nome": "Teste",
  "telefone": "11999999999",
  "email": "teste@example.com",
  "origem": "site",
  "clienteId": "meu-escritorio-123"
}
```

A resposta incluirá o `clienteId`:
```json
{
  "success": true,
  "leadId": "uuid",
  "clienteId": "meu-escritorio-123",
  "routing": {
    "destino": "whatsapp_humano",
    "urgencia": "imediata"
  }
}
```

### 2.3 Chamar API do SDR Advogados

Após filtrar por `clienteId`, você precisa enviar os dados para a API:

1. Adicione node **"HTTP Request"**
2. Configure:
   - **Method**: `POST`
   - **URL**: `https://sdradvogados.up.railway.app/leads`
   - **Authentication**: None (ou adicione se necessário)
   - **Body Content Type**: `JSON`
   - **Body**:
   ```json
   {
     "nome": "{{ $json.body.nome }}",
     "telefone": "{{ $json.body.telefone }}",
     "email": "{{ $json.body.email }}",
     "origem": "{{ $json.body.origem }}",
     "clienteId": "{{ $json.body.clienteId }}"
   }
   ```

3. A resposta da API conterá o `routing` que você usará no próximo passo

---

## ⚡ Passo 3: Configurar Ações Baseadas no Roteamento (3 minutos)

### 3.1 Adicionar Switch (Router)

1. Após o HTTP Request que chama a API, adicione node **"Switch"**
2. Configure 3 rotas baseadas em `routing.destino` da **resposta da API**:

#### Rota 1: `routing.destino = "whatsapp_humano"`
- **Rule**: `{{ $json.routing.destino }}` equals `"whatsapp_humano"`
- **Ação**: Enviar para WhatsApp (veja Passo 4)

#### Rota 2: `routing.destino = "sdr_ia"`
- **Rule**: `{{ $json.routing.destino }}` equals `"sdr_ia"`
- **Ação**: Enviar para CRM ou sistema de nutrição

#### Rota 3: `routing.destino = "nutricao"`
- **Rule**: `{{ $json.routing.destino }}` equals `"nutricao"`
- **Ação**: Adicionar à sequência de emails/mensagens

**Importante:** Use `{{ $json.routing.destino }}` (sem `.body`) porque a resposta da API já está no formato JSON direto.

### 3.2 Filtrar por Urgência (Opcional)

Dentro de cada rota, você pode filtrar por `routing.urgencia` usando expressão:

- `{{ $json.routing.urgencia }}` equals `"imediata"` → Ação imediata (notificação, WhatsApp)
- `{{ $json.routing.urgencia }}` equals `"alta"` → Ação em até 1 hora
- `{{ $json.routing.urgencia }}` equals `"normal"` → Ação em até 24 horas

---

## ⚡ Passo 4: Integrar WhatsApp (2 minutos)

### 4.1 Usar HTTP Request para API WhatsApp

1. Na rota `whatsapp_humano`, adicione node **"HTTP Request"**
2. Configure:
   - **Method**: `POST`
   - **URL**: Sua API WhatsApp (Evolution API, Twilio, etc.)
   - **Body**:
   ```json
   {
     "to": "{{ $('HTTP Request').json.body.telefone }}",
     "message": "Olá {{ $('HTTP Request').json.body.nome }}! 👋\n\nRecebemos seu contato sobre {{ $('HTTP Request').json.body.origem }}.\n\nNossa equipe entrará em contato em breve!\n\nEquipe Jurídica",
     "clienteId": "{{ $('HTTP Request').json.body.clienteId }}"
   }
   ```

   **Nota:** Use `$('HTTP Request')` para acessar dados do node anterior, ou `{{ $json.leadId }}` para acessar dados da resposta da API.

### 4.2 Usar N8N WhatsApp Node (se disponível)

Se você tem o node do WhatsApp instalado no N8N:

1. Adicione node **"WhatsApp"** (ou similar)
2. Configure:
   - **To**: `{{ $('HTTP Request').json.body.telefone }}`
   - **Message**: Template personalizado usando expressões N8N

---

## 📊 Estrutura Completa do Workflow N8N

```
1. Webhook (recebe dados do formulário/site)
   ↓
2. IF (clienteId = "seu-escritorio-id")
   ↓
3. HTTP Request (POST para API SDR Advogados /leads)
   ↓
4. Switch (routing.destino da resposta)
   ├─ Rota 1: routing.destino = "whatsapp_humano"
   │  └─ HTTP Request (WhatsApp API)
   │
   ├─ Rota 2: routing.destino = "sdr_ia"
   │  └─ HTTP Request (CRM / Sistema de nutrição)
   │
   └─ Rota 3: routing.destino = "nutricao"
      └─ HTTP Request (Email Marketing / Sequência)
```

**Nota importante:** O N8N recebe os dados do seu formulário/site via webhook, processa e envia para a API do SDR Advogados. A resposta da API contém o `routing` que determina o próximo passo.

---

## 🎯 Campos Disponíveis no Webhook

### Campos de Entrada (você envia):
- `nome` (obrigatório)
- `telefone` (obrigatório)
- `email` (opcional)
- `origem` (opcional: "site", "whatsapp", "make", "indicacao")
- `clienteId` (opcional: ID do seu escritório)

### Campos de Resposta (você recebe):
- `success` (boolean)
- `leadId` (string - UUID)
- `clienteId` (string - ID do tenant)
- `message` (string)
- `classification` (objeto - opcional):
  - `score` (number)
  - `classificacao` ("lead_quente" | "lead_morno" | "lead_frio")
  - `prioridade` ("alta" | "media" | "baixa")
  - `proximaAcao` (string)
  - `motivo` (string)
- `routing` (objeto - sempre presente):
  - `destino` ("whatsapp_humano" | "sdr_ia" | "nutricao")
  - `urgencia` ("imediata" | "alta" | "normal")

---

## 🔧 Exemplo Completo de Request

```json
POST https://sdradvogados.up.railway.app/leads
Content-Type: application/json

{
  "nome": "João Silva",
  "telefone": "(11) 99999-9999",
  "email": "joao@example.com",
  "origem": "site",
  "clienteId": "escritorio-abc-123"
}
```

### Resposta Esperada:

```json
{
  "success": true,
  "leadId": "550e8400-e29b-41d4-a716-446655440000",
  "clienteId": "escritorio-abc-123",
  "message": "Lead criado com sucesso",
  "classification": {
    "score": 70,
    "classificacao": "lead_quente",
    "prioridade": "alta",
    "proximaAcao": "chamar_whatsapp",
    "motivo": "Classificação automática (fallback)"
  },
  "routing": {
    "destino": "whatsapp_humano",
    "urgencia": "imediata"
  }
}
```

---

## ✅ Checklist de Integração

- [ ] Webhook configurado no N8N
- [ ] Filtro por `clienteId` configurado (node IF)
- [ ] HTTP Request configurado para chamar API `/leads`
- [ ] Switch configurado com 3 rotas
- [ ] WhatsApp integrado (se aplicável)
- [ ] Testado com lead de exemplo
- [ ] Notificações configuradas (opcional)

---

## 🆘 Troubleshooting

### Problema: Webhook não recebe dados
- Verifique se a URL está correta
- Confirme que o N8N está rodando e o workflow está ativo
- Teste com Postman/Insomnia diretamente na API

### Problema: Filtro não funciona
- Verifique se `clienteId` está sendo enviado
- Confirme que o valor é exatamente igual (case-sensitive)

### Problema: Routing não aparece
- O campo `routing` sempre deve estar presente
- Se não aparecer, verifique os logs do backend

### Problema: Telefone inválido
- O sistema normaliza automaticamente
- Formato esperado: `+5511999999999`
- Aceita: `(11) 99999-9999`, `11 99999-9999`, etc.

---

## 📞 Suporte

- **Documentação API**: Veja `README.md`
- **Logs**: Acesse Railway dashboard
- **Issues**: Abra issue no GitHub

---

## 🎉 Pronto!

Seu escritório está integrado e pronto para receber leads automaticamente!

**Tempo total**: ~10 minutos ⏱️

---

**Última atualização**: Janeiro 2025
