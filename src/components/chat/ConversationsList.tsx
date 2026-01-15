import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Clock, Bot, UserCheck } from 'lucide-react';
import { useConversations } from '@/hooks/useConversation';
import { Conversation } from '@/api/conversations';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConversationsListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationsList({ selectedConversationId, onSelectConversation }: ConversationsListProps) {
  const { conversations, isLoading, error } = useConversations({ status: 'active' });

  if (error) {
    return (
      <div className="w-80 border-r border-border bg-card p-4">
        <div className="text-center py-8">
          <p className="text-sm text-destructive mb-2">Erro ao carregar conversas</p>
          <p className="text-xs text-muted-foreground">
            {error.message?.includes('ERR_CONNECTION_REFUSED') 
              ? 'Backend não está rodando' 
              : error.message || 'Erro desconhecido'}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-80 border-r border-border bg-card p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="w-80 border-r border-border bg-card p-4">
        <p className="text-muted-foreground text-sm text-center py-8">
          Nenhuma conversa ativa
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Conversas Ativas</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        {conversations.map((conversation: Conversation) => {
          const lastMessage = conversation.messages?.[conversation.messages.length - 1];
          const isSelected = selectedConversationId === conversation.id;
          const isAI = conversation.assignedType === 'ai';
          const isHuman = conversation.assignedType === 'human';

          return (
            <Card
              key={conversation.id}
              className={cn(
                "m-2 cursor-pointer transition-colors",
                isSelected && "border-primary bg-primary/5",
                !isSelected && "hover:bg-accent/50"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {conversation.lead?.name || 'Lead sem nome'}
                      </p>
                      {isAI && (
                        <Badge variant="outline" className="text-xs">
                          <Bot className="w-3 h-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      {isHuman && (
                        <Badge variant="outline" className="text-xs">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Humano
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {lastMessage.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(conversation.updatedAt), "HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
