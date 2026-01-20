import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from './ChatLiveView';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationsSidebar({
  conversations,
  selectedId,
  onSelect,
}: ConversationsSidebarProps) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(conv => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      conv.lead.name.toLowerCase().includes(searchLower) ||
      conv.lead.phone.includes(search) ||
      conv.lead.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
      }
      
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getLastMessage = (conv: Conversation) => {
    if (conv.messages && conv.messages.length > 0) {
      const last = conv.messages[conv.messages.length - 1];
      return last.content.substring(0, 50) + (last.content.length > 50 ? '...' : '');
    }
    return 'Sem mensagens';
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-500/10 text-green-600 border-green-500/20',
      chat: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      email: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      instagram: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    };
    return colors[channel] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Conversas</h3>
          <Badge variant="outline">{conversations.length}</Badge>
        </div>
        
        {/* Busca */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros */}
        <Button variant="outline" size="sm" className="w-full">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa no momento'}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={cn(
                  "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                  selectedId === conv.id && "bg-muted border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lead.phone}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatTime(conv.updatedAt)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {getLastMessage(conv)}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getChannelBadge(conv.channel))}
                  >
                    {conv.channel === 'whatsapp' ? 'WhatsApp' : 
                     conv.channel === 'chat' ? 'Chat' :
                     conv.channel === 'email' ? 'Email' :
                     conv.channel === 'instagram' ? 'Instagram' : conv.channel}
                  </Badge>
                  
                  {conv.status === 'paused' && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                      Pausado
                    </Badge>
                  )}
                  
                  {conv.assignedType === 'ai' && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                      IA
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
