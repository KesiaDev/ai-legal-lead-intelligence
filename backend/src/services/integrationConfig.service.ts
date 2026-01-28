/**
 * Serviço Centralizado de Configurações de Integração
 * 
 * Prioriza configurações do banco (por tenant) sobre variáveis de ambiente.
 * Permite configuração multi-tenant real.
 */

import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

export interface IntegrationConfig {
  openaiApiKey: string | null;
  evolutionApiUrl: string | null;
  evolutionApiKey: string | null;
  evolutionInstance: string | null;
  zapiInstanceId: string | null;
  zapiToken: string | null;
  zapiBaseUrl: string | null;
}

export interface IntegrationConfigWithSource extends IntegrationConfig {
  source: 'database' | 'environment' | 'mixed';
  details: {
    openaiApiKey?: 'database' | 'environment';
    evolutionApiUrl?: 'database' | 'environment';
    evolutionApiKey?: 'database' | 'environment';
    evolutionInstance?: 'database' | 'environment';
    zapiInstanceId?: 'database' | 'environment';
    zapiToken?: 'database' | 'environment';
    zapiBaseUrl?: 'database' | 'environment';
  };
}

export class IntegrationConfigService {
  private fastify: FastifyInstance;
  private prisma: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.prisma = fastify.prisma as PrismaClient;
  }

  /**
   * Obtém configurações de integração para um tenant
   * PRIORIDADE 1: Banco de dados (IntegrationConfig por tenantId)
   * PRIORIDADE 2: Variáveis de ambiente (fallback global)
   * 
   * @param tenantId - ID do tenant (opcional, se não fornecido usa apenas env vars)
   * @returns Configurações com indicação da fonte (banco ou env)
   */
  async getConfig(tenantId?: string): Promise<IntegrationConfigWithSource> {
    const config: IntegrationConfig = {
      openaiApiKey: null,
      evolutionApiUrl: null,
      evolutionApiKey: null,
      evolutionInstance: null,
      zapiInstanceId: null,
      zapiToken: null,
      zapiBaseUrl: null,
    };

    const details: IntegrationConfigWithSource['details'] = {};
    let source: 'database' | 'environment' | 'mixed' = 'environment';

    // PRIORIDADE 1: Buscar no banco por tenant
    if (tenantId) {
      try {
        const dbConfig = await this.prisma.integrationConfig.findUnique({
          where: { tenantId },
          select: {
            openaiApiKey: true,
            evolutionApiUrl: true,
            evolutionApiKey: true,
            evolutionInstance: true,
            zapiInstanceId: true,
            zapiToken: true,
            zapiBaseUrl: true,
          },
        });

        if (dbConfig) {
          // Usar valores do banco se existirem e não forem vazios/null
          if (dbConfig.openaiApiKey && dbConfig.openaiApiKey.trim() !== '' && dbConfig.openaiApiKey !== 'null') {
            config.openaiApiKey = dbConfig.openaiApiKey;
            details.openaiApiKey = 'database';
          }
          if (dbConfig.evolutionApiUrl && dbConfig.evolutionApiUrl.trim() !== '' && dbConfig.evolutionApiUrl !== 'null') {
            config.evolutionApiUrl = dbConfig.evolutionApiUrl;
            details.evolutionApiUrl = 'database';
          }
          if (dbConfig.evolutionApiKey && dbConfig.evolutionApiKey.trim() !== '' && dbConfig.evolutionApiKey !== 'null') {
            config.evolutionApiKey = dbConfig.evolutionApiKey;
            details.evolutionApiKey = 'database';
          }
          if (dbConfig.evolutionInstance && dbConfig.evolutionInstance.trim() !== '' && dbConfig.evolutionInstance !== 'null') {
            config.evolutionInstance = dbConfig.evolutionInstance;
            details.evolutionInstance = 'database';
          }
          if (dbConfig.zapiInstanceId && dbConfig.zapiInstanceId.trim() !== '' && dbConfig.zapiInstanceId !== 'null') {
            config.zapiInstanceId = dbConfig.zapiInstanceId;
            details.zapiInstanceId = 'database';
          }
          if (dbConfig.zapiToken && dbConfig.zapiToken.trim() !== '' && dbConfig.zapiToken !== 'null') {
            config.zapiToken = dbConfig.zapiToken;
            details.zapiToken = 'database';
          }
          if (dbConfig.zapiBaseUrl && dbConfig.zapiBaseUrl.trim() !== '' && dbConfig.zapiBaseUrl !== 'null') {
            config.zapiBaseUrl = dbConfig.zapiBaseUrl;
            details.zapiBaseUrl = 'database';
          }
        }
      } catch (error: any) {
        // Se erro for "tabela não existe", logar mas continuar para fallback
        if (error.message?.includes('does not exist') || error.code === 'P2021') {
          this.fastify.log.warn({ tenantId, error: error.message }, 'Tabela IntegrationConfig não existe ainda - usando fallback env vars');
        } else {
          this.fastify.log.warn({ error, tenantId }, 'Erro ao buscar configurações do banco - usando fallback env vars');
        }
      }
    }

    // PRIORIDADE 2: Fallback para variáveis de ambiente (apenas se não houver no banco)
    if (!config.openaiApiKey && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && process.env.OPENAI_API_KEY !== 'sua-chave-aqui') {
      config.openaiApiKey = process.env.OPENAI_API_KEY;
      details.openaiApiKey = 'environment';
    }
    if (!config.evolutionApiUrl && process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_URL.trim() !== '') {
      config.evolutionApiUrl = process.env.EVOLUTION_API_URL;
      details.evolutionApiUrl = 'environment';
    }
    if (!config.evolutionApiKey && process.env.EVOLUTION_API_KEY && process.env.EVOLUTION_API_KEY.trim() !== '') {
      config.evolutionApiKey = process.env.EVOLUTION_API_KEY;
      details.evolutionApiKey = 'environment';
    }
    if (!config.evolutionInstance && process.env.EVOLUTION_INSTANCE && process.env.EVOLUTION_INSTANCE.trim() !== '') {
      config.evolutionInstance = process.env.EVOLUTION_INSTANCE;
      details.evolutionInstance = 'environment';
    }
    if (!config.zapiInstanceId && process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_INSTANCE_ID.trim() !== '') {
      config.zapiInstanceId = process.env.ZAPI_INSTANCE_ID;
      details.zapiInstanceId = 'environment';
    }
    if (!config.zapiToken && process.env.ZAPI_TOKEN && process.env.ZAPI_TOKEN.trim() !== '') {
      config.zapiToken = process.env.ZAPI_TOKEN;
      details.zapiToken = 'environment';
    }
    if (!config.zapiBaseUrl && process.env.ZAPI_BASE_URL && process.env.ZAPI_BASE_URL.trim() !== '') {
      config.zapiBaseUrl = process.env.ZAPI_BASE_URL;
      details.zapiBaseUrl = 'environment';
    } else if (!config.zapiBaseUrl) {
      // Default para Z-API
      config.zapiBaseUrl = 'https://api.z-api.io';
      details.zapiBaseUrl = 'environment';
    }

    // Determinar fonte principal
    const hasDatabaseConfig = Object.values(details).some(d => d === 'database');
    const hasEnvironmentConfig = Object.values(details).some(d => d === 'environment');
    
    if (hasDatabaseConfig && hasEnvironmentConfig) {
      source = 'mixed';
    } else if (hasDatabaseConfig) {
      source = 'database';
    } else {
      source = 'environment';
    }

    // Log da fonte das configurações
    if (tenantId) {
      this.fastify.log.info({
        tenantId,
        source,
        details,
        hasOpenAI: !!config.openaiApiKey,
        hasEvolution: !!(config.evolutionApiUrl && config.evolutionApiKey && config.evolutionInstance),
        hasZApi: !!(config.zapiInstanceId && config.zapiToken),
      }, 'Configurações de integração carregadas');
    }

    return {
      ...config,
      source,
      details,
    };
  }

  /**
   * Verifica se uma configuração específica está disponível
   */
  async isConfigured(type: 'openai' | 'evolution' | 'zapi', tenantId?: string): Promise<boolean> {
    const config = await this.getConfig(tenantId);
    
    switch (type) {
      case 'openai':
        return !!config.openaiApiKey;
      case 'evolution':
        return !!(config.evolutionApiUrl && config.evolutionApiKey && config.evolutionInstance);
      case 'zapi':
        return !!(config.zapiInstanceId && config.zapiToken);
      default:
        return false;
    }
  }
}
