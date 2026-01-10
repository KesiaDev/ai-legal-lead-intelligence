import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Calendar, 
  Download, 
  Settings,
  Scale,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'conversations', label: 'Conversas', icon: MessageSquare },
  { id: 'schedule', label: 'Agendamentos', icon: Calendar },
  { id: 'export', label: 'Exportar Dados', icon: Download },
  { id: 'agent', label: 'Agente IA', icon: Bot },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-display font-semibold text-sidebar-foreground">
                SDR Jurídico
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Inteligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "sidebar-nav-item w-full",
              currentView === item.id && "sidebar-nav-item-active"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="animate-fade-in">{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          className="sidebar-nav-item w-full"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
