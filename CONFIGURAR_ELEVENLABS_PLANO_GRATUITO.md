# 🎤 Configurar ElevenLabs - Plano Gratuito

## 🎯 Objetivo

Configurar uma voz do ElevenLabs no plano gratuito e saber como fazer upgrade para Pro depois.

---

## 📋 Passo 1: Criar Conta no ElevenLabs (Plano Gratuito)

### **1.1. Acessar ElevenLabs**

1. Acesse: https://elevenlabs.io
2. Clique em **"Sign Up"** ou **"Get Started"**
3. Crie sua conta (pode usar email ou Google)

### **1.2. Plano Gratuito Inclui:**

✅ **10.000 caracteres/mês** (grátis)
✅ **3 vozes customizadas**
✅ **Acesso à biblioteca de vozes**
✅ **API Key gratuita**

**Isso é suficiente para testar!** 🎉

---

## 📋 Passo 2: Obter API Key

### **2.1. Gerar API Key**

1. Faça login no ElevenLabs
2. Clique no seu **perfil** (canto superior direito)
3. Vá em **"Profile"** → **"API Keys"**
4. Clique em **"Create API Key"**
5. Dê um nome (ex: "SDR Advogados")
6. **Copie a API Key** (ela só aparece uma vez!)

### **2.2. Escolher Voz**

1. No ElevenLabs, vá em **"Voices"** (menu lateral)
2. Escolha uma voz da biblioteca (ex: "Sarah", "Rachel", "Adam")
3. Clique na voz
4. **Copie o Voice ID** (ex: `21m00Tcm4TlvDq8ikWAM`)

**Vozes Gratuitas Recomendadas:**
- **Sarah** - Voz feminina, profissional
- **Rachel** - Voz feminina, amigável
- **Adam** - Voz masculina, confiável
- **Antoni** - Voz masculina, profissional

---

## 📋 Passo 3: Configurar na Plataforma

### **3.1. Acessar Configurações de Voz**

1. Acesse sua plataforma: https://www.sdrjuridico.com.br
2. Faça login
3. Vá em **"Agente"** → **"Voz"** (ou **"Configurações"** → **"Voz"**)

### **3.2. Preencher Dados**

**Campos obrigatórios:**
- **API Key do ElevenLabs:** Cole a API Key que você copiou
- **Voice ID:** Cole o Voice ID da voz escolhida
- **Voice Name:** Nome da voz (ex: "Sarah")

**Campos opcionais (pode deixar padrão):**
- **Probabilidade de resposta em áudio:**
  - Em texto: "nunca" (padrão)
  - Em áudio: "alta" (padrão)
  - Em mídia: "baixa" (padrão)

### **3.3. Ativar Voz**

1. Marque **"Ativar voz"** ou **"Enabled"**
2. Clique em **"Salvar"** ou **"Save"**

---

## 📋 Passo 4: Testar Voz

### **4.1. Testar na Interface**

1. Na tela de configuração de voz
2. Clique em **"Testar Voz"** ou **"Test Voice"**
3. Digite um texto de teste (ex: "Olá, como posso ajudar?")
4. Clique em **"Gerar"** ou **"Generate"**
5. Ouça o áudio gerado

### **4.2. Testar via WhatsApp**

1. Envie uma mensagem via WhatsApp para o número conectado
2. O agente deve responder em áudio (se configurado)
3. Verifique se o áudio foi gerado e enviado

---

## 📋 Passo 5: Fazer Upgrade para Pro (Depois)

### **5.1. Quando Fazer Upgrade?**

**Faça upgrade quando:**
- ✅ Você precisar de mais de 10.000 caracteres/mês
- ✅ Quiser vozes customizadas ilimitadas
- ✅ Quiser remover marca d'água
- ✅ Quiser prioridade no suporte

**Plano Gratuito é suficiente para:**
- ✅ Testes iniciais
- ✅ Pequenos volumes
- ✅ Validação do conceito

### **5.2. Como Fazer Upgrade**

1. Acesse: https://elevenlabs.io
2. Faça login
3. Clique no seu **perfil** (canto superior direito)
4. Vá em **"Subscription"** ou **"Billing"**
5. Escolha o plano **"Pro"** ou **"Creator"**
6. Complete o pagamento
7. **Sua API Key continua a mesma!** ✅

### **5.3. Planos Disponíveis**

**Starter (Gratuito):**
- 10.000 caracteres/mês
- 3 vozes customizadas
- Biblioteca de vozes

**Creator ($5/mês):**
- 30.000 caracteres/mês
- 10 vozes customizadas
- Sem marca d'água

**Pro ($22/mês):**
- 100.000 caracteres/mês
- Vozes customizadas ilimitadas
- Prioridade no suporte

**Business (Customizado):**
- Volume customizado
- Suporte dedicado
- SLA garantido

---

## 📋 Passo 6: Configurar no Backend (Railway)

### **6.1. Adicionar Variáveis de Ambiente**

No Railway → Backend → Variables, adicione:

```
ELEVENLABS_API_KEY=sua_api_key_aqui
```

**Nota:** A voz será configurada por cliente na plataforma, não via variável de ambiente.

### **6.2. Verificar Configuração**

1. Acesse: https://api.sdrjuridico.com.br/api/voice/config
2. Faça login e verifique se a configuração está salva

---

## ✅ Checklist

- [ ] Conta criada no ElevenLabs (plano gratuito)
- [ ] API Key gerada e copiada
- [ ] Voz escolhida e Voice ID copiado
- [ ] Configurado na plataforma (Agente → Voz)
- [ ] Voz ativada
- [ ] Teste realizado com sucesso
- [ ] Funcionando! ✅

---

## 🎯 Resumo Rápido

### **Para Configurar Agora (Gratuito):**

1. ✅ Crie conta no ElevenLabs (grátis)
2. ✅ Gere API Key
3. ✅ Escolha uma voz e copie o Voice ID
4. ✅ Configure na plataforma (Agente → Voz)
5. ✅ Ative e teste

### **Para Fazer Upgrade Depois:**

1. Acesse elevenlabs.io → Subscription
2. Escolha plano Pro
3. Complete pagamento
4. **API Key continua a mesma!** ✅

---

## 💡 Dicas

### **Economizar Caracteres (Plano Gratuito):**

- ✅ Use respostas curtas
- ✅ Configure "nunca" para respostas em texto
- ✅ Use "alta" apenas para mensagens de áudio recebidas
- ✅ Monitore uso no dashboard do ElevenLabs

### **Monitorar Uso:**

1. Acesse ElevenLabs → Dashboard
2. Veja quantos caracteres você usou
3. Acompanhe o limite mensal

---

## 🚀 Próximos Passos

1. **Agora:** Configure com plano gratuito
2. **Teste:** Valide funcionamento
3. **Depois:** Faça upgrade se precisar de mais volume

**Tudo pronto para começar!** 🎉
