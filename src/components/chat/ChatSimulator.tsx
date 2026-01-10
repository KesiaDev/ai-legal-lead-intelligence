import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLeads } from '@/contexts/LeadsContext';
import { LegalArea, Urgency, ConversationStep } from '@/types/lead';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

const CONVERSATION_FLOW: ConversationStep[] = [
  {
    id: 'lgpd',
    type: 'lgpd',
    question: 'Olá! Bem-vindo(a) ao atendimento jurídico. Antes de prosseguirmos, informamos que seus dados serão utilizados exclusivamente para contato e encaminhamento ao advogado responsável, em conformidade com a Lei Geral de Proteção de Dados (LGPD).\n\nVocê concorda em prosseguir com o atendimento?',
    options: ['Sim, concordo', 'Não concordo'],
  },
  {
    id: 'name',
    type: 'contact',
    question: 'Obrigado por seu consentimento. Para iniciarmos, qual é o seu nome completo?',
  },
  {
    id: 'area',
    type: 'area',
    question: 'Agora, por favor, selecione a área do Direito relacionada à sua demanda:',
    options: ['Direito Trabalhista', 'Direito Previdenciário', 'Direito de Família', 'Direito Cível', 'Direito Penal'],
  },
  {
    id: 'demand',
    type: 'demand',
    question: 'Por favor, descreva brevemente sua demanda. Lembre-se: este é apenas um primeiro contato para triagem. Não oferecemos consultoria jurídica por este canal.',
  },
  {
    id: 'urgency',
    type: 'urgency',
    question: 'Qual o grau de urgência da sua demanda?',
    options: ['Baixa - Posso aguardar alguns dias', 'Média - Preciso de resposta em breve', 'Alta - Situação urgente'],
  },
  {
    id: 'location',
    type: 'location',
    question: 'Em qual cidade e estado você está localizado(a)?',
  },
  {
    id: 'contact',
    type: 'contact',
    question: 'Qual sua preferência de contato?',
    options: ['WhatsApp', 'Ligação telefônica', 'E-mail'],
  },
  {
    id: 'schedule',
    type: 'schedule',
    question: 'Você gostaria de agendar uma conversa com um de nossos advogados?',
    options: ['Sim, gostaria de agendar', 'Não, apenas gostaria de informações'],
  },
  {
    id: 'complete',
    type: 'complete',
    question: 'Perfeito! Seus dados foram registrados com sucesso. Um de nossos advogados entrará em contato em breve através do meio de comunicação escolhido.\n\nAgradecemos a confiança em nossos serviços jurídicos.',
  },
];

const mapAreaToKey = (area: string): LegalArea => {
  const mapping: Record<string, LegalArea> = {
    'Direito Trabalhista': 'trabalhista',
    'Direito Previdenciário': 'previdenciario',
    'Direito de Família': 'familia',
    'Direito Cível': 'civel',
    'Direito Penal': 'penal',
  };
  return mapping[area] || 'civel';
};

const mapUrgencyToKey = (urgency: string): Urgency => {
  if (urgency.includes('Baixa')) return 'baixa';
  if (urgency.includes('Média')) return 'media';
  return 'alta';
};

export function ChatSimulator() {
  const { addLead } = useLeads();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start conversation
    if (messages.length === 0) {
      addBotMessage(CONVERSATION_FLOW[0].question, CONVERSATION_FLOW[0].options);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, options?: string[]) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      content,
      sender: 'bot',
      timestamp: new Date(),
      options,
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date(),
    }]);
  };

  const processResponse = (response: string) => {
    const currentFlow = CONVERSATION_FLOW[currentStep];
    
    // Save response data
    const newLeadData = { ...leadData };
    
    switch (currentFlow.id) {
      case 'lgpd':
        if (response.includes('Não')) {
          addBotMessage('Compreendemos. Sem o consentimento, não podemos prosseguir com o atendimento. Agradecemos o contato.');
          setIsComplete(true);
          return;
        }
        newLeadData.lgpdConsent = 'true';
        break;
      case 'name':
        newLeadData.name = response;
        break;
      case 'area':
        newLeadData.area = response;
        break;
      case 'demand':
        newLeadData.demand = response;
        break;
      case 'urgency':
        newLeadData.urgency = response;
        break;
      case 'location':
        newLeadData.location = response;
        break;
      case 'contact':
        newLeadData.contactPreference = response;
        break;
      case 'schedule':
        newLeadData.wantsSchedule = response.includes('Sim') ? 'true' : 'false';
        break;
    }
    
    setLeadData(newLeadData);

    // Move to next step
    const nextStep = currentStep + 1;
    if (nextStep < CONVERSATION_FLOW.length) {
      setCurrentStep(nextStep);
      setTimeout(() => {
        addBotMessage(CONVERSATION_FLOW[nextStep].question, CONVERSATION_FLOW[nextStep].options);
        
        // If this is the complete step, save the lead
        if (CONVERSATION_FLOW[nextStep].type === 'complete') {
          const [city, state] = (newLeadData.location || 'Não informado, -').split(',').map(s => s.trim());
          
          addLead({
            name: newLeadData.name || 'Lead sem nome',
            phone: '(00) 00000-0000', // Simulated
            city,
            state,
            legalArea: mapAreaToKey(newLeadData.area || ''),
            demandDescription: newLeadData.demand,
            urgency: mapUrgencyToKey(newLeadData.urgency || ''),
            status: newLeadData.urgency?.includes('Alta') ? 'urgente' : 'qualificado',
            contactPreference: newLeadData.contactPreference,
            availableForHumanContact: newLeadData.wantsSchedule === 'true',
            lgpdConsent: true,
            lgpdConsentDate: new Date(),
            messages: [],
            followUps: [],
          });
          setIsComplete(true);
        }
      }, 500);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isComplete) return;
    
    addUserMessage(input);
    processResponse(input);
    setInput('');
  };

  const handleOptionClick = (option: string) => {
    if (isComplete) return;
    
    addUserMessage(option);
    processResponse(option);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentStep(0);
    setLeadData({});
    setIsComplete(false);
    setTimeout(() => {
      addBotMessage(CONVERSATION_FLOW[0].question, CONVERSATION_FLOW[0].options);
    }, 100);
  };

  return (
    <div className="card-elevated rounded-xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Bot className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold">SDR Jurídico</h4>
            <p className="text-xs text-primary-foreground/70">Atendimento Automatizado</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[80%]",
                message.sender === 'user' 
                  ? "whatsapp-bubble-sent"
                  : "whatsapp-bubble-received"
              )}>
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                
                {message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        disabled={isComplete}
                        className="w-full text-left px-3 py-2 text-sm bg-secondary/20 hover:bg-secondary/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {isComplete ? (
          <Button onClick={handleReset} className="w-full">
            Iniciar Nova Conversa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
