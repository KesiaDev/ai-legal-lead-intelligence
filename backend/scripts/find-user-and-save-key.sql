-- Script SQL para encontrar usuário e salvar chave da OpenAI
-- Execute este script no Prisma Studio ou no cliente PostgreSQL do Railway

-- 1. Primeiro, encontrar o usuário "kesiawnandi"
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u."tenantId",
  t.name as tenant_name
FROM "User" u
JOIN "Tenant" t ON u."tenantId" = t.id
WHERE 
  u.email ILIKE '%kesiawnandi%' 
  OR u.name ILIKE '%kesiawnandi%'
ORDER BY u."createdAt" DESC;

-- 2. Depois de encontrar o tenantId, execute este UPDATE (substitua <TENANT_ID> pelo ID encontrado):
-- 
-- INSERT INTO "IntegrationConfig" ("id", "tenantId", "openaiApiKey", "n8nWebhookUrl", "evolutionApiUrl", "evolutionApiKey", "evolutionInstance", "zapiInstanceId", "zapiToken", "zapiBaseUrl", "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid(),
--   '<TENANT_ID>',
--   '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',
--   NULL,
--   NULL,
--   NULL,
--   NULL,
--   NULL,
--   NULL,
--   'https://api.z-api.io',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT ("tenantId") 
-- DO UPDATE SET 
--   "openaiApiKey" = EXCLUDED."openaiApiKey",
--   "updatedAt" = NOW();

-- OU, se já existe registro, use apenas o UPDATE:
-- UPDATE "IntegrationConfig"
-- SET 
--   "openaiApiKey" = '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',
--   "updatedAt" = NOW()
-- WHERE "tenantId" = '<TENANT_ID>';
