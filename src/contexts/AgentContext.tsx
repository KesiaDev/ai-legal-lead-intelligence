import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
import { promptsApi } from '@/api/prompts';
import { useAuth } from './AuthContext';
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
    name: 'Scheduler',
    type: 'Scheduler',
    version: 'v8',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `<objetivo>
Você é o **Agente de AGENDA**, responsável por gerenciar consultas, agendamentos, remarcações e cancelamentos de reuniões.
É o agente principal de coordenação de agenda no fluxo do orquestrador.
Você nunca fala diretamente com o lead – responde **apenas em formato JSON estruturado**.
Seu papel é garantir que **toda ação de agenda siga regras reais de disponibilidade, bloqueio e limites**, sempre com base nas ferramentas definidas.
Você interpreta a linguagem natural enviada pelo lead (como "amanhã às 15h", "sexta às 10h") e converte para formato de data/hora padronizado ISO (YYYY-MM-DDTHH:mm:ss), **sem aplicar fuso horário**.
Após interpretar, você chama diretamente o **HTTP Request de Validação de Horário** ("Validador de Horário") para confirmar se o horário é válido conforme as regras do cliente.
</objetivo>`,
  },
  {
    id: 'prompt-2',
    name: 'Agente Conversacional',
    type: 'Orquestrador',
    version: 'v20',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `<objetivo>
Sua missão é:
1. Atuar como SDR da **Expert Integrado** em contatos de qualificação de leads via WhatsApp, conduzindo uma conversa natural, objetiva e profissional.
2. Compreender as necessidades do lead relacionadas a automação comercial e IA SDR.
3. Coletar informações essenciais sobre a operação comercial da empresa de forma gradual e estratégica.
4. Encaminhar leads qualificados para agendamento de reunião de diagnóstico com especialistas.
5. **NUNCA repetir perguntas já respondidas pelo lead.**
6. Você não executa ferramentas diretamente - apenas coleta, organiza e passa os dados para os agentes auxiliares (Qualifier e Scheduler).
</objetivo>

<base_conhecimento>
Sempre que o lead fizer perguntas sobre o produto Super SDR ou funcionalidades, consulte os arquivos "Super SDR Virtual" e "Perguntas Frequentes" do vector store.

Se o lead perguntar sobre integrações com CRM, informe que integram com os principais do mercado e são credenciados do Pipedrive.

Se a informação não estiver disponível, diga ao lead: "Essa é uma ótima pergunta! Nosso especialista vai te explicar isso em detalhes na reunião, combinado?"
</base_conhecimento>

<auto_monitoramento>
Após cada resposta que você enviar, verifique INTERNAMENTE:

CRÍTICO - PERGUNTAS JÁ RESPONDIDAS:
- O lead já respondeu a esta pergunta anteriormente na conversa?
- Se SIM, NUNCA repetir. Pular para a próxima pergunta do fluxo.

VERIFICAÇÃO DE QUALIFICAÇÃO:
- O lead demonstrou interesse real no produto?
- As informações coletadas são suficientes para qualificar?
- Se SIM, encaminhar para agendamento.

VERIFICAÇÃO DE OBJEÇÕES:
- O lead apresentou alguma objeção?
- Se SIM, tratar de forma empática e profissional.
- Se a objeção for sobre preço, mencionar que o especialista vai apresentar opções na reunião.
</auto_monitoramento>

<regras_comunicacao>
1. Seja sempre profissional, mas amigável.
2. Use linguagem natural, como se estivesse conversando pessoalmente.
3. Evite jargões técnicos desnecessários.
4. Se o lead não entender algo, explique de forma mais simples.
5. Sempre confirme informações importantes antes de prosseguir.
6. Se o lead pedir para falar com um humano, respeite e encaminhe imediatamente.
</regras_comunicacao>

<fluxo_qualificacao>
1. Apresentação inicial e identificação do lead.
2. Entender a necessidade/desafio do lead.
3. Coletar informações sobre a operação comercial:
   - Quantidade de vendedores/SDRs
   - Volume de leads mensais
   - CRM atual (se houver)
   - Principais desafios na qualificação
4. Apresentar o Super SDR de forma breve e objetiva.
5. Qualificar o interesse e disponibilidade para reunião.
6. Agendar reunião de diagnóstico (usar o agente Scheduler).
</fluxo_qualificacao>

<importante>
- NUNCA invente informações sobre o produto.
- NUNCA faça promessas que não pode cumprir.
- NUNCA seja insistente ou invasivo.
- SEMPRE seja transparente sobre o processo.
- SEMPRE respeite o tempo e a decisão do lead.
</importante>`,
  },
  {
    id: 'prompt-3',
    name: 'Qualifier',
    type: 'Qualificador',
    version: 'v6',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `Analise a mensagem do lead e retorne:
- area_direito: trabalhista | civil | familia | consumidor | previdenciario | criminal | empresarial | outro
- urgencia: alta | media | baixa
- resumo: descrição em até 50 palavras
- proxima_pergunta: sugestão de pergunta para continuar qualificação

NUNCA faça suposições. Se não tiver certeza, pergunte.`,
  },
  {
    id: 'prompt-4',
    name: 'Video Transcription',
    type: 'video_transcription',
    version: 'v2',
    status: 'ativo',
    provider: 'Google',
    model: 'models/gemini-2.5-pro',
    content: `Transcreva o conteúdo de vídeos enviados pelo lead, extraindo informações relevantes para qualificação.`,
  },
  {
    id: 'prompt-5',
    name: 'Document Interpretation',
    type: 'document_interpretate',
    version: 'v2',
    status: 'ativo',
    provider: 'Google',
    model: 'models/gemini-2.5-pro',
    content: `Interprete documentos enviados pelo lead, extraindo informações relevantes para qualificação.`,
  },
  {
    id: 'prompt-6',
    name: 'Insights',
    type: 'insights',
    version: 'v4',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    content: `Gere insights sobre a conversa com o lead, identificando padrões, necessidades e oportunidades.`,
  },
  {
    id: 'prompt-7',
    name: 'Conversation Summary',
    type: 'conversation_summary',
    version: 'v2',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    content: `Gere um resumo estruturado da conversa contendo:
- Dados do lead
- Área do direito identificada
- Nível de urgência
- Principais pontos mencionados
- Próximos passos sugeridos`,
  },
  {
    id: 'prompt-8',
    name: 'Follow Up',
    type: 'followup',
    version: 'v2',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `Gere mensagens de follow-up cordiais e profissionais.
Respeite o intervalo de tempo desde o último contato.
Não seja insistente. Máximo de 3 tentativas.`,
  },
  {
    id: 'prompt-9',
    name: 'protractor',
    type: 'protractor',
    version: 'v2',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `Analise e extraia informações estruturadas de documentos e mensagens.`,
  },
  {
    id: 'prompt-10',
    name: 'Document Interpretation',
    type: 'document_interpretation',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `Interprete documentos enviados pelo lead, extraindo informações relevantes para qualificação.`,
  },
  {
    id: 'prompt-11',
    name: 'Lembrete de reunião',
    type: 'Lembrete',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    content: `Gere lembretes de reunião agendada, enviando mensagens antes do horário combinado.`,
  },
  {
    id: 'prompt-12',
    name: 'Follow-Up Final',
    type: 'followup',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1-mini',
    content: `Gere a mensagem final de follow-up quando o lead não respondeu após múltiplas tentativas.`,
  },
  {
    id: 'prompt-13',
    name: 'Image Transcription',
    type: 'image_transcription',
    version: 'v1',
    status: 'ativo',
    provider: 'OpenAI',
    model: 'gpt-4.1',
    content: `Transcreva o conteúdo de imagens enviadas pelo lead, extraindo informações relevantes para qualificação.`,
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
  const { user } = useAuth();
  const [agent, setAgent] = useState<AgentConfig>(defaultAgent);
  const [communication, setCommunication] = useState<CommunicationConfig>(defaultCommunication);
  const [prompts, setPrompts] = useState<AgentPrompt[]>(defaultPrompts);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  // Carregar prompts do backend quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadPromptsFromBackend();
    }
  }, [user]);

  const loadPromptsFromBackend = async () => {
    setIsLoadingPrompts(true);
    try {
      const response = await promptsApi.list();
      if (response.prompts && response.prompts.length > 0) {
        // Converter prompts do backend para formato do frontend
        const convertedPrompts: AgentPrompt[] = response.prompts.map(p => ({
          id: p.id,
          name: p.name,
          type: p.type,
          version: p.version,
          status: p.status,
          provider: p.provider,
          model: p.model,
          content: p.content,
        }));
        setPrompts(convertedPrompts);
      }
    } catch (error: any) {
      console.error('Erro ao carregar prompts do backend:', error);
      // Se der erro, mantém os prompts padrão
    } finally {
      setIsLoadingPrompts(false);
    }
  };
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>(defaultKnowledgeBase);
  const [followUpConfig, setFollowUpConfig] = useState<FollowUpConfig>(defaultFollowUp);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(defaultSchedule);
  const [intentions, setIntentions] = useState<Intention[]>(defaultIntentions);
  const [humanizationConfig, setHumanizationConfig] = useState<HumanizationConfig>(DEFAULT_HUMANIZATION_CONFIG);
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(DEFAULT_VOICE_CONFIG);
  
  // Carregar configuração de voz do backend
  useEffect(() => {
    if (user) {
      loadVoiceConfigFromBackend();
    }
  }, [user]);

  const loadVoiceConfigFromBackend = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/voice/config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setVoiceConfig({
            ...DEFAULT_VOICE_CONFIG,
            ...data.config,
            elevenlabsApiKey: data.config.elevenlabsApiKey || (voiceConfig as any).elevenlabsApiKey,
          } as VoiceConfig);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de voz:', error);
    }
  };
  
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>(DEFAULT_FUNNEL_STAGES);
  const [lawyers, setLawyers] = useState<Lawyer[]>(DEFAULT_LAWYERS);
  const [rotationRules, setRotationRules] = useState<RotationRule[]>(DEFAULT_ROTATION_RULES);
  const [reminders, setReminders] = useState<ReminderConfig[]>(DEFAULT_REMINDERS);
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);

  const updateAgent = async (updates: Partial<AgentConfig>) => {
    const newAgent = { ...agent, ...updates, updatedAt: new Date() };
    setAgent(newAgent);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newAgent.name,
          description: newAgent.description,
          isActive: newAgent.isActive,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações do agente:', error);
    }
  };

  const updateCommunication = async (updates: Partial<CommunicationConfig>) => {
    const newCommunication = { ...communication, ...updates };
    setCommunication(newCommunication);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          communicationConfig: newCommunication,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de comunicação:', error);
    }
  };

  const addPrompt = async (prompt: AgentPrompt) => {
    try {
      // Salvar no backend
      const savedPrompt = await promptsApi.save({
        name: prompt.name,
        type: prompt.type,
        version: prompt.version,
        status: prompt.status,
        provider: prompt.provider,
        model: prompt.model,
        content: prompt.content,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
      });
      
      // Atualizar estado local com o prompt salvo (com ID do backend)
      setPrompts(prev => [...prev, { ...prompt, id: savedPrompt.id }]);
    } catch (error: any) {
      console.error('Erro ao salvar prompt no backend:', error);
      // Em caso de erro, adiciona localmente mesmo assim
      setPrompts(prev => [...prev, prompt]);
    }
  };

  const updatePrompt = async (id: string, updates: Partial<AgentPrompt>) => {
    try {
      // Atualizar no backend
      const prompt = prompts.find(p => p.id === id);
      if (prompt) {
        await promptsApi.update(id, { ...prompt, ...updates });
      }
      
      // Atualizar estado local
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error: any) {
      console.error('Erro ao atualizar prompt no backend:', error);
      // Em caso de erro, atualiza localmente mesmo assim
      setPrompts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      // Deletar no backend
      await promptsApi.delete(id);
      
      // Atualizar estado local
      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Erro ao deletar prompt no backend:', error);
      // Em caso de erro, remove localmente mesmo assim
      setPrompts(prev => prev.filter(p => p.id !== id));
    }
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

  const updateFollowUpConfig = async (updates: Partial<FollowUpConfig>) => {
    const newConfig = { ...followUpConfig, ...updates };
    setFollowUpConfig(newConfig);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          followUpConfig: newConfig,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de follow-up:', error);
    }
  };

  const updateScheduleConfig = async (updates: Partial<ScheduleConfig>) => {
    const newConfig = { ...scheduleConfig, ...updates };
    setScheduleConfig(newConfig);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduleConfig: newConfig,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de agendamento:', error);
    }
  };

  const addIntention = async (intention: Intention) => {
    const newIntentions = [...intentions, intention];
    setIntentions(newIntentions);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          intentions: newIntentions,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar intenções:', error);
    }
  };

  const updateIntention = async (id: string, updates: Partial<Intention>) => {
    const newIntentions = intentions.map(i => i.id === id ? { ...i, ...updates } : i);
    setIntentions(newIntentions);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          intentions: newIntentions,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar intenções:', error);
    }
  };

  const deleteIntention = async (id: string) => {
    const newIntentions = intentions.filter(i => i.id !== id);
    setIntentions(newIntentions);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          intentions: newIntentions,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar intenções:', error);
    }
  };

  const updateHumanizationConfig = async (updates: Partial<HumanizationConfig>) => {
    const newConfig = { ...humanizationConfig, ...updates };
    setHumanizationConfig(newConfig);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      await fetch(`${API_URL}/api/agent/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          humanizationConfig: newConfig,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de humanização:', error);
    }
  };

  const updateVoiceConfig = async (updates: Partial<VoiceConfig>) => {
    const newConfig = { ...voiceConfig, ...updates };
    setVoiceConfig(newConfig);
    
    // Salvar no backend
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.sdrjuridico.com.br';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/voice/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newConfig,
          elevenlabsApiKey: (newConfig as any).elevenlabsApiKey,
        }),
      });
      
      if (!response.ok) {
        console.error('Erro ao salvar configuração de voz:', await response.text());
      }
    } catch (error) {
      console.error('Erro ao salvar configuração de voz:', error);
    }
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
