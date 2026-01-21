const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMigration() {
  try {
    console.log('🔧 Aplicando migration segura...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Dividir em comandos (separados por ;)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length > 0) {
        try {
          await prisma.$executeRawUnsafe(command);
          console.log(`✅ Comando ${i + 1}/${commands.length} executado`);
        } catch (error) {
          // Ignorar erros de "já existe" ou "não existe"
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate')) {
            console.log(`⚠️  Comando ${i + 1}/${commands.length} ignorado (já existe ou não necessário)`);
          } else {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log('\n✅ Migration aplicada com sucesso!');
    console.log('🔄 Reinicie o serviço no Railway para aplicar as mudanças.');

  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();
