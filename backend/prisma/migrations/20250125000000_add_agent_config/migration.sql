-- CreateTable
CREATE TABLE IF NOT EXISTS "AgentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "communicationConfig" JSONB,
    "followUpConfig" JSONB,
    "scheduleConfig" JSONB,
    "humanizationConfig" JSONB,
    "knowledgeBase" JSONB,
    "intentions" JSONB,
    "templates" JSONB,
    "funnelStages" JSONB,
    "lawyers" JSONB,
    "rotationRules" JSONB,
    "reminders" JSONB,
    "eventConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AgentConfig_tenantId_key" ON "AgentConfig"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentConfig_tenantId_idx" ON "AgentConfig"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentConfig_isActive_idx" ON "AgentConfig"("isActive");

-- AddForeignKey
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
