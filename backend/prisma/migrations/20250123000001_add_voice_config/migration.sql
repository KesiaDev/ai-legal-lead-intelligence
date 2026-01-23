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
