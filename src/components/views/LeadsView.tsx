import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadDetail } from '@/components/leads/LeadDetail';

export function LeadsView() {
  const { leads, selectedLead, setSelectedLead } = useLeads();

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setSelectedLead(lead || null);
  };

  return (
    <div className="flex gap-6 h-full">
      <div className={selectedLead ? "flex-1" : "w-full"}>
        <LeadsList onSelectLead={handleSelectLead} />
      </div>
      
      {selectedLead && (
        <div className="w-[400px] flex-shrink-0">
          <LeadDetail 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)}
          />
        </div>
      )}
    </div>
  );
}
