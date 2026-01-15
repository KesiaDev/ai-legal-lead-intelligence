// Types for schedule configuration

export interface EventConfig {
  title: string;
  description: string;
  type: 'consulta' | 'reuniao' | 'audiencia';
  location: 'presencial' | 'online' | 'telefone';
  meetingLink?: string;
  requireConfirmation: boolean;
}

export interface Lawyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  legalAreas: string[];
  isActive: boolean;
  maxDailyMeetings: number;
  meetingsToday: number;
}

export interface RotationRule {
  id: string;
  name: string;
  type: 'round_robin' | 'load_balance' | 'area_match' | 'manual';
  lawyers: string[];
  isActive: boolean;
}

export interface ReminderConfig {
  id: string;
  name: string;
  triggerBefore: number; // minutes
  channel: 'whatsapp' | 'email' | 'sms';
  templateId: string;
  isActive: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  isBlocked: boolean;
  blockReason?: string;
}

export const DEFAULT_LAWYERS: Lawyer[] = [
  {
    id: 'lawyer-1',
    name: 'Dr. Ricardo Silva',
    email: 'ricardo@escritorio.com.br',
    phone: '(11) 99999-1111',
    legalAreas: ['trabalhista', 'previdenciario'],
    isActive: true,
    maxDailyMeetings: 8,
    meetingsToday: 3,
  },
  {
    id: 'lawyer-2',
    name: 'Dra. Ana Santos',
    email: 'ana@escritorio.com.br',
    phone: '(11) 99999-2222',
    legalAreas: ['familia', 'civil'],
    isActive: true,
    maxDailyMeetings: 6,
    meetingsToday: 2,
  },
  {
    id: 'lawyer-3',
    name: 'Dr. Carlos Oliveira',
    email: 'carlos@escritorio.com.br',
    phone: '(11) 99999-3333',
    legalAreas: ['consumidor', 'empresarial'],
    isActive: true,
    maxDailyMeetings: 10,
    meetingsToday: 5,
  },
];

export const DEFAULT_ROTATION_RULES: RotationRule[] = [
  {
    id: 'rotation-1',
    name: 'Rodízio Padrão',
    type: 'round_robin',
    lawyers: ['lawyer-1', 'lawyer-2', 'lawyer-3'],
    isActive: true,
  },
  {
    id: 'rotation-2',
    name: 'Por Especialidade',
    type: 'area_match',
    lawyers: ['lawyer-1', 'lawyer-2', 'lawyer-3'],
    isActive: false,
  },
];

export const DEFAULT_REMINDERS: ReminderConfig[] = [
  {
    id: 'reminder-1',
    name: 'Lembrete 24h antes',
    triggerBefore: 1440, // 24 hours
    channel: 'whatsapp',
    templateId: 'tpl-6',
    isActive: true,
  },
  {
    id: 'reminder-2',
    name: 'Lembrete 1h antes',
    triggerBefore: 60,
    channel: 'whatsapp',
    templateId: 'tpl-6',
    isActive: true,
  },
];

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  title: 'Consulta Inicial',
  description: 'Reunião para análise do caso e orientação preliminar.',
  type: 'consulta',
  location: 'online',
  meetingLink: '',
  requireConfirmation: true,
};
