import { useState, useEffect } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Power, PowerOff, Save, Plus, Pencil, Trash2, Clock, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/api/client';

interface CommunicationChannel {
  id: string;
  name: string;
  tags: string[];
  type: 'chatguru' | 'manychat' | 'whatsapp' | 'zapi' | 'other';
  status?: 'connected' | 'disconnected';
}

export function AgentConfigSection() {
  const { agent, updateAgent, followUpConfig, updateFollowUpConfig } = useAgent();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [is24_7, setIs24_7] = useState(false);
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);

  // Buscar integrações do backend
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const response = await api.get('/api/integrations');
        const config = response.data;
        
        const defaultChannels: CommunicationChannel[] = [
          { id: '1', name: 'Disparador Chatguru', tags: ['Chatguru', 'Qualquer coisa'], type: 'chatguru' },
          { id: '2', name: 'Instagram - ManyChat', tags: ['ManyChat', 'messenger', 'manychat'], type: 'manychat' },
          { id: '3', name: 'Atendimento - 9092 Chatguru', tags: ['Chatguru', 'Qualquer coisa'], type: 'chatguru' },
        ];
        
        const newChannels: CommunicationChannel[] = [...defaultChannels];
        
        // Adicionar Z-API se configurada
        if (config?.zapiInstanceId && config?.zapiToken) {
          newChannels.push({
            id: 'zapi-whatsapp',
            name: 'WhatsApp - Z-API',
            tags: ['Z-API', 'WhatsApp', 'Mensagens'],
            type: 'zapi',
            status: 'connected',
          });
        }
        
        setChannels(newChannels);
      } catch (error) {
        console.error('Erro ao carregar integrações:', error);
        // Manter canais padrão em caso de erro
      }
    };
    
    loadIntegrations();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações do agente foram atualizadas com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChannel = () => {
    const newChannel: CommunicationChannel = {
      id: Date.now().toString(),
      name: 'Nova Integração',
      tags: [],
      type: 'other',
    };
    setChannels([...channels, newChannel]);
  };

  const handleDeleteChannel = (id: string) => {
    setChannels(channels.filter(ch => ch.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Status do Agente</h2>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Status do Agente - Botões no topo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => updateAgent({ isActive: true })}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
            agent.isActive
              ? "bg-green-600 text-white shadow-lg"
              : "bg-muted text-muted-foreground hover:bg-green-600/20"
          )}
        >
          <Power className="w-4 h-4" />
          ATIVO
        </button>
        <button
          onClick={() => updateAgent({ isActive: false })}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
            !agent.isActive
              ? "bg-red-600 text-white shadow-lg"
              : "border border-red-600/30 text-red-600 hover:bg-red-600/10"
          )}
        >
          <PowerOff className="w-4 h-4" />
          DESLIGAR
        </button>
      </div>

      {/* Tabs de Configuração */}
      <Card>
        <Tabs defaultValue="basic" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="hours">Horário de Funcionamento</TabsTrigger>
              <TabsTrigger value="channels">Canais de Comunicação</TabsTrigger>
              <TabsTrigger value="credentials">Credenciais Avançadas</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do Agente</Label>
                <Input
                  id="agent-name"
                  value={agent.name}
                  onChange={(e) => updateAgent({ name: e.target.value })}
                  placeholder="Ex: SDR Jurídico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-description">Descrição do Agente</Label>
                <Textarea
                  id="agent-description"
                  value={agent.description}
                  onChange={(e) => updateAgent({ description: e.target.value })}
                  placeholder="Descreva o propósito do agente..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-0 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Horário de Funcionamento</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Defina os horários de funcionamento do agente
                </p>
              </div>
              
              {/* Opção 24/7 Global */}
              <div className="flex items-center justify-end mb-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={is24_7}
                    onCheckedChange={(checked) => {
                      setIs24_7(checked);
                      if (checked) {
                        const newHours = followUpConfig.businessHours.map(h => ({
                          ...h,
                          isOpen: true,
                          is24h: true,
                          startTime: '00:00',
                          endTime: '23:59',
                        }));
                        updateFollowUpConfig({ businessHours: newHours });
                      }
                    }}
                  />
                  <Label>24/7</Label>
                </div>
              </div>

              {/* Lista de dias */}
              <div className="space-y-3">
                {followUpConfig.businessHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center gap-4 py-2">
                    <span className="w-12 font-medium text-sm">{schedule.day}</span>
                    {schedule.isOpen ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => {
                              const newHours = [...followUpConfig.businessHours];
                              newHours[index].startTime = e.target.value;
                              updateFollowUpConfig({ businessHours: newHours });
                            }}
                            className="w-24"
                            disabled={is24_7}
                          />
                        </div>
                        <span className="text-muted-foreground">até</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => {
                              const newHours = [...followUpConfig.businessHours];
                              newHours[index].endTime = e.target.value;
                              updateFollowUpConfig({ businessHours: newHours });
                            }}
                            className="w-24"
                            disabled={is24_7}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].isOpen = false;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch
                            checked={schedule.is24h || false}
                            onCheckedChange={(checked) => {
                              const newHours = [...followUpConfig.businessHours];
                              newHours[index].is24h = checked;
                              if (checked) {
                                newHours[index].startTime = '00:00';
                                newHours[index].endTime = '23:59';
                              }
                              updateFollowUpConfig({ businessHours: newHours });
                            }}
                            disabled={is24_7}
                          />
                          <span className="text-xs text-muted-foreground">24h</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Fechado</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].isOpen = true;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="ml-auto"
                        >
                          Ativar
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-0 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Canais de Comunicação</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gerencie as integrações de comunicação do agente
                </p>
              </div>
              
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddChannel} variant="default" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Integração
                </Button>
              </div>

              <div className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{channel.name}</p>
                        {channel.status === 'connected' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Conectado
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {channel.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {channel.type === 'zapi' ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Redirecionar para configurações de integrações
                            window.location.href = '/settings?tab=integrations';
                          }}
                        >
                          Configurar
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteChannel(channel.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="mt-0">
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">Credenciais Avançadas</p>
                <p className="text-sm">Configure credenciais e tokens de API para integrações avançadas.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
