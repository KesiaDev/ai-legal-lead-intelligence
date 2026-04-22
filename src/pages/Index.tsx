import { useState } from 'react';
import { LeadsProvider, useLeads } from '@/contexts/LeadsContext';
import { AgentProvider } from '@/contexts/AgentContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { LeadsView } from '@/components/views/LeadsView';
import { ConversationsView } from '@/components/views/ConversationsView';
import { ScheduleView } from '@/components/schedule/ScheduleView';
import { MediaBankView } from '@/components/views/MediaBankView';
import { ExportPanel } from '@/components/export/ExportPanel';
import { AgentConfigView } from '@/components/views/AgentConfigView';
import { MissingFeaturesView } from '@/components/views/MissingFeaturesView';
import { FollowUpView } from '@/components/views/FollowUpView';
import { ReportsView } from '@/components/views/ReportsView';
import { DepartmentsView } from '@/components/views/DepartmentsView';
import { IntegrationsView } from '@/components/views/IntegrationsView';
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
      case 'schedule': return 'Agenda';
      case 'media': return 'Banco de Mídia';
      case 'followups': return 'Follow-ups';
      case 'reports': return 'Relatórios';
      case 'departments': return 'Departamentos';
      case 'integrations': return 'Integrações';
      case 'export': return 'Exportar Dados';
      case 'agent': return 'Configuração do Agente';
      case 'roadmap': return 'O que falta';
      case 'settings': return 'Configurações';
      default: return 'SDR Jurídico';
    }
  };

  const getViewSubtitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Visão geral do seu funil de leads';
      case 'leads': return `${leads.length} leads no sistema`;
      case 'conversations': return 'Simulador de atendimento';
      case 'media': return 'Gerencie imagens, vídeos, áudios e documentos';
      case 'followups': return 'Lembretes e acompanhamentos agendados';
      case 'reports': return 'Métricas detalhadas do seu SDR Jurídico';
      case 'departments': return 'Organize sua equipe por área de atuação';
      case 'integrations': return 'Conecte WhatsApp, CRM, Calendário e sistemas jurídicos';
      case 'roadmap': return 'O que o sistema ainda não tem';
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
          {currentView === 'media' && <MediaBankView />}
          {currentView === 'export' && <ExportPanel />}
          {currentView === 'followups' && <FollowUpView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'departments' && <DepartmentsView />}
          {currentView === 'integrations' && <IntegrationsView />}
          {currentView === 'agent' && <AgentConfigView />}
          {currentView === 'roadmap' && <MissingFeaturesView />}
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
