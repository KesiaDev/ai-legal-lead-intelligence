import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Conversation, Message } from './ChatLiveView';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  conversation: Conversation;
  onUpdate: (updated: Conversation) => void;
}

export function ChatMessages({ conversation, onUpdate }: ChatMessagesProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
      }
    } catch {
      return '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input.trim();
    setInput('');
    setIsSending(true);

    try {
      // Enviar mensagem via API
      const response = await api.post(`/api/conversations/${conversation.id}/messages`, {
        content: messageContent,
        senderType: 'sdr',
      });

      // Atualizar conversa com nova mensagem
      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      // Em caso de erro, ainda mostra a mensagem localmente
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderType: 'sdr',
        createdAt: new Date().toISOString(),
      };
      onUpdate({
        ...conversation,
        messages: [...conversation.messages, tempMessage],
      });
    } finally {
      setIsSending(false);
    }
  };

  const getMessageBubbleClass = (senderType: string) => {
    switch (senderType) {
      case 'lead':
        return 'bg-blue-500 text-white ml-auto';
      case 'sdr':
        return 'bg-green-500 text-white ml-auto';
      case 'ai':
        return 'bg-muted text-foreground';
      case 'system':
        return 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getSenderLabel = (senderType: string) => {
    switch (senderType) {
      case 'lead':
        return conversation.lead.name;
      case 'sdr':
        return 'Você';
      case 'ai':
        return 'SDR Jurídico';
      case 'system':
        return 'Sistema';
      default:
        return 'Desconhecido';
    }
  };

  // Agrupar mensagens por data
  const groupedMessages = conversation.messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header com nome do lead */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{conversation.lead.name}</h3>
            <p className="text-sm text-muted-foreground">{conversation.lead.phone}</p>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date}>
              {/* Separador de data */}
              <div className="flex items-center justify-center my-4">
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {date}
                </div>
              </div>

              {/* Mensagens do dia */}
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg p-3',
                      getMessageBubbleClass(message.senderType),
                      message.senderType === 'lead' || message.senderType === 'sdr'
                        ? 'ml-auto'
                        : 'mr-auto'
                    )}
                  >
                    {/* Label do remetente */}
                    {message.senderType !== 'lead' && (
                      <p className="text-xs font-medium mb-1 opacity-80">
                        {getSenderLabel(message.senderType)}
                      </p>
                    )}

                    {/* Conteúdo da mensagem */}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Timestamp */}
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>

                  {/* Badge de intenção detectada */}
                  {message.intention && (
                    <div className="mt-2 ml-2">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                        Intenção detectada: {message.intention}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {conversation.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm mt-2">Inicie a conversa enviando uma mensagem</p>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input de mensagem */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={isSending || conversation.status === 'paused'}
          />
          <Button
            onClick={handleSend}
            disabled={isSending || !input.trim() || conversation.status === 'paused'}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
