# 🔧 SOLUÇÃO COMPLETA: Erro ao Salvar API do OpenAI

## 🚨 Problema Identificado

O salvamento da API do OpenAI está falhando com erro **500** devido a múltiplos problemas:

1. ❌ **Frontend usando URL antiga** - `sdradvogados.up.railway.app` em vez de `api.sdrjuridico.com.br`
2. ❌ **Backend priorizando variável de ambiente** - Ignora chave salva no banco
3. ❌ **Prisma Client desatualizado** - Tabela `IntegrationConfig` pode não estar no Prisma Client
4. ❌ **Migrations não aplicadas** - Tabela pode não existir no banco

---

## ✅ Correções Implementadas

### **1. Backend Prioriza Banco sobre Variável de Ambiente**

**Arquivo:** `backend/src/services/agent.service.ts`

**Mudança:**
- ✅ **ANTES:** Primeiro tentava `process.env.OPENAI_API_KEY`, depois banco
- ✅ **AGORA:** Primeiro tenta banco (por tenant), depois variável de ambiente (fallback global)

**Por quê?**
- Permite que cada cliente tenha sua própria chave OpenAI
- Variável de ambiente é apenas fallback global
- Ignora placeholder `sua-chave-aqui` da variável de ambiente

**Código:**
```typescript
// PRIORIDADE 1: Banco por tenant
if (tenantId) {
  const config = await this.prisma.integrationConfig.findUnique({...});
  if (config?.openaiApiKey) {
    return config.openaiApiKey; // ✅ Usa chave do banco
  }
}

// PRIORIDADE 2: Variável de ambiente (fallback)
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sua-chave-aqui') {
  return process.env.OPENAI_API_KEY; // ✅ Fallback global
}
```

---

### **2. Tratamento Robusto de Erros**

**Arquivo:** `backend/src/api/integrations.routes.ts`

**Melhorias:**
- ✅ Detecta erro "tabela não existe" e retorna 503 com mensagem clara
- ✅ Detecta erro de constraint (duplicado) e retorna 409
- ✅ Detecta erro de conexão e retorna 503
- ✅ Logs detalhados para debug
- ✅ Mensagens de erro específicas por tipo de problema

**Código:**
```typescript
catch (error: any) {
  // Erro de tabela não existe
  if (error.message?.includes('does not exist') || error.code === 'P2021') {
    return reply.status(503).send({
      error: 'Tabela não encontrada',
      message: 'O backend precisa ser reiniciado para aplicar migrations.',
      code: 'MIGRATION_PENDING',
    });
  }
  // ... outros tratamentos
}
```

---

### **3. Verificação de Tabela Antes de Operações**

**Arquivo:** `backend/src/api/integrations.routes.ts`

**Melhorias:**
- ✅ Verifica se tabela existe antes de `findUnique`
- ✅ Verifica se tabela existe antes de `create`
- ✅ Retorna erro 503 claro se tabela não existir
- ✅ Evita erros 500 genéricos

---

## 🔍 Diagnóstico do Problema

### **Sintomas:**
- ❌ Erro 500 ao salvar OpenAI API key
- ❌ Console mostra: `Failed sdradvogados.up.railway.app/api/integrations:1`
- ❌ Mensagem: "Erro no servidor. A migration pode não ter sido aplicada ainda."

### **Causas Possíveis:**

1. **Frontend usando URL antiga:**
   - Variável `VITE_API_URL` não configurada no Railway (Frontend)
   - Cache do navegador usando código antigo

2. **Backend com Prisma Client desatualizado:**
   - Migration não foi aplicada no último deploy
   - Prisma Client foi gerado antes da migration

3. **Tabela não existe no banco:**
   - Migration falhou silenciosamente
   - Banco foi resetado sem aplicar migrations

---

## 🛠️ Solução Passo a Passo

### **PASSO 1: Verificar e Corrigir Frontend (Railway)**

1. **Acesse Railway Dashboard**
2. **Vá para service "SDR Advogados Front"**
3. **Clique em "Variables"**
4. **Verifique `VITE_API_URL`:**
   - ✅ Deve ser: `https://api.sdrjuridico.com.br`
   - ❌ NÃO deve ser: `sdradvogados.up.railway.app`

5. **Se estiver errado:**
   - Clique nos 3 pontinhos (⋮) → "Edit"
   - Altere para: `https://api.sdrjuridico.com.br`
   - Salve

6. **Force redeploy:**
   - Vá em "Deployments"
   - Clique nos 3 pontinhos (⋮) do último deployment
   - Selecione "Redeploy"
   - Aguarde 3-5 minutos

---

### **PASSO 2: Verificar e Reiniciar Backend (Railway)**

1. **Acesse Railway Dashboard**
2. **Vá para service "SDR Advogados" (Backend)**
3. **Verifique logs:**
   - Procure por: `Running migrations...`
   - Procure por: `Migration 20250124000000_add_integration_config applied`
   - Se não aparecer, migration não foi aplicada

4. **Force restart do backend:**
   - Vá em "Settings"
   - Clique em "Restart"
   - Aguarde 2-3 minutos

5. **Verifique logs após restart:**
   - Deve aparecer: `prisma migrate deploy` executando
   - Deve aparecer: `prisma generate` executando
   - Deve aparecer: `Server listening on port 3001`

---

### **PASSO 3: Verificar Tabela no Banco**

1. **Acesse Railway Dashboard**
2. **Vá para service "Postgres"**
3. **Clique em "Query"**
4. **Execute:**

```sql
-- Verificar se tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'IntegrationConfig';

-- Se retornar vazio, tabela não existe
-- Se retornar 'IntegrationConfig', tabela existe ✅
```

5. **Se tabela NÃO existe:**
   - Backend precisa ser reiniciado (PASSO 2)
   - Ou aplicar migration manualmente (veja PASSO 4)

---

### **PASSO 4: Aplicar Migration Manualmente (Se Necessário)**

**Se a tabela não existe e o restart não funcionou:**

1. **Acesse Railway Dashboard → Postgres → Query**
2. **Execute o SQL da migration:**

```sql
-- Criar tabela IntegrationConfig
CREATE TABLE IF NOT EXISTS "IntegrationConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "openaiApiKey" TEXT,
    "n8nWebhookUrl" TEXT,
    "evolutionApiUrl" TEXT,
    "evolutionApiKey" TEXT,
    "evolutionInstance" TEXT,
    "zapiInstanceId" TEXT,
    "zapiToken" TEXT,
    "zapiBaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntegrationConfig_pkey" PRIMARY KEY ("id")
);

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationConfig_tenantId_key" ON "IntegrationConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "IntegrationConfig_tenantId_idx" ON "IntegrationConfig"("tenantId");

-- Adicionar foreign key
ALTER TABLE "IntegrationConfig" 
ADD CONSTRAINT "IntegrationConfig_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
```

3. **Reinicie o backend** (PASSO 2)

---

### **PASSO 5: Limpar Cache do Navegador**

1. **Limpe cache:**
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Marque "Imagens e arquivos em cache"
   - Clique em "Limpar"

2. **Ou use Modo Anônimo:**
   - `Ctrl + Shift + N` (Chrome)
   - Teste em modo anônimo

3. **Hard refresh:**
   - `Ctrl + Shift + R`

---

### **PASSO 6: Testar Salvamento**

1. **Acesse:** Configurações → Integrações → OpenAI
2. **Cole a API Key:** `sk-...`
3. **Clique em "Salvar"**
4. **Verifique:**
   - ✅ Deve aparecer: "Configurações salvas!" (verde)
   - ❌ NÃO deve aparecer: "Erro no servidor" (vermelho)

5. **Verifique console (F12):**
   - ✅ Deve mostrar: `Enviando payload para salvar integrações`
   - ✅ Deve mostrar: `Resposta do servidor: { success: true }`
   - ❌ NÃO deve mostrar: `Failed sdradvogados.up.railway.app`

6. **Verifique Network (F12 → Network):**
   - ✅ URL deve ser: `https://api.sdrjuridico.com.br/api/integrations`
   - ✅ Status deve ser: `200 OK`
   - ❌ NÃO deve ser: `500 Internal Server Error`

---

## 🧪 Verificação Final

### **1. Verificar se Salvou no Banco**

No console do navegador (F12):

```javascript
const token = localStorage.getItem('auth_token');
fetch('https://api.sdrjuridico.com.br/api/integrations/verify', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('Status:', data);
  if (data.status.openai.hasValue) {
    console.log('✅ OpenAI: SALVO NO BANCO!');
  } else {
    console.log('❌ OpenAI: NÃO SALVO');
  }
});
```

### **2. Verificar Logs do Backend**

Railway → Backend → Logs:

Procure por:
- ✅ `Recebendo dados para atualizar integrações`
- ✅ `OpenAI API Key será atualizada (hasValue: true)`
- ✅ `Configurações de integração atualizadas com sucesso`

Se aparecer:
- ❌ `CRÍTICO: Tabela IntegrationConfig não existe` → Backend precisa reiniciar

---

## 📋 Checklist de Correção

- [ ] Frontend: `VITE_API_URL` configurada corretamente no Railway
- [ ] Frontend: Redeploy realizado
- [ ] Backend: Restart realizado
- [ ] Backend: Logs mostram migrations aplicadas
- [ ] Banco: Tabela `IntegrationConfig` existe
- [ ] Navegador: Cache limpo
- [ ] Teste: Salvamento funciona sem erro 500
- [ ] Teste: Verificação mostra `hasValue: true`

---

## 🎯 Resultado Esperado

Após todas as correções:

1. ✅ Frontend usa URL correta (`api.sdrjuridico.com.br`)
2. ✅ Backend prioriza banco sobre variável de ambiente
3. ✅ Tabela `IntegrationConfig` existe e é reconhecida
4. ✅ Salvamento funciona sem erro 500
5. ✅ Chave OpenAI é salva no banco por tenant
6. ✅ Agente IA usa chave do banco (não da variável de ambiente)

---

## 🚨 Se Ainda Não Funcionar

### **Verificar Logs Detalhados:**

1. **Backend Logs (Railway):**
   - Procure por erros específicos
   - Verifique se Prisma Client foi regenerado
   - Verifique se migrations foram aplicadas

2. **Frontend Console (F12):**
   - Verifique URL das requisições
   - Verifique erros de CORS
   - Verifique erros de autenticação

3. **Network Tab (F12 → Network):**
   - Verifique status code das requisições
   - Verifique payload enviado
   - Verifique resposta do servidor

---

## 📝 Notas Importantes

1. **Variável de Ambiente `OPENAI_API_KEY` no Railway:**
   - Pode ser removida ou deixada como fallback global
   - Se tiver valor placeholder `sua-chave-aqui`, será ignorada
   - Chave do banco sempre tem prioridade

2. **Multi-Tenancy:**
   - Cada tenant pode ter sua própria chave OpenAI
   - Chave é salva por tenant no banco
   - Agente IA busca chave do tenant do lead

3. **Migrations:**
   - Devem ser aplicadas automaticamente no start do backend
   - Se falharem, backend retorna erro 503 claro
   - Reiniciar backend geralmente resolve

---

**Última atualização:** 2026-01-27
**Status:** Correções implementadas, aguardando deploy e testes
