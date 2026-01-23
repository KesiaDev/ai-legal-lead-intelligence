# 👤 Fluxo de Cadastro e Configuração do Cliente

## 🎯 Como Funciona o Cadastro

### **1. Cliente se Cadastra na Plataforma**

Quando um cliente (escritório) se cadastra:

1. **Acessa a tela de cadastro** (`/login` → aba "Criar Conta")
2. **Preenche os dados:**
   - Nome completo
   - Email
   - Senha
   - **Nome do Escritório** (nome da empresa) ← **IMPORTANTE!**

3. **Sistema cria automaticamente:**
   - ✅ Um **Tenant** (cliente) com o nome do escritório
   - ✅ Um **Usuário** admin vinculado ao tenant
   - ✅ Isolamento completo de dados (multi-tenancy)

**Resultado:**
- Cliente tem seu próprio "espaço" na plataforma
- Dados isolados de outros clientes
- Pode ter múltiplos usuários (futuro)

---

## ⚙️ Configurações Necessárias para o Agente Funcionar

### **📋 Checklist de Configuração**

Após o cadastro, o cliente precisa configurar:

#### **1. ✅ OBRIGATÓRIO: OpenAI API Key**

**Onde configurar:**
- **Configurações** → **Integrações** → **OpenAI**

**Por que é obrigatório:**
- Agente IA precisa da OpenAI para gerar respostas inteligentes
- Sem isso, o agente usa fallback básico (menos inteligente)

**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma conta (se não tiver)
3. Gere uma API Key
4. Cole na plataforma

**Custo:**
- ~$0.002 por mensagem processada
- Muito barato para começar

---

#### **2. ✅ OBRIGATÓRIO: Evolution API (WhatsApp)**

**Onde configurar:**
- **Configurações** → **Integrações** → **Evolution API**

**Por que é obrigatório:**
- Permite enviar e receber mensagens via WhatsApp
- Sem isso, o agente não pode conversar com leads

**O que precisa:**
- **URL da Evolution API:** Ex: `https://drybee-evolution.cloudfy.live`
- **API Key:** Chave de autenticação
- **Nome da Instância:** Ex: `SDR Advogados2`

**Como obter:**
1. Cliente precisa ter uma conta no Evolution API
2. Criar uma instância
3. Conectar WhatsApp Business
4. Copiar URL, API Key e Nome da Instância
5. Colar na plataforma

**Nota:** 
- Se o cliente não tem Evolution API própria, você pode usar uma compartilhada
- Cada cliente pode ter sua própria instância ou compartilhar

---

#### **3. ⚠️ OPCIONAL: ElevenLabs (Voz)**

**Onde configurar:**
- **Agente** → **Configurações** → **Voz**

**Por que é opcional:**
- Agente funciona perfeitamente **sem voz** (apenas texto)
- Voz é um recurso adicional para humanizar ainda mais

**O que precisa:**
- **API Key do ElevenLabs**
- **Voice ID** (ID da voz escolhida)

**Como obter:**
1. Acesse: https://elevenlabs.io
2. Crie uma conta
3. Gere uma API Key
4. Escolha uma voz (Sarah, George, etc.)
5. Copie o Voice ID
6. Configure na plataforma

**Status atual:**
- ✅ Interface pronta para configurar
- ⚠️ Backend ainda não está totalmente integrado (precisa implementar)
- ⚠️ Por enquanto, é apenas configuração visual

**Custo:**
- ~$0.30 por 1000 caracteres
- Opcional - pode ativar depois

---

#### **4. ⚠️ OPCIONAL: N8N Webhook**

**Onde configurar:**
- **Configurações** → **Integrações** → **N8N**

**Por que é opcional:**
- A plataforma já tem agente IA integrado
- N8N é apenas se quiser automações extras

**Quando usar:**
- Se quiser workflows complexos
- Se quiser integrações adicionais
- Se quiser usar N8N para outras automações

**Nota:** 
- A plataforma funciona **sem N8N**
- Agente IA está integrado diretamente

---

## 📊 Resumo: O Que é Obrigatório vs Opcional

### **✅ OBRIGATÓRIO para o Agente Funcionar:**

1. **OpenAI API Key** ← **CRÍTICO**
   - Sem isso: Agente usa fallback básico
   - Com isso: Agente inteligente e conversacional

2. **Evolution API** ← **CRÍTICO**
   - Sem isso: Não pode enviar/receber WhatsApp
   - Com isso: Agente conversa via WhatsApp

### **⚠️ OPCIONAL (melhora experiência):**

3. **ElevenLabs (Voz)**
   - Sem isso: Agente responde apenas em texto
   - Com isso: Agente pode responder em áudio

4. **N8N Webhook**
   - Sem isso: Plataforma funciona normalmente
   - Com isso: Automações extras

---

## 🔄 Fluxo Completo de Configuração

### **Passo 1: Cadastro**
```
Cliente acessa → Cria conta → Sistema cria Tenant
```

### **Passo 2: Configurações Básicas**
```
Cliente faz login → Vai em Configurações → Integrações
```

### **Passo 3: Configurar OpenAI**
```
Abre aba "OpenAI" → Cola API Key → Testa → Salva
```

### **Passo 4: Configurar Evolution API**
```
Abre aba "Evolution API" → Preenche URL, API Key, Instância → Testa → Salva
```

### **Passo 5: Configurar Prompts (Opcional)**
```
Vai em Agente → Prompts → Edita prompts → Salva
```

### **Passo 6: Configurar Voz (Opcional)**
```
Vai em Agente → Voz → Ativa → Configura ElevenLabs → Salva
```

### **Passo 7: Testar**
```
Envia mensagem via WhatsApp → Verifica se agente responde
```

---

## 💡 Sobre ElevenLabs e Voz

### **Status Atual:**

✅ **Interface pronta:**
- Tela de configuração de voz existe
- Campos para API Key e Voice ID
- Seleção de voz (Sarah, George, etc.)
- Configurações de probabilidade de resposta em áudio

⚠️ **Backend precisa:**
- Integração com API do ElevenLabs
- Geração de áudio quando necessário
- Envio de áudio via WhatsApp

### **Como Funcionaria (quando implementado):**

1. Cliente configura ElevenLabs na plataforma
2. Agente decide se responde em texto ou áudio
3. Se for áudio:
   - Texto é enviado para ElevenLabs
   - ElevenLabs gera áudio
   - Áudio é enviado via WhatsApp
4. Lead recebe mensagem de voz

### **Por que é Opcional:**

- Agente funciona perfeitamente **sem voz**
- Voz é um diferencial, não obrigatório
- Cliente pode ativar depois se quiser

---

## 🎯 Resposta Direta à Sua Pergunta

> "Como cliente que está se cadastrando na plataforma... ela se cadastra cadastra o número da empresa dela certo? tem que fazer as configurações da elevenlabs para que esse agente atue na voz e etc... isso?"

**Resposta:**

1. **Sim, cadastra o nome da empresa:**
   - No cadastro, preenche "Nome do Escritório"
   - Sistema cria Tenant automaticamente

2. **Sobre ElevenLabs:**
   - **NÃO é obrigatório** para o agente funcionar
   - Agente funciona perfeitamente **sem voz** (apenas texto)
   - ElevenLabs é **opcional** para adicionar respostas em áudio
   - Cliente pode configurar depois se quiser

3. **O que É obrigatório:**
   - ✅ **OpenAI API Key** (para agente inteligente)
   - ✅ **Evolution API** (para WhatsApp)

4. **O que é opcional:**
   - ⚠️ **ElevenLabs** (para voz)
   - ⚠️ **N8N** (para automações extras)

---

## 📝 Próximos Passos (Para Você)

Se quiser que ElevenLabs funcione completamente:

1. **Implementar integração no backend:**
   - Criar serviço para chamar API do ElevenLabs
   - Gerar áudio quando necessário
   - Enviar áudio via WhatsApp

2. **Salvar configurações no banco:**
   - Criar tabela para salvar API Key do ElevenLabs por tenant
   - Integrar com `VoiceConfig` do frontend

3. **Testar:**
   - Configurar ElevenLabs
   - Enviar mensagem
   - Verificar se áudio é gerado e enviado

---

**Resumo:** Cliente cadastra com nome da empresa → Configura OpenAI e Evolution API (obrigatório) → Opcionalmente configura ElevenLabs para voz.
