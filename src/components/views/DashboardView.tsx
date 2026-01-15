import { Users, UserCheck, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LeadsByAreaChart } from '@/components/dashboard/LeadsByAreaChart';
import { LeadCard } from '@/components/leads/LeadCard';
import { LeadsQueue } from '@/components/operational/LeadsQueue';
import { OperationalDashboard } from '@/components/operational/OperationalDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardViewProps {
  onSelectLead: (leadId: string) => void;
}

export function DashboardView({ onSelectLead }: DashboardViewProps) {
  const { leads, isLoading } = useLeads();

  // Safe fallback para leads
  const safeLeads = leads || [];

  const stats = {
    total: safeLeads.length,
    qualified: safeLeads.filter(l => l.status === 'qualificado' || l.status === 'qualificado').length,
    urgent: safeLeads.filter(l => l.status === 'urgente' || l.urgency === 'alta').length,
    ready: safeLeads.filter(l => l.status === 'pronto' || l.availableForHumanContact).length,
    pendingFollowUp: safeLeads.filter(l => (l as any).followUps?.some((f: any) => f.status === 'pending') || false).length,
  };

  const recentLeads = safeLeads.slice(0, 3);
  const urgentLeads = safeLeads.filter(l => l.status === 'urgente' || l.urgency === 'alta').slice(0, 3);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="operational">Controle Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total de Leads"
              value={stats.total}
              subtitle="Leads recebidos"
              icon={Users}
            />
            <StatsCard
              title="Qualificados"
              value={stats.qualified}
              subtitle="Prontos para análise"
              icon={UserCheck}
              variant="success"
            />
            <StatsCard
              title="Urgentes"
              value={stats.urgent}
              subtitle="Requer atenção imediata"
              icon={AlertTriangle}
              variant="urgent"
            />
            <StatsCard
              title="Follow-ups Pendentes"
              value={stats.pendingFollowUp}
              subtitle="Mensagens agendadas"
              icon={Clock}
              variant="warning"
            />
          </div>

          {/* Charts and Lists */}
          <div className="grid gap-6 lg:grid-cols-3">
            <LeadsByAreaChart />
            
            <div className="lg:col-span-2 space-y-6">
              {/* Urgent Leads */}
              {urgentLeads.length > 0 && (
                <div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-urgent" />
                    Leads Urgentes
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {urgentLeads.map(lead => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onClick={() => onSelectLead(lead.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Leads */}
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-secondary" />
                  Leads Recentes
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentLeads.map(lead => (
                    <LeadCard 
                      key={lead.id} 
                      lead={lead} 
                      onClick={() => onSelectLead(lead.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <OperationalDashboard />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LeadsQueue onSelectLead={onSelectLead} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
