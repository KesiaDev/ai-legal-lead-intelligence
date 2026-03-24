/**
 * Apify Service
 * Integração com Apify para raspagem automática de leads
 */

import axios from 'axios';

export interface ApifyLeadResult {
  nome?: string;
  name?: string;
  email?: string;
  telefone?: string;
  phone?: string;
  empresa?: string;
  company?: string;
  cargo?: string;
  position?: string;
  descricao?: string;
  description?: string;
  url?: string;
  fonte?: string;
  source?: string;
  [key: string]: any;
}

export interface ApifyRunOptions {
  actorId: string;
  apiKey: string;
  input: Record<string, any>;
  waitForFinish?: number; // segundos para aguardar (0 = não aguardar)
}

export class ApifyService {
  private readonly baseUrl = 'https://api.apify.com/v2';

  /**
   * Inicia um actor do Apify e retorna o ID do run
   */
  async runActor(options: ApifyRunOptions): Promise<{ runId: string; datasetId: string }> {
    const { actorId, apiKey, input, waitForFinish = 0 } = options;

    const params: Record<string, any> = {};
    if (waitForFinish > 0) {
      params.waitForFinish = waitForFinish;
    }

    const response = await axios.post(
      `${this.baseUrl}/acts/${actorId}/runs`,
      input,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        params,
      }
    );

    const run = response.data.data;
    return {
      runId: run.id,
      datasetId: run.defaultDatasetId,
    };
  }

  /**
   * Busca os resultados de um dataset do Apify
   */
  async getDatasetItems(datasetId: string, apiKey: string, limit = 100): Promise<ApifyLeadResult[]> {
    const response = await axios.get(
      `${this.baseUrl}/datasets/${datasetId}/items`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: { limit, clean: true },
      }
    );
    return response.data;
  }

  /**
   * Verifica o status de um run
   */
  async getRunStatus(runId: string, apiKey: string): Promise<{ status: string; datasetId: string }> {
    const response = await axios.get(
      `${this.baseUrl}/actor-runs/${runId}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );
    const run = response.data.data;
    return {
      status: run.status,
      datasetId: run.defaultDatasetId,
    };
  }

  /**
   * Normaliza um item do Apify para o formato de lead da plataforma
   */
  normalizeToLead(item: ApifyLeadResult): {
    nome: string;
    email?: string;
    telefone?: string;
    empresa?: string;
    descricao?: string;
    fonte: string;
  } {
    return {
      nome: item.nome || item.name || item.fullName || item.firstName || 'Lead sem nome',
      email: item.email || item.emailAddress || undefined,
      telefone: item.telefone || item.phone || item.phoneNumber || undefined,
      empresa: item.empresa || item.company || item.organization || undefined,
      descricao: item.descricao || item.description || item.summary || item.about || undefined,
      fonte: item.fonte || item.source || item.url || 'apify',
    };
  }
}

export const apifyService = new ApifyService();
