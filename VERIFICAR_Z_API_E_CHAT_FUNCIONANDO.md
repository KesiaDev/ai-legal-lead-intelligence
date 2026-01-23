# Verificar Z-API e Chat Funcionando

## Problema Identificado

A integração Z-API não estava aparecendo na seção "Canais de Comunicação" e o chat não estava funcionando.

## Correções Implementadas

### 1. Exibição da Z-API nos Canais de Comunicação

✅ **Atualizado:** `src/components/agent/sections/AgentConfigSection.tsx`

- Agora busca integrações do backend automaticamente
- Mostra Z-API se estiver configurada (`zapiInstanceId` e `zapiToken`)
- Exibe badge "Conectado" quando a integração está ativa
- Botão "Configurar" redireciona para as configurações

### 2. Como Verificar se Está Funcionando

#### Passo 1: Verificar Configuração Z-API

1. Acesse: **Configurações → Integrações → Z-API**
2. Verifique se:
   - ✅ ID da Instância está preenchido
   - ✅ Token está preenchido
   - ✅ Teste de conexão retorna "Conectado"

#### Passo 2: Verificar Canais de Comunicação

1. Acesse: **Agente → Configurações → Canais de Comunicação**
2. Deve aparecer:
   - ✅ **WhatsApp - Z-API** com badge "Conectado"
   - Tags: `Z-API`, `WhatsApp`, `Mensagens`

#### Passo 3: Verificar Webhook Z-API

1. Acesse o painel do Z-API
2. Verifique se o webhook está configurado:
   - URL: `https://api.sdrjuridico.com.br/api/webhooks/zapi`
   - Campo: "Ao receber"

#### Passo 4: Verificar Variáveis de Ambiente (Railway)

No Railway (Backend), verifique se existem:
- ✅ `ZAPI_INSTANCE_ID` = ID da instância
- ✅ `ZAPI_TOKEN` = Token da instância
- ✅ `ZAPI_BASE_URL` = `https://api.z-api.io` (opcional)

#### Passo 5: Testar Recebimento de Mensagem

1. Envie uma mensagem de WhatsApp para o número conectado ao Z-API
2. Verifique os logs do Railway:
   ```bash
   # Deve aparecer:
   "Webhook Z-API recebido"
   "Tenant identificado para Z-API"
   "Processando mensagem com agente IA"
   ```

3. Verifique se a conversa aparece:
   - Acesse: **Conversas**
   - Deve aparecer uma nova conversa com o lead

#### Passo 6: Verificar Resposta do Agente

1. O agente deve responder automaticamente
2. Verifique se:
   - ✅ Mensagem foi salva no banco
   - ✅ Agente processou com OpenAI (se configurado)
   - ✅ Resposta foi enviada via Z-API

## Troubleshooting

### ❌ Z-API não aparece nos Canais

**Causa:** Integração não configurada no banco

**Solução:**
1. Acesse: **Configurações → Integrações → Z-API**
2. Preencha ID da Instância e Token
3. Clique em "Salvar"
4. Recarregue a página de Canais de Comunicação

### ❌ Chat não mostra conversas

**Causa:** Mensagens não estão sendo processadas

**Verificações:**
1. ✅ Webhook Z-API está configurado corretamente?
2. ✅ Variáveis de ambiente no Railway estão corretas?
3. ✅ Logs do Railway mostram erro?
4. ✅ OpenAI está configurado? (necessário para o agente responder)

**Solução:**
1. Verifique os logs do Railway:
   ```bash
   # Railway → Backend → Logs
   # Procure por erros relacionados a:
   # - "Z-API não configurada"
   # - "Erro ao processar webhook"
   # - "OpenAI API key não encontrada"
   ```

2. Teste o webhook manualmente:
   ```bash
   curl -X POST https://api.sdrjuridico.com.br/api/webhooks/zapi \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "5511999999999",
       "message": "Olá, preciso de ajuda",
       "type": "text"
     }'
   ```

### ❌ Agente não responde

**Causa:** OpenAI não configurado ou erro no processamento

**Verificações:**
1. ✅ OpenAI API Key está configurada? (Configurações → Integrações → OpenAI)
2. ✅ API Key está salva no banco? (verificar tabela `IntegrationConfig`)
3. ✅ Logs mostram erro do OpenAI?

**Solução:**
1. Configure OpenAI:
   - Acesse: **Configurações → Integrações → OpenAI**
   - Cole a API Key
   - Clique em "Salvar"
   - Verifique se aparece "Conectado"

2. Verifique os logs:
   ```bash
   # Deve aparecer:
   "Processando conversa com OpenAI"
   "Resposta gerada com sucesso"
   ```

## Checklist Completo

- [ ] Z-API configurada em Configurações → Integrações
- [ ] Z-API aparece em Canais de Comunicação com badge "Conectado"
- [ ] Webhook configurado no painel Z-API
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] OpenAI configurado e salvo no banco
- [ ] Teste de mensagem: enviar WhatsApp e verificar resposta
- [ ] Conversa aparece em "Conversas"
- [ ] Mensagens são salvas no banco
- [ ] Agente responde automaticamente

## Próximos Passos

Após verificar tudo acima:

1. **Teste completo:**
   - Envie uma mensagem de WhatsApp
   - Verifique se aparece em "Conversas"
   - Verifique se o agente respondeu
   - Verifique se a resposta foi enviada

2. **Se ainda não funcionar:**
   - Verifique os logs do Railway
   - Verifique os logs do Z-API
   - Teste o webhook manualmente (curl)
   - Verifique se o banco de dados está acessível
