/**
 * Script para salvar chave da OpenAI diretamente no banco de dados
 * 
 * Uso: node scripts/save-openai-key.js <email_ou_nome_usuario> <chave_openai>
 * Exemplo: node scripts/save-openai-key.js kesiawnandi sk-proj-...
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function saveOpenAIKey(userIdentifier, openaiKey) {
  try {
    console.log('🔍 Buscando usuário...');
    
    // Tentar buscar por email primeiro
    let user = await prisma.user.findUnique({
      where: { email: userIdentifier },
      include: { tenant: true },
    });

    // Se não encontrar por email, buscar por nome (contém)
    if (!user) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: userIdentifier, mode: 'insensitive' } },
            { name: { contains: userIdentifier, mode: 'insensitive' } },
          ],
        },
        include: { tenant: true },
      });

      if (users.length === 0) {
        throw new Error(`Usuário não encontrado: ${userIdentifier}`);
      }

      if (users.length > 1) {
        console.log('⚠️ Múltiplos usuários encontrados:');
        users.forEach((u, i) => {
          console.log(`  ${i + 1}. ${u.name} (${u.email}) - Tenant: ${u.tenant.name} (${u.tenantId})`);
        });
        throw new Error('Múltiplos usuários encontrados. Use o email completo.');
      }

      user = users[0];
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`   Tenant: ${user.tenant.name} (${user.tenantId})`);

    const tenantId = user.tenantId;

    console.log('💾 Salvando chave da OpenAI...');

    // Fazer upsert na IntegrationConfig
    const config = await prisma.integrationConfig.upsert({
      where: { tenantId },
      update: {
        openaiApiKey: openaiKey,
      },
      create: {
        tenantId,
        openaiApiKey: openaiKey,
        n8nWebhookUrl: null,
        evolutionApiUrl: null,
        evolutionApiKey: null,
        evolutionInstance: null,
        zapiInstanceId: null,
        zapiToken: null,
        zapiBaseUrl: 'https://api.z-api.io',
      },
    });

    console.log('✅ Chave da OpenAI salva com sucesso!');
    console.log(`   Tenant ID: ${tenantId}`);
    console.log(`   Chave (últimos 4 chars): ...${openaiKey.slice(-4)}`);

    return config;
  } catch (error) {
    console.error('❌ Erro ao salvar chave:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Uso: node scripts/save-openai-key.js <email_ou_nome_usuario> <chave_openai>');
  console.error('   Exemplo: node scripts/save-openai-key.js kesiawnandi sk-proj-...');
  process.exit(1);
}

const [userIdentifier, openaiKey] = args;

if (!openaiKey.startsWith('sk-')) {
  console.warn('⚠️ Aviso: A chave não parece ser uma chave válida da OpenAI (deve começar com "sk-")');
}

saveOpenAIKey(userIdentifier, openaiKey)
  .then(() => {
    console.log('✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
