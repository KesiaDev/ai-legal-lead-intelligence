const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resolveFailedMigration() {
  try {
    console.log('🔧 Verificando e resolvendo migrations falhadas...\n');
    
    // Conectar ao banco
    try {
      await prisma.$connect();
      console.log('✅ Conectado ao banco de dados');
    } catch (connectError: any) {
      console.error('❌ Erro ao conectar ao banco:', connectError.message);
      // Tentar continuar mesmo se não conectar (pode ser que o banco ainda não esteja pronto)
      return;
    }

    // Verificar se há migration falhada
    let failedMigrations: any[] = [];
    try {
      failedMigrations = await prisma.$queryRawUnsafe(`
        SELECT * FROM "_prisma_migrations" 
        WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
        AND finished_at IS NULL
      `) as any[];
    } catch (queryError: any) {
      console.log('⚠️  Erro ao verificar migrations (pode ser que a tabela não exista ainda):', queryError.message);
      // Continuar mesmo se der erro
    }

    if (failedMigrations && failedMigrations.length > 0) {
      console.log('⚠️  Migration falhada encontrada. Resolvendo...\n');

      // 1. Remover migration falhada
      try {
        await prisma.$executeRawUnsafe(`
          DELETE FROM "_prisma_migrations" 
          WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
          AND finished_at IS NULL
        `);
        console.log('✅ Migration falhada removida do histórico');
      } catch (deleteError: any) {
        console.log('⚠️  Erro ao remover migration falhada (continuando):', deleteError.message);
      }

      // Ler e executar o SQL de correção
      let sqlPath = path.join(__dirname, 'fix-migration-direct.sql');
      if (!fs.existsSync(sqlPath)) {
        sqlPath = path.join(__dirname, 'prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql');
      }

      if (!fs.existsSync(sqlPath)) {
        console.log('⚠️  Arquivo SQL não encontrado. Pulando correção automática.');
        return;
      }

      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

      console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.length > 0) {
          try {
            await prisma.$executeRawUnsafe(command);
            console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
          } catch (error) {
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('duplicate') ||
                error.message.includes('constraint')) {
              console.log(`⚠️  Comando ${i + 1}/${commands.length} ignorado (já existe)`);
            } else {
              console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            }
          }
        }
      }

      // 2. Criar tabelas se não existirem (apenas as que faltam)
      console.log('📝 Criando tabelas que faltam...\n');
      
      const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS "Pipeline" (
          "id" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "color" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Pipeline_pkey" PRIMARY KEY ("id")
        );
        
        CREATE TABLE IF NOT EXISTS "Deal" (
          "id" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "pipelineId" TEXT NOT NULL,
          "stageId" TEXT NOT NULL,
          "leadId" TEXT,
          "title" TEXT NOT NULL,
          "value" DOUBLE PRECISION,
          "currency" TEXT NOT NULL DEFAULT 'BRL',
          "crmId" TEXT,
          "crmType" TEXT,
          "crmData" JSONB,
          "assignedTo" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
        );
        
        CREATE TABLE IF NOT EXISTS "CrmIntegration" (
          "id" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "apiKey" TEXT,
          "apiSecret" TEXT,
          "apiUrl" TEXT,
          "workspaceId" TEXT,
          "syncDirection" TEXT NOT NULL DEFAULT 'bidirectional',
          "autoSync" BOOLEAN NOT NULL DEFAULT true,
          "syncInterval" INTEGER NOT NULL DEFAULT 3600,
          "fieldMapping" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "lastSyncAt" TIMESTAMP(3),
          CONSTRAINT "CrmIntegration_pkey" PRIMARY KEY ("id")
        );
      `;

      const createCommands = createTablesSQL.split(';').filter(cmd => cmd.trim().length > 0);
      for (const cmd of createCommands) {
        try {
          await prisma.$executeRawUnsafe(cmd.trim());
        } catch (err: any) {
          if (!err.message.includes('already exists')) {
            console.log('⚠️  Erro ao criar tabela (pode já existir):', err.message);
          }
        }
      }

      // 3. Adicionar colunas ao PipelineHistory
      try {
        await prisma.$executeRawUnsafe(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'PipelineHistory' AND column_name = 'dealId') THEN
              ALTER TABLE "PipelineHistory" ADD COLUMN "dealId" TEXT;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'PipelineHistory' AND column_name = 'pipelineStageId') THEN
              ALTER TABLE "PipelineHistory" ADD COLUMN "pipelineStageId" TEXT;
            END IF;
          END $$;
        `);
      } catch (err: any) {
        console.log('⚠️  Erro ao adicionar colunas (pode já existir)');
      }

      // 4. Marcar migration como aplicada
      await prisma.$executeRawUnsafe(`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
        SELECT 
          gen_random_uuid(),
          '',
          NOW(),
          '20250120000000_add_pipelines_and_deals',
          NULL,
          NULL,
          NOW(),
          1
        WHERE NOT EXISTS (
          SELECT 1 FROM "_prisma_migrations" 
          WHERE migration_name = '20250120000000_add_pipelines_and_deals' AND finished_at IS NOT NULL
        )
      `);

      console.log('\n✅ Migration resolvida e marcada como aplicada!');
    } else {
      console.log('✅ Nenhuma migration falhada encontrada.');
    }
  } catch (error: any) {
    console.error('❌ Erro ao verificar migrations:', error.message);
    // Não bloquear o startup se der erro
  } finally {
    await prisma.$disconnect();
  }
}

// Executar antes do servidor iniciar
resolveFailedMigration()
  .then(() => {
    console.log('✅ Pré-inicialização concluída\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('⚠️  Erro na pré-inicialização (continuando):', error.message);
    process.exit(0); // Não bloquear o startup
  });
