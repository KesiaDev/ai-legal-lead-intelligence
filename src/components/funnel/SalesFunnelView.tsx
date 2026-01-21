import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, Filter } from 'lucide-react';
import { api } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Pipeline {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  stages: PipelineStage[];
  _count?: {
    deals: number;
  };
}

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string;
  _count?: {
    deals: number;
  };
}

interface Deal {
  id: string;
  title: string;
  value?: number;
  currency: string;
  stageId: string;
  lead?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface PipelineStats {
  totalDeals: number;
  overallConversion: number;
  stagesStats: Array<{
    stageId: string;
    stageName: string;
    deals: number;
    conversion: number;
  }>;
}

export function SalesFunnelView() {
  const { tenant } = useAuth();
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const [deals, setDeals] = useState<Record<string, Deal[]>>({});
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversionMode, setConversionMode] = useState<'total' | 'stage'>('total');

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (selectedPipeline) {
      fetchDeals(selectedPipeline);
      fetchStats(selectedPipeline);
    }
  }, [selectedPipeline]);

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/pipelines');
      const pipelinesData = response.data.pipelines || [];
      setPipelines(pipelinesData);
      
      // Selecionar primeiro pipeline ativo automaticamente
      const firstActive = pipelinesData.find((p: Pipeline) => p.isActive) || pipelinesData[0];
      if (firstActive) {
        setSelectedPipeline(firstActive.id);
      }
    } catch (err: any) {
      console.error('Erro ao buscar pipelines:', err);
      toast({
        title: 'Erro ao carregar funis',
        description: err.response?.data?.message || 'Não foi possível carregar os funis de campanha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeals = async (pipelineId: string) => {
    try {
      const response = await api.get(`/api/pipelines/${pipelineId}/deals`);
      setDeals(response.data.dealsByStage || {});
    } catch (err: any) {
      console.error('Erro ao buscar deals:', err);
    }
  };

  const fetchStats = async (pipelineId: string) => {
    try {
      const response = await api.get(`/api/pipelines/${pipelineId}/stats`);
      setStats(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline);
  const stages = currentPipeline?.stages || [];

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const getStageDeals = (stageId: string) => {
    return deals[stageId] || [];
  };

  const getStageConversion = (stageId: string) => {
    if (!stats) return 0;
    const stageStat = stats.stagesStats.find(s => s.stageId === stageId);
    return stageStat?.conversion || 0;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Carregando funis de campanha...
      </div>
    );
  }

  if (pipelines.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhum funil de campanha criado ainda.</p>
          <Button onClick={() => {
            toast({
              title: 'Em breve',
              description: 'A funcionalidade de criar funis estará disponível em breve.',
              variant: 'default',
            });
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Funil
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com seleção de pipeline e controles */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <Select value={selectedPipeline || ''} onValueChange={setSelectedPipeline}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {stats && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {stats.totalDeals} deals
              </Badge>
              <Badge variant="outline" className="text-sm">
                {stats.overallConversion.toFixed(1)}% conversão geral
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={conversionMode === 'total' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConversionMode('total')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Conv. Total
          </Button>
          <Button
            variant={conversionMode === 'stage' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setConversionMode('stage')}
          >
            <Filter className="w-4 h-4 mr-2" />
            Conv. Etapa
          </Button>
        </div>
      </div>

      {/* Funil de Vendas */}
      {currentPipeline && (
        <div className="space-y-6">
          {/* Taxa de Conversão Geral */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Taxa de Conversão Geral:
              </span>
              <span className="text-lg font-semibold">
                {stats.overallConversion.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Etapas do Funil */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {stages.map((stage) => {
                const stageDeals = getStageDeals(stage.id);
                const conversion = getStageConversion(stage.id);

                return (
                  <Card key={stage.id} className="min-w-[200px] flex-shrink-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stage.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {stageDeals.length}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          DEALS
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {conversion.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          conversão
                        </div>
                      </div>

                      {/* Lista de deals (opcional, pode ser expandido) */}
                      {stageDeals.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                          {stageDeals.slice(0, 5).map((deal) => (
                            <div
                              key={deal.id}
                              className="p-2 bg-muted rounded text-xs"
                            >
                              <div className="font-medium truncate">
                                {deal.title}
                              </div>
                              {deal.lead && (
                                <div className="text-muted-foreground truncate">
                                  {deal.lead.name}
                                </div>
                              )}
                              {deal.value && (
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(deal.value, deal.currency)}
                                </div>
                              )}
                            </div>
                          ))}
                          {stageDeals.length > 5 && (
                            <div className="text-xs text-center text-muted-foreground">
                              +{stageDeals.length - 5} mais
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
