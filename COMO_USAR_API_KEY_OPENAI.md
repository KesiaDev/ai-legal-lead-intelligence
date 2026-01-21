# 🔑 Como Usar a API Key da OpenAI

## ✅ Resposta Rápida

**SIM! Você pode usar a MESMA API key da OpenAI em:**
- ✅ **N8N** (nos nodes do workflow)
- ✅ **Plataforma SDR Jurídico** (nas configurações)

**É a mesma chave, mas usada em contextos diferentes!**

---

## 🎯 Onde Usar a API Key

### **1. No N8N (Workflow)**

**Onde configurar:**
- Nos nodes do N8N que usam OpenAI:
  - `OpenAI Chat Model`
  - `OpenAI Agent`
  - `OpenAI Embeddings`
  - etc.

**Como configurar:**
1. Abra seu workflow no N8N
2. Clique no node que usa OpenAI (ex: "OpenAI Chat Model")
3. Vá em **Credentials**
4. Selecione ou crie credencial "OpenAI API"
5. Cole a API key: `sk-...0r0A` (a mesma da imagem)
6. Salve

**O que faz:**
- N8N usa OpenAI para gerar respostas do agente IA
- Processa mensagens e cria respostas humanizadas
- Analisa contexto e gera textos

---

### **2. Na Plataforma SDR Jurídico**

**Onde configurar:**
- **Configurações** → **Integrações** → **OpenAI**

**Como configurar:**
1. Acesse a plataforma
2. Vá em **Configurações** → **Integrações**
3. Aba **OpenAI**
4. Cole a mesma API key: `sk-...0r0A`
5. Clique em **"Testar Conexão"**
6. Salve

**O que faz:**
- Plataforma usa OpenAI para **análise de leads**
- Classifica leads (quente, morno, frio)
- Identifica área do direito
- Detecta urgência
- Gera insights automáticos

---

## 🔄 Diferenças de Uso

### **N8N usa OpenAI para:**
- ✅ Gerar respostas do agente conversacional
- ✅ Processar mensagens recebidas
- ✅ Humanizar textos
- ✅ Criar contexto de conversação

### **Plataforma usa OpenAI para:**
- ✅ Analisar leads quando chegam
- ✅ Classificar qualidade do lead
- ✅ Identificar área jurídica
- ✅ Detectar urgência
- ✅ Gerar insights automáticos

**São usos complementares, não conflitantes!**

---

## 💰 Custo

### **Usando a Mesma API Key:**

**Custo total:**
- Você paga **UMA VEZ** para OpenAI
- Cada uso consome créditos da sua conta
- N8N e Plataforma compartilham os mesmos créditos

**Exemplo:**
- N8N gera resposta: ~$0.002
- Plataforma analisa lead: ~$0.002
- **Total:** ~$0.004 por interação completa

**Economia:**
- ✅ Não precisa criar API keys separadas
- ✅ Gerencia tudo em um lugar
- ✅ Facilita controle de custos

---

## 🔐 Segurança

### **Boas Práticas:**

1. **Nunca compartilhe a API key:**
   - ❌ Não coloque no código público
   - ❌ Não compartilhe em chats
   - ❌ Não exponha no frontend

2. **Use variáveis de ambiente:**
   - ✅ N8N: Salve em Credentials (criptografado)
   - ✅ Plataforma: Salve no backend (variável de ambiente)

3. **Monitore uso:**
   - ✅ Acompanhe em: https://platform.openai.com/usage
   - ✅ Configure limites de gasto
   - ✅ Revise logs regularmente

4. **Rotacione se necessário:**
   - ✅ Se suspeitar de vazamento, crie nova key
   - ✅ Desative a antiga imediatamente

---

## 📋 Passo a Passo Completo

### **Passo 1: Obter API Key (Você já tem!)**

Você já tem a API key: `sk-...0r0A`

✅ Status: **Active**
✅ Criada: 20 de jan. de 2026
✅ Permissões: **All**

---

### **Passo 2: Configurar no N8N**

1. **Abra seu workflow no N8N**
2. **Clique no node "OpenAI Chat Model"** (ou similar)
3. **Vá em "Credentials"**
4. **Selecione "OpenAI API"** (ou crie nova)
5. **Cole a API key:** `sk-...0r0A`
6. **Salve o node**
7. **Teste o workflow**

**Resultado:**
- N8N agora pode usar OpenAI para gerar respostas
- Agente IA funcionará corretamente

---

### **Passo 3: Configurar na Plataforma**

1. **Acesse a plataforma**
2. **Faça login**
3. **Vá em Configurações** → **Integrações**
4. **Aba "OpenAI"**
5. **Cole a API key:** `sk-...0r0A`
6. **Clique em "Testar Conexão"**
   - Deve aparecer: ✅ "Conexão bem-sucedida!"
7. **Clique em "Salvar"**

**Resultado:**
- Plataforma agora analisa leads com OpenAI
- Classificação automática funcionará
- Insights serão gerados

---

## 🎯 Fluxo Completo com a Mesma API Key

```
1. Lead chega no WhatsApp
   ↓
2. N8N recebe (webhook)
   ↓
3. N8N usa OpenAI (API key)
   → Gera resposta do agente IA
   ↓
4. N8N envia para Plataforma
   POST /api/agent/intake
   ↓
5. Plataforma usa OpenAI (mesma API key)
   → Analisa e classifica lead
   ↓
6. Plataforma salva lead
   ↓
7. N8N envia resposta via WhatsApp
   ↓
8. Conversa aparece na Plataforma
```

**Ambos usam a MESMA API key, mas para funções diferentes!**

---

## ⚠️ Importante

### **Você PODE usar a mesma API key:**
- ✅ N8N e Plataforma podem compartilhar
- ✅ É mais prático e econômico
- ✅ Facilita gerenciamento

### **Você PODE criar keys separadas:**
- ✅ Se quiser separar custos
- ✅ Se quiser diferentes permissões
- ✅ Se quiser isolar ambientes (dev/prod)

**Recomendação:** Use a mesma key para começar. Se precisar separar depois, é fácil criar novas.

---

## 🔍 Verificar Uso

### **No Dashboard da OpenAI:**

1. Acesse: https://platform.openai.com/usage
2. Veja uso por:
   - **API Key** (qual key foi usada)
   - **Modelo** (gpt-4, gpt-3.5, etc.)
   - **Data** (quando foi usado)
   - **Custo** (quanto gastou)

### **Exemplo de Uso:**

```
API Key: sk-...0r0A
├─ N8N: 50 chamadas (respostas do agente)
└─ Plataforma: 30 chamadas (análise de leads)
Total: 80 chamadas = ~$0.16
```

---

## ✅ Resumo

### **Pergunta: "A API seria a mesma que usei pro N8N?"**

**Resposta: SIM!**

- ✅ **Mesma API key** (`sk-...0r0A`)
- ✅ **Usada em dois lugares:**
  - N8N: Para gerar respostas do agente
  - Plataforma: Para analisar leads
- ✅ **Compartilha os mesmos créditos**
- ✅ **Mais prático e econômico**

### **Como Configurar:**

1. **N8N:** Credentials → OpenAI API → Cole a key
2. **Plataforma:** Configurações → Integrações → OpenAI → Cole a key

**Pronto! Ambos funcionarão com a mesma API key!** 🚀
