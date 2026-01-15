import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  AgentConfig,
  CommunicationConfig,
  AgentPrompt,
  KnowledgeBaseItem,
  FollowUpConfig,
  ScheduleConfig,
  Intention,
  BusinessHours,
} from '@/types/agent';
import { HumanizationConfig, DEFAULT_HUMANIZATION_CONFIG } from '@/types/humanization';
import { VoiceConfig, DEFAULT_VOICE_CONFIG } from '@/types/voice';
import { MessageTemplate, DEFAULT_TEMPLATES } from '@/types/template';
import { 
  FunnelStage, 
  DEFAULT_FUNNEL_STAGES 
} from '@/types/funnel';
import {
  Lawyer,
  RotationRule,
  ReminderConfig,
  EventConfig,
  DEFAULT_LAWYERS,
  DEFAULT_ROTATION_RULES,
  DEFAULT_REMINDERS,
  DEFAULT_EVENT_CONFIG,
} from '@/types/schedule';

interface AgentContextType {
  agent: AgentConfig;
  updateAgent: (updates: Partial<AgentConfig>) => void;
  communication: CommunicationConfig;
  updateCommunication: (updates: Partial<CommunicationConfig>) => void;
  prompts: AgentPrompt[];
  addPrompt: (prompt: AgentPrompt) => void;
  updatePrompt: (id: string, updates: Partial<AgentPrompt>) => void;
  deletePrompt: (id: string) => void;
  knowledgeBase: KnowledgeBaseItem[];
  addKnowledgeItem: (item: KnowledgeBaseItem) => void;
  updateKnowledgeItem: (id: string, updates: Partial<KnowledgeBaseItem>) => void;
  removeKnowledgeItem: (id: string) => void;
  followUpConfig: FollowUpConfig;
  updateFollowUpConfig: (updates: Partial<FollowUpConfig>) => void;
  scheduleConfig: ScheduleConfig;
  updateScheduleConfig: (updates: Partial<ScheduleConfig>) => void;
  intentions: Intention[];
  addIntention: (intention: Intention) => void;
  updateIntention: (id: string, updates: Partial<Intention>) => void;
  deleteIntention: (id: string) => void;
  humanizationConfig: HumanizationConfig;
  updateHumanizationConfig: (updates: Partial<HumanizationConfig>) => void;
  voiceConfig: VoiceConfig;
  updateVoiceConfig: (updates: Partial<VoiceConfig>) => void;
  // Templates
  templates: MessageTemplate[];
  addTemplate: (template: MessageTemplate) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  // Funnel
  funnelStages: FunnelStage[];
  updateFunnelStage: (id: string, updates: Partial<FunnelStage>) => void;
  addFunnelStage: (stage: FunnelStage) => void;
  deleteFunnelStage: (id: string) => void;
  // Schedule Extended
  lawyers: Lawyer[];
  addLawyer: (lawyer: Lawyer) => void;
  updateLawyer: (id: string, updates: Partial<Lawyer>) => void;
  deleteLawyer: (id: string) => void;
  rotationRules: RotationRule[];
  updateRotationRule: (id: string, updates: Partial<RotationRule>) => void;
  reminders: ReminderConfig[];
  updateReminder: (id: string, updates: Partial<ReminderConfig>) => void;
  addReminder: (reminder: ReminderConfig) => void;
  deleteReminder: (id: string) => void;
  eventConfig: EventConfig;
  updateEventConfig: (updates: Partial<EventConfig>) => void;
}

const defaultBusinessHours: BusinessHours[] = [
  { day: 'SEG', isOpen: true, startTime: '09:00', endTime: '20:00' },
  { day: 'TER', isOpen: true, startTime: '09:00', endTime: '20:00' },
  { day: 'QUA', isOpen: true, startTime: '09:00', endTime: '20:00' },
  { day: 'QUI', isOpen: true, startTime: '09:00', endTime: '20:00' },
  { day: 'SEX', isOpen: true, startTime: '09:00', endTime: '20:00' },
  { day: 'SAB', isOpen: false, startTime: '09:00', endTime: '12:00' },
  { day: 'DOM', isOpen: false, startTime: '09:00', endTime: '12:00' },
];

const defaultAgent: AgentConfig = {
  id: 'agent-1',
  name: 'SDR Jurídico',
  description: 'Assistente virtual para qualificação de leads jurídicos',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  aiConfig: {
    enabled: true,
    interventionLevel: 'medio',
  },
};

const defaultCommunication: CommunicationConfig = {
  bufferLatency: 10,
  timeBetweenMessages: 3,
  errorMessage: 'Desculpa, não entendi. Pode por favor enviar a mensagem de outra forma?',
  tone: 'formal',
  useEmojis: false,
  signature: 'Atenciosamente, Equipe Jurídica',
};

const defaultPrompts: AgentPrompt[] = [
  {
    id: 'prompt-1',
    name: 'Agente Conversacional',
    type: 'Orquestrador',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4',
    content: `Você é um assistente jurídico profissional especializado em pré-vendas para escritórios de advocacia.

OBJETIVO:
- Qualificar leads de forma consultiva
- Identificar área do direito e urgência
- Encaminhar para atendimento humano quando apropriado

REGRAS OBRIGATÓRIAS:
1. NUNCA fornecer aconselhamento jurídico
2. NUNCA prometer resultados em processos
3. NUNCA usar linguagem informal excessiva
4. SEMPRE manter tom profissional e empático
5. SEMPRE respeitar LGPD e ética da OAB

FLUXO:
1. Saudação → 2. Identificar demanda → 3. Qualificar urgência → 4. Coletar dados → 5. Encaminhar`,
  },
  {
    id: 'prompt-2',
    name: 'Qualificador Jurídico',
    type: 'Qualificador',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4',
    content: `Analise a mensagem do lead e retorne:
- area_direito: trabalhista | civil | familia | consumidor | previdenciario | criminal | empresarial | outro
- urgencia: alta | media | baixa
- resumo: descrição em até 50 palavras
- proxima_pergunta: sugestão de pergunta para continuar qualificação

NUNCA faça suposições. Se não tiver certeza, pergunte.`,
  },
  {
    id: 'prompt-3',
    name: 'Follow Up',
    type: 'followup',
    version: 'v1',
    status: 'ativo',
    provider: 'Google',
    model: 'gemini-2.5-pro',
    content: `Gere mensagens de follow-up cordiais e profissionais.
Respeite o intervalo de tempo desde o último contato.
Não seja insistente. Máximo de 3 tentativas.`,
  },
  {
    id: 'prompt-4',
    name: 'Resumo de Conversa',
    type: 'Resumo',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4-turbo',
    content: `Gere um resumo estruturado da conversa contendo:
- Dados do lead
- Área do direito identificada
- Nível de urgência
- Principais pontos mencionados
- Próximos passos sugeridos`,
  },
  {
    id: 'prompt-5',
    name: 'Agendamento',
    type: 'Scheduler',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-3.5-turbo',
    content: `Conduza o agendamento de reunião:
1. Confirmar disponibilidade do lead
2. Oferecer horários disponíveis
3. Confirmar data/hora escolhida
4. Enviar confirmação com detalhes`,
  },
];

const defaultKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: 'kb-1',
    title: 'Perguntas e respostas sobre serviços',
    content: 'FAQ completo do escritório com perguntas frequentes sobre áreas de atuação, honorários, prazos e processo de atendimento.',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'kb-2',
    title: 'Sobre o Escritório',
    content: 'Informações institucionais: história, missão, valores, equipe de advogados e especialidades.',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'kb-3',
    title: 'Áreas de Atuação',
    content: 'Detalhes sobre áreas do direito atendidas: trabalhista, civil, família, consumidor, previdenciário, empresarial.',
    createdAt: new Date('2025-01-03'),
  },
];

const defaultFollowUp: FollowUpConfig = {
  businessHours: defaultBusinessHours,
  cadence: {
    firstFollowUp: 24,
    secondFollowUp: 48,
    finalFollowUp: 72,
  },
  messages: {
    first: 'Olá {{nome}}! Notamos que você ainda não concluiu seu cadastro. Posso ajudar com alguma dúvida?',
    second: 'Prezado(a) {{nome}}, estamos à disposição para esclarecer quaisquer dúvidas sobre nossos serviços jurídicos.',
    final: 'Esta é nossa última tentativa de contato. Caso tenha interesse, entre em contato conosco.',
  },
};

const defaultSchedule: ScheduleConfig = {
  timezone: 'São Paulo (BRT)',
  meetingDuration: 60,
  timeIncrement: 30,
  minAdvanceTime: 60,
  maxAdvanceDays: 30,
  onlyQualifiedLeads: true,
  availableHours: defaultBusinessHours,
};

const defaultIntentions: Intention[] = [
  { id: 'int-1', name: 'Cancelou reunião', description: 'Lead cancelou a reunião agendada.', actions: ['Criar anotação', 'Enviar mensagem de confirmação'] },
  { id: 'int-2', name: 'Transferiu para humano', description: 'Solicitou atendimento humano.', actions: ['Delegar para Humano', 'Criar anotação'] },
  { id: 'int-3', name: 'Reagendou reunião', description: 'Lead solicitou reagendamento.', actions: ['Atualizar agenda', 'Enviar confirmação'] },
  { id: 'int-4', name: 'Em conexão', description: 'Toda vez que o contato responder a primeira mensagem.', actions: ['Mover etapa no funil'] },
  { id: 'int-5', name: 'Tentando contato', description: 'Aguardando resposta do lead.', actions: [] },
  { id: 'int-6', name: 'Sem resposta', description: 'Lead não respondeu após follow-ups.', actions: ['Criar anotação', 'Arquivar'] },
  { id: 'int-7', name: 'Dúvidas sobre serviços', description: 'Toda vez que uma pessoa quiser saber sobre serviços.', actions: ['Delegar para Humano', 'Criar atividade', 'Mover etapa no funil'] },
  { id: 'int-8', name: 'Agendou Reunião', description: 'Quando o lead agendar uma reunião.', actions: ['Mover etapa no funil', 'Resumo da conversa', 'Delegar para Humano'] },
  { id: 'int-9', name: 'Desqualificado', description: 'Lead não atende aos critérios de qualificação.', actions: ['Criar anotação', 'Mudar status'] },
  { id: 'int-10', name: 'Qualificado', description: 'Lead qualificado e pronto para atendimento.', actions: ['Criar anotação', 'Mover etapa no funil'] },
];

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<AgentConfig>(defaultAgent);
  const [communication, setCommunication] = useState<CommunicationConfig>(defaultCommunication);
  const [prompts, setPrompts] = useState<AgentPrompt[]>(defaultPrompts);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(defaultKnowledgeBase);
  const [followUpConfig, setFollowUpConfig] = useState<FollowUpConfig>(defaultFollowUp);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(defaultSchedule);
  const [intentions, setIntentions] = useState<Intention[]>(defaultIntentions);
  const [humanizationConfig, setHumanizationConfig] = useState<HumanizationConfig>(DEFAULT_HUMANIZATION_CONFIG);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(DEFAULT_VOICE_CONFIG);
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>(DEFAULT_FUNNEL_STAGES);
  const [lawyers, setLawyers] = useState<Lawyer[]>(DEFAULT_LAWYERS);
  const [rotationRules, setRotationRules] = useState<RotationRule[]>(DEFAULT_ROTATION_RULES);
  const [reminders, setReminders] = useState<ReminderConfig[]>(DEFAULT_REMINDERS);
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);

  const updateAgent = (updates: Partial<AgentConfig>) => {
    setAgent(prev => ({ ...prev, ...updates, updatedAt: new Date() }));
  };

  const updateCommunication = (updates: Partial<CommunicationConfig>) => {
    setCommunication(prev => ({ ...prev, ...updates }));
  };

  const addPrompt = (prompt: AgentPrompt) => {
    setPrompts(prev => [...prev, prompt]);
  };

  const updatePrompt = (id: string, updates: Partial<AgentPrompt>) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const addKnowledgeItem = (item: KnowledgeBaseItem) => {
    setKnowledgeBase(prev => [...prev, item]);
  };

  const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeBaseItem>) => {
    setKnowledgeBase(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeKnowledgeItem = (id: string) => {
    setKnowledgeBase(prev => prev.filter(item => item.id !== id));
  };

  const updateFollowUpConfig = (updates: Partial<FollowUpConfig>) => {
    setFollowUpConfig(prev => ({ ...prev, ...updates }));
  };

  const updateScheduleConfig = (updates: Partial<ScheduleConfig>) => {
    setScheduleConfig(prev => ({ ...prev, ...updates }));
  };

  const addIntention = (intention: Intention) => {
    setIntentions(prev => [...prev, intention]);
  };

  const updateIntention = (id: string, updates: Partial<Intention>) => {
    setIntentions(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteIntention = (id: string) => {
    setIntentions(prev => prev.filter(i => i.id !== id));
  };

  const updateHumanizationConfig = (updates: Partial<HumanizationConfig>) => {
    setHumanizationConfig(prev => ({ ...prev, ...updates }));
  };

  const updateVoiceConfig = (updates: Partial<VoiceConfig>) => {
    setVoiceConfig(prev => ({ ...prev, ...updates }));
  };

  // Templates
  const addTemplate = (template: MessageTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Funnel
  const updateFunnelStage = (id: string, updates: Partial<FunnelStage>) => {
    setFunnelStages(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addFunnelStage = (stage: FunnelStage) => {
    setFunnelStages(prev => [...prev, stage]);
  };

  const deleteFunnelStage = (id: string) => {
    setFunnelStages(prev => prev.filter(s => s.id !== id));
  };

  // Lawyers
  const addLawyer = (lawyer: Lawyer) => {
    setLawyers(prev => [...prev, lawyer]);
  };

  const updateLawyer = (id: string, updates: Partial<Lawyer>) => {
    setLawyers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLawyer = (id: string) => {
    setLawyers(prev => prev.filter(l => l.id !== id));
  };

  // Rotation Rules
  const updateRotationRule = (id: string, updates: Partial<RotationRule>) => {
    setRotationRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Reminders
  const updateReminder = (id: string, updates: Partial<ReminderConfig>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addReminder = (reminder: ReminderConfig) => {
    setReminders(prev => [...prev, reminder]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Event Config
  const updateEventConfig = (updates: Partial<EventConfig>) => {
    setEventConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <AgentContext.Provider value={{
      agent,
      updateAgent,
      communication,
      updateCommunication,
      prompts,
      addPrompt,
      updatePrompt,
      deletePrompt,
      knowledgeBase,
      addKnowledgeItem,
      updateKnowledgeItem,
      removeKnowledgeItem,
      followUpConfig,
      updateFollowUpConfig,
      scheduleConfig,
      updateScheduleConfig,
      intentions,
      addIntention,
      updateIntention,
      deleteIntention,
      humanizationConfig,
      updateHumanizationConfig,
      voiceConfig,
      updateVoiceConfig,
      templates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      funnelStages,
      updateFunnelStage,
      addFunnelStage,
      deleteFunnelStage,
      lawyers,
      addLawyer,
      updateLawyer,
      deleteLawyer,
      rotationRules,
      updateRotationRule,
      reminders,
      updateReminder,
      addReminder,
      deleteReminder,
      eventConfig,
      updateEventConfig,
    }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
