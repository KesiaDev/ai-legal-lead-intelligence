/**
 * Advbox Integration — CRM jurídico líder no Brasil
 * API REST da Advbox para escritórios de advocacia
 */
export class AdvboxService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, subdomain: string) {
    this.apiKey = apiKey;
    this.baseUrl = `https://${subdomain}.advbox.com.br/api/v1`;
  }

  private headers() {
    return {
      'X-Auth-Token': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  // Cria cliente (pessoa) no Advbox
  async createClient(data: {
    name: string;
    email?: string;
    phone?: string;
    document?: string; // CPF/CNPJ
    city?: string;
    state?: string;
    notes?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/people`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        person: {
          name: data.name,
          email: data.email,
          mobile_phone: data.phone,
          document: data.document,
          city: data.city,
          state: data.state,
          observation: data.notes,
          type: 'customer',
        },
      }),
    });
    return response.json();
  }

  // Cria processo/caso no Advbox
  async createCase(data: {
    clientId: string;
    title: string;
    legalArea: string;
    description?: string;
    urgency?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/lawsuits`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        lawsuit: {
          people_id: data.clientId,
          title: data.title,
          legal_type: data.legalArea,
          description: data.description,
          priority: data.urgency === 'urgente' ? 'high' : data.urgency === 'alta' ? 'medium' : 'low',
        },
      }),
    });
    return response.json();
  }

  // Agenda evento/consulta
  async createEvent(data: {
    clientId: string;
    title: string;
    startAt: string;
    endAt: string;
    description?: string;
    assignedTo?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        event: {
          title: data.title,
          people_id: data.clientId,
          start_at: data.startAt,
          end_at: data.endAt,
          description: data.description,
        },
      }),
    });
    return response.json();
  }

  // Sincroniza lead → cliente + caso no Advbox
  async syncLead(lead: {
    name: string;
    email?: string;
    phone?: string;
    legalArea?: string;
    demandDescription?: string;
    urgency?: string;
  }) {
    const client = await this.createClient({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      notes: `Lead SDR Jurídico - Área: ${lead.legalArea || 'N/A'} - Urgência: ${lead.urgency || 'N/A'}`,
    });
    if (client?.person?.id && lead.legalArea) {
      await this.createCase({
        clientId: client.person.id,
        title: `Consulta: ${lead.legalArea}`,
        legalArea: lead.legalArea || 'geral',
        description: lead.demandDescription,
        urgency: lead.urgency,
      });
    }
    return client;
  }
}
