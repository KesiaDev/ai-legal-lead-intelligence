# 🔧 Troubleshooting: Teste de Conexão Z-API

## ❌ Erro: "Falha na conexão"

Se você está vendo este erro ao testar a conexão Z-API, siga estes passos:

---

## ✅ Checklist de Verificação

### 1. **Credenciais Corretas?**

Verifique no painel do Z-API:
- **ID da Instância:** `3EDAA0991A2272AFA1183EBEF7B316F4`
- **Token da Instância:** `147E1F8CFCAACFFE1799DFAE`
- **URL Base:** `https://api.z-api.io`

**Onde encontrar:**
- Acesse o painel do Z-API
- Vá em **"Dados da instância web"**
- Copie o **ID da instância** e o **Token da instância**

---

### 2. **Deploy do Backend Concluído?**

O endpoint `/api/zapi/test-connection` precisa estar deployado no Railway.

**Como verificar:**
1. Acesse Railway → Backend → Deployments
2. Verifique se o último deploy foi concluído
3. Aguarde alguns minutos se acabou de fazer push

**Teste manual:**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/zapi/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "3EDAA0991A2272AFA1183EBEF7B316F4",
    "token": "147E1F8CFCAACFFE1799DFAE",
    "baseUrl": "https://api.z-api.io"
  }'
```

---

### 3. **Instância Conectada ao WhatsApp?**

A instância do Z-API precisa estar conectada ao WhatsApp.

**Como verificar:**
1. Acesse o painel do Z-API
2. Verifique se a instância está **"Conectada"** (status verde)
3. Se não estiver, escaneie o QR Code com o WhatsApp

---

### 4. **Token Válido?**

O token pode ter expirado ou sido regenerado.

**Como verificar:**
1. No painel do Z-API, vá em **"Dados da instância web"**
2. Verifique se o token atual é o mesmo que você está usando
3. Se necessário, gere um novo token e atualize na plataforma

---

## 🔍 Mensagens de Erro Específicas

### **"Credenciais inválidas"**
- ✅ Verifique o ID da Instância
- ✅ Verifique o Token da Instância
- ✅ Certifique-se de que não há espaços extras
- ✅ Gere um novo token se necessário

### **"Endpoint não encontrado" (404)**
- ✅ Aguarde o deploy do backend
- ✅ Verifique se a URL da API está correta: `https://api.sdrjuridico.com.br`

### **"Erro de conexão"**
- ✅ Verifique sua conexão com a internet
- ✅ Verifique se a API do Z-API está acessível
- ✅ Tente novamente em alguns minutos

### **"Falha na conexão" (genérico)**
- ✅ Verifique todos os itens acima
- ✅ Abra o console do navegador (F12) e veja o erro completo
- ✅ Verifique os logs do backend no Railway

---

## 🚀 Solução Rápida

1. **Copie as credenciais novamente** do painel do Z-API
2. **Cole na interface** da plataforma
3. **Aguarde o deploy** do backend (se acabou de fazer push)
4. **Teste novamente**

---

## 📞 Se Nada Funcionar

1. **Abra o console do navegador** (F12 → Console)
2. **Tente testar a conexão** novamente
3. **Copie a mensagem de erro completa**
4. **Verifique os logs do backend** no Railway
5. **Compartilhe os erros** para investigação

---

## ✅ Teste Alternativo

Se o teste na interface não funcionar, você pode testar diretamente:

```bash
# Teste via curl
curl -X POST https://api.sdrjuridico.com.br/api/zapi/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "instanceId": "3EDAA0991A2272AFA1183EBEF7B316F4",
    "token": "147E1F8CFCAACFFE1799DFAE",
    "baseUrl": "https://api.z-api.io"
  }'
```

---

## 🎯 Próximos Passos

Após o teste funcionar:
1. ✅ Configure as variáveis no Railway
2. ✅ Configure o webhook no Z-API
3. ✅ Teste enviando uma mensagem do WhatsApp
