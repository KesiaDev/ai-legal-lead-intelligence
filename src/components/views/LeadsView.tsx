import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { LeadsList } from '@/components/leads/LeadsList';
import { LeadDetail } from '@/components/leads/LeadDetail';
import { AlertCircle, Server, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LeadsView() {
  const { leads, isLoading, error } = useLeads();
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find((l: any) => l.id === leadId);
    setSelectedLead(lead || null);
  };

  // Tratamento de erro de conexão
  if (error) {
    const isConnectionError = error.message?.includes('ERR_CONNECTION_REFUSED') || 
                            error.message?.includes('Failed to fetch') ||
                            error.message?.includes('Network Error');

    if (isConnectionError) {
      return (
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <CardTitle>Backend não está rodando</CardTitle>
                  <CardDescription>
                    Não foi possível conectar ao servidor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                O backend precisa estar rodando em <code className="text-xs bg-muted px-1 py-0.5 rounded">localhost:3001</code>
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Para iniciar o backend:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Abra um terminal</li>
                  <li>Navegue até a pasta <code className="text-xs bg-muted px-1 py-0.5 rounded">backend</code></li>
                  <li>Execute: <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
                </ol>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Outros erros
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Erro ao carregar leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Ocorreu um erro desconhecido'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
            >
              Recarregar página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

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
