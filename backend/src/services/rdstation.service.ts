/**
 * RD Station CRM Integration
 * API: https://developers.rdstation.com/
 */
export class RDStationService {
  private baseUrl = 'https://api.rd.services';

  async getAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
    const response = await fetch(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    return response.json();
  }

  async createContact(accessToken: string, data: {
    name: string;
    email?: string;
    mobile_phone?: string;
    city?: string;
    state?: string;
    tags?: string[];
    cf_area_juridica?: string; // campo customizado
  }) {
    const response = await fetch(`${this.baseUrl}/platform/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact: data }),
    });
    return response.json();
  }

  async updateContact(accessToken: string, contactId: string, data: any) {
    const response = await fetch(`${this.baseUrl}/platform/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contact: data }),
    });
    return response.json();
  }

  async createDeal(accessToken: string, data: {
    name: string;
    amount_montly?: number;
    contact_id?: string;
    stage_id?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/crm/deals`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deal: data }),
    });
    return response.json();
  }

  async syncLead(accessToken: string, lead: {
    name: string;
    email?: string;
    phone?: string;
    legalArea?: string;
    urgency?: string;
    score?: number;
    status?: string;
  }) {
    // Cria ou atualiza contato + deal
    const contact = await this.createContact(accessToken, {
      name: lead.name,
      email: lead.email,
      mobile_phone: lead.phone,
      tags: ['sdr-juridico', lead.legalArea || 'geral'],
      cf_area_juridica: lead.legalArea,
    });
    return contact;
  }
}
