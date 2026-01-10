import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle2 } from 'lucide-react';

export function ScheduleConfigSection() {
  const { scheduleConfig, updateScheduleConfig } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Agenda</h2>
        <span className="text-sm text-muted-foreground">Modo somente leitura</span>
      </div>

      <Card>
        <Tabs defaultValue="rules" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              <TabsTrigger value="rules">Regras de Agendamento</TabsTrigger>
              <TabsTrigger value="event">Configuração do Evento</TabsTrigger>
              <TabsTrigger value="hours">Horário de Agendamento</TabsTrigger>
              <TabsTrigger value="rotation">Regras de Rodízio</TabsTrigger>
              <TabsTrigger value="reminders">Lembretes</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="rules" className="space-y-6 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Regras de Agendamento</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Configure horários disponíveis, durações e limites
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={scheduleConfig.timezone}
                    onValueChange={(value) => updateScheduleConfig({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="São Paulo (BRT)">São Paulo (BRT)</SelectItem>
                      <SelectItem value="Brasília (BRT)">Brasília (BRT)</SelectItem>
                      <SelectItem value="Manaus (AMT)">Manaus (AMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duração da Reunião (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.meetingDuration}
                    onChange={(e) => updateScheduleConfig({ meetingDuration: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Incrementos de Horário (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.timeIncrement}
                    onChange={(e) => updateScheduleConfig({ timeIncrement: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Antecedência Mínima (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.minAdvanceTime}
                    onChange={(e) => updateScheduleConfig({ minAdvanceTime: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Antecedência Máxima (dias)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.maxAdvanceDays}
                    onChange={(e) => updateScheduleConfig({ maxAdvanceDays: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/30 mt-6">
                <Checkbox
                  id="qualified-only"
                  checked={scheduleConfig.onlyQualifiedLeads}
                  onCheckedChange={(checked) => 
                    updateScheduleConfig({ onlyQualifiedLeads: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="qualified-only" className="font-medium cursor-pointer">
                    Agendar somente com leads qualificados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Restringe agendamentos apenas para leads que passaram pelo processo de qualificação
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="event" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>Configuração do tipo de evento e detalhes.</p>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>Defina os horários disponíveis para agendamento.</p>
              </div>
            </TabsContent>

            <TabsContent value="rotation" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>Configure regras de rodízio entre advogados.</p>
              </div>
            </TabsContent>

            <TabsContent value="reminders" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>Configure lembretes automáticos antes das reuniões.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
