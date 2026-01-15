import { useState } from 'react';
import { LeadsProvider, useLeads } from '@/contexts/LeadsContext';
import { AgentProvider } from '@/contexts/AgentContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { LeadsView } from '@/components/views/LeadsView';
import { ConversationsView } from '@/components/views/ConversationsView';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { ExportPanel } from '@/components/export/ExportPanel';
import { AgentConfigView } from '@/components/views/AgentConfigView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Configurações
        </h2>
        <p className="text-muted-foreground mt-1">
          Personalize o comportamento do SDR Jurídico.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="font-display">Notificações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure alertas para leads urgentes e novos contatos.
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <CardTitle className="font-display">Compliance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configurações de LGPD e mensagens de consentimento.
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-warning" />
              </div>
              <CardTitle className="font-display">Personalização</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Personalize as mensagens do SDR com a identidade do seu escritório.
            </p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-secondary" />
              </div>
              <CardTitle className="font-display">Integrações</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure webhooks e integrações com seu CRM.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { leads, setSelectedLead } = useLeads();

  // Safe fallback for leads (já vem do context que usa API)
  const safeLeads = leads || [];

  const handleSelectLead = (leadId: string) => {
    const lead = safeLeads.find(l => l.id === leadId);
    setSelectedLead(lead || null);
    setCurrentView('leads');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'leads': return 'Gestão de Leads';
      case 'conversations': return 'Conversas';
      case 'schedule': return 'Agendamentos';
      case 'export': return 'Exportar Dados';
      case 'agent': return 'Configuração do Agente';
      case 'settings': return 'Configurações';
      default: return 'SDR Jurídico';
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Visão geral do seu funil de leads';
      case 'leads': return `${safeLeads.length} leads no sistema`;
      case 'conversations': return 'Simulador de atendimento';
      default: return undefined;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Header title={getViewTitle()} subtitle={getViewSubtitle()} />
        
        <div className="flex-1 overflow-auto p-6">
          {currentView === 'dashboard' && (
            <DashboardView onSelectLead={handleSelectLead} />
          )}
          {currentView === 'leads' && <LeadsView />}
          {currentView === 'conversations' && <ConversationsView />}
          {currentView === 'schedule' && <ScheduleView />}
          {currentView === 'export' && <ExportPanel />}
          {currentView === 'agent' && <AgentConfigView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

const Index = () => {
  return (
    <LeadsProvider>
      <AgentProvider>
        <AppContent />
      </AgentProvider>
    </LeadsProvider>
  );
};

export default Index;
