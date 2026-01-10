import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { LeadCard } from './LeadCard';
import { LeadStatus, LegalArea, LEGAL_AREAS, STATUS_LABELS } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, SortAsc } from 'lucide-react';

interface LeadsListProps {
  onSelectLead: (leadId: string) => void;
}

export function LeadsList({ onSelectLead }: LeadsListProps) {
  const { leads, selectedLead } = useLeads();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [areaFilter, setAreaFilter] = useState<LegalArea | 'all'>('all');

  const filteredLeads = leads.filter(lead => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (areaFilter !== 'all' && lead.legalArea !== areaFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v as LegalArea | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Área do Direito" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Áreas</SelectItem>
            {Object.entries(LEGAL_AREAS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} encontrado{filteredLeads.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLeads.map(lead => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onClick={() => onSelectLead(lead.id)}
            selected={selectedLead?.id === lead.id}
          />
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum lead encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
