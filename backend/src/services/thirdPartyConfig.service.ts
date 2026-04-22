/**
 * Helper para buscar configurações de integrações de terceiros armazenadas no DB
 * e retornar instâncias prontas dos respectivos services.
 */

import prismaClient from '../config/database';
import { PipedriveService } from './pipedrive.service';
import { ChatGuruService } from './chatguru.service';

// Cast necessário até que `prisma generate` seja executado com o schema atualizado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = prismaClient as any;

/**
 * Busca a config de uma integração ativa para o tenant.
 * Retorna o campo `config` como Record<string, string> ou null se não encontrado.
 */
export async function getIntegrationConfig(
  tenantId: string,
  provider: string,
): Promise<Record<string, string> | null> {
  try {
    const integration = await prisma.userIntegration.findFirst({
      where: {
        tenantId,
        provider,
        isActive: true,
      },
    });

    if (!integration) return null;

    const config = integration.config;

    // config é Json no Prisma — garantir que é um objeto plano
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      throw new Error(
        `Config da integração ${provider} para tenant ${tenantId} não é um objeto válido`,
      );
    }

    return config as Record<string, string>;
  } catch (err) {
    throw new Error(
      `Erro ao buscar config da integração ${provider} para tenant ${tenantId}: ${(err as Error).message}`,
    );
  }
}

/**
 * Retorna uma instância de PipedriveService configurada para o tenant,
 * ou null se a integração não existir / estiver inativa.
 *
 * O config do Pipedrive deve conter: { apiToken: string }
 */
export async function getPipedriveClient(tenantId: string): Promise<PipedriveService | null> {
  const config = await getIntegrationConfig(tenantId, 'pipedrive');

  if (!config) return null;

  const { apiToken } = config;

  if (!apiToken) {
    throw new Error(
      `Config do Pipedrive para tenant ${tenantId} está incompleta: campo apiToken ausente`,
    );
  }

  return new PipedriveService(apiToken);
}

/**
 * Retorna uma instância de ChatGuruService configurada para o tenant,
 * ou null se a integração não existir / estiver inativa.
 *
 * O config do ChatGuru deve conter: { apiKey: string, channelId: string }
 */
export async function getChatguruClient(tenantId: string): Promise<ChatGuruService | null> {
  const config = await getIntegrationConfig(tenantId, 'chatguru');

  if (!config) return null;

  const { apiKey, channelId } = config;

  if (!apiKey || !channelId) {
    throw new Error(
      `Config do ChatGuru para tenant ${tenantId} está incompleta: campos apiKey e/ou channelId ausentes`,
    );
  }

  return new ChatGuruService(apiKey, channelId);
}
