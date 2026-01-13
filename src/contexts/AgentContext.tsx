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

interface AgentContextType {
  agent: AgentConfig;
  updateAgent: (updates: Partial<AgentConfig>) => void;
  communication: CommunicationConfig;
  updateCommunication: (updates: Partial<CommunicationConfig>) => void;
  prompts: AgentPrompt[];
  addPrompt: (prompt: AgentPrompt) => void;
  updatePrompt: (id: string, updates: Partial<AgentPrompt>) => void;
  knowledgeBase: KnowledgeBaseItem[];
  addKnowledgeItem: (item: KnowledgeBaseItem) => void;
  removeKnowledgeItem: (id: string) => void;
  followUpConfig: FollowUpConfig;
  updateFollowUpConfig: (updates: Partial<FollowUpConfig>) => void;
  scheduleConfig: ScheduleConfig;
  updateScheduleConfig: (updates: Partial<ScheduleConfig>) => void;
  intentions: Intention[];
  addIntention: (intention: Intention) => void;
  updateIntention: (id: string, updates: Partial<Intention>) => void;
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
    content: 'Você é um assistente jurídico profissional...',
  },
  {
    id: 'prompt-2',
    name: 'Qualificador',
    type: 'Qualificador',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4',
    content: 'Qualifique o lead com base nas informações...',
  },
  {
    id: 'prompt-3',
    name: 'Follow Up',
    type: 'followup',
    version: 'v1',
    status: 'ativo',
    provider: 'Google',
    model: 'gemini-2.5-pro',
    content: 'Gere mensagens de follow-up cordiais...',
  },
];

const defaultKnowledgeBase: KnowledgeBaseItem[] = [
  {
    id: 'kb-1',
    title: 'Perguntas e respostas sobre serviços',
    content: 'FAQ do escritório...',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'kb-2',
    title: 'Sobre o Escritório',
    content: 'Informações institucionais...',
    createdAt: new Date('2025-01-03'),
  },
  {
    id: 'kb-3',
    title: 'Áreas de Atuação',
    content: 'Detalhes sobre áreas do direito atendidas...',
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
    first: 'Olá! Notamos que você ainda não concluiu seu cadastro. Posso ajudar com alguma dúvida?',
    second: 'Prezado(a), estamos à disposição para esclarecer quaisquer dúvidas sobre nossos serviços jurídicos.',
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
  { id: 'int-1', name: 'Cancelou reunião', actions: [] },
  { id: 'int-2', name: 'Transferiu para humano', actions: [] },
  { id: 'int-3', name: 'Reagendou reunião', actions: [] },
  { id: 'int-4', name: 'Em conexão', description: 'Toda vez que o contato responder a primeira mensagem.', actions: ['Mover etapa no funil'] },
  { id: 'int-5', name: 'Tentando contato', actions: [] },
  { id: 'int-6', name: 'Sem resposta', actions: [] },
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

  const addKnowledgeItem = (item: KnowledgeBaseItem) => {
    setKnowledgeBase(prev => [...prev, item]);
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

  return (
    <AgentContext.Provider value={{
      agent,
      updateAgent,
      communication,
      updateCommunication,
      prompts,
      addPrompt,
      updatePrompt,
      knowledgeBase,
      addKnowledgeItem,
      removeKnowledgeItem,
      followUpConfig,
      updateFollowUpConfig,
      scheduleConfig,
      updateScheduleConfig,
      intentions,
      addIntention,
      updateIntention,
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
