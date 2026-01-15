import { useLeads } from '@/hooks/useLeads';
import { useConversations } from '@/hooks/useConversation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MessageSquare, TrendingUp, AlertTriangle, Bot, UserCheck, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function OperationalDashboard() {
  const { leads, isLoading: leadsLoading } = useLeads();
  const { conversations, isLoading: conversationsLoading } = useConversations({ status: 'active' });

  if (leadsLoading || conversationsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const now = new Date();
  
  // Calcular métricas
  const activeConversations = conversations.length;
  const aiConversations = conversations.filter((c: any) => c.assignedType === 'ai').length;
  const humanConversations = conversations.filter((c: any) => c.assignedType === 'human').length;
  const hybridConversations = conversations.filter((c: any) => c.assignedType === 'hybrid').length;

  // SLA: 5 minutos para primeira resposta
  const slaMinutes = 5;
  const leadsWithSLA = leads.map(lead => {
    const createdAt = new Date(lead.createdAt);
    const minutesWaiting = Math.floor((now.getTime() - createdAt.getTime()) / 1000 / 60);
    return { ...lead, minutesWaiting, slaExceeded: minutesWaiting > slaMinutes };
  });

  const slaExceeded = leadsWithSLA.filter(l => l.slaExceeded).length;
  const slaWarning = leadsWithSLA.filter(l => l.minutesWaiting > slaMinutes * 0.8 && !l.slaExceeded).length;
  const avgResponseTime = activeConversations > 0
    ? Math.round(
        conversations.reduce((acc: number, conv: any) => {
          const createdAt = new Date(conv.createdAt);
          const minutes = Math.floor((now.getTime() - createdAt.getTime()) / 1000 / 60);
          return acc + minutes;
        }, 0) / activeConversations
      )
    : 0;

  // Taxa de conversão (simplificada - leads que chegaram a "pronto")
  const convertedLeads = leads.filter((l: any) => l.status === 'pronto' || l.status === 'qualificado').length;
  const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConversations}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Bot className="w-3 h-3" />
              <span>{aiConversations} IA</span>
              <span className="mx-1">•</span>
              <UserCheck className="w-3 h-3" />
              <span>{humanConversations} Humano</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">SLA</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slaExceeded > 0 ? (
                <span className="text-destructive">{slaExceeded}</span>
              ) : (
                <span className="text-success">OK</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {slaExceeded > 0
                ? `${slaExceeded} excedido${slaExceeded > 1 ? 's' : ''}`
                : slaWarning > 0
                ? `${slaWarning} próximo${slaWarning > 1 ? 's' : ''} do limite`
                : 'Todos dentro do SLA'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}min</div>
            <p className="text-xs text-muted-foreground mt-2">
              Tempo médio de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {convertedLeads} de {leads.length} leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição IA vs Humano */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <Bot className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{aiConversations}</div>
              <p className="text-xs text-muted-foreground">IA</p>
              {activeConversations > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((aiConversations / activeConversations) * 100).toFixed(0)}%
                </p>
              )}
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/10">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">{humanConversations}</div>
              <p className="text-xs text-muted-foreground">Humano</p>
              {activeConversations > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((humanConversations / activeConversations) * 100).toFixed(0)}%
                </p>
              )}
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold">{hybridConversations}</div>
              <p className="text-xs text-muted-foreground">Híbrido</p>
              {activeConversations > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {((hybridConversations / activeConversations) * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
