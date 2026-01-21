# 🎭 Guia Completo: Simular Como Cliente na Plataforma

## 🎯 Objetivo

Entender como a plataforma funciona do ponto de vista de um **cliente (escritório)** que vai usar o sistema.

---

## 📋 Passo 1: Criar um Novo Cliente (Tenant)

### **Opção A: Via Interface (Recomendado)**

1. **Faça login** com sua conta atual
2. Vá em **Configurações** → **Empresa**
3. O nome da empresa já está criado como seu tenant

### **Opção B: Criar Cliente de Teste (Via API)**

Execute no terminal ou Postman:

```bash
# 1. Fazer login primeiro
curl -X POST https://api.sdrjuridico.com.br/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu-email@exemplo.com",
    "password": "sua-senha"
  }'

# 2. Criar novo tenant (cliente)
curl -X POST https://api.sdrjuridico.com.br/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Escritório de Teste",
    "plan": "free"
  }'

# 3. Criar usuário para esse tenant
curl -X POST https://api.sdrjuridico.com.br/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente-teste@exemplo.com",
    "password": "senha123",
    "name": "Cliente Teste",
    "tenantName": "Escritório de Teste"
  }'
```

### **Opção C: Usar o Cliente Atual**

Se você já tem um login, você **JÁ É um cliente**! Seu tenant foi criado automaticamente quando você se registrou.

---

## 🏠 Passo 2: Entender o Que Você Vê Como Cliente

### **1. Dashboard (Página Inicial)**

Quando você faz login, você vê:

**📊 Métricas:**
- Total de Leads
- Qualificados
- Urgentes
- Follow-ups Pendentes

**📈 Gráficos:**
- Leads por Área do Direito
- Leads Recentes

**🎯 Funil de Vendas:**
- Funis de campanha criados
- Negócios em cada etapa
- Conversão por funil

**✅ O que você vê:**
- **APENAS** os leads do seu escritório (tenant)
- **APENAS** os funis que você criou
- **APENAS** os dados do seu negócio

---

### **2. Leads (Lista de Contatos)**

**O que aparece:**
- Todos os leads que chegaram para seu escritório
- Filtros por status, área do direito, urgência
- Busca por nome, telefone, email
- Detalhes completos de cada lead

**Como os leads chegam:**
1. Via N8N (webhook do WhatsApp/Instagram/etc)
2. Manualmente (você adiciona)
3. Via API (integrações futuras)

**Isolamento:**
- Você **NÃO vê** leads de outros escritórios
- Cada lead pertence ao seu tenant

---

### **3. Conversas (Chat ao Vivo)**

**O que aparece:**
- Lista de conversas ativas
- Histórico de mensagens
- Status da conversa (ativa, pausada, finalizada)
- Ações: IA, Pausar, Transferir

**Como funciona:**
1. Lead envia mensagem no WhatsApp
2. N8N recebe e processa
3. Agente IA responde (se configurado)
4. Conversa aparece na plataforma
5. Você pode assumir e conversar manualmente

**Isolamento:**
- Você **NÃO vê** conversas de outros escritórios
- Cada conversa pertence ao seu tenant

---

### **4. Agendamentos**

**O que aparece:**
- Agendamentos criados para seus leads
- Calendário de consultas
- Lembretes e notificações

**Isolamento:**
- Você **NÃO vê** agendamentos de outros escritórios

---

### **5. Funis de Campanha**

**O que aparece:**
- Funis que você criou
- Negócios (deals) em cada etapa
- Conversão e métricas

**Isolamento:**
- Você **NÃO vê** funis de outros escritórios

---

## 🤖 Passo 3: Entender Integrações

### **OpenAI (Análise Inteligente)**

**Onde configurar:**
- Configurações → **Integrações** → **OpenAI**

**O que faz:**
- ✅ Analisa mensagens de leads automaticamente
- ✅ Classifica leads (quente, morno, frio)
- ✅ Gera respostas inteligentes
- ✅ Identifica área do direito
- ✅ Detecta urgência

**Como funciona:**
1. Você cadastra sua API Key da OpenAI
2. Quando um lead chega, a plataforma usa OpenAI para analisar
3. Se não tiver OpenAI, usa análise básica (fallback)

**Custo:**
- Você paga diretamente para OpenAI
- ~$0.002 por análise (muito barato)
- Pode usar plano free da OpenAI para testes

---

### **N8N (Automação)**

**Onde configurar:**
- Configurações → **Integrações** → **N8N**

**O que faz:**
- ✅ Recebe leads do WhatsApp/Instagram/etc
- ✅ Processa mensagens (texto, áudio, imagem)
- ✅ Envia para agente IA
- ✅ Humaniza respostas
- ✅ Envia de volta via WhatsApp

**Como funciona:**
1. Você cria workflow no N8N
2. Configura webhook para receber leads
3. N8N processa e envia para Evolution API
4. Respostas voltam para a plataforma

**Custo:**
- N8N self-hosted: **GRÁTIS**
- N8N Cloud: $20-50/mês (opcional)

---

### **Evolution API (WhatsApp)**

**Onde configurar:**
- Configurações → **Integrações** → **Evolution API**
- **OU** configurar direto no N8N (recomendado)

**O que faz:**
- ✅ Gerencia conexão com WhatsApp
- ✅ Envia mensagens
- ✅ Recebe mensagens
- ✅ Gerencia instâncias

**Como funciona:**
1. Você cria instância no Evolution API
2. Conecta WhatsApp Business
3. N8N usa Evolution para enviar/receber
4. Plataforma recebe notificações via N8N

**Custo:**
- Evolution API: $0-50/mês (depende do plano)

---

## 🔄 Fluxo Completo: Do Lead ao Cliente

### **Cenário Real:**

```
1. Cliente envia mensagem no WhatsApp
   "Preciso de ajuda com processo trabalhista"
   ↓
2. Evolution API recebe
   ↓
3. N8N processa (webhook)
   - Extrai nome e telefone
   - Consolida mensagem
   ↓
4. N8N envia para Plataforma
   POST /api/agent/intake
   {
     "lead_id": "123",
     "mensagem": "Preciso de ajuda com processo trabalhista",
     "canal": "whatsapp"
   }
   ↓
5. Plataforma analisa (OpenAI ou fallback)
   - Área: Direito Trabalhista
   - Urgência: Alta
   - Score: 85
   ↓
6. Plataforma cria/atualiza lead
   - Salva no banco (tenant isolado)
   - Retorna análise
   ↓
7. N8N recebe análise
   - Gera resposta com Agente IA
   - Humaniza texto
   ↓
8. N8N envia resposta via Evolution API
   "Olá! Entendo sua situação. Vou te ajudar..."
   ↓
9. Cliente recebe no WhatsApp
   ↓
10. Conversa aparece na Plataforma
    - Você vê no "Chat ao Vivo"
    - Pode assumir e conversar manualmente
```

---

## 🎯 Como Simular Como Cliente

### **Passo 1: Criar Conta de Teste**

1. Acesse: `https://api.sdrjuridico.com.br`
2. Clique em **"Registrar"**
3. Preencha:
   - Email: `cliente-teste@exemplo.com`
   - Nome: `Cliente Teste`
   - Senha: `senha123`
   - Nome da Empresa: `Escritório Teste`

### **Passo 2: Fazer Login**

1. Faça login com a conta criada
2. Você verá o dashboard **vazio** (sem leads ainda)

### **Passo 3: Simular Recebimento de Lead**

**Opção A: Via N8N (Real)**
1. Configure N8N com webhook
2. Envie mensagem de teste no WhatsApp
3. Lead aparecerá automaticamente na plataforma

**Opção B: Via API (Teste Rápido)**
```bash
curl -X POST https://api.sdrjuridico.com.br/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@exemplo.com",
    "origem": "whatsapp",
    "clienteId": "ID_DO_SEU_TENANT"
  }'
```

### **Passo 4: Ver Lead Aparecer**

1. Vá em **Leads**
2. Você verá o lead que acabou de criar
3. Clique no lead para ver detalhes

### **Passo 5: Ver Conversa**

1. Vá em **Conversas** → **Chat ao Vivo**
2. Se houver conversa ativa, aparecerá aqui
3. Você pode conversar manualmente

---

## 🔧 Configurar Integrações

### **1. OpenAI (Opcional mas Recomendado)**

**Por que configurar:**
- Análise mais inteligente de leads
- Respostas automáticas melhores
- Classificação mais precisa

**Como configurar:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma API Key
3. Vá em **Configurações** → **Integrações** → **OpenAI**
4. Cole a API Key
5. Clique em **"Testar Conexão"**
6. Salve

**Custo:**
- ~$0.002 por análise
- Muito barato para começar

---

### **2. N8N (Obrigatório para Automação)**

**Por que configurar:**
- Recebe mensagens do WhatsApp
- Processa e envia para agente IA
- Gerencia fluxo completo

**Como configurar:**
1. Crie workflow no N8N
2. Configure webhook para receber leads
3. Vá em **Configurações** → **Integrações** → **N8N**
4. Cole a URL do webhook
5. Clique em **"Testar Conexão"**
6. Salve

**Nota:** A configuração principal do N8N é no próprio N8N. A URL aqui é apenas para referência.

---

### **3. Evolution API (Obrigatório para WhatsApp)**

**Por que configurar:**
- Gerencia conexão com WhatsApp
- Envia e recebe mensagens

**Como configurar:**
1. Crie instância no Evolution API Manager
2. Conecte WhatsApp Business
3. Vá em **Configurações** → **Integrações** → **Evolution API**
4. Preencha URL, API Key e Nome da Instância
5. Clique em **"Testar Conexão"**
6. Salve

**Nota:** A configuração principal é no N8N (onde você usa a Evolution API).

---

## 📊 O Que Você Vê Sem CRM

### **Sem CRM Contratado:**

✅ **Funciona perfeitamente:**
- Recebimento de leads
- Análise e classificação
- Chat ao vivo
- Funis de campanha
- Agendamentos
- Exportação CSV/JSON

❌ **Não funciona (ainda):**
- Sincronização automática com CRM
- Envio de leads para CRM externo
- Importação de leads do CRM

### **Com Exportação CSV/JSON:**

Você pode:
1. Exportar todos os leads em CSV
2. Importar no seu CRM manualmente
3. Ou usar integração futura (quando implementar)

---

## 🎯 Resumo: Como Funciona Para Você (Cliente)

### **1. Você Faz Login:**
- Vê dashboard com seus dados
- Apenas leads do seu escritório

### **2. Leads Chegam Automaticamente:**
- Via WhatsApp → N8N → Plataforma
- Aparecem em tempo real
- Classificados automaticamente

### **3. Você Gerencia:**
- Vê leads em **Leads**
- Conversa em **Chat ao Vivo**
- Cria funis em **Dashboard**
- Exporta dados em **Exportar Dados**

### **4. Integrações:**
- **OpenAI:** Análise inteligente (opcional)
- **N8N:** Automação completa (obrigatório)
- **Evolution API:** WhatsApp (obrigatório)
- **CRM:** Em breve (por enquanto, exporte CSV)

---

## ✅ Checklist: Como Começar

- [ ] Fazer login na plataforma
- [ ] Ver dashboard (vazio no início)
- [ ] Configurar OpenAI (opcional)
- [ ] Configurar N8N webhook
- [ ] Configurar Evolution API
- [ ] Testar recebimento de lead
- [ ] Ver lead aparecer na plataforma
- [ ] Testar chat ao vivo
- [ ] Criar funil de campanha
- [ ] Exportar dados (CSV/JSON)

---

**Pronto! Agora você entende como funciona do ponto de vista do cliente!** 🚀
