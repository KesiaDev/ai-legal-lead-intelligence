# 🧪 Teste Completo - Cliente Kesia (kesiawnandi@gmail.com)

## ✅ Resposta Rápida

> "elevenlabs precisa contratar o serviços né não contratei ainda"

**NÃO precisa contratar ElevenLabs para testar!**

✅ **Funciona sem ElevenLabs:**
- Mensagens de texto ✅
- Prompts ✅
- Follow-ups ✅
- Agente IA ✅
- Tudo funciona perfeitamente!

⚠️ **ElevenLabs é apenas para:**
- Adicionar respostas em áudio (opcional)
- Você pode contratar depois se quiser

**Pode testar tudo agora mesmo sem contratar ElevenLabs!** 🚀

---

## 📋 Passo 1: Verificar Dados da Cliente

### **1.1. Verificar no Banco de Dados**

No Railway → Banco de Dados → Query, execute:

```sql
-- Buscar usuário e tenant
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u."tenantId",
  t.name as tenant_name
FROM "User" u
JOIN "Tenant" t ON t.id = u."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com';

-- Buscar leads dessa cliente
SELECT 
  l.id,
  l.name,
  l.phone,
  l.email,
  l.status,
  l."createdAt"
FROM "Lead" l
JOIN "User" u ON u."tenantId" = l."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com'
ORDER BY l."createdAt" DESC;
```

### **1.2. Se Não Tiver Telefone Cadastrado**

Crie um lead de teste com telefone:

```sql
-- Primeiro, pegue o tenantId da query acima
-- Depois execute (substitua TENANT_ID e TELEFONE):

INSERT INTO "Lead" (
  id, 
  "tenantId", 
  name, 
  phone, 
  email, 
  status, 
  "createdAt", 
  "updatedAt"
)
VALUES (
  gen_random_uuid(),
  'TENANT_ID_AQUI', -- Cole o tenantId da query acima
  'Kesia Teste',
  '5511999999999', -- TELEFONE DA KESIA (formato: 55 + DDD + número)
  'kesiawnandi@gmail.com',
  'novo',
  NOW(),
  NOW()
);
```

---

## 📋 Passo 2: Configurar Evolution API

### **2.1. Verificar Configuração**

1. Acesse **Configurações** → **Integrações** → **Evolution API**
2. Verifique se está configurado:
   - URL da Evolution API
   - API Key
   - Nome da Instância (ex: "SDR Advogados2")

### **2.2. Se Não Estiver Configurado**

Configure no Railway → Backend → Variables:
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE`

---

## 📋 Passo 3: Testar Mensagens

### **Opção A: Enviar Mensagem Real via WhatsApp**

1. **Kesia envia mensagem** do WhatsApp dela para o número conectado
2. **Sistema recebe** via webhook
3. **Agente responde** automaticamente
4. **Lead é criado/atualizado** na plataforma

### **Opção B: Simular Webhook (Teste Rápido)**

```bash
curl -X POST https://api.sdrjuridico.com.br/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "x-cliente-id: TENANT_ID_AQUI" \
  -d '{
    "event": "messages.upsert",
    "instance": "SDR Advogados2",
    "data": {
      "key": {
        "remoteJid": "5511999999999@s.whatsapp.net",
        "fromMe": false
      },
      "message": {
        "conversation": "Olá, preciso de ajuda jurídica"
      },
      "messageTimestamp": '$(date +%s)',
      "pushName": "Kesia"
    }
  }'
```

**Substitua:**
- `TENANT_ID_AQUI` pelo tenantId da Kesia
- `5511999999999` pelo telefone da Kesia (formato: 55 + DDD + número)

---

## 📋 Passo 4: Testar Prompts

### **4.1. Verificar Prompts Configurados**

1. Acesse **Agente** → **Prompts** na plataforma
2. Verifique se há prompts salvos
3. Se não houver, crie um prompt de teste

### **4.2. Verificar no Banco**

```sql
-- Ver prompts da cliente
SELECT 
  ap.id,
  ap.name,
  ap.type,
  ap.status,
  ap.model,
  LEFT(ap.content, 100) as content_preview
FROM "AgentPrompt" ap
JOIN "User" u ON u."tenantId" = ap."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com';
```

### **4.3. Testar Prompt em Ação**

1. Envie mensagem via WhatsApp (Passo 3)
2. Agente deve usar o prompt configurado
3. Verifique logs do backend para confirmar:
   - Railway → Backend → Logs
   - Procure por: "Prompt encontrado" ou "Usando prompt padrão"

---

## 📋 Passo 5: Testar Follow-ups

### **5.1. Configurar Follow-up**

1. Acesse **Agente** → **Follow-up** (se tiver interface)
2. Configure intervalos e mensagens
3. Salve

### **5.2. Criar Lead para Teste**

1. Crie um lead com status "novo"
2. Sistema deve agendar follow-ups automaticamente
3. Verifique se follow-ups são enviados nos intervalos

---

## 📋 Passo 6: Verificar Respostas

### **6.1. Verificar Mensagens no Banco**

```sql
-- Ver mensagens da conversa
SELECT 
  m.id,
  m.content,
  m."senderType",
  m."createdAt",
  c."channel",
  l.name as lead_name,
  l.phone
FROM "Message" m
JOIN "Conversation" c ON c.id = m."conversationId"
JOIN "Lead" l ON l.id = c."leadId"
JOIN "User" u ON u."tenantId" = l."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com'
ORDER BY m."createdAt" DESC
LIMIT 20;
```

### **6.2. Verificar Lead Criado/Atualizado**

```sql
-- Ver lead atualizado
SELECT 
  l.*,
  COUNT(m.id) as total_messages
FROM "Lead" l
LEFT JOIN "Conversation" c ON c."leadId" = l.id
LEFT JOIN "Message" m ON m."conversationId" = c.id
JOIN "User" u ON u."tenantId" = l."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com'
GROUP BY l.id
ORDER BY l."updatedAt" DESC
LIMIT 1;
```

---

## 📋 Passo 7: Testar ElevenLabs (Opcional - Depois)

### **⚠️ IMPORTANTE: Não Precisa Contratar Agora!**

**Tudo funciona sem ElevenLabs:**
- ✅ Mensagens de texto
- ✅ Prompts
- ✅ Follow-ups
- ✅ Agente IA
- ✅ Tudo funciona!

**ElevenLabs é apenas para adicionar voz (opcional).**

### **Se Quiser Testar Voz Depois:**

1. Acesse: https://elevenlabs.io
2. Crie conta e gere API Key
3. Acesse **Agente** → **Voz** na plataforma
4. Configure:
   - API Key do ElevenLabs
   - Voz selecionada
   - Probabilidades
5. Ative voz
6. Salve

---

## ✅ Checklist de Testes

- [ ] Cliente existe no banco
- [ ] Telefone está cadastrado (ou criar lead de teste)
- [ ] Evolution API configurada
- [ ] Mensagem enviada via WhatsApp
- [ ] Agente respondeu
- [ ] Lead foi criado/atualizado
- [ ] Prompt foi usado (verificar logs)
- [ ] Mensagens aparecem no banco
- [ ] Sistema funciona sem ElevenLabs ✅

---

## 🎯 Resumo

**Para testar com a cliente Kesia:**

1. ✅ Verificar se ela existe no banco
2. ✅ Verificar/criar lead com telefone
3. ✅ Configurar Evolution API (se não estiver)
4. ✅ Enviar mensagem via WhatsApp
5. ✅ Verificar se agente responde
6. ✅ Verificar prompts funcionando
7. ✅ Tudo funciona sem ElevenLabs! ✅

**ElevenLabs é opcional** - pode contratar depois se quiser voz! 🎤

---

## 🚀 Próximos Passos

1. Execute as queries SQL para verificar dados
2. Configure Evolution API (se necessário)
3. Envie mensagem de teste
4. Verifique respostas
5. Tudo funciona! ✅
