// Types for message templates

export type TemplateType = 
  | 'primeira_resposta' 
  | 'followup' 
  | 'qualificacao' 
  | 'encaminhamento' 
  | 'agendamento'
  | 'lembrete';

export type TemplateStatus = 'ativo' | 'inativo' | 'arquivado';

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  variables: string[];
  status: TemplateStatus;
  legalArea?: string;
  funnelStage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TEMPLATE_TYPES: Record<TemplateType, string> = {
  primeira_resposta: 'Primeira Resposta',
  followup: 'Follow-up',
  qualificacao: 'Qualificação',
  encaminhamento: 'Encaminhamento para Humano',
  agendamento: 'Agendamento',
  lembrete: 'Lembrete',
};

export const TEMPLATE_VARIABLES = [
  { key: '{{nome}}', description: 'Nome do lead' },
  { key: '{{area_direito}}', description: 'Área do direito identificada' },
  { key: '{{urgencia}}', description: 'Nível de urgência' },
  { key: '{{advogado}}', description: 'Nome do advogado responsável' },
  { key: '{{data_reuniao}}', description: 'Data da reunião agendada' },
  { key: '{{hora_reuniao}}', description: 'Hora da reunião agendada' },
  { key: '{{escritorio}}', description: 'Nome do escritório' },
  { key: '{{telefone}}', description: 'Telefone do lead' },
];

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Boas-vindas Inicial',
    type: 'primeira_resposta',
    content: 'Olá {{nome}}! 👋 Sou assistente virtual do escritório e estou aqui para ajudá-lo. Para que possamos atendê-lo da melhor forma, poderia me contar brevemente sobre sua situação?',
    variables: ['nome'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tpl-2',
    name: 'Follow-up 24h',
    type: 'followup',
    content: 'Olá {{nome}}, tudo bem? Notei que conversamos ontem sobre sua questão de {{area_direito}}. Posso ajudar com mais alguma informação?',
    variables: ['nome', 'area_direito'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tpl-3',
    name: 'Qualificação Inicial',
    type: 'qualificacao',
    content: 'Entendi, {{nome}}. Para encaminhar seu caso corretamente, preciso de mais algumas informações. Há quanto tempo você está lidando com essa situação?',
    variables: ['nome'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tpl-4',
    name: 'Encaminhamento para Advogado',
    type: 'encaminhamento',
    content: 'Perfeito, {{nome}}! Seu caso é do tipo {{area_direito}} com urgência {{urgencia}}. Vou transferir você para {{advogado}}, nosso especialista nesta área. Ele entrará em contato em breve!',
    variables: ['nome', 'area_direito', 'urgencia', 'advogado'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tpl-5',
    name: 'Confirmação de Agendamento',
    type: 'agendamento',
    content: '✅ Agendamento confirmado!\n\n📅 Data: {{data_reuniao}}\n⏰ Horário: {{hora_reuniao}}\n👤 Advogado: {{advogado}}\n\nCaso precise remarcar, entre em contato conosco.',
    variables: ['data_reuniao', 'hora_reuniao', 'advogado'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'tpl-6',
    name: 'Lembrete de Reunião',
    type: 'lembrete',
    content: 'Olá {{nome}}! 🔔 Lembrando que sua reunião com {{advogado}} está marcada para amanhã, {{data_reuniao}} às {{hora_reuniao}}. Confirme sua presença respondendo "OK".',
    variables: ['nome', 'advogado', 'data_reuniao', 'hora_reuniao'],
    status: 'ativo',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];
