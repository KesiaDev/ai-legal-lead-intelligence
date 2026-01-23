# ⚡ Teste Rápido - Cliente Kesia

## 🎯 Teste Rápido (5 minutos)

### **1. Verificar Cliente no Banco**

No Railway → Banco → Query:
```sql
SELECT u.email, u.name, t.name as tenant_name, t.id as tenant_id
FROM "User" u
JOIN "Tenant" t ON t.id = u."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com';
```

### **2. Verificar/Criar Lead com Telefone**

```sql
-- Verificar leads existentes
SELECT * FROM "Lead" l
JOIN "User" u ON u."tenantId" = l."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com';

-- Se não tiver, criar lead de teste (substitua TENANT_ID e TELEFONE)
INSERT INTO "Lead" (id, "tenantId", name, phone, email, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'TENANT_ID_AQUI',
  'Kesia Teste',
  '5511999999999', -- TELEFONE DA KESIA
  'kesiawnandi@gmail.com',
  'novo',
  NOW(),
  NOW()
);
```

### **3. Enviar Mensagem de Teste**

**Opção A: Via WhatsApp Real**
- Envie uma mensagem do WhatsApp da Kesia para o número conectado
- O agente deve responder automaticamente

**Opção B: Via API (Simular Webhook)**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
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
      "messageTimestamp": '$(date +%s)'
    }
  }'
```

### **4. Verificar Resposta**

```sql
-- Verificar mensagens
SELECT m.*, c."channel"
FROM "Message" m
JOIN "Conversation" c ON c.id = m."conversationId"
ORDER BY m."createdAt" DESC
LIMIT 10;
```

---

## ✅ Sobre ElevenLabs

**NÃO precisa contratar para testar!**

- ✅ Tudo funciona sem voz (texto)
- ✅ Agente responde normalmente
- ✅ Prompts funcionam
- ✅ Follow-ups funcionam

**ElevenLabs é opcional** - pode contratar depois se quiser voz.

---

## 🎯 Teste Agora

1. Verifique cliente no banco
2. Envie mensagem via WhatsApp
3. Veja agente responder
4. Tudo funciona! ✅
