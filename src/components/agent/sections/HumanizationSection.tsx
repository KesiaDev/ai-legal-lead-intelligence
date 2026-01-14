import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, Type, AlertCircle } from 'lucide-react';
import { useAgent } from '@/contexts/AgentContext';
import { previewHumanization } from '@/services/textHumanizer';
import { 
  MessageLength, 
  EmojiUsage, 
  IntensityLevel 
} from '@/types/humanization';

export function HumanizationSection() {
  const { humanizationConfig, updateHumanizationConfig } = useAgent();
  
  const preview = previewHumanization(humanizationConfig);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Humanização de Texto
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure como as mensagens do agente serão humanizadas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="humanization-enabled">Ativar Humanização</Label>
          <Switch
            id="humanization-enabled"
            checked={humanizationConfig.enabled}
            onCheckedChange={(enabled) => updateHumanizationConfig({ enabled })}
          />
        </div>
      </div>

      {/* Aviso de Compliance */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Regras de Compliance</p>
              <p className="text-sm text-muted-foreground">
                A humanização NUNCA comprometerá a clareza jurídica ou profissionalismo. 
                Termos técnicos, prazos e informações críticas são sempre preservados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tamanho das Mensagens */}
            <div className="space-y-2">
              <Label>Tamanho das Mensagens</Label>
              <Select
                value={humanizationConfig.messageLength}
                onValueChange={(value: MessageLength) => 
                  updateHumanizationConfig({ messageLength: value })
                }
                disabled={!humanizationConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtas">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Curtas</Badge>
                      <span className="text-muted-foreground text-sm">Até 2 frases</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medias">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Médias</Badge>
                      <span className="text-muted-foreground text-sm">3-4 frases</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="longas">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Longas</Badge>
                      <span className="text-muted-foreground text-sm">Texto completo</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Uso de Emojis */}
            <div className="space-y-2">
              <Label>Uso de Emojis</Label>
              <Select
                value={humanizationConfig.emojiUsage}
                onValueChange={(value: EmojiUsage) => 
                  updateHumanizationConfig({ emojiUsage: value })
                }
                disabled={!humanizationConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nunca">Nunca</SelectItem>
                  <SelectItem value="moderado">Moderado (50%)</SelectItem>
                  <SelectItem value="sempre">Sempre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Abreviações */}
            <div className="space-y-2">
              <Label>Abreviações (vc, tb, pq...)</Label>
              <Select
                value={humanizationConfig.abbreviations}
                onValueChange={(value: IntensityLevel) => 
                  updateHumanizationConfig({ abbreviations: value })
                }
                disabled={!humanizationConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desativado">Desativado</SelectItem>
                  <SelectItem value="pouco">Pouco (máx. 2)</SelectItem>
                  <SelectItem value="moderado">Moderado (máx. 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Minúsculas no Início */}
            <div className="space-y-2">
              <Label>Minúsculas no Início das Frases</Label>
              <Select
                value={humanizationConfig.lowercaseStart}
                onValueChange={(value: IntensityLevel) => 
                  updateHumanizationConfig({ lowercaseStart: value })
                }
                disabled={!humanizationConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desativado">Desativado</SelectItem>
                  <SelectItem value="pouco">Pouco (30%)</SelectItem>
                  <SelectItem value="moderado">Moderado (60%)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Erros de Digitação */}
            <div className="space-y-2">
              <Label>Simulação de Erros de Digitação</Label>
              <Select
                value={humanizationConfig.typoSimulation}
                onValueChange={(value: IntensityLevel) => 
                  updateHumanizationConfig({ typoSimulation: value })
                }
                disabled={!humanizationConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desativado">Desativado</SelectItem>
                  <SelectItem value="pouco">Pouco (máx. 1 erro)</SelectItem>
                  <SelectItem value="moderado">Moderado (máx. 2 erros)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                ⚠️ Nunca aplicado em termos jurídicos críticos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Preview da Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">MENSAGEM ORIGINAL</Label>
                <div className="mt-1 p-3 bg-muted/50 rounded-lg text-sm">
                  Olá! Obrigado por entrar em contato. Entendi que você está buscando orientação sobre um processo trabalhista. Poderia me informar há quanto tempo você foi desligado da empresa? Essa informação é importante para analisarmos seu caso.
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-muted-foreground text-xs">MENSAGEM HUMANIZADA</Label>
                <div className={`mt-1 p-3 rounded-lg text-sm ${
                  humanizationConfig.enabled 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted/50'
                }`}>
                  {preview}
                </div>
              </div>

              {humanizationConfig.enabled && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Tamanho: {humanizationConfig.messageLength}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Emojis: {humanizationConfig.emojiUsage}
                  </Badge>
                  {humanizationConfig.abbreviations !== 'desativado' && (
                    <Badge variant="secondary" className="text-xs">
                      Abreviações: {humanizationConfig.abbreviations}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
