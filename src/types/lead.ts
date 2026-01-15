// Importar áreas do arquivo dedicado
import type { LegalArea } from './legalAreas';
export type { LegalArea } from './legalAreas';

export type LeadStatus = 
  | 'frio'
  | 'qualificado'
  | 'urgente'
  | 'pronto';

export type Urgency = 'baixa' | 'media' | 'alta';

export type FollowUpStatus = 'pending' | 'sent' | 'responded' | 'completed';

export interface Message {
  id: string;
  content: string;
  sender: 'lead' | 'sdr';
  timestamp: Date;
}

export interface FollowUp {
  id: string;
  scheduledFor: Date;
  status: FollowUpStatus;
  message: string;
  sentAt?: Date;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  city?: string;
  state?: string;
  legalArea?: LegalArea;
  customLegalArea?: string; // Para especializações customizadas quando legalArea = 'outra'
  demandDescription?: string;
  urgency?: Urgency;
  status: LeadStatus;
  contactPreference?: string;
  availableForHumanContact: boolean;
  lgpdConsent: boolean;
  lgpdConsentDate?: Date;
  messages: Message[];
  followUps: FollowUp[];
  scheduledContact?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationStep {
  id: string;
  type: 'lgpd' | 'area' | 'demand' | 'urgency' | 'location' | 'contact' | 'schedule' | 'complete';
  question: string;
  options?: string[];
}

// Re-exportar LEGAL_AREAS do arquivo dedicado
export { LEGAL_AREAS, getLegalAreasAsOptions, getLegalAreasGrouped } from './legalAreas';

export const URGENCY_LABELS: Record<Urgency, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  frio: 'Lead Frio',
  qualificado: 'Qualificado',
  urgente: 'Urgente',
  pronto: 'Pronto para Atendimento',
};
