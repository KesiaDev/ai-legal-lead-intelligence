import api from './client';

export interface LeadApi {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  state: string | null;
  legalArea: string | null;
  customLegalArea: string | null;
  demandDescription: string | null;
  urgency: string | null;
  status: string;
  contactPreference: string | null;
  availableForHumanContact: boolean;
  lgpdConsent: boolean;
  lgpdConsentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  leads: LeadApi[];
  total: number;
}

export const leadsApi = {
  getAll: () => api.get<LeadsResponse>('/api/leads'),
};
