import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

export function FollowUpSection() {
  const { followUpConfig, updateFollowUpConfig } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Follow-up</h2>
        <span className="text-sm text-muted-foreground">Modo somente leitura</span>
      </div>

      <Card>
        <Tabs defaultValue="hours" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="hours">Horário de Envio</TabsTrigger>
              <TabsTrigger value="cadence">Cadência de Mensagens</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="hours" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Limite de horário de envio</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Defina um horário para envio dos follow-ups
              </p>

              <div className="flex items-center justify-end gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Switch id="24-7" />
                  <Label htmlFor="24-7">24/7</Label>
                </div>
              </div>

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
                        <button className="text-destructive text-sm hover:underline">×</button>
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

            <TabsContent value="cadence" className="space-y-6 mt-0">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Primeiro Follow-up</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={followUpConfig.cadence.firstFollowUp}
                      onChange={(e) => updateFollowUpConfig({
                        cadence: { ...followUpConfig.cadence, firstFollowUp: Number(e.target.value) }
                      })}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">horas</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Segundo Follow-up</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={followUpConfig.cadence.secondFollowUp}
                      onChange={(e) => updateFollowUpConfig({
                        cadence: { ...followUpConfig.cadence, secondFollowUp: Number(e.target.value) }
                      })}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">horas</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Final</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={followUpConfig.cadence.finalFollowUp}
                      onChange={(e) => updateFollowUpConfig({
                        cadence: { ...followUpConfig.cadence, finalFollowUp: Number(e.target.value) }
                      })}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">horas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Mensagem do Primeiro Follow-up</Label>
                  <Textarea
                    value={followUpConfig.messages.first}
                    onChange={(e) => updateFollowUpConfig({
                      messages: { ...followUpConfig.messages, first: e.target.value }
                    })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem do Segundo Follow-up</Label>
                  <Textarea
                    value={followUpConfig.messages.second}
                    onChange={(e) => updateFollowUpConfig({
                      messages: { ...followUpConfig.messages, second: e.target.value }
                    })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mensagem Final</Label>
                  <Textarea
                    value={followUpConfig.messages.final}
                    onChange={(e) => updateFollowUpConfig({
                      messages: { ...followUpConfig.messages, final: e.target.value }
                    })}
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
