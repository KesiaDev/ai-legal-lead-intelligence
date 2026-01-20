# 🔧 Ajustes para seu Workflow N8N Existente

## ✅ Seu workflow está perfeito!

Seu workflow N8N atual está **muito bem estruturado** e pode continuar sendo usado. Apenas precisa de alguns ajustes para integrar com a plataforma SDR Advogados.

---

## 🎯 O que precisa ajustar

### **1. Adicionar `clienteId` nas chamadas para a API**

Onde você chama a API do SDR Advogados (nós "agente.ia" ou chamadas HTTP), adicione o campo `clienteId`:

#### **No node "agente.ia" ou HTTP Request para `/api/agent/conversation`:**

**Antes:**
```json
{
  "lead_id": "{{ $json.lead_id }}",
  "message": "{{ $json.message }}",
  "conversation_data": {{ $json.conversation_data }}
}
```

**Depois:**
```json
{
  "lead_id": "{{ $json.lead_id }}",
  "message": "{{ $json.message }}",
  "conversation_data": {{ $json.conversation_data }},
  "clienteId": "{{ $json.clienteId || $env.CLIENTE_ID || 'seu-cliente-id' }}"
}
```

#### **No node que cria/atualiza lead no Supabase:**

Você pode continuar usando Supabase, mas **também** pode chamar nossa API `/leads` para sincronizar:

**Adicione um node HTTP Request após "Criar Lead" no Supabase:**

```json
POST https://sdradvogados.up.railway.app/leads
{
  "nome": "{{ $json.nome }}",
  "telefone": "{{ $json.telefone }}",
  "email": "{{ $json.email }}",
  "origem": "whatsapp",
  "clienteId": "{{ $json.clienteId || $env.CLIENTE_ID }}"
}
```

Isso vai:
- ✅ Criar/atualizar lead na plataforma SDR Advogados
- ✅ Classificar automaticamente (quente/morno/frio)
- ✅ Retornar routing (whatsapp_humano/sdr_ia/nutricao)
- ✅ Permitir que o cliente veja o lead na plataforma web

---

## 🔑 Como identificar o `clienteId`

Você tem 3 opções:

### **Opção 1: Via Variável de Ambiente no N8N (Recomendado)**

1. No N8N, vá em **Settings → Variables**
2. Adicione variável:
   - **Name**: `CLIENTE_ID`
   - **Value**: `"escritorio-abc-123"` (ID do seu cliente)

3. Use no workflow:
   ```
   {{ $env.CLIENTE_ID }}
   ```

**Vantagem:** Um workflow pode atender múltiplos clientes mudando apenas a variável.

### **Opção 2: Via Webhook Body**

Se o webhook que recebe mensagens já envia `clienteId`:

```
{{ $json.body.clienteId }}
```

### **Opção 3: Hardcoded no Workflow**

Se cada workflow é para um cliente específico:

```
"clienteId": "escritorio-abc-123"
```

---

## 📊 Fluxo Ajustado Recomendado

```
1. WhatsApp → N8N Webhook
   ↓
2. Tratamento de Mensagens (seu workflow atual)
   ↓
3. Criar/Atualizar Lead no Supabase (continue usando)
   ↓
4. [NOVO] Sincronizar com API SDR Advogados
   POST /leads com clienteId
   ↓
5. Chamar Agente IA
   POST /api/agent/conversation com clienteId
   ↓
6. Humanizar Resposta (seu workflow atual)
   ↓
7. Enviar Mensagem (seu workflow atual)
```

---

## 🔄 Duas Abordagens Possíveis

### **Abordagem 1: Híbrida (Recomendada)**

- ✅ Continue usando Supabase para seu controle interno
- ✅ **Também** sincronize com API SDR Advogados
- ✅ Melhor dos dois mundos

**Vantagens:**
- Mantém seu workflow atual funcionando
- Adiciona integração com plataforma SDR
- Dados em dois lugares (backup)

### **Abordagem 2: Migração Completa**

- ✅ Substitua Supabase pela API SDR Advogados
- ✅ Use apenas nossa API para tudo

**Vantagens:**
- Dados centralizados
- Classificação e roteamento automáticos
- Plataforma web já integrada

---

## 🎯 Onde adicionar `clienteId` no seu workflow

### **1. No início do workflow (após "Variáveis do Fluxo")**

Adicione um node **Set** para definir `clienteId`:

```
Node: Set
Fields:
  - clienteId: "{{ $env.CLIENTE_ID || 'seu-cliente-id' }}"
```

### **2. Antes de chamar Agente IA**

No node que chama `/api/agent/conversation`, adicione `clienteId` no body.

### **3. Antes de criar lead no Supabase**

Se quiser sincronizar com nossa API, adicione um HTTP Request após criar no Supabase.

---

## ✅ Checklist de Ajustes

- [ ] Adicionar variável `CLIENTE_ID` no N8N (ou usar hardcoded)
- [ ] Adicionar `clienteId` no node "agente.ia" (chamada para `/api/agent/conversation`)
- [ ] [Opcional] Adicionar HTTP Request para `/leads` após criar lead no Supabase
- [ ] Testar workflow completo
- [ ] Verificar se lead aparece na plataforma web

---

## 🚀 Exemplo Prático

### **Node "agente.ia" ajustado:**

**URL:** `https://sdradvogados.up.railway.app/api/agent/conversation`

**Method:** `POST`

**Body (JSON):**
```json
{
  "lead_id": "{{ $('Criar Lead').json.id }}",
  "message": "{{ $json.message }}",
  "conversation_data": {{ $json.conversation_data || null }},
  "clienteId": "{{ $env.CLIENTE_ID }}"
}
```

### **Node "Sincronizar com SDR Advogados" (novo, opcional):**

**URL:** `https://sdradvogados.up.railway.app/leads`

**Method:** `POST`

**Body (JSON):**
```json
{
  "nome": "{{ $('Criar Lead').json.nome }}",
  "telefone": "{{ $('Criar Lead').json.telefone }}",
  "email": "{{ $('Criar Lead').json.email }}",
  "origem": "whatsapp",
  "clienteId": "{{ $env.CLIENTE_ID }}"
}
```

---

## 💡 Dicas Importantes

1. **Continue usando Supabase se quiser** - Nossa API é complementar, não substituta
2. **clienteId é obrigatório** - Sem ele, o lead vai para tenant padrão
3. **Teste primeiro** - Adicione um lead de teste e verifique na plataforma web
4. **Logs são seus amigos** - Veja os logs do N8N e da API para debug

---

## 🎉 Resultado Final

Após os ajustes:
- ✅ Seu workflow N8N continua funcionando igual
- ✅ Leads aparecem na plataforma SDR Advogados
- ✅ Cliente pode gerenciar leads na plataforma web
- ✅ Classificação e roteamento automáticos
- ✅ Agente IA funcionando com identidade "Super SDR Advogados"

---

**Seu workflow está excelente, só precisa desses pequenos ajustes!** 🚀
