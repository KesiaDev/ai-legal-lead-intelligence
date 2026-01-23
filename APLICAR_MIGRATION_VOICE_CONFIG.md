# 🗄️ Como Aplicar Migration de VoiceConfig no Railway

## ⚠️ Importante

**NÃO execute `npm run db:migrate` localmente!** 

O banco de dados está no Railway e a URL `postgres.railway.internal:5432` só funciona dentro da rede do Railway.

---

## ✅ Opção 1: Railway Executa Automaticamente (Recomendado)

O Railway **executa migrations automaticamente** quando você faz deploy!

**O que acontece:**
1. Você faz commit e push
2. Railway detecta mudanças
3. Railway executa `npm run db:migrate` automaticamente
4. Migration é aplicada

**Verificar se funcionou:**
1. Acesse o Railway
2. Abra o serviço do **backend**
3. Vá em **Deploy Logs**
4. Procure por: `"Running migrations..."` ou `"No pending migrations"`

---

## ✅ Opção 2: Aplicar Manualmente via Railway CLI

Se a migration automática não funcionou:

### **Passo 1: Instalar Railway CLI**
```bash
npm install -g @railway/cli
```

### **Passo 2: Fazer Login**
```bash
railway login
```

### **Passo 3: Conectar ao Projeto**
```bash
railway link
```

### **Passo 4: Aplicar Migration**
```bash
cd backend
railway run npm run db:migrate
```

---

## ✅ Opção 3: Executar SQL Diretamente no Railway

### **Passo 1: Acessar o Banco no Railway**
1. Acesse: https://railway.app
2. Abra o serviço do **banco de dados** (PostgreSQL)
3. Clique em **"Query"** ou **"Connect"**

### **Passo 2: Executar SQL**
Cole e execute o SQL da migration:

```sql
-- CreateTable
CREATE TABLE IF NOT EXISTS "VoiceConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'elevenlabs',
    "elevenlabsApiKey" TEXT,
    "voiceId" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "audioResponseProbabilityOnText" TEXT NOT NULL DEFAULT 'nunca',
    "audioResponseProbabilityOnAudio" TEXT NOT NULL DEFAULT 'alta',
    "audioResponseProbabilityOnMedia" TEXT NOT NULL DEFAULT 'baixa',
    "maxAudioDuration" INTEGER NOT NULL DEFAULT 60,
    "textToSpeechAdjustment" TEXT NOT NULL DEFAULT 'moderado',
    "textOnlyKeywords" JSONB DEFAULT '[]',
    "voiceStability" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "voiceSimilarityBoost" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "voiceStyle" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "voiceSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VoiceConfig_tenantId_idx" ON "VoiceConfig"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "VoiceConfig_enabled_idx" ON "VoiceConfig"("enabled");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "VoiceConfig_tenantId_key" ON "VoiceConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "VoiceConfig" ADD CONSTRAINT "VoiceConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### **Passo 3: Verificar**
```sql
SELECT * FROM "VoiceConfig" LIMIT 1;
```

Se não der erro, a tabela foi criada! ✅

---

## ✅ Opção 4: Usar o Endpoint de Fix Migration (Mais Fácil)

O backend já tem um endpoint para aplicar migrations manualmente!

### **Passo 1: Criar arquivo SQL**
Crie o arquivo `backend/fix-voice-migration.sql` com o conteúdo da migration.

### **Passo 2: Chamar o Endpoint**
```bash
curl -X POST https://api.sdrjuridico.com.br/api/fix-migration \
  -H "Content-Type: application/json" \
  -d '{"secret": "fix-migration-2026"}'
```

---

## 🎯 Recomendação

**Use a Opção 3 (SQL Direto no Railway)** - É a mais rápida e confiável!

1. Acesse Railway → Banco de Dados → Query
2. Cole o SQL da migration
3. Execute
4. Pronto! ✅

---

## ✅ Verificar se Funcionou

Execute no Railway (Query):
```sql
SELECT * FROM "VoiceConfig" LIMIT 1;
```

**Se não der erro:** Tabela criada com sucesso! ✅  
**Se der erro "relation does not exist":** Tabela ainda não foi criada ❌

---

**Depois que a migration for aplicada, a integração do ElevenLabs estará 100% funcional!** 🎉
