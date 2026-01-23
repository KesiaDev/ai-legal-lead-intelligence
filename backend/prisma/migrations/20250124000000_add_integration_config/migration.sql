-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "IntegrationConfig_tenantId_key" ON "IntegrationConfig"("tenantId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntegrationConfig_tenantId_idx" ON "IntegrationConfig"("tenantId");

-- AddForeignKey
ALTER TABLE "IntegrationConfig" ADD CONSTRAINT "IntegrationConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
