# 🧪 Teste Passo a Passo - Prompts Integrados

## 🎯 Objetivo
Verificar se os prompts estão sendo salvos no banco e se o agente está usando eles corretamente.

---

## 📋 Passo 1: Verificar Migration

### Opção A: Via Railway (Recomendado)
1. Acesse o Railway: https://railway.app
2. Abra o serviço do **banco de dados** (PostgreSQL)
3. Clique em "Query" ou "Connect"
4. Execute:
```sql
SELECT * FROM "AgentPrompt" LIMIT 5;
```

**Resultado esperado:**
- Se a tabela existe: Lista vazia ou prompts salvos
- Se não existe: Erro "relation does not exist"

### Opção B: Via Terminal (Se tiver acesso)
```bash
# Conectar ao banco
psql $DATABASE_URL

# Verificar tabela
\d "AgentPrompt"

# Ver prompts
SELECT * FROM "AgentPrompt" LIMIT 5;
```

**Se a tabela não existir:**
```bash
cd backend
npm run db:migrate
```

---

## 📋 Passo 2: Testar no Frontend

### 2.1. Acessar a Plataforma
1. Abra: `https://www.sdrjuridico.com.br`
2. Faça login com suas credenciais

### 2.2. Abrir DevTools
1. Pressione `F12` ou `Ctrl+Shift+I`
2. Vá na aba **Console**
3. Execute para pegar o token:
```javascript
localStorage.getItem('auth_token')
```
4. **Copie o token** (você vai precisar dele)

### 2.3. Acessar Seção de Prompts
1. No menu lateral, clique em **"Agente"**
2. Clique em **"Prompts"**
3. Verifique se a página carrega sem erros

**O que verificar:**
- ✅ Página carrega normalmente
- ✅ Console não mostra erros 401/500
- ✅ Se houver prompts, eles aparecem na lista

### 2.4. Criar um Prompt de Teste
1. Clique em **"Novo Prompt"**
2. Preencha:
   - **Nome:** `Teste Prompt`
   - **Tipo:** `Orquestrador`
   - **Versão:** `v1.0`
   - **Status:** `Ativo`
   - **Provider:** `OpenAI`
   - **Modelo:** `gpt-4o-mini`
   - **Conteúdo:** `Você é um assistente jurídico de teste. Seja profissional e cordial.`
3. Clique em **"Salvar"**

**O que verificar:**
- ✅ Toast de sucesso aparece
- ✅ Prompt aparece na lista
- ✅ Abra DevTools → **Network** → Procure requisição `POST /api/prompts`
- ✅ Status deve ser `200 OK`

### 2.5. Verificar no Banco
Volte ao Railway e execute:
```sql
SELECT * FROM "AgentPrompt" ORDER BY "createdAt" DESC LIMIT 1;
```

**Resultado esperado:**
- Deve aparecer o prompt que você acabou de criar
- Verifique se `name` = "Teste Prompt"
- Verifique se `tenantId` está correto

---

## 📋 Passo 3: Testar API Diretamente

### 3.1. Usar o Script de Teste
1. Abra o arquivo `testar-prompts.js`
2. Cole o token que você copiou no Passo 2.2
3. Execute:
```bash
node testar-prompts.js
```

**Resultado esperado:**
- ✅ Todos os testes passam
- ✅ Prompt é criado, buscado e deletado com sucesso

### 3.2. Ou Testar Manualmente com curl
```bash
# Substitua SEU_TOKEN pelo token que você copiou
TOKEN="seu_token_aqui"

# Listar prompts
curl -X GET "https://api.sdrjuridico.com.br/api/prompts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Criar prompt
curl -X POST "https://api.sdrjuridico.com.br/api/prompts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste API",
    "type": "orquestrador",
    "version": "v1.0",
    "status": "ativo",
    "provider": "OpenAI",
    "model": "gpt-4o-mini",
    "content": "Você é um assistente jurídico."
  }'
```

---

## 📋 Passo 4: Testar Agente IA

### 4.1. Verificar se o Agente Usa o Prompt
1. Envie uma mensagem via WhatsApp para o número conectado
2. O agente deve responder

**O que verificar:**
- ✅ Mensagem é recebida
- ✅ Agente responde
- ✅ Resposta segue o tom/configuração do prompt

### 4.2. Verificar Logs do Backend
1. No Railway, abra o serviço do **backend**
2. Vá em **"Logs"**
3. Procure por:
```
Prompt encontrado no banco
```
ou
```
Usando prompt padrão
```

**Se aparecer "Prompt encontrado no banco":**
- ✅ O agente está usando o prompt do banco!

**Se aparecer "Usando prompt padrão":**
- ⚠️ O prompt não foi encontrado no banco
- Verifique se o prompt está com `status: 'ativo'`
- Verifique se o `type` está correto (`orquestrador`)

---

## 🐛 Troubleshooting

### Erro: "Tabela não existe"
**Solução:**
```bash
cd backend
npm run db:migrate
```

### Erro: "401 Unauthorized"
**Solução:**
- Token expirado: Faça login novamente
- Token não configurado: Verifique se está enviando o header `Authorization`

### Prompts não aparecem no Frontend
**Solução:**
1. Abra DevTools → **Console**
2. Verifique erros
3. Abra DevTools → **Network**
4. Verifique requisição `GET /api/prompts`
5. Verifique se retorna `200` e dados válidos

### Agente não usa prompt configurado
**Solução:**
1. Verifique logs do backend
2. Verifique se o prompt está com `status: 'ativo'`
3. Verifique se o `type` está correto (`orquestrador`)
4. Verifique se o `tenantId` está sendo passado corretamente

---

## ✅ Checklist Final

- [ ] Migration aplicada (tabela existe)
- [ ] Frontend carrega prompts sem erros
- [ ] Prompt é salvo no banco ao criar na interface
- [ ] API retorna prompts corretamente
- [ ] Agente usa prompt do banco (verificar logs)
- [ ] Multi-tenancy funciona (se tiver múltiplos tenants)

---

## 🎉 Pronto!

Se todos os testes passaram, os prompts estão funcionando corretamente! 🚀
