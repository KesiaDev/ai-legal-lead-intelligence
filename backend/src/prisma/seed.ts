/**
 * Seed script para popular banco com dados iniciais
 * 
 * Execute com: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Criar tenant de exemplo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Escritório Exemplo',
      plan: 'pro',
    },
  });

  console.log('✅ Tenant criado:', tenant.id);

  // Criar usuário admin
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'admin@exemplo.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar estágios do pipeline
  const stages = [
    { name: 'Novo Lead', order: 1, color: '#3b82f6', description: 'Lead acabou de entrar' },
    { name: 'Em Triagem', order: 2, color: '#f59e0b', description: 'Sendo qualificado pela IA' },
    { name: 'Qualificado', order: 3, color: '#10b981', description: 'Pronto para atendimento' },
    { name: 'Consulta Agendada', order: 4, color: '#8b5cf6', description: 'Reunião marcada' },
    { name: 'Compareceu', order: 5, color: '#06b6d4', description: 'Lead compareceu à consulta' },
    { name: 'Contrato Enviado', order: 6, color: '#ec4899', description: 'Aguardando assinatura' },
    { name: 'Contrato Assinado', order: 7, color: '#10b981', description: 'Cliente convertido' },
    { name: 'Perdido', order: 8, color: '#ef4444', description: 'Lead desqualificado' },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.create({
      data: {
        tenantId: tenant.id,
        ...stage,
      },
    });
  }

  console.log('✅ Estágios do pipeline criados');

  console.log('🎉 Seed completo!');
  console.log('\n📧 Login: admin@exemplo.com');
  console.log('🔑 Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
