# ✅ Como Testar se os Tokens Estão Sendo Gravados

## 🎯 Objetivo

Verificar se os tokens de **OpenAI**, **Z-API**, **Evolution API** e **N8N** estão sendo salvos corretamente no banco de dados.

---

## 📋 Passo a Passo

### 1. **Salvar os Tokens na Interface**

1. Acesse **Configurações → Integrações**
2. Preencha os campos para cada integração:
   - **OpenAI**: Cole a API Key
   - **Z-API**: Cole o Instance ID e Token
   - **Evolution API**: Cole URL, API Key e Instance
   - **N8N**: Cole a URL do Webhook
3. Clique em **"Salvar"** em cada aba
4. Aguarde a mensagem de sucesso: **"Configurações salvas!"**

---

### 2. **Verificar no Console do Navegador**

1. Abra o **Console** (F12 → Console)
2. Procure por mensagens como:
   ```
   Enviando payload para salvar integrações: {...}
   Resposta do servidor: {...}
   ```
3. Verifique se não há erros (vermelho)

---

### 3. **Testar Endpoint de Verificação**

No console do navegador, execute:

```javascript
// Obter token de autenticação
const token = localStorage.getItem('auth_token');

// Verificar status dos tokens salvos
fetch('https://api.sdrjuridico.com.br/api/integrations/verify', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
.then(r => r.json())
.then(data => {
  console.log('✅ Status dos Tokens:', data);
  
  // Verificar cada integração
  if (data.status.openai.hasValue) {
    console.log('✅ OpenAI: SALVO');
  } else {
    console.log('❌ OpenAI: NÃO SALVO');
  }
  
  if (data.status.zapi.hasValue) {
    console.log('✅ Z-API: SALVO');
  } else {
    console.log('❌ Z-API: NÃO SALVO');
  }
  
  if (data.status.evolution.hasValue) {
    console.log('✅ Evolution API: SALVO');
  } else {
    console.log('❌ Evolution API: NÃO SALVO');
  }
  
  if (data.status.n8n.hasValue) {
    console.log('✅ N8N: SALVO');
  } else {
    console.log('❌ N8N: NÃO SALVO');
  }
})
.catch(err => console.error('❌ Erro:', err));
```

---

### 4. **Verificar Logs do Backend (Railway)**

1. Acesse **Railway → Backend Service → Logs**
2. Procure por mensagens como:
   ```
   Recebendo dados para atualizar integrações
   OpenAI API Key será atualizada
   Z-API Token será atualizada
   Configurações de integração atualizadas com sucesso
   ```
3. Verifique se há erros (vermelho)

---

### 5. **Verificar Diretamente no Banco de Dados (Opcional)**

No Railway → PostgreSQL → Query:

```sql
SELECT 
  "openaiApiKey" IS NOT NULL as has_openai,
  "n8nWebhookUrl" IS NOT NULL as has_n8n,
  "evolutionApiKey" IS NOT NULL as has_evolution_key,
  "evolutionApiUrl" IS NOT NULL as has_evolution_url,
  "evolutionInstance" IS NOT NULL as has_evolution_instance,
  "zapiInstanceId" IS NOT NULL as has_zapi_instance,
  "zapiToken" IS NOT NULL as has_zapi_token,
  "updatedAt"
FROM "IntegrationConfig"
WHERE "tenantId" = 'SEU_TENANT_ID';
```

**Nota:** Os valores completos dos tokens não serão mostrados por segurança, apenas se estão salvos ou não.

---

## 🔍 O Que Verificar

### ✅ **Sucesso:**
- Mensagem "Configurações salvas!" aparece
- Console mostra `Enviando payload` e `Resposta do servidor`
- Endpoint `/api/integrations/verify` retorna `hasValue: true` para cada token
- Logs do backend mostram "Configurações de integração atualizadas com sucesso"

### ❌ **Problemas Comuns:**

1. **Erro 500 ao salvar:**
   - Verifique se a migration foi aplicada
   - Verifique logs do backend para erros específicos

2. **Token não aparece após recarregar:**
   - Tokens são mascarados por segurança (mostram apenas `***XXXX`)
   - O valor completo está salvo no banco, apenas não é exibido

3. **Auto-save do OpenAI não funciona:**
   - Aguarde 2 segundos após parar de digitar
   - Verifique console para erros

---

## 🛠️ Melhorias Implementadas

1. **Logs detalhados** no backend para rastrear salvamento
2. **Endpoint de verificação** (`/api/integrations/verify`) para testar
3. **Tratamento correto** de strings vazias (null em vez de undefined)
4. **Console logs** no frontend para debug
5. **Salvamento temporário** no localStorage para não perder ao recarregar

---

## 📝 Próximos Passos

Após confirmar que os tokens estão sendo salvos:

1. **Teste as conexões** usando os botões "Testar Conexão"
2. **Verifique se as integrações funcionam** na prática
3. **Confirme que os tokens persistem** após recarregar a página

---

## ✅ Checklist Final

- [ ] Tokens salvos na interface
- [ ] Mensagem de sucesso apareceu
- [ ] Console mostra logs de salvamento
- [ ] Endpoint `/api/integrations/verify` confirma salvamento
- [ ] Logs do backend mostram atualização bem-sucedida
- [ ] Tokens persistem após recarregar página
