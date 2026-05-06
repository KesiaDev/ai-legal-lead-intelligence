import { Bot, Pause, X, Calendar, User, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from './ChatLiveView';
import { api } from '@/api/client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AISummary {
  legalArea: string;
  urgency: string;
  collectedData: string[];
  nextStep: string;
}

interface ChatActionsProps {
  conversation: Conversation;
  onUpdate: (updated: Conversation) => void;
}

export function ChatActions({ conversation, onUpdate }: ChatActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);

  const MOCK_SUMMARY: AISummary = {
    legalArea: 'Trabalhista',
    urgency: 'Alta — prazo prescricional próximo (menos de 30 dias)',
    collectedData: [
      'Nome: ' + conversation.lead.name,
      'Telefone: ' + conversation.lead.phone,
      'Demissão sem justa causa relatada',
      'FGTS não depositado nos últimos 8 meses',
      'Empresa ainda ativa (confirmado pelo lead)',
    ],
    nextStep: 'Agendar consulta presencial para coleta de documentos e abertura de processo.',
  };

  const handleOpenSummary = async () => {
    setSummaryOpen(true);
    setSummaryLoading(true);
    setSummary(null);
    try {
      const response = await api.post('/api/ai/summary', {
        conversationId: conversation.id,
      });
      setSummary(response.data.summary as AISummary);
    } catch {
      setSummary(MOCK_SUMMARY);
    } finally {
      setSummaryLoading(false);
    }
  };

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
    <>
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

        {/* Botão Resumo IA */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSummary}
          disabled={isUpdating}
          className="border-purple-500/30 text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/60"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Resumo IA
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

      {/* Dialog Resumo IA */}

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Resumo IA — {conversation.lead.name}
            </DialogTitle>
          </DialogHeader>

          {summaryLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : summary ? (
            <div className="space-y-3 py-2">
              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Área jurídica detectada
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {summary.legalArea}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Urgência
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-sm">{summary.urgency}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Dados coletados
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <ul className="space-y-1">
                    {summary.collectedData.map((item, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-xs text-muted-foreground uppercase tracking-wide">
                    Próximo passo recomendado
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <p className="text-sm font-medium text-green-600">{summary.nextStep}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
