import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, AlertTriangle, User, MessageSquare, TrendingUp } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useConversations } from '@/hooks/useConversation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Lead } from '@/types/lead';

interface LeadsQueueProps {
  onSelectLead: (leadId: string) => void;
}

export function LeadsQueue({ onSelectLead }: LeadsQueueProps) {
  const { leads, isLoading: leadsLoading } = useLeads();
  const { conversations, isLoading: conversationsLoading } = useConversations({ status: 'active' });

  if (leadsLoading || conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fila de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular SLA e prioridade
  const leadsWithSLA = leads.map(lead => {
    const conversation = conversations.find((c: any) => c.leadId === lead.id);
    const createdAt = new Date(lead.createdAt);
    const now = new Date();
    const minutesWaiting = Math.floor((now.getTime() - createdAt.getTime()) / 1000 / 60);
    
    // SLA: 5 minutos para primeira resposta
    const slaMinutes = 5;
    const slaStatus = minutesWaiting > slaMinutes ? 'exceeded' : minutesWaiting > slaMinutes * 0.8 ? 'warning' : 'ok';
    
    return {
      ...lead,
      conversation,
      minutesWaiting,
      slaStatus,
      priority: lead.urgency === 'alta' ? 'high' : lead.urgency === 'media' ? 'medium' : 'low',
    };
  });

  // Ordenar por prioridade e tempo de espera
  const sortedLeads = leadsWithSLA.sort((a, b) => {
    // Primeiro por SLA (excedido primeiro)
    if (a.slaStatus === 'exceeded' && b.slaStatus !== 'exceeded') return -1;
    if (b.slaStatus === 'exceeded' && a.slaStatus !== 'exceeded') return 1;
    
    // Depois por urgência
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority as keyof typeof priorityOrder] !== priorityOrder[b.priority as keyof typeof priorityOrder]) {
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    }
    
    // Por fim, por tempo de espera
    return b.minutesWaiting - a.minutesWaiting;
  });

  const exceededSLA = sortedLeads.filter(l => l.slaStatus === 'exceeded').length;
  const warningSLA = sortedLeads.filter(l => l.slaStatus === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Fila de Leads</CardTitle>
          <div className="flex items-center gap-2">
            {exceededSLA > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {exceededSLA} SLA excedido
              </Badge>
            )}
            {warningSLA > 0 && exceededSLA === 0 && (
              <Badge variant="outline" className="gap-1 text-warning border-warning">
                <Clock className="w-3 h-3" />
                {warningSLA} próximo do SLA
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-auto">
          {sortedLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum lead na fila</p>
            </div>
          ) : (
            sortedLeads.map((lead) => (
              <div
                key={lead.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50",
                  lead.slaStatus === 'exceeded' && "border-destructive bg-destructive/5",
                  lead.slaStatus === 'warning' && "border-warning bg-warning/5",
                  lead.priority === 'high' && "border-l-4 border-l-urgent"
                )}
                onClick={() => onSelectLead(lead.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{lead.name}</p>
                      {lead.urgency === 'alta' && (
                        <Badge variant="outline" className="text-xs bg-urgent/10 text-urgent border-urgent">
                          Urgente
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lead.minutesWaiting < 60
                          ? `${lead.minutesWaiting}min`
                          : `${Math.floor(lead.minutesWaiting / 60)}h ${lead.minutesWaiting % 60}min`}
                      </div>
                      {lead.conversation && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {lead.conversation.assignedType === 'ai' ? 'IA' : 'Humano'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {lead.slaStatus === 'exceeded' && (
                      <Badge variant="destructive" className="text-xs">
                        SLA Excedido
                      </Badge>
                    )}
                    {lead.slaStatus === 'warning' && (
                      <Badge variant="outline" className="text-xs text-warning border-warning">
                        Atenção SLA
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead.id);
                      }}
                    >
                      Atender
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
