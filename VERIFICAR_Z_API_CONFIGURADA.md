# Verificar se Z-API está Configurada

## Problema: Z-API não aparece em "Canais de Comunicação"

## Passos para Verificar

### 1. Verificar Console do Navegador

Após o deploy (2-3 minutos), abra o console do navegador (F12) e vá para:
- **Agente → Configurações → Canais de Comunicação**

Você deve ver logs como:
```
Configurações carregadas: {
  zapiInstanceId: "...",
  zapiToken: "***",
  hasZApi: true/false
}
```

**Se `hasZApi: false`**, significa que a Z-API não está configurada no banco.

### 2. Verificar se Z-API está Salva

1. Acesse: **Configurações → Integrações → Z-API**
2. Verifique se:
   - ✅ ID da Instância está preenchido
   - ✅ Token está preenchido
   - ✅ Clique em "Salvar" (mesmo que já tenha salvo antes)

### 3. Verificar no Banco de Dados (Railway)

Se você tem acesso ao Railway PostgreSQL:

```sql
SELECT 
  "zapiInstanceId", 
  CASE 
    WHEN "zapiToken" IS NOT NULL THEN '***' || RIGHT("zapiToken", 4)
    ELSE NULL
  END as token_masked,
  "zapiBaseUrl"
FROM "IntegrationConfig"
WHERE "tenantId" = (
  SELECT id FROM "Tenant" LIMIT 1
);
```

**Se retornar `NULL` para `zapiInstanceId`**, a Z-API não está configurada.

### 4. Verificar API Diretamente

Abra o console do navegador (F12) e execute:

```javascript
// Obter token de autenticação
const token = localStorage.getItem('token');

// Fazer requisição
fetch('https://api.sdrjuridico.com.br/api/integrations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Resposta da API:', data);
  console.log('Z-API configurada?', !!(data.zapiInstanceId && data.zapiToken));
});
```

**Se `zapiInstanceId` ou `zapiToken` forem `null`**, a Z-API não está configurada.

## Solução

### Se Z-API não está configurada:

1. Acesse: **Configurações → Integrações → Z-API**
2. Preencha:
   - **ID da Instância**: Cole o ID da instância do Z-API
   - **Token**: Cole o token da instância
3. Clique em **"Testar Conexão"** (deve aparecer "Conectado")
4. Clique em **"Salvar"**
5. Aguarde alguns segundos
6. Recarregue a página: **Agente → Configurações → Canais de Comunicação**
7. A Z-API deve aparecer agora

### Se Z-API está configurada mas não aparece:

1. Verifique os logs no console (F12)
2. Verifique se há erros na requisição
3. Limpe o cache do navegador (Ctrl+Shift+R)
4. Verifique se o deploy do frontend foi concluído

## Debug Adicional

Se ainda não funcionar, adicione este código no console:

```javascript
// Verificar se a requisição está funcionando
const token = localStorage.getItem('token');
fetch('https://api.sdrjuridico.com.br/api/integrations', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== DEBUG Z-API ===');
  console.log('zapiInstanceId:', data.zapiInstanceId);
  console.log('zapiToken:', data.zapiToken);
  console.log('zapiBaseUrl:', data.zapiBaseUrl);
  console.log('Deve aparecer?', !!(data.zapiInstanceId && data.zapiToken));
});
```

Envie o resultado para análise.
