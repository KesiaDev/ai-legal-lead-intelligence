-- CreateTable
CREATE TABLE IF NOT EXISTS "AgentPrompt" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "provider" TEXT NOT NULL DEFAULT 'OpenAI',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "temperature" DOUBLE PRECISION DEFAULT 0.4,
    "maxTokens" INTEGER DEFAULT 500,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "limits" JSONB,
    "tone" TEXT,
    "outputSchema" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentPrompt_tenantId_idx" ON "AgentPrompt"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentPrompt_type_idx" ON "AgentPrompt"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentPrompt_status_idx" ON "AgentPrompt"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AgentPrompt_tenantId_type_status_idx" ON "AgentPrompt"("tenantId", "type", "status");

-- CreateUniqueIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AgentPrompt_tenantId_type_version_key" ON "AgentPrompt"("tenantId", "type", "version");

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
