import { useState } from 'react';
import { AgentSection } from '@/types/agent';
import { AgentSidebar } from '@/components/agent/AgentSidebar';
import { AgentConfigSection } from '@/components/agent/sections/AgentConfigSection';
import { CommunicationSection } from '@/components/agent/sections/CommunicationSection';
import { HumanizationSection } from '@/components/agent/sections/HumanizationSection';
import { VoiceConfigSection } from '@/components/agent/sections/VoiceConfigSection';
import { PromptsSection } from '@/components/agent/sections/PromptsSection';
import { TemplatesSection } from '@/components/agent/sections/TemplatesSection';
import { KnowledgeBaseSection } from '@/components/agent/sections/KnowledgeBaseSection';
import { FollowUpSection } from '@/components/agent/sections/FollowUpSection';
import { ScheduleConfigSection } from '@/components/agent/sections/ScheduleConfigSection';
import { IntentionsSection } from '@/components/agent/sections/IntentionsSection';
import { TriggersSection } from '@/components/agent/sections/TriggersSection';
import { useAgent } from '@/contexts/AgentContext';

export function AgentConfigView() {
  const [currentSection, setCurrentSection] = useState<AgentSection>('config');
  const { agent } = useAgent();

  const renderSection = () => {
    switch (currentSection) {
      case 'config':
        return <AgentConfigSection />;
      case 'communication':
        return <CommunicationSection />;
      case 'humanization':
        return <HumanizationSection />;
      case 'voice':
        return <VoiceConfigSection />;
      case 'prompts':
        return <PromptsSection />;
      case 'templates':
        return <TemplatesSection />;
      case 'knowledge':
        return <KnowledgeBaseSection />;
      case 'followup':
        return <FollowUpSection />;
      case 'schedule':
        return <ScheduleConfigSection />;
      case 'intentions':
        return <IntentionsSection />;
      case 'triggers':
        return <TriggersSection />;
      default:
        return <AgentConfigSection />;
    }
  };

  return (
    <div className="flex h-full -m-6">
      <AgentSidebar 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      <div className="flex-1 p-6 overflow-auto">
        {renderSection()}
      </div>
    </div>
  );
}
