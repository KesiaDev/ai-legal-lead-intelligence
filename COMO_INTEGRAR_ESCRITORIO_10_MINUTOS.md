# 🚀 Como Integrar Seu Escritório em 10 Minutos

Guia rápido para integrar seu escritório jurídico com o SDR Advogados usando Make (Integromat).

---

## 📋 Pré-requisitos

- Conta no Make (Integromat) - [Criar conta gratuita](https://www.make.com/)
- URL da API: `https://sdradvogados.up.railway.app`
- WhatsApp Business configurado (opcional, para automação completa)

---

## ⚡ Passo 1: Configurar Webhook no Make (2 minutos)

### 1.1 Criar Novo Cenário

1. Acesse [Make.com](https://www.make.com/)
2. Clique em **"Create a new scenario"**
3. Nomeie: `SDR Advogados - Captura de Leads`

### 1.2 Adicionar Trigger (Webhook)

1. Clique em **"Add a module"**
2. Busque por **"Webhooks"** → Selecione **"Custom webhook"**
3. Clique em **"Add"**
4. Copie a **URL do webhook** gerada (ex: `https://hook.make.com/xxxxx`)

---

## ⚡ Passo 2: Configurar Filtro por Cliente (3 minutos)

### 2.1 Adicionar Filtro

1. Após o webhook, adicione módulo **"Set variable"** ou **"Filter"**
2. Configure o filtro para verificar `clienteId`:

```
clienteId = "seu-escritorio-id"
```

**Exemplo de filtro:**
- **Condition**: `clienteId` equals `"escritorio-123"`
- **Action**: Continue only if condition is met

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

---

## ⚡ Passo 3: Configurar Ações Baseadas no Roteamento (3 minutos)

### 3.1 Adicionar Router (Switch)

1. Adicione módulo **"Router"** ou **"Switch"**
2. Configure 3 rotas baseadas em `routing.destino`:

#### Rota 1: `routing.destino = "whatsapp_humano"`
- **Condição**: `routing.destino` equals `"whatsapp_humano"`
- **Ação**: Enviar para WhatsApp (veja Passo 4)

#### Rota 2: `routing.destino = "sdr_ia"`
- **Condição**: `routing.destino` equals `"sdr_ia"`
- **Ação**: Enviar para CRM ou sistema de nutrição

#### Rota 3: `routing.destino = "nutricao"`
- **Condição**: `routing.destino` equals `"nutricao"`
- **Ação**: Adicionar à sequência de emails/mensagens

### 3.2 Filtrar por Urgência (Opcional)

Dentro de cada rota, você pode filtrar por `routing.urgencia`:

- `"imediata"` → Ação imediata (notificação, WhatsApp)
- `"alta"` → Ação em até 1 hora
- `"normal"` → Ação em até 24 horas

---

## ⚡ Passo 4: Integrar WhatsApp (2 minutos)

### 4.1 Usar Conector WhatsApp do Make

1. Na rota `whatsapp_humano`, adicione módulo **"WhatsApp"**
2. Configure:
   - **To**: `{{telefone}}` (já normalizado pelo sistema)
   - **Message**: Template personalizado

**Exemplo de mensagem:**
```
Olá {{nome}}! 👋

Recebemos seu contato sobre {{origem}}.

Nossa equipe entrará em contato em breve!

Equipe Jurídica
```

### 4.2 Usar API Externa (Evolution API, Twilio, etc.)

Se preferir usar API externa:

1. Adicione módulo **"HTTP"** → **"Make a request"**
2. Configure:
   - **URL**: Sua API WhatsApp
   - **Method**: `POST`
   - **Body**:
   ```json
   {
     "to": "{{telefone}}",
     "message": "Olá {{nome}}! Recebemos seu contato.",
     "clienteId": "{{clienteId}}"
   }
   ```

---

## 📊 Estrutura Completa do Cenário Make

```
1. Webhook (Custom webhook)
   ↓
2. Filter (clienteId = "seu-escritorio-id")
   ↓
3. Router (Switch)
   ├─ Rota 1: routing.destino = "whatsapp_humano"
   │  └─ WhatsApp / HTTP Request
   │
   ├─ Rota 2: routing.destino = "sdr_ia"
   │  └─ CRM / Sistema de nutrição
   │
   └─ Rota 3: routing.destino = "nutricao"
      └─ Email Marketing / Sequência
```

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

- [ ] Webhook configurado no Make
- [ ] Filtro por `clienteId` configurado
- [ ] Router configurado com 3 rotas
- [ ] WhatsApp integrado (se aplicável)
- [ ] Testado com lead de exemplo
- [ ] Notificações configuradas (opcional)

---

## 🆘 Troubleshooting

### Problema: Webhook não recebe dados
- Verifique se a URL está correta
- Confirme que o Make está ativo
- Teste com Postman/Insomnia

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
