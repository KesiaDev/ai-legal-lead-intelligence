import { cn } from '@/lib/utils';
import { 
  Settings, 
  MessageCircle, 
  FileText, 
  BookOpen, 
  RefreshCw, 
  Calendar, 
  Target,
  Bot,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Mic
} from 'lucide-react';
import { useState } from 'react';
import { AgentSection } from '@/types/agent';
import { useAgent } from '@/contexts/AgentContext';

interface AgentSidebarProps {
  currentSection: AgentSection;
  onSectionChange: (section: AgentSection) => void;
}

const agentSections = [
  { id: 'config' as AgentSection, label: 'Configurações', icon: Settings },
  { id: 'communication' as AgentSection, label: 'Comunicação', icon: MessageCircle },
  { id: 'humanization' as AgentSection, label: 'Humanização', icon: Sparkles },
  { id: 'voice' as AgentSection, label: 'Voz', icon: Mic },
  { id: 'prompts' as AgentSection, label: 'Prompts', icon: FileText },
  { id: 'knowledge' as AgentSection, label: 'Base de Conhecimento', icon: BookOpen },
  { id: 'followup' as AgentSection, label: 'Follow-up', icon: RefreshCw },
  { id: 'schedule' as AgentSection, label: 'Agenda', icon: Calendar },
  { id: 'intentions' as AgentSection, label: 'Intenções', icon: Target },
];

export function AgentSidebar({ currentSection, onSectionChange }: AgentSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const { agent } = useAgent();

  // Safe fallback for agent
  const safeAgent = agent || { name: 'SDR Jurídico' };

  return (
    <div className="border-r border-border bg-card h-full w-64 flex flex-col">
      {/* Agent Header */}
      <div className="p-4 border-b border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          AGENTES (1/1)
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full hover:bg-accent/50 rounded-lg p-2 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-success" />
          </div>
          <span className="font-medium text-sm flex-1 text-left">{safeAgent.name}</span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Agent Sections */}
      {expanded && (
        <nav className="flex-1 p-2 space-y-1 overflow-auto">
          {agentSections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors",
                currentSection === section.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <section.icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
