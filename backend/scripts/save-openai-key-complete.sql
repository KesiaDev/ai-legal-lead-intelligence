-- Script SQL completo para salvar chave da OpenAI para o usuário kesiawnandi
-- Execute este script no Query Editor do Railway PostgreSQL

-- Passo 1: Encontrar o usuário e seu tenantId
DO $$
DECLARE
    v_tenant_id TEXT;
    v_user_email TEXT;
    v_user_name TEXT;
BEGIN
    -- Buscar tenantId do usuário kesiawnandi
    SELECT 
        u."tenantId",
        u.email,
        u.name
    INTO 
        v_tenant_id,
        v_user_email,
        v_user_name
    FROM "User" u
    WHERE 
        u.email ILIKE '%kesiawnandi%' 
        OR u.name ILIKE '%kesiawnandi%'
    LIMIT 1;

    -- Verificar se encontrou o usuário
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Usuário kesiawnandi não encontrado';
    END IF;

    -- Mostrar informações encontradas
    RAISE NOTICE 'Usuário encontrado: % (%)', v_user_name, v_user_email;
    RAISE NOTICE 'Tenant ID: %', v_tenant_id;

    -- Fazer upsert da chave da OpenAI
    INSERT INTO "IntegrationConfig" (
        "id",
        "tenantId",
        "openaiApiKey",
        "n8nWebhookUrl",
        "evolutionApiUrl",
        "evolutionApiKey",
        "evolutionInstance",
        "zapiInstanceId",
        "zapiToken",
        "zapiBaseUrl",
        "createdAt",
        "updatedAt"
    )
    VALUES (
        gen_random_uuid(),
        v_tenant_id,
        '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',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'https://api.z-api.io',
        NOW(),
        NOW()
    )
    ON CONFLICT ("tenantId") 
    DO UPDATE SET 
        "openaiApiKey" = EXCLUDED."openaiApiKey",
        "updatedAt" = NOW();

    RAISE NOTICE 'Chave da OpenAI salva com sucesso para o tenant %', v_tenant_id;
END $$;

-- Verificar se foi salvo corretamente
SELECT 
    ic."tenantId",
    t.name as tenant_name,
    u.email as user_email,
    u.name as user_name,
    CASE 
        WHEN ic."openaiApiKey" IS NOT NULL THEN '***' || RIGHT(ic."openaiApiKey", 4)
        ELSE 'NULL'
    END as openai_key_preview,
    ic."updatedAt"
FROM "IntegrationConfig" ic
JOIN "Tenant" t ON ic."tenantId" = t.id
JOIN "User" u ON u."tenantId" = t.id
WHERE 
    u.email ILIKE '%kesiawnandi%' 
    OR u.name ILIKE '%kesiawnandi%'
LIMIT 1;
