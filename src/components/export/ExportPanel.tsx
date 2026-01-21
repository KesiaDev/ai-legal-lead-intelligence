import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeads } from '@/contexts/LeadsContext';
import { useToast } from '@/hooks/use-toast';

export function ExportPanel() {
  const { leads, exportLeads } = useLeads();
  const { toast } = useToast();
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = (format: 'csv' | 'json') => {
    try {
      const data = exportLeads(format);
      
      // Para CSV, adicionar BOM UTF-8 para compatibilidade com Excel
      const blobContent = format === 'csv' 
        ? '\uFEFF' + data // BOM UTF-8 para Excel
        : data;
      
      const blob = new Blob([blobContent], { 
        type: format === 'json' 
          ? 'application/json;charset=utf-8' 
          : 'text/csv;charset=utf-8'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(format);
      toast({
        title: 'Exportação concluída',
        description: `${leads.length} lead${leads.length !== 1 ? 's' : ''} exportado${leads.length !== 1 ? 's' : ''} em formato ${format.toUpperCase()}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar os dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Exportar Dados
        </h2>
        <p className="text-muted-foreground mt-1">
          Exporte seus leads para integração com seu CRM ou outras ferramentas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-elevated">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="font-display">Exportar CSV</CardTitle>
            <CardDescription>
              Formato compatível com Excel, Google Sheets e a maioria dos CRMs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleExport('csv')} 
              className="w-full"
            >
              {lastExport === 'csv' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Exportado!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <FileJson className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-display">Exportar JSON</CardTitle>
            <CardDescription>
              Formato ideal para integrações via API e desenvolvimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleExport('json')} 
              variant="outline"
              className="w-full"
            >
              {lastExport === 'json' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Exportado!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar JSON
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display text-lg">Resumo dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
              <p className="text-sm text-muted-foreground">Total de Leads</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {leads.filter(l => l.lgpdConsent).length}
              </p>
              <p className="text-sm text-muted-foreground">Com Consentimento</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {leads.filter(l => l.status === 'qualificado' || l.status === 'pronto').length}
              </p>
              <p className="text-sm text-muted-foreground">Qualificados</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {leads.filter(l => l.status === 'urgente').length}
              </p>
              <p className="text-sm text-muted-foreground">Urgentes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
