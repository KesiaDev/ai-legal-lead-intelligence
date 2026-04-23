import { useState, useEffect, useRef } from 'react';
import { ConversationsSidebar } from './ConversationsSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatActions } from './ChatActions';
import { api } from '@/api/client';
import { Loader2 } from 'lucide-react';

export interface Conversation {
  id: string;
  leadId: string;
  lead: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: string;
  };
  channel: string;
  assignedType: 'ai' | 'human' | 'hybrid';
  status: 'active' | 'paused' | 'closed';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderType: 'lead' | 'sdr' | 'ai' | 'system';
  createdAt: string;
  intention?: string; // Intenção detectada (ex: "agendou_reuniao")
}

export function ChatLiveView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    selectedIdRef.current = selectedConversation?.id ?? null;
  }, [selectedConversation]);

  // Poll silencioso — nunca bloqueia a UI com spinner
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/api/conversations');
        if (!mountedRef.current) return;
        const data: Conversation[] = response.data.conversations || [];
        setConversations(data);
        if (data.length > 0 && !selectedIdRef.current) {
          setSelectedConversation(data[0]);
        }
      } catch (err: any) {
        console.error('Erro ao buscar conversas:', err);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // Manter conversa selecionada atualizada
  useEffect(() => {
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) setSelectedConversation(updated);
    }
  }, [conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selectedConversation?.id === updated.id) setSelectedConversation(updated);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar com lista de conversas */}
      <ConversationsSidebar
        conversations={conversations}
        selectedId={selectedConversation?.id}
        onSelect={handleSelectConversation}
      />

      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Barra de ações */}
            <ChatActions
              conversation={selectedConversation}
              onUpdate={handleUpdateConversation}
            />

            {/* Mensagens */}
            <ChatMessages
              conversation={selectedConversation}
              onUpdate={handleUpdateConversation}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg mb-2">Nenhuma conversa selecionada</p>
              <p className="text-sm">Selecione uma conversa na lista ao lado</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
