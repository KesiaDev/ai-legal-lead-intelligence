import { Bot, Pause, X, Calendar, User, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from './ChatLiveView';
import { api } from '@/api/client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChatActionsProps {
  conversation: Conversation;
  onUpdate: (updated: Conversation) => void;
}

export function ChatActions({ conversation, onUpdate }: ChatActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleAI = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newType = conversation.assignedType === 'ai' ? 'human' : 'ai';
      const response = await api.patch(`/api/conversations/${conversation.id}/assigned-type`, {
        assignedType: newType,
      });

      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao atualizar tipo:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePause = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus = conversation.status === 'paused' ? 'active' : 'paused';
      const response = await api.patch(`/api/conversations/${conversation.id}/status`, {
        status: newStatus,
      });

      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao pausar conversa:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkNotQualified = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // Atualizar status do lead para "não qualificado"
      await api.patch(`/api/leads/${conversation.leadId}`, {
        status: 'perdido',
      });

      // Registrar intenção
      await api.post(`/api/conversations/${conversation.id}/intentions`, {
        intention: 'nao_qualificado',
      });

      // Recarregar conversa
      const response = await api.get(`/api/conversations/${conversation.id}`);
      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao marcar como não qualificado:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkScheduled = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // Registrar intenção
      await api.post(`/api/conversations/${conversation.id}/intentions`, {
        intention: 'agendou_reuniao',
      });

      // Atualizar status do lead
      await api.patch(`/api/leads/${conversation.leadId}`, {
        status: 'consulta_agendada',
      });

      // Recarregar conversa
      const response = await api.get(`/api/conversations/${conversation.id}`);
      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao marcar como agendado:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkNotTransferred = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      // Registrar intenção
      await api.post(`/api/conversations/${conversation.id}/intentions`, {
        intention: 'nao_transferido',
      });

      // Recarregar conversa
      const response = await api.get(`/api/conversations/${conversation.id}`);
      if (response.data.conversation) {
        onUpdate(response.data.conversation);
      }
    } catch (err: any) {
      console.error('Erro ao marcar como não transferido:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
      {/* Informações do lead */}
      <div className="flex items-center gap-4">
        <div>
          <h3 className="font-semibold">{conversation.lead.name}</h3>
          <p className="text-sm text-muted-foreground">{conversation.lead.phone}</p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex items-center gap-2">
        {/* Botão IA */}
        <Button
          variant={conversation.assignedType === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleAI}
          disabled={isUpdating}
          className={cn(
            conversation.assignedType === 'ai' && 'bg-blue-600 hover:bg-blue-700'
          )}
        >
          <Bot className="w-4 h-4 mr-2" />
          IA
        </Button>

        {/* Botão Pausar */}
        <Button
          variant={conversation.status === 'paused' ? 'default' : 'outline'}
          size="sm"
          onClick={handleTogglePause}
          disabled={isUpdating}
          className={cn(
            conversation.status === 'paused' && 'bg-yellow-600 hover:bg-yellow-700'
          )}
        >
          <Pause className="w-4 h-4 mr-2" />
          {conversation.status === 'paused' ? 'Retomar' : 'Pausar'}
        </Button>

        {/* Botão Não Qualificado */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkNotQualified}
          disabled={isUpdating || conversation.lead.status === 'perdido'}
        >
          <X className="w-4 h-4 mr-2" />
          Não Qualificado
        </Button>

        {/* Botão Agendado */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkScheduled}
          disabled={isUpdating || conversation.lead.status === 'consulta_agendada'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Agendado
        </Button>

        {/* Botão Não Transferido */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkNotTransferred}
          disabled={isUpdating}
        >
          <User className="w-4 h-4 mr-2" />
          Não Transferido
        </Button>

        {/* Status badges */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-border">
          {conversation.status === 'paused' && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
              Pausado
            </Badge>
          )}
          {conversation.assignedType === 'ai' && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
              IA Ativa
            </Badge>
          )}
          {conversation.lead.status === 'consulta_agendada' && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600">
              <Check className="w-3 h-3 mr-1" />
              Agendado
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
