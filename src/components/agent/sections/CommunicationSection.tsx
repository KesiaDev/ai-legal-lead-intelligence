import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function CommunicationSection() {
  const { communication, updateCommunication } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Comunicação</h2>
        <span className="text-sm text-muted-foreground">Modo somente leitura</span>
      </div>

      <Card>
        <Tabs defaultValue="rules" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              <TabsTrigger value="rules">Regras de Comunicação</TabsTrigger>
              <TabsTrigger value="style">Linguagem e Estilo</TabsTrigger>
              <TabsTrigger value="humanize">Humanização do Texto</TabsTrigger>
              <TabsTrigger value="templates" disabled>
                <span className="flex items-center gap-1">
                  Templates
                  <span className="text-xs bg-muted px-1 rounded">em breve</span>
                </span>
              </TabsTrigger>
              <TabsTrigger value="voice" disabled>Configuração de Voz</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="rules" className="space-y-6 mt-0">
              {/* Ritmo de Resposta */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Ritmo de Resposta</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Label>Buffer (latência controlada)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Tempo de espera antes de enviar a resposta</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={communication.bufferLatency}
                        onChange={(e) => updateCommunication({ bufferLatency: Number(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-muted-foreground">seg</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Label>Tempo entre mensagens</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Intervalo entre mensagens consecutivas</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={communication.timeBetweenMessages}
                        onChange={(e) => updateCommunication({ timeBetweenMessages: Number(e.target.value) })}
                        className="w-20"
                      />
                      <span className="text-muted-foreground">seg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resposta de Erro */}
              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label>Resposta de erro</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mensagem enviada quando a IA não consegue processar</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <p className="text-sm text-muted-foreground">
                  Digite o texto que a IA vai responder em caso de erro no processamento
                </p>
                <Textarea
                  value={communication.errorMessage}
                  onChange={(e) => updateCommunication({ errorMessage: e.target.value })}
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tom da Comunicação</Label>
                  <Select
                    value={communication.tone}
                    onValueChange={(value: 'formal' | 'casual' | 'professional') => 
                      updateCommunication({ tone: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Define como o agente se comunica com os leads
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Usar Emojis</p>
                    <p className="text-sm text-muted-foreground">
                      Permite o uso de emojis nas respostas
                    </p>
                  </div>
                  <Switch
                    checked={communication.useEmojis}
                    onCheckedChange={(checked) => updateCommunication({ useEmojis: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assinatura</Label>
                  <Input
                    value={communication.signature}
                    onChange={(e) => updateCommunication({ signature: e.target.value })}
                    placeholder="Ex: Atenciosamente, Equipe Jurídica"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="humanize" className="space-y-6 mt-0">
              <div className="text-center py-8 text-muted-foreground">
                <p>Configurações de humanização do texto.</p>
                <p className="text-sm mt-2">Ajuste como o agente simula padrões humanos de digitação.</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
