import { useState } from 'react';
import { useLeads } from '@/contexts/LeadsContext';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function LeadsView() {
  const { leads, selectedLead, setSelectedLead, isLoading, error, refreshLeads } = useLeads();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar leads</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshLeads} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
