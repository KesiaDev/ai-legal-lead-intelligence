# 🚀 Aplicar Migration VoiceConfig - Passo a Passo Rápido

## ⚠️ Você NÃO precisa executar `npm run db:migrate` localmente!

O erro acontece porque o banco está no Railway, não na sua máquina.

---

## ✅ Solução Rápida (2 minutos)

### **Passo 1: Acessar Railway**
1. Acesse: https://railway.app
2. Faça login
3. Abra o projeto **SDR Advogados**

### **Passo 2: Abrir Banco de Dados**
1. Clique no serviço do **PostgreSQL** (banco de dados)
2. Clique em **"Query"** ou **"Connect"**

### **Passo 3: Executar SQL**
Cole e execute este SQL:

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

### **Passo 4: Verificar**
Execute:
```sql
SELECT * FROM "VoiceConfig" LIMIT 1;
```

**Se não der erro:** ✅ Tabela criada!  
**Se der erro "relation does not exist":** ❌ Tente novamente

---

## 🎯 Pronto!

Depois disso, a integração do ElevenLabs estará funcionando! 🎉
