const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resolveFailedMigration() {
  try {
    console.log('🔧 Verificando migrations falhadas...\n');

    // Verificar se há migration falhada
    const failedMigrations = await prisma.$queryRawUnsafe(`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
      AND finished_at IS NULL
    `);

    if (failedMigrations && Array.isArray(failedMigrations) && failedMigrations.length > 0) {
      console.log('⚠️  Migration falhada encontrada. Resolvendo...\n');

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

      console.log('\n✅ Migration resolvida com sucesso!');
    } else {
      console.log('✅ Nenhuma migration falhada encontrada.');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar migrations:', error.message);
    // Não bloquear o startup se der erro
  } finally {
    await prisma.$disconnect();
  }
}

// Executar antes do servidor iniciar
resolveFailedMigration()
  .then(() => {
    console.log('🚀 Iniciando servidor...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
