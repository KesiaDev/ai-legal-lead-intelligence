# 🧪 Guia de Teste - Prompts Integrados

## 📋 Checklist de Testes

### 1. ✅ Verificar Migration no Banco

```bash
# Conectar ao banco e verificar se a tabela existe
psql $DATABASE_URL -c "\d \"AgentPrompt\""
```

Ou via Railway:
1. Acesse o serviço do banco no Railway
2. Abra o PostgreSQL
3. Execute: `SELECT * FROM "AgentPrompt" LIMIT 5;`

---

### 2. ✅ Testar API de Prompts (Backend)

#### **2.1. Listar Prompts**
```bash
# Substitua SEU_TOKEN pelo token de autenticação
curl -X GET "https://api.sdrjuridico.com.br/api/prompts" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

**Resultado esperado:**
```json
{
  "prompts": [],
  "total": 0
}
```
(Array vazio se não houver prompts salvos ainda)

#### **2.2. Criar um Prompt**
```bash
curl -X POST "https://api.sdrjuridico.com.br/api/prompts" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Orquestrador Teste",
    "type": "orquestrador",
    "version": "v1.0",
    "status": "ativo",
    "provider": "OpenAI",
    "model": "gpt-4o-mini",
    "content": "Você é um assistente jurídico. Seja profissional e cordial.",
    "temperature": 0.4,
    "maxTokens": 500
  }'
```

**Resultado esperado:**
```json
{
  "prompt": {
    "id": "uuid-gerado",
    "name": "Orquestrador Teste",
    "type": "orquestrador",
    ...
  },
  "message": "Prompt salvo com sucesso"
}
```

#### **2.3. Buscar Prompt por Tipo**
```bash
curl -X GET "https://api.sdrjuridico.com.br/api/prompts/orquestrador" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

---

### 3. ✅ Testar Frontend

#### **3.1. Verificar se Prompts Carregam**
1. Acesse `https://www.sdrjuridico.com.br`
2. Faça login
3. Vá em "Agente" → "Prompts"
4. Verifique se os prompts aparecem (ou se está vazio)

**O que verificar:**
- ✅ Página carrega sem erros
- ✅ Console do navegador não mostra erros 401/500
- ✅ Se houver prompts no banco, eles aparecem na lista

#### **3.2. Criar/Editar Prompt**
1. Clique em "Novo Prompt" ou edite um existente
2. Preencha os campos:
   - Nome: "Teste Prompt"
   - Tipo: "Orquestrador"
   - Conteúdo: "Você é um assistente jurídico..."
3. Clique em "Salvar"

**O que verificar:**
- ✅ Toast de sucesso aparece
- ✅ Prompt aparece na lista
- ✅ Abra DevTools → Network → Verifique requisição POST para `/api/prompts`
- ✅ Status da requisição deve ser 200

#### **3.3. Verificar no Banco**
Após salvar, verifique se o prompt foi salvo:
```sql
SELECT * FROM "AgentPrompt" ORDER BY "createdAt" DESC LIMIT 1;
```

---

### 4. ✅ Testar Agente IA

#### **4.1. Enviar Mensagem via WhatsApp**
1. Envie uma mensagem para o número do WhatsApp conectado
2. O agente deve responder usando o prompt configurado

**O que verificar:**
- ✅ Mensagem é recebida
- ✅ Agente responde
- ✅ Resposta segue o tom/configuração do prompt
- ✅ Logs do backend mostram qual prompt foi usado

#### **4.2. Verificar Logs do Backend**
No Railway, acesse os logs do backend e procure por:
```
Prompt encontrado no banco
```
ou
```
Usando prompt padrão
```

---

### 5. ✅ Testar Multi-Tenancy

Se você tiver múltiplos tenants:
1. Faça login com Tenant A
2. Crie um prompt específico
3. Faça login com Tenant B
4. Verifique que o prompt do Tenant A não aparece
5. Crie um prompt para Tenant B
6. Verifique que cada tenant vê apenas seus prompts

---

## 🐛 Troubleshooting

### **Erro: "Tabela não existe"**
**Solução:** Aplique a migration:
```bash
cd backend
npm run db:migrate
```

### **Erro: "401 Unauthorized"**
**Solução:** 
- Verifique se está logado
- Verifique se o token está sendo enviado
- Token pode ter expirado (faça login novamente)

### **Erro: "Prompt não encontrado"**
**Solução:**
- Verifique se o prompt foi salvo no banco
- Verifique se o `status` é "ativo"
- Verifique se o `tenantId` está correto

### **Prompts não aparecem no Frontend**
**Solução:**
1. Abra DevTools → Console
2. Verifique erros
3. Abra DevTools → Network
4. Verifique requisição GET para `/api/prompts`
5. Verifique se retorna 200 e dados válidos

### **Agente não usa prompt configurado**
**Solução:**
1. Verifique logs do backend
2. Verifique se o prompt está com `status: 'ativo'`
3. Verifique se o `type` está correto (deve ser "orquestrador")
4. Verifique se o `tenantId` está sendo passado corretamente

---

## 📊 Resultados Esperados

### ✅ Teste Bem-Sucedido

1. **Migration aplicada:** Tabela `AgentPrompt` existe no banco
2. **API funciona:** GET/POST/DELETE retornam 200
3. **Frontend salva:** Prompt aparece na lista após salvar
4. **Agente usa prompt:** Resposta segue o prompt configurado
5. **Multi-tenancy:** Cada tenant vê apenas seus prompts

---

## 🎯 Próximos Passos Após Testes

1. ✅ Se tudo funcionar: Pronto para produção!
2. ⚠️ Se houver erros: Verifique logs e siga troubleshooting
3. 📝 Documente qualquer comportamento inesperado

---

**Boa sorte com os testes! 🚀**
