import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, UserCheck, Bot as BotIcon, Pause, Play, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useConversation } from '@/hooks/useConversation';
import { useLead } from '@/hooks/useLeads';
import { useAgent } from '@/contexts/AgentContext';
import { conversationsApi } from '@/api/conversations';
import { ChatSidebar } from './ChatSidebar';
import { Message } from '@/api/conversations';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

interface ChatLiveProps {
  conversationId: string | null;
  leadId?: string | null;
}

export function ChatLive({ conversationId, leadId }: ChatLiveProps) {
  const queryClient = useQueryClient();
  const { conversation, messages, sendMessage: sendMessageApi, updateConversation, isLoading, error } = useConversation(conversationId);
  const resolvedLeadId = leadId || conversation?.leadId || null;
  const { lead } = useLead(resolvedLeadId);
  const { agent } = useAgent();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isConnected: wsConnected, lastMessage: wsMessage, sendTyping } = useWebSocket(conversationId);

  // Safe fallback for agent
  const safeAgent = agent || {
    aiConfig: {
      enabled: false,
      interventionLevel: 'medio' as const,
    },
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detectar quando IA está respondendo (última mensagem é do lead em modo AI)
  useEffect(() => {
    if (conversation?.assignedType === 'ai' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Se última mensagem é do lead e não há resposta da IA ainda, IA está processando
      if (lastMessage.senderType === 'lead') {
        setIsAIResponding(true);
        // Timeout para limpar indicador se IA não responder em 10s
        const timeout = setTimeout(() => {
          setIsAIResponding(false);
        }, 10000);
        return () => clearTimeout(timeout);
      } else if (lastMessage.senderType === 'ai' && lastMessage.isAI) {
        // IA respondeu
        setIsAIResponding(false);
      }
    } else {
      setIsAIResponding(false);
    }
  }, [messages, conversation?.assignedType]);

  // Handle WebSocket messages em tempo real
  useEffect(() => {
    if (wsMessage) {
      switch (wsMessage.type) {
        case 'new_message':
          // Nova mensagem recebida - invalidar query para atualizar
          queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
          break;
        case 'conversation_updated':
          // Conversa atualizada - invalidar query
          queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
          break;
        case 'typing':
          // Alguém está digitando (pode ser usado no futuro)
          break;
      }
    }
  }, [wsMessage, conversationId, queryClient]);

  const handleSend = async () => {
    if (!input.trim() || isSending || !conversationId) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Mensagem do operador sempre é do tipo 'human'
      const response = await sendMessageApi({
        content: messageContent,
        senderType: 'human',
        isAI: false,
      });

      // Se a IA respondeu automaticamente (quando mensagem é do lead em modo AI)
      // Isso é tratado no backend, mas podemos verificar se há aiResponse
      if (response.data.aiResponse) {
        // A resposta da IA já foi salva pelo backend
        // O polling vai atualizar as mensagens automaticamente
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput(messageContent); // Restaurar input em caso de erro
    } finally {
      setIsSending(false);
    }
  };

  const handleTakeOver = async () => {
    if (!conversationId) return;
    
    try {
      await updateConversation({
        assignedType: 'human',
        assignedTo: null, // Será preenchido pelo backend com usuário atual
      });
    } catch (error) {
      console.error('Failed to take over conversation:', error);
    }
  };

  const handleReturnToAI = async () => {
    if (!conversationId) return;
    
    try {
      await updateConversation({
        assignedType: 'ai',
        assignedTo: null,
      });
    } catch (error) {
      console.error('Failed to return to AI:', error);
    }
  };

  const handlePause = async () => {
    if (!conversationId) return;
    
    try {
      await updateConversation({
        status: 'paused',
      });
    } catch (error) {
      console.error('Failed to pause conversation:', error);
    }
  };

  const handleResume = async () => {
    if (!conversationId) return;
    
    try {
      await updateConversation({
        status: 'active',
      });
    } catch (error) {
      console.error('Failed to resume conversation:', error);
    }
  };

  if (isLoading && !conversation) {
    return (
      <div className="card-elevated rounded-xl h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated rounded-xl h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Erro ao carregar conversa</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="card-elevated rounded-xl h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Nenhuma conversa selecionada</p>
          <p className="text-sm text-muted-foreground">
            Selecione um lead para iniciar uma conversa
          </p>
        </div>
      </div>
    );
  }

  const isAI = conversation.assignedType === 'ai';
  const isHuman = conversation.assignedType === 'human';
  const isHybrid = conversation.assignedType === 'hybrid';
  const isPaused = conversation.status === 'paused';

  return (
    <div className="flex h-[600px] rounded-xl overflow-hidden border border-border">
      {/* Sidebar com contexto do lead */}
      <ChatSidebar lead={lead} />

      {/* Chat principal */}
      <div className="flex-1 flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <BotIcon className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h4 className="font-semibold">SDR Jurídico</h4>
                <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
                  {isAI && (
                    <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                      <Bot className="w-3 h-3 mr-1" />
                      IA Ativa
                    </Badge>
                  )}
                  {isHuman && (
                    <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Atendimento Humano
                    </Badge>
                  )}
                  {isHybrid && (
                    <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Modo Híbrido
                    </Badge>
                  )}
                  {isPaused && (
                    <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                      <Pause className="w-3 h-3 mr-1" />
                      Pausado
                    </Badge>
                  )}
                  {wsConnected && (
                    <span className="text-xs">● Conectado</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAI && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  onClick={handleTakeOver}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Assumir
                </Button>
              )}
              {isHuman && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  onClick={handleReturnToAI}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Devolver para IA
                </Button>
              )}
              {!isPaused ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  onClick={handlePause}
                >
                  <Pause className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
                  onClick={handleResume}
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma mensagem ainda</p>
                <p className="text-sm">Inicie a conversa enviando uma mensagem</p>
              </div>
            ) : (
              messages.map((message: Message) => {
                const isFromLead = message.senderType === 'lead';
                const isFromAI = message.isAI;
                const isFromHuman = message.senderType === 'human' && !message.isAI;

                return (
                  <div key={message.id}>
                    <div
                      className={cn(
                        "flex",
                        isFromLead ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[80%]",
                        isFromLead
                          ? "whatsapp-bubble-sent"
                          : isFromAI
                          ? "whatsapp-bubble-received"
                          : "whatsapp-bubble-received bg-secondary/20"
                      )}>
                        <div className="flex items-start gap-2">
                          {!isFromLead && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {isFromAI ? (
                                <Bot className="w-3 h-3 text-primary" />
                              ) : (
                                <User className="w-3 h-3 text-primary" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              isFromLead
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}>
                              {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="whatsapp-bubble-received flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Enviando...</span>
                </div>
              </div>
            )}
            {isAIResponding && conversation?.assignedType === 'ai' && (
              <div className="flex justify-start">
                <div className="whatsapp-bubble-received flex items-center gap-2">
                  <Bot className="w-4 h-4 animate-pulse text-primary" />
                  <span className="text-sm text-muted-foreground">IA está digitando...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          {isPaused ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Conversa pausada
              </p>
              <Button size="sm" onClick={handleResume}>
                <Play className="w-4 h-4 mr-2" />
                Retomar
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isAI ? "A IA responderá automaticamente..." : "Digite sua mensagem..."}
                className="flex-1"
                disabled={isSending || isAI}
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={isSending || !input.trim() || isAI}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
