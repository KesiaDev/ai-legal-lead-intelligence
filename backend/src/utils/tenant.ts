import prisma from '../config/database';

/**
 * Busca ou cria tenant padrão
 */
export async function getOrCreateDefaultTenant(): Promise<string> {
  const NAME = 'Tenant Padrão SDR';

  let tenant = await prisma.tenant.findFirst({
    where: { name: NAME },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: NAME,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}

/**
 * Busca ou cria tenant baseado no clienteId
 * Se clienteId não for fornecido, usa tenant padrão
 */
export async function getOrCreateTenantByClienteId(clienteId?: string): Promise<string> {
  if (!clienteId) {
    return getOrCreateDefaultTenant();
  }

  // Busca tenant pelo clienteId (usando o ID do tenant como clienteId)
  let tenant = await prisma.tenant.findUnique({
    where: { id: clienteId },
  });

  if (!tenant) {
    // Se não existir, cria um novo tenant com o clienteId
    tenant = await prisma.tenant.create({
      data: {
        id: clienteId, // Usa clienteId como ID do tenant
        name: `Cliente ${clienteId}`,
        plan: 'free',
      },
    });
  }

  return tenant.id;
}
