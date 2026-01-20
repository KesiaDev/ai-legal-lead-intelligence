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
import { SettingsView } from '@/components/settings/SettingsView';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const { leads, setSelectedLead } = useLeads();

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
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
      case 'leads': return `${leads.length} leads no sistema`;
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
