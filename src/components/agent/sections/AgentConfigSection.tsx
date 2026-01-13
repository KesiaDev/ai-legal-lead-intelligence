import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Power, PowerOff, Sparkles, Brain, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AgentConfigSection() {
  const { agent, updateAgent, followUpConfig, updateFollowUpConfig } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Configurações Gerais</h2>
          <p className="text-sm text-muted-foreground">Modo somente leitura</p>
        </div>
      </div>

      {/* Status do Agente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status do Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => updateAgent({ isActive: true })}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                agent.isActive
                  ? "bg-success text-white shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-success/20"
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
                  ? "bg-destructive text-white shadow-lg"
                  : "border border-destructive/30 text-destructive hover:bg-destructive/10"
              )}
            >
              <PowerOff className="w-4 h-4" />
              DESLIGAR
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de IA */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Inteligência Artificial</CardTitle>
          </div>
          <CardDescription>
            Configure o comportamento da IA controlada para qualificação de leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle IA */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                agent.aiConfig.enabled ? "bg-primary/20" : "bg-muted"
              )}>
                <Brain className={cn(
                  "w-5 h-5",
                  agent.aiConfig.enabled ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-medium">IA Controlada</p>
                <p className="text-sm text-muted-foreground">
                  {agent.aiConfig.enabled 
                    ? "IA ativa para análise e sugestões" 
                    : "Usando apenas fluxo manual"}
                </p>
              </div>
            </div>
            <Switch
              checked={agent.aiConfig.enabled}
              onCheckedChange={(enabled) => 
                updateAgent({ aiConfig: { ...agent.aiConfig, enabled } })
              }
            />
          </div>

          {/* Nível de Intervenção */}
          {agent.aiConfig.enabled && (
            <div className="space-y-3">
              <Label>Nível de Intervenção da IA</Label>
              <Select
                value={agent.aiConfig.interventionLevel}
                onValueChange={(value: 'baixo' | 'medio') =>
                  updateAgent({ aiConfig: { ...agent.aiConfig, interventionLevel: value } })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">
                    <div className="flex items-center gap-2">
                      <span>Baixo</span>
                      <span className="text-xs text-muted-foreground">- Apenas análise passiva</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medio">
                    <div className="flex items-center gap-2">
                      <span>Médio</span>
                      <span className="text-xs text-muted-foreground">- Análise + sugestões ativas</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {agent.aiConfig.interventionLevel === 'baixo' 
                  ? "A IA analisa as mensagens mas não interfere no fluxo."
                  : "A IA sugere perguntas personalizadas e analisa respostas em tempo real."}
              </p>
            </div>
          )}

          {/* Regras de Compliance */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-success" />
              <span className="font-medium text-sm">Regras de Compliance Ativas</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Nunca oferece consultoria jurídica
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Nunca promete resultados
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Mantém tom profissional e ético
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Segue apenas fluxo definido
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Configuração */}
      <Card>
        <Tabs defaultValue="basic" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="hours">Horário de Funcionamento</TabsTrigger>
              <TabsTrigger value="channels">Canais de Comunicação</TabsTrigger>
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

            <TabsContent value="hours" className="mt-0">
              <div className="space-y-3">
                {followUpConfig.businessHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center gap-4 py-2">
                    <span className="w-12 font-medium text-sm">{schedule.day}</span>
                    {schedule.isOpen ? (
                      <>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].startTime = e.target.value;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].endTime = e.target.value;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="w-24"
                        />
                        <button
                          onClick={() => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].isOpen = false;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="text-destructive text-sm hover:underline"
                        >
                          ×
                        </button>
                        <button className="text-success text-sm hover:underline">+</button>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch
                            checked={schedule.is24h || false}
                            onCheckedChange={(checked) => {
                              const newHours = [...followUpConfig.businessHours];
                              newHours[index].is24h = checked;
                              updateFollowUpConfig({ businessHours: newHours });
                            }}
                          />
                          <span className="text-xs text-muted-foreground">24h</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Fechado</span>
                        <button
                          onClick={() => {
                            const newHours = [...followUpConfig.businessHours];
                            newHours[index].isOpen = true;
                            updateFollowUpConfig({ businessHours: newHours });
                          }}
                          className="ml-auto text-primary text-sm hover:underline"
                        >
                          Ativar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-500 font-bold">W</span>
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Canal principal de atendimento</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-500 font-bold">@</span>
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">Em desenvolvimento</p>
                    </div>
                  </div>
                  <Switch disabled />
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
