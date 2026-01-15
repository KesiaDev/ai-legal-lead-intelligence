// Types for CRM Funnel

export interface FunnelStage {
  id: string;
  name: string;
  order: number;
  color: string;
  description: string;
  autoActions: FunnelAction[];
  isActive: boolean;
}

export interface FunnelAction {
  id: string;
  type: 'move_stage' | 'delegate_human' | 'create_note' | 'send_message' | 'update_status' | 'schedule_followup';
  config: Record<string, any>;
}

export const DEFAULT_FUNNEL_STAGES: FunnelStage[] = [
  {
    id: 'stage-1',
    name: 'Novo Contato',
    order: 1,
    color: 'hsl(var(--info))',
    description: 'Lead acabou de entrar em contato',
    autoActions: [],
    isActive: true,
  },
  {
    id: 'stage-2',
    name: 'Em Qualificação',
    order: 2,
    color: 'hsl(var(--warning))',
    description: 'Lead está sendo qualificado pela IA',
    autoActions: [],
    isActive: true,
  },
  {
    id: 'stage-3',
    name: 'Qualificado',
    order: 3,
    color: 'hsl(var(--success))',
    description: 'Lead qualificado e pronto para atendimento',
    autoActions: [
      { id: 'action-1', type: 'delegate_human', config: {} },
    ],
    isActive: true,
  },
  {
    id: 'stage-4',
    name: 'Aguardando Reunião',
    order: 4,
    color: 'hsl(var(--secondary))',
    description: 'Reunião agendada, aguardando data',
    autoActions: [],
    isActive: true,
  },
  {
    id: 'stage-5',
    name: 'Em Atendimento',
    order: 5,
    color: 'hsl(var(--primary))',
    description: 'Lead em atendimento com advogado',
    autoActions: [],
    isActive: true,
  },
  {
    id: 'stage-6',
    name: 'Convertido',
    order: 6,
    color: 'hsl(var(--success))',
    description: 'Lead convertido em cliente',
    autoActions: [],
    isActive: true,
  },
  {
    id: 'stage-7',
    name: 'Perdido',
    order: 7,
    color: 'hsl(var(--destructive))',
    description: 'Lead desqualificado ou perdido',
    autoActions: [],
    isActive: true,
  },
];

export const FUNNEL_ACTION_TYPES = {
  move_stage: 'Mover Etapa',
  delegate_human: 'Delegar para Humano',
  create_note: 'Criar Anotação',
  send_message: 'Enviar Mensagem',
  update_status: 'Atualizar Status',
  schedule_followup: 'Agendar Follow-up',
};
