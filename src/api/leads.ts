import api from './client';
import { Lead } from '@/types/lead';

export interface CreateLeadDto {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  legalArea?: string;
  caseType?: string;
  demandDescription?: string;
  urgency?: 'baixa' | 'media' | 'alta';
  origin?: string;
  estimatedTicket?: number;
  contactPreference?: string;
  availableForHumanContact?: boolean;
  lgpdConsent?: boolean;
  tags?: string[];
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface ListLeadsParams {
  status?: string;
  pipelineStage?: string;
  assignedTo?: string;
  search?: string;
}

export const leadsApi = {
  getAll: (params?: ListLeadsParams) => 
    api.get<{ leads: Lead[] }>('/leads', { params }),
  
  getById: (id: string) => 
    api.get<{ lead: Lead }>(`/leads/${id}`),
  
  create: (data: CreateLeadDto) => 
    api.post<{ lead: Lead }>('/leads', data),
  
  update: (id: string, data: UpdateLeadDto) => 
    api.patch<{ lead: Lead }>(`/leads/${id}`, data),
  
  delete: (id: string) => 
    api.delete(`/leads/${id}`),
  
  transition: (id: string, toStage: string, reason?: string, notes?: string) =>
    api.post<{ lead: Lead; transition: any }>(`/leads/${id}/transition`, {
      toStage,
      reason,
      notes,
    }),
  
  getTransitions: (id: string) =>
    api.get<{ transitions: any[] }>(`/leads/${id}/transitions`),
};
