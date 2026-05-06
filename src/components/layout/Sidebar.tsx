import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, MessageSquare, Calendar, Download,
  Settings, Scale, ChevronLeft, ChevronRight, Bot, Image,
  Bell, BarChart2, Building2, Plug, Library, Send, Smartphone,
  FileSignature, FilePen,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navGroups = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
      { id: 'leads',        label: 'Leads',            icon: Users },
      { id: 'conversations',label: 'Conversas',        icon: MessageSquare },
      { id: 'schedule',     label: 'Agenda',           icon: Calendar },
      { id: 'followups',    label: 'Follow-ups',       icon: Bell },
      { id: 'reports',      label: 'Relatórios',       icon: BarChart2 },
    ],
  },
  {
    label: 'Agentes IA',
    items: [
      { id: 'agents-library', label: 'Biblioteca de Agentes', icon: Library },
      { id: 'multi-agents',   label: 'Multi-Agentes',         icon: Bot },
      { id: 'agent',          label: 'Config. Agente',        icon: Bot },
    ],
  },
  {
    label: 'Automação',
    items: [
      { id: 'bulk-messaging',    label: 'Envios em Massa',    icon: Send },
      { id: 'whatsapp-numbers',  label: 'Números WhatsApp',   icon: Smartphone },
    ],
  },
  {
    label: 'Plataformas IA',
    items: [
      { id: 'peticionamento', label: 'Peticionamento IA', icon: FilePen },
      { id: 'juris-ai',       label: 'Juris AI',          icon: Scale },
      { id: 'assinatura',     label: 'Assina com IA',     icon: FileSignature },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { id: 'media',        label: 'Banco de Mídia',  icon: Image },
      { id: 'departments',  label: 'Departamentos',   icon: Building2 },
      { id: 'integrations', label: 'Integrações',     icon: Plug },
      { id: 'export',       label: 'Exportar Dados',  icon: Download },
    ],
  },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar flex flex-col transition-all duration-300 relative flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in min-w-0">
              <h1 className="text-base font-display font-semibold text-sidebar-foreground leading-tight">
                SDR Jurídico
              </h1>
              <p className="text-[11px] text-sidebar-foreground/60">Inteligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation — scrollable */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest px-2 mb-1">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'sidebar-nav-item w-full',
                    collapsed && 'justify-center px-2',
                    currentView === item.id && 'sidebar-nav-item-active'
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="animate-fade-in text-sm">{item.label}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 pb-3 pt-2 border-t border-sidebar-border flex-shrink-0">
        <button
          type="button"
          className={cn('sidebar-nav-item w-full', collapsed && 'justify-center px-2', currentView === 'settings' && 'sidebar-nav-item-active')}
          onClick={() => onViewChange('settings')}
          title={collapsed ? 'Configurações' : undefined}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Configurações</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
