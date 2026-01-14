import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Mic, 
  Volume2, 
  Settings2, 
  AlertTriangle,
  Play,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAgent } from '@/contexts/AgentContext';
import { 
  VoiceResponseProbability, 
  TextAdjustmentLevel,
  ELEVENLABS_VOICES 
} from '@/types/voice';
import { useState } from 'react';

export function VoiceConfigSection() {
  const { voiceConfig, updateVoiceConfig } = useAgent();
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !voiceConfig.textOnlyKeywords.includes(newKeyword.trim())) {
      updateVoiceConfig({
        textOnlyKeywords: [...voiceConfig.textOnlyKeywords, newKeyword.trim().toLowerCase()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    updateVoiceConfig({
      textOnlyKeywords: voiceConfig.textOnlyKeywords.filter(k => k !== keyword)
    });
  };

  const probabilityLabels: Record<VoiceResponseProbability, string> = {
    'nunca': 'Nunca (0%)',
    'baixa': 'Baixa (25%)',
    'media': 'Média (50%)',
    'alta': 'Alta (75%)',
    'sempre': 'Sempre (100%)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary" />
            Configuração de Voz
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure respostas em áudio com integração ElevenLabs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="voice-enabled">Ativar Voz</Label>
          <Switch
            id="voice-enabled"
            checked={voiceConfig.enabled}
            onCheckedChange={(enabled) => updateVoiceConfig({ enabled })}
          />
        </div>
      </div>

      {/* Aviso */}
      <Card className="border-info/50 bg-info/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-info mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Integração Preparada</p>
              <p className="text-sm text-muted-foreground">
                A arquitetura está pronta para ElevenLabs. Configure sua API key nas variáveis de ambiente para ativar.
                URLs, emails, valores monetários e termos sensíveis são automaticamente convertidos para texto escrito.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Voz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Seleção de Voz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider */}
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={voiceConfig.provider}
                onValueChange={(value: any) => updateVoiceConfig({ provider: value })}
                disabled={!voiceConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary">Recomendado</Badge>
                      ElevenLabs
                    </div>
                  </SelectItem>
                  <SelectItem value="google">Google TTS</SelectItem>
                  <SelectItem value="azure">Azure Speech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Voz */}
            <div className="space-y-2">
              <Label>Voz</Label>
              <Select
                value={voiceConfig.voiceId}
                onValueChange={(voiceId) => {
                  const voice = ELEVENLABS_VOICES.find(v => v.id === voiceId);
                  updateVoiceConfig({ 
                    voiceId, 
                    voiceName: voice?.name || voiceId 
                  });
                }}
                disabled={!voiceConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELEVENLABS_VOICES.map(voice => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Configurações de Voz */}
            <div className="space-y-4">
              <Label className="text-muted-foreground">Parâmetros da Voz</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Estabilidade</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(voiceConfig.voiceSettings.stability * 100)}%
                  </span>
                </div>
                <Slider
                  value={[voiceConfig.voiceSettings.stability * 100]}
                  onValueChange={([value]) => updateVoiceConfig({
                    voiceSettings: { ...voiceConfig.voiceSettings, stability: value / 100 }
                  })}
                  max={100}
                  step={5}
                  disabled={!voiceConfig.enabled}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Similaridade</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(voiceConfig.voiceSettings.similarityBoost * 100)}%
                  </span>
                </div>
                <Slider
                  value={[voiceConfig.voiceSettings.similarityBoost * 100]}
                  onValueChange={([value]) => updateVoiceConfig({
                    voiceSettings: { ...voiceConfig.voiceSettings, similarityBoost: value / 100 }
                  })}
                  max={100}
                  step={5}
                  disabled={!voiceConfig.enabled}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Velocidade</span>
                  <span className="text-sm text-muted-foreground">
                    {voiceConfig.voiceSettings.speed}x
                  </span>
                </div>
                <Slider
                  value={[(voiceConfig.voiceSettings.speed - 0.7) * 200]}
                  onValueChange={([value]) => updateVoiceConfig({
                    voiceSettings: { ...voiceConfig.voiceSettings, speed: 0.7 + value / 200 }
                  })}
                  max={100}
                  step={10}
                  disabled={!voiceConfig.enabled}
                />
              </div>
            </div>

            {/* Preview Button */}
            <Button 
              variant="outline" 
              className="w-full"
              disabled={!voiceConfig.enabled}
            >
              <Play className="w-4 h-4 mr-2" />
              Testar Voz (Simulado)
            </Button>
          </CardContent>
        </Card>

        {/* Regras de Resposta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Regras de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Probabilidades */}
            <div className="space-y-4">
              <Label>Probabilidade de Responder em Áudio</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ao receber <Badge variant="outline">Texto</Badge></span>
                  <Select
                    value={voiceConfig.audioResponseProbability.onText}
                    onValueChange={(value: VoiceResponseProbability) => updateVoiceConfig({
                      audioResponseProbability: {
                        ...voiceConfig.audioResponseProbability,
                        onText: value
                      }
                    })}
                    disabled={!voiceConfig.enabled}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(probabilityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Ao receber <Badge variant="outline">Áudio</Badge></span>
                  <Select
                    value={voiceConfig.audioResponseProbability.onAudio}
                    onValueChange={(value: VoiceResponseProbability) => updateVoiceConfig({
                      audioResponseProbability: {
                        ...voiceConfig.audioResponseProbability,
                        onAudio: value
                      }
                    })}
                    disabled={!voiceConfig.enabled}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(probabilityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Ao receber <Badge variant="outline">Mídia</Badge></span>
                  <Select
                    value={voiceConfig.audioResponseProbability.onMedia}
                    onValueChange={(value: VoiceResponseProbability) => updateVoiceConfig({
                      audioResponseProbability: {
                        ...voiceConfig.audioResponseProbability,
                        onMedia: value
                      }
                    })}
                    disabled={!voiceConfig.enabled}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(probabilityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Duração Máxima */}
            <div className="space-y-2">
              <Label>Duração Máxima do Áudio (segundos)</Label>
              <Input
                type="number"
                min={10}
                max={120}
                value={voiceConfig.maxAudioDuration}
                onChange={(e) => updateVoiceConfig({ 
                  maxAudioDuration: parseInt(e.target.value) || 60 
                })}
                disabled={!voiceConfig.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Mensagens mais longas serão enviadas como texto
              </p>
            </div>

            {/* Ajuste de Texto */}
            <div className="space-y-2">
              <Label>Ajuste para Linguagem Falada</Label>
              <Select
                value={voiceConfig.textToSpeechAdjustment}
                onValueChange={(value: TextAdjustmentLevel) => 
                  updateVoiceConfig({ textToSpeechAdjustment: value })
                }
                disabled={!voiceConfig.enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desativado">Desativado</SelectItem>
                  <SelectItem value="pouco">Pouco (Remove URLs/emails)</SelectItem>
                  <SelectItem value="moderado">Moderado (Converte siglas, valores)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Blacklist */}
            <div className="space-y-3">
              <Label>Palavras que Forçam Resposta em Texto</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite uma palavra..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  disabled={!voiceConfig.enabled}
                />
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={addKeyword}
                  disabled={!voiceConfig.enabled}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {voiceConfig.textOnlyKeywords.map(keyword => (
                  <Badge 
                    key={keyword} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => voiceConfig.enabled && removeKeyword(keyword)}
                  >
                    {keyword}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
