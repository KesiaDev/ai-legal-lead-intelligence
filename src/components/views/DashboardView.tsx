import { Users, UserCheck, AlertTriangle, Clock, MessageSquare, Calendar } from 'lucide-react';
import { useLeads } from '@/contexts/LeadsContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LeadsByAreaChart } from '@/components/dashboard/LeadsByAreaChart';
import { LeadCard } from '@/components/leads/LeadCard';
import { SalesFunnelView } from '@/components/funnel/SalesFunnelView';

interface DashboardViewProps {
  onSelectLead: (leadId: string) => void;
}

export function DashboardView({ onSelectLead }: DashboardViewProps) {
  const { leads } = useLeads();

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'qualificado').length,
    urgent: leads.filter(l => l.status === 'urgente').length,
    ready: leads.filter(l => l.status === 'pronto').length,
    pendingFollowUp: leads.filter(l => l.followUps.some(f => f.status === 'pending')).length,
  };

  const recentLeads = leads.slice(0, 3);
  const urgentLeads = leads.filter(l => l.status === 'urgente').slice(0, 3);

  return (
    <div className="space-y-8">
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

      {/* Funis de Campanha */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
            Funil de Vendas
          </h2>
          <p className="text-muted-foreground">
            Acompanhe seus negócios através dos funis de campanha
          </p>
        </div>
        <SalesFunnelView />
      </div>
    </div>
  );
}
