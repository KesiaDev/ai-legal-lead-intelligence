# 🧪 Guia de Teste - Cliente Kesia (kesiawnandi@gmail.com)

## 🎯 Objetivo

Testar todas as funcionalidades da plataforma usando a cliente **kesiawnandi@gmail.com** que já está cadastrada.

---

## 📋 Passo 1: Verificar Dados da Cliente

### **1.1. Verificar se Existe no Banco**

No Railway → Banco de Dados → Query, execute:

```sql
-- Buscar usuário
SELECT * FROM "User" WHERE email = 'kesiawnandi@gmail.com';

-- Buscar tenant
SELECT t.* FROM "Tenant" t
JOIN "User" u ON u."tenantId" = t.id
WHERE u.email = 'kesiawnandi@gmail.com';

-- Buscar leads dessa cliente
SELECT l.* FROM "Lead" l
JOIN "User" u ON u."tenantId" = l."tenantId"
WHERE u.email = 'kesiawnandi@gmail.com';
```

### **1.2. Verificar Telefone**

Se o telefone não estiver cadastrado, você pode:
- Adicionar manualmente no banco
- Ou criar um lead de teste com o telefone

---

## 📋 Passo 2: Testar Mensagens via WhatsApp

### **2.1. Configurar Evolution API (Se Ainda Não Estiver)**

1. Acesse **Configurações** → **Integrações** → **Evolution API**
2. Preencha:
   - URL da Evolution API
   - API Key
   - Nome da Instância
3. Salve

### **2.2. Enviar Mensagem de Teste**

**Opção A: Via Interface (Se Tiver)**
- Criar lead com telefone da Kesia
- Enviar mensagem via chat

**Opção B: Via API Diretamente**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/whatsapp/send \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste do agente IA."
  }'
```

**Opção C: Via Evolution API Diretamente**
- Envie uma mensagem do WhatsApp da Kesia para o número conectado
- O agente deve responder automaticamente

---

## 📋 Passo 3: Testar Prompts

### **3.1. Verificar Prompts Configurados**

1. Acesse **Agente** → **Prompts**
2. Verifique se há prompts salvos
3. Se não houver, crie um prompt de teste

### **3.2. Editar Prompt**

1. Clique em um prompt (ex: "Orquestrador")
2. Edite o conteúdo
3. Salve
4. Verifique se foi salvo no banco:
```sql
SELECT * FROM "AgentPrompt" WHERE "tenantId" = 'ID_DO_TENANT_DA_KESIA';
```

### **3.3. Testar Prompt em Ação**

1. Envie mensagem via WhatsApp
2. O agente deve usar o prompt configurado
3. Verifique logs do backend para confirmar

---

## 📋 Passo 4: Testar Follow-ups

### **4.1. Configurar Follow-up**

1. Acesse **Agente** → **Follow-up**
2. Configure:
   - Intervalos (primeiro, segundo, final)
   - Mensagens de follow-up
   - Horários comerciais
3. Salve

### **4.2. Criar Lead para Teste**

1. Crie um lead com status "novo"
2. O sistema deve agendar follow-ups automaticamente
3. Verifique se follow-ups são enviados nos intervalos configurados

---

## 📋 Passo 5: Testar ElevenLabs (Opcional)

### **⚠️ IMPORTANTE: ElevenLabs NÃO é Obrigatório!**

**Você pode testar TUDO sem contratar ElevenLabs:**
- ✅ Mensagens de texto funcionam perfeitamente
- ✅ Prompts funcionam
- ✅ Follow-ups funcionam
- ✅ Agente IA funciona
- ✅ Tudo funciona sem voz!

**ElevenLabs é apenas para:**
- Adicionar respostas em áudio (opcional)
- Humanizar ainda mais o atendimento (opcional)

### **5.1. Se Quiser Testar Voz (Depois de Contratar)**

1. Acesse: https://elevenlabs.io
2. Crie conta e gere API Key
3. Acesse **Agente** → **Voz**
4. Configure:
   - API Key do ElevenLabs
   - Voz selecionada
   - Probabilidades
5. Ative voz
6. Salve

### **5.2. Testar Geração de Áudio**

1. Na tela de configuração de voz
2. Clique em **"Testar Voz"**
3. Digite um texto
4. Verifique se áudio é gerado

---

## 📋 Passo 6: Teste Completo End-to-End

### **Cenário de Teste:**

1. **Kesia envia mensagem via WhatsApp:**
   - "Olá, preciso de ajuda jurídica"
   
2. **Agente responde:**
   - Usa prompt configurado
   - Coleta informações
   - Qualifica lead

3. **Sistema cria/atualiza lead:**
   - Lead aparece na plataforma
   - Dados são salvos

4. **Follow-ups são agendados:**
   - Sistema agenda follow-ups automáticos
   - Mensagens são enviadas nos intervalos

5. **Tudo funciona sem ElevenLabs:**
   - Respostas em texto
   - Agente inteligente
   - Follow-ups automáticos

---

## 🔍 Verificações

### **1. Verificar Lead Criado**
```sql
SELECT * FROM "Lead" 
WHERE phone = 'TELEFONE_DA_KESIA'
ORDER BY "createdAt" DESC
LIMIT 1;
```

### **2. Verificar Mensagens**
```sql
SELECT m.*, c."channel" 
FROM "Message" m
JOIN "Conversation" c ON c.id = m."conversationId"
JOIN "Lead" l ON l.id = c."leadId"
WHERE l.phone = 'TELEFONE_DA_KESIA'
ORDER BY m."createdAt" DESC;
```

### **3. Verificar Prompts Usados**
- Verifique logs do backend
- Procure por: "Prompt encontrado no banco" ou "Usando prompt padrão"

---

## ✅ Checklist de Testes

- [ ] Cliente existe no banco
- [ ] Telefone está cadastrado
- [ ] Evolution API configurada
- [ ] Mensagem enviada via WhatsApp
- [ ] Agente respondeu
- [ ] Lead foi criado/atualizado
- [ ] Prompt foi usado (verificar logs)
- [ ] Follow-ups configurados
- [ ] Sistema funciona sem ElevenLabs ✅

---

## 🎯 Resposta Direta

> "elevenlabs precisa contratar o serviços né não contratei ainda"

**Resposta:**

**NÃO precisa contratar ElevenLabs para testar!**

✅ **Funciona sem ElevenLabs:**
- Mensagens de texto
- Prompts
- Follow-ups
- Agente IA
- Tudo funciona perfeitamente!

⚠️ **ElevenLabs é apenas para:**
- Adicionar respostas em áudio (opcional)
- Você pode contratar depois se quiser

**Pode testar tudo agora mesmo sem contratar ElevenLabs!** 🚀

---

## 🚀 Próximos Passos

1. Verificar dados da cliente no banco
2. Testar envio de mensagem
3. Verificar se agente responde
4. Testar prompts
5. Configurar follow-ups
6. Tudo funciona sem ElevenLabs! ✅
