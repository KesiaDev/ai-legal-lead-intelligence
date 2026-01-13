import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLeads } from '@/contexts/LeadsContext';
import { useAgent } from '@/contexts/AgentContext';
import { LegalArea, Urgency, ConversationStep } from '@/types/lead';
import { 
  analyzeMessage, 
  rewriteAgentMessage, 
  suggestNextQuestion,
  AIAnalysisResult,
  updateAIConfig 
} from '@/services/aiService';
import { AISuggestion, AIAnalysisDisplay } from '@/types/ai';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
  aiAnalysis?: AIAnalysisDisplay;
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
  const { agent } = useAgent();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [leadData, setLeadData] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysisResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync AI config with agent settings
  useEffect(() => {
    updateAIConfig({
      enabled: agent.aiConfig.enabled,
      interventionLevel: agent.aiConfig.interventionLevel,
    });
  }, [agent.aiConfig]);

  useEffect(() => {
    // Start conversation
    if (messages.length === 0) {
      addBotMessage(CONVERSATION_FLOW[0].question, CONVERSATION_FLOW[0].options);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string, options?: string[], aiAnalysis?: AIAnalysisDisplay) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      content,
      sender: 'bot',
      timestamp: new Date(),
      options,
      aiAnalysis,
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

  const processResponse = async (response: string) => {
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
        
        // Analyze demand with AI
        if (agent.aiConfig.enabled) {
          setIsAnalyzing(true);
          try {
            const analysis = await analyzeMessage(response, currentFlow);
            setLastAnalysis(analysis);
            
            // Show analysis in next message
            const aiDisplay: AIAnalysisDisplay = {
              legalArea: {
                name: analysis.possibleLegalArea.name,
                confidence: analysis.possibleLegalArea.confidence,
              },
              urgency: analysis.urgencyLevel,
              summary: analysis.summary,
              suggestions: analysis.suggestions,
            };
            
            // Store for display
            newLeadData.aiAnalysis = JSON.stringify(aiDisplay);
          } catch (error) {
            console.error('AI analysis failed:', error);
          }
          setIsAnalyzing(false);
        }
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
      
      // Get AI-enhanced question if enabled
      let nextQuestion = CONVERSATION_FLOW[nextStep].question;
      let questionOptions = CONVERSATION_FLOW[nextStep].options;
      
      if (agent.aiConfig.enabled && agent.aiConfig.interventionLevel === 'medio') {
        try {
          const suggestion = await suggestNextQuestion({
            currentStep: CONVERSATION_FLOW[nextStep],
            leadData: newLeadData,
            conversationHistory: messages.map(m => m.content),
          });
          nextQuestion = suggestion.question;
          questionOptions = suggestion.options;
        } catch (error) {
          console.error('AI suggestion failed:', error);
        }
      }
      
      setTimeout(() => {
        // Include AI analysis if we have one for demand step
        const aiAnalysis = lastAnalysis && currentFlow.id === 'demand' ? {
          legalArea: {
            name: lastAnalysis.possibleLegalArea.name,
            confidence: lastAnalysis.possibleLegalArea.confidence,
          },
          urgency: lastAnalysis.urgencyLevel,
          summary: lastAnalysis.summary,
          suggestions: lastAnalysis.suggestions,
        } : undefined;
        
        addBotMessage(nextQuestion, questionOptions, aiAnalysis);
        
        // If this is the complete step, save the lead
        if (CONVERSATION_FLOW[nextStep].type === 'complete') {
          const [city, state] = (newLeadData.location || 'Não informado, -').split(',').map(s => s.trim());
          
          addLead({
            name: newLeadData.name || 'Lead sem nome',
            phone: '(00) 00000-0000', // Simulated
            city,
            state,
            legalArea: lastAnalysis?.possibleLegalArea.key as LegalArea || mapAreaToKey(newLeadData.area || ''),
            demandDescription: newLeadData.demand,
            urgency: lastAnalysis?.urgencyLevel || mapUrgencyToKey(newLeadData.urgency || ''),
            status: (lastAnalysis?.urgencyLevel === 'alta' || newLeadData.urgency?.includes('Alta')) ? 'urgente' : 'qualificado',
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
    if (!input.trim() || isComplete || isAnalyzing) return;
    
    addUserMessage(input);
    processResponse(input);
    setInput('');
  };

  const handleOptionClick = (option: string) => {
    if (isComplete || isAnalyzing) return;
    
    addUserMessage(option);
    processResponse(option);
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentStep(0);
    setLeadData({});
    setIsComplete(false);
    setLastAnalysis(null);
    setCurrentSuggestion(null);
    setTimeout(() => {
      addBotMessage(CONVERSATION_FLOW[0].question, CONVERSATION_FLOW[0].options);
    }, 100);
  };

  const getUrgencyColor = (urgency: 'alta' | 'media' | 'baixa') => {
    switch (urgency) {
      case 'alta': return 'bg-urgent/10 text-urgent border-urgent/20';
      case 'media': return 'bg-warning/10 text-warning border-warning/20';
      case 'baixa': return 'bg-success/10 text-success border-success/20';
    }
  };

  return (
    <div className="card-elevated rounded-xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary text-primary-foreground rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">SDR Jurídico</h4>
              <p className="text-xs text-primary-foreground/70">Atendimento Automatizado</p>
            </div>
          </div>
          {agent.aiConfig.enabled && (
            <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
              <Sparkles className="w-3 h-3 mr-1" />
              IA Ativa
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div
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
                          disabled={isComplete || isAnalyzing}
                          className="w-full text-left px-3 py-2 text-sm bg-secondary/20 hover:bg-secondary/40 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Analysis Panel */}
              {message.aiAnalysis && agent.aiConfig.enabled && (
                <div className="mt-2 ml-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">Análise da IA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Área detectada:</span>
                      <p className="font-medium">{message.aiAnalysis.legalArea.name}</p>
                      <p className="text-muted-foreground">
                        Confiança: {Math.round(message.aiAnalysis.legalArea.confidence * 100)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Urgência:</span>
                      <Badge className={cn("mt-1", getUrgencyColor(message.aiAnalysis.urgency))}>
                        {message.aiAnalysis.urgency.charAt(0).toUpperCase() + message.aiAnalysis.urgency.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {message.aiAnalysis.suggestions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Sugestões:</span>
                      <ul className="mt-1 space-y-1">
                        {message.aiAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-xs">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="whatsapp-bubble-received flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analisando resposta...</span>
              </div>
            </div>
          )}
          
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
              disabled={isAnalyzing}
            />
            <Button onClick={handleSend} size="icon" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
