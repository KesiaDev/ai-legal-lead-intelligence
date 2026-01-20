import { useState } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { HelpCircle, Save, Plus, X, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CommunicationSection() {
  const { communication, updateCommunication, humanizationConfig, updateHumanizationConfig, voiceConfig, updateVoiceConfig } = useAgent();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedToneTags, setSelectedToneTags] = useState<string[]>(['amigavel']);
  const [toneDescription, setToneDescription] = useState('Um tom cordial e profissional, com toques de informalidade para criar proximidade com o cliente., amigável');
  const [personality, setPersonality] = useState('Uma personalidade amigável e entusiasmada, que transmita confiança e profissionalismo.');
  const [skills, setSkills] = useState('Especialista em Qualificação de Leads; Especialista em Automação e Inteligência Artificial; Especialista em processos comerciais automatizados;');
  const [newBlacklistWord, setNewBlacklistWord] = useState('');

  const toneTags = ['Amigável', 'Profissional', 'Consultivo', 'Casual', 'Objetivo', 'Formal', 'Engajador'];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Configurações salvas!',
        description: 'As configurações de comunicação foram atualizadas com sucesso.',
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

  const handleAddBlacklistWord = () => {
    if (newBlacklistWord.trim()) {
      updateVoiceConfig({
        textOnlyKeywords: [...voiceConfig.textOnlyKeywords, newBlacklistWord.trim()],
      });
      setNewBlacklistWord('');
    }
  };

  const handleRemoveBlacklistWord = (word: string) => {
    updateVoiceConfig({
      textOnlyKeywords: voiceConfig.textOnlyKeywords.filter(w => w !== word),
    });
  };

  const automaticBlocked = ['Números', 'URLs', 'URLs com www', 'Emails', 'Extensões de domínio', 'Caracteres especiais', 'Emojis'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Comunicação</h2>
        <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
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
              <TabsTrigger value="voice">Configuração de Voz</TabsTrigger>
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
                  value={communication.errorMessage || 'Desculpa, não entendi, pode por favor enviar a msg de outra forma?'}
                  onChange={(e) => updateCommunication({ errorMessage: e.target.value })}
                  rows={3}
                  placeholder="Digite o texto que a IA vai responder em caso de erro..."
                />
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-6 mt-0">
              {/* Tom de voz da IA */}
              <div className="space-y-3">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label>Tom de voz da IA</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Configure o tom de voz que a IA deve usar nas respostas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Textarea
                  value={toneDescription}
                  onChange={(e) => setToneDescription(e.target.value)}
                  rows={3}
                  placeholder="Descreva o tom de voz desejado..."
                />
                <div className="flex flex-wrap gap-2">
                  {toneTags.map((tag) => {
                    const tagKey = tag.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const isSelected = selectedToneTags.includes(tagKey);
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedToneTags(selectedToneTags.filter(t => t !== tagKey));
                          } else {
                            setSelectedToneTags([...selectedToneTags, tagKey]);
                          }
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personalidade */}
              <div className="space-y-3">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label>Personalidade</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Descreva a personalidade que o agente deve transmitir</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Textarea
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  rows={3}
                  placeholder="Descreva a personalidade do agente..."
                />
              </div>

              {/* Habilidades */}
              <div className="space-y-3">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label>Habilidades</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Liste as habilidades e especialidades do agente</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={3}
                  placeholder="Liste as habilidades do agente..."
                />
              </div>
            </TabsContent>

            <TabsContent value="humanize" className="space-y-6 mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configurações de Texto</h3>
              </div>

              {/* Tamanho das mensagens */}
              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Label>Tamanho das mensagens</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Define o tamanho padrão das mensagens enviadas</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                <Select
                  value={humanizationConfig.messageLength === 'curtas' ? 'curta' : humanizationConfig.messageLength === 'medias' ? 'unica' : 'unica'}
                  onValueChange={(value) => {
                    const mapping: Record<string, 'curtas' | 'medias' | 'longas'> = {
                      'curta': 'curtas',
                      'unica': 'longas',
                      'media': 'medias',
                    };
                    updateHumanizationConfig({ messageLength: mapping[value] || 'medias' });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="curta">Mensagens curtas</SelectItem>
                    <SelectItem value="media">Mensagens médias</SelectItem>
                    <SelectItem value="unica">Única mensagem (longa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantidade de emojis */}
              <div className="space-y-2">
                <Label>Quantidade de emojis</Label>
                <div className="flex gap-2">
                  {(['nunca', 'moderado', 'sempre'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => updateHumanizationConfig({ emojiUsage: option })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        humanizationConfig.emojiUsage === option
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {option === 'nunca' ? 'Nunca' : option === 'moderado' ? 'Moderado' : 'Sempre'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Abreviar palavras */}
              <div className="space-y-2">
                <Label>Abreviar palavras</Label>
                <div className="flex gap-2">
                  {(['desativado', 'pouco', 'moderado'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => updateHumanizationConfig({ abbreviations: option })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        humanizationConfig.abbreviations === option
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {option === 'desativado' ? 'Desativado' : option === 'pouco' ? 'Pouco' : 'Moderado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Começar frases com letras minúsculas */}
              <div className="space-y-2">
                <Label>Começar frases com letras minúsculas</Label>
                <div className="flex gap-2">
                  {(['desativado', 'pouco', 'moderado'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => updateHumanizationConfig({ lowercaseStart: option })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        humanizationConfig.lowercaseStart === option
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {option === 'desativado' ? 'Desativado' : option === 'pouco' ? 'Pouco' : 'Moderado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Erros de Digitação */}
              <div className="space-y-2">
                <Label>Erros de Digitação</Label>
                <div className="flex gap-2">
                  {(['desativado', 'pouco', 'moderado'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => updateHumanizationConfig({ typoSimulation: option })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        humanizationConfig.typoSimulation === option
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {option === 'desativado' ? 'Desativado' : option === 'pouco' ? 'Pouco' : 'Moderado'}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="space-y-6 mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configurações de Voz</h3>
              </div>

              {/* Probabilidades de resposta em áudio */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Prob. ao receber TEXTO</Label>
                    <span className="text-sm font-medium">
                      {(() => {
                        const prob = voiceConfig.audioResponseProbability.onText;
                        if (prob === 'nunca') return 0;
                        if (prob === 'baixa') return 20;
                        if (prob === 'media') return 50;
                        if (prob === 'alta') return 80;
                        return 100;
                      })()}%
                    </span>
                  </div>
                  <Slider
                    value={[(() => {
                      const prob = voiceConfig.audioResponseProbability.onText;
                      if (prob === 'nunca') return 0;
                      if (prob === 'baixa') return 20;
                      if (prob === 'media') return 50;
                      if (prob === 'alta') return 80;
                      return 100;
                    })()]}
                    onValueChange={([value]) => {
                      let prob: 'nunca' | 'baixa' | 'media' | 'alta' | 'sempre' = 'nunca';
                      if (value === 0) prob = 'nunca';
                      else if (value <= 20) prob = 'baixa';
                      else if (value <= 50) prob = 'media';
                      else if (value <= 80) prob = 'alta';
                      else prob = 'sempre';
                      updateVoiceConfig({
                        audioResponseProbability: { ...voiceConfig.audioResponseProbability, onText: prob },
                      });
                    }}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Prob. ao receber MÍDIA</Label>
                    <span className="text-sm font-medium">
                      {(() => {
                        const prob = voiceConfig.audioResponseProbability.onMedia;
                        if (prob === 'nunca') return 0;
                        if (prob === 'baixa') return 20;
                        if (prob === 'media') return 50;
                        if (prob === 'alta') return 80;
                        return 100;
                      })()}%
                    </span>
                  </div>
                  <Slider
                    value={[(() => {
                      const prob = voiceConfig.audioResponseProbability.onMedia;
                      if (prob === 'nunca') return 0;
                      if (prob === 'baixa') return 20;
                      if (prob === 'media') return 50;
                      if (prob === 'alta') return 80;
                      return 100;
                    })()]}
                    onValueChange={([value]) => {
                      let prob: 'nunca' | 'baixa' | 'media' | 'alta' | 'sempre' = 'nunca';
                      if (value === 0) prob = 'nunca';
                      else if (value <= 20) prob = 'baixa';
                      else if (value <= 50) prob = 'media';
                      else if (value <= 80) prob = 'alta';
                      else prob = 'sempre';
                      updateVoiceConfig({
                        audioResponseProbability: { ...voiceConfig.audioResponseProbability, onMedia: prob },
                      });
                    }}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Prob. ao receber ÁUDIO</Label>
                    <span className="text-sm font-medium">
                      {(() => {
                        const prob = voiceConfig.audioResponseProbability.onAudio;
                        if (prob === 'nunca') return 0;
                        if (prob === 'baixa') return 20;
                        if (prob === 'media') return 50;
                        if (prob === 'alta') return 80;
                        return 100;
                      })()}%
                    </span>
                  </div>
                  <Slider
                    value={[(() => {
                      const prob = voiceConfig.audioResponseProbability.onAudio;
                      if (prob === 'nunca') return 0;
                      if (prob === 'baixa') return 20;
                      if (prob === 'media') return 50;
                      if (prob === 'alta') return 80;
                      return 100;
                    })()]}
                    onValueChange={([value]) => {
                      let prob: 'nunca' | 'baixa' | 'media' | 'alta' | 'sempre' = 'nunca';
                      if (value === 0) prob = 'nunca';
                      else if (value <= 20) prob = 'baixa';
                      else if (value <= 50) prob = 'media';
                      else if (value <= 80) prob = 'alta';
                      else prob = 'sempre';
                      updateVoiceConfig({
                        audioResponseProbability: { ...voiceConfig.audioResponseProbability, onAudio: prob },
                      });
                    }}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Duração máxima do áudio */}
              <div className="space-y-2">
                <Label>Duração máx. do áudio</Label>
                <p className="text-sm text-muted-foreground">Tempo máximo de duração</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={voiceConfig.maxAudioDuration}
                    onChange={(e) => updateVoiceConfig({ maxAudioDuration: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">segundos</span>
                </div>
              </div>

              {/* Adaptar para Linguagem Falada */}
              <div className="space-y-2">
                <Label>Adaptar para Linguagem Falada</Label>
                <p className="text-sm text-muted-foreground">
                  Ajusta o texto para soar mais natural em áudio
                </p>
                <div className="flex gap-2">
                  {(['desativado', 'pouco', 'moderado'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => updateVoiceConfig({ textToSpeechAdjustment: option })}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        voiceConfig.textToSpeechAdjustment === option
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {option === 'desativado' ? 'Desativado' : option === 'pouco' ? 'Pouco' : 'Moderado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blacklist de Palavras para Áudio */}
              <div className="space-y-4">
                <div>
                  <Label>Blacklist de Palavras para Áudio</Label>
                  <p className="text-sm text-muted-foreground">
                    Quando detectadas, o agente responde em texto ao invés de áudio
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newBlacklistWord}
                    onChange={(e) => setNewBlacklistWord(e.target.value)}
                    placeholder="Digite uma palavra..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddBlacklistWord();
                      }
                    }}
                  />
                  <Button onClick={handleAddBlacklistWord} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {voiceConfig.textOnlyKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {voiceConfig.textOnlyKeywords.map((word) => (
                      <Badge key={word} variant="secondary" className="flex items-center gap-1">
                        {word}
                        <button
                          onClick={() => handleRemoveBlacklistWord(word)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Label className="text-sm font-semibold">BLOQUEADOS AUTOMATICAMENTE</Label>
                  <div className="mt-2 space-y-2">
                    {automaticBlocked.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="w-4 h-4" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
