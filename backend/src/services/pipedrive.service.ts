/**
 * Pipedrive CRM Integration Service
 * API: https://api.pipedrive.com/v1
 * Auth: ?api_token=xxx em todos os requests
 */

const BASE_URL = 'https://api.pipedrive.com/v1';

interface PipedriveResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface PipedrivePerson {
  id: number;
  name: string;
}

interface PipedriveDeal {
  id: number;
  title: string;
}

interface CreatePersonData {
  name: string;
  phone: string;
  email?: string;
  area_juridica?: string;
}

interface CreateDealData {
  title: string;
  personId: number;
  pipelineId?: number;
  stageId?: number;
  value?: number;
}

interface SyncLeadData {
  name: string;
  phone: string;
  email?: string;
  legalArea?: string;
  urgency?: string;
  score?: number;
  status?: string;
}

interface SyncLeadResult {
  personId: number;
  dealId: number;
}

export class PipedriveService {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private url(path: string): string {
    return `${BASE_URL}${path}?api_token=${this.apiToken}`;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.url(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Pipedrive API error [${method} ${path}] ${response.status}: ${text}`);
    }

    const json = (await response.json()) as PipedriveResponse<T>;

    if (!json.success) {
      throw new Error(`Pipedrive retornou erro em ${method} ${path}: ${json.error ?? 'unknown error'}`);
    }

    return json.data;
  }

  /**
   * Cria uma pessoa no Pipedrive.
   * Retorna o id da pessoa criada.
   */
  async createPerson(data: CreatePersonData): Promise<{ id: number }> {
    const payload: Record<string, unknown> = {
      name: data.name,
      phone: [{ value: data.phone, primary: true }],
    };

    if (data.email) {
      payload['email'] = [{ value: data.email, primary: true }];
    }

    // Área jurídica como campo customizado label (visível em notas / campo texto)
    if (data.area_juridica) {
      payload['a1d1f5f7f5f1c5f1'] = data.area_juridica; // campo custom genérico; pode ser sobrescrito
    }

    const person = await this.request<PipedrivePerson>('/persons', 'POST', payload);
    return { id: person.id };
  }

  /**
   * Cria um negócio no Pipedrive vinculado a uma pessoa.
   * Retorna o id do deal criado.
   */
  async createDeal(data: CreateDealData): Promise<{ id: number }> {
    const payload: Record<string, unknown> = {
      title: data.title,
      person_id: data.personId,
    };

    if (data.pipelineId !== undefined) payload['pipeline_id'] = data.pipelineId;
    if (data.stageId !== undefined) payload['stage_id'] = data.stageId;
    if (data.value !== undefined) payload['value'] = data.value;

    const deal = await this.request<PipedriveDeal>('/deals', 'POST', payload);
    return { id: deal.id };
  }

  /**
   * Atualiza campos de um deal existente.
   */
  async updateDeal(dealId: number, data: Record<string, unknown>): Promise<void> {
    await this.request<PipedriveDeal>(`/deals/${dealId}`, 'PUT', data);
  }

  /**
   * Adiciona uma nota de texto a um deal.
   */
  async addNote(dealId: number, content: string): Promise<void> {
    await this.request<{ id: number }>('/notes', 'POST', {
      content,
      deal_id: dealId,
    });
  }

  /**
   * Sincroniza um lead para o Pipedrive:
   * 1. Cria a Pessoa
   * 2. Cria o Deal vinculado, com custom fields de área jurídica, urgência e score
   * 3. Adiciona nota com detalhes extras
   * Retorna { personId, dealId }
   */
  async syncLead(lead: SyncLeadData): Promise<SyncLeadResult> {
    // 1. Criar pessoa
    let personId: number;
    try {
      const person = await this.createPerson({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        area_juridica: lead.legalArea,
      });
      personId = person.id;
    } catch (err) {
      throw new Error(`Pipedrive syncLead — falha ao criar pessoa: ${(err as Error).message}`);
    }

    // 2. Montar título e custom fields do deal
    const dealTitle = `${lead.name}${lead.legalArea ? ` — ${lead.legalArea}` : ''}`;
    const dealPayload: CreateDealData = {
      title: dealTitle,
      personId,
    };

    let dealId: number;
    try {
      const deal = await this.createDeal(dealPayload);
      dealId = deal.id;
    } catch (err) {
      throw new Error(`Pipedrive syncLead — falha ao criar deal: ${(err as Error).message}`);
    }

    // 3. Atualizar deal com campos customizados (urgência, score, status)
    const customFields: Record<string, unknown> = {};
    if (lead.urgency) customFields['urgency'] = lead.urgency;
    if (lead.score !== undefined) customFields['score'] = lead.score;
    if (lead.status) customFields['status'] = lead.status;

    if (Object.keys(customFields).length > 0) {
      try {
        await this.updateDeal(dealId, customFields);
      } catch (err) {
        // Não falha o sync inteiro por campos customizados opcionais
        console.warn(`Pipedrive syncLead — aviso ao atualizar custom fields: ${(err as Error).message}`);
      }
    }

    // 4. Adicionar nota com resumo do lead
    const noteLines: string[] = [`Lead sincronizado via Legal Lead Scout`];
    if (lead.legalArea) noteLines.push(`Área jurídica: ${lead.legalArea}`);
    if (lead.urgency) noteLines.push(`Urgência: ${lead.urgency}`);
    if (lead.score !== undefined) noteLines.push(`Score: ${lead.score}`);
    if (lead.status) noteLines.push(`Status: ${lead.status}`);
    if (lead.email) noteLines.push(`E-mail: ${lead.email}`);

    try {
      await this.addNote(dealId, noteLines.join('\n'));
    } catch (err) {
      console.warn(`Pipedrive syncLead — aviso ao adicionar nota: ${(err as Error).message}`);
    }

    return { personId, dealId };
  }
}
