import { useState } from 'react';
import { AgentPrompt } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Calendar, FileText, Settings, Code, Clock, CheckCircle2, ExternalLink, Plus, X, MessageSquare, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptDetailViewProps {
  prompt: AgentPrompt;
  onBack: () => void;
  onSave?: (prompt: AgentPrompt) => void;
  isReadOnly?: boolean;
}

const AVAILABLE_VARIABLES = [
  { name: 'lead_name', description: 'Nome do lead' },
  { name: 'lead_first_name', description: 'Primeiro nome do lead' },
  { name: 'lead_email', description: 'Email do lead' },
  { name: 'lead_phone', description: 'Telefone do lead' },
  { name: 'company_name', description: 'Nome da empresa' },
  { name: 'agent_name', description: 'Nome do agente' },
  { name: 'operator_name', description: 'Nome do operador' },
];

const PROMPT_ICONS: Record<string, any> = {
  'Scheduler': Calendar,
  'Orquestrador': MessageSquare,
  'Qualificador': FileText,
  'followup': FileText,
  'insights': FileText,
  'conversation_summary': FileText,
  'video_transcription': FileText,
  'document_interpretate': FileText,
  'document_interpretation': FileText,
  'image_transcription': FileText,
  'Lembrete': Calendar,
  'protractor': FileText,
};

export function PromptDetailView({ prompt, onBack, onSave, isReadOnly = true }: PromptDetailViewProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [editedPrompt, setEditedPrompt] = useState<AgentPrompt>(prompt);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [jsonSchema, setJsonSchema] = useState('{\n  "type": "object",\n  "required": ["action", "status"],\n  "properties": {\n    "action": {\n      "type": "string",\n      "enum": ["consultar", "agendar", "remarcar", "cancelar"]\n    },\n    "status": {\n      "type": "string",\n      "enum": ["ok", "need_identity", "need_choice"]\n    }\n  }\n}');
  const [promptConfig, setPromptConfig] = useState({
    mainProvider: prompt.provider,
    mainModel: prompt.model,
    fallbackProvider: 'Google' as 'OpenAI' | 'Google',
    fallbackModel: 'gemini-2.5-pro',
    temperature: 0.1,
    maxTokens: 512,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
  });

  const PromptIcon = PROMPT_ICONS[prompt.type] || FileText;
  const createdAt = new Date('2025-11-18').toLocaleDateString('pt-BR');
  const updatedAt = new Date('2026-01-20').toLocaleDateString('pt-BR');

  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById('prompt-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = editedPrompt.content;
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
      setEditedPrompt({ ...editedPrompt, content: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedPrompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <PromptIcon className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-display font-semibold">{editedPrompt.name}</h2>
              <p className="text-sm text-muted-foreground">
                Versão {editedPrompt.version} • Atualizado em {updatedAt}
              </p>
            </div>
            {isReadOnly && (
              <Badge variant="secondary" className="ml-2">Somente visualização</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Status do Prompt */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <Label>Status do Prompt</Label>
            <Badge className="bg-green-600 text-white">
              {editedPrompt.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Conteúdo
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="schema" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                JSON Schema
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Histórico
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Informações Básicas */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-2">Informações Básicas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure as informações principais do prompt
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt-name">Nome *</Label>
                  <Input
                    id="prompt-name"
                    value={editedPrompt.name}
                    onChange={(e) => setEditedPrompt({ ...editedPrompt, name: e.target.value })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt-description">Descrição</Label>
                  <Textarea
                    id="prompt-description"
                    placeholder="Descreva o objetivo deste prompt"
                    rows={3}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt-tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="prompt-tags"
                      placeholder="Digite uma tag e pressione Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      disabled={isReadOnly}
                    />
                    <Button onClick={handleAddTag} disabled={isReadOnly} size="icon" className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          {!isReadOnly && (
                            <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt-version">Versão</Label>
                    <Input
                      id="prompt-version"
                      value={editedPrompt.version}
                      onChange={(e) => setEditedPrompt({ ...editedPrompt, version: e.target.value })}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt-created">Criado em</Label>
                    <Input
                      id="prompt-created"
                      value={createdAt}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prompt-updated">Última atualização</Label>
                    <Input
                      id="prompt-updated"
                      value={updatedAt}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Conteúdo */}
            <TabsContent value="content" className="mt-0">
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Conteúdo do Prompt</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Escreva o conteúdo do prompt. Use as variáveis disponíveis ao lado.
                    </p>
                  </div>
                  <div className="relative">
                    <Textarea
                      id="prompt-content"
                      value={editedPrompt.content}
                      onChange={(e) => setEditedPrompt({ ...editedPrompt, content: e.target.value })}
                      className="font-mono text-sm min-h-[500px]"
                      disabled={isReadOnly}
                      placeholder="<objetivo>...</objetivo>"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        const textarea = document.getElementById('prompt-content');
                        if (textarea) {
                          textarea.requestFullscreen?.();
                        }
                      }}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-64 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Clique para inserir no prompt
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <button
                          key={variable.name}
                          onClick={() => handleInsertVariable(variable.name)}
                          className="w-full text-left p-2 rounded border hover:bg-muted transition-colors"
                          disabled={isReadOnly}
                        >
                          <code className="text-xs font-mono text-primary">{`{{${variable.name}}}`}</code>
                          <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Configurações */}
            <TabsContent value="settings" className="space-y-6 mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-2">Modelo e Provedor</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure o modelo de IA principal e o fallback
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provedor Principal *</Label>
                  <Select
                    value={promptConfig.mainProvider}
                    onValueChange={(value: 'OpenAI' | 'Google') =>
                      setPromptConfig({ ...promptConfig, mainProvider: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo Principal *</Label>
                  <Select
                    value={promptConfig.mainModel}
                    onValueChange={(value) =>
                      setPromptConfig({ ...promptConfig, mainModel: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                      <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                      <SelectItem value="gpt-4">gpt-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                      <SelectItem value="models/gemini-2.5-pro">models/gemini-2.5-pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provedor Fallback</Label>
                  <Select
                    value={promptConfig.fallbackProvider}
                    onValueChange={(value: 'OpenAI' | 'Google') =>
                      setPromptConfig({ ...promptConfig, fallbackProvider: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Modelo Fallback</Label>
                  <Select
                    value={promptConfig.fallbackModel}
                    onValueChange={(value) =>
                      setPromptConfig({ ...promptConfig, fallbackModel: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                      <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                      <SelectItem value="gemini-2.5-pro">gemini-2.5-pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Parâmetros de Geração</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajuste os parâmetros de geração do modelo
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature: {promptConfig.temperature.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[promptConfig.temperature]}
                      onValueChange={([value]) =>
                        setPromptConfig({ ...promptConfig, temperature: value })
                      }
                      min={0}
                      max={2}
                      step={0.01}
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">Controla a criatividade</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Max Tokens: {promptConfig.maxTokens}</Label>
                    </div>
                    <Slider
                      value={[promptConfig.maxTokens]}
                      onValueChange={([value]) =>
                        setPromptConfig({ ...promptConfig, maxTokens: value })
                      }
                      min={1}
                      max={4096}
                      step={1}
                      disabled={isReadOnly}
                    />
                    <p className="text-xs text-muted-foreground">Tamanho máximo da resposta</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Top P: {promptConfig.topP.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[promptConfig.topP]}
                      onValueChange={([value]) =>
                        setPromptConfig({ ...promptConfig, topP: value })
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      disabled={true}
                    />
                    <p className="text-xs text-muted-foreground">Nucleus sampling (somente leitura)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Frequency Penalty: {promptConfig.frequencyPenalty.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[promptConfig.frequencyPenalty]}
                      onValueChange={([value]) =>
                        setPromptConfig({ ...promptConfig, frequencyPenalty: value })
                      }
                      min={-2}
                      max={2}
                      step={0.01}
                      disabled={true}
                    />
                    <p className="text-xs text-muted-foreground">Penaliza repetições (somente leitura)</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Presence Penalty: {promptConfig.presencePenalty.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[promptConfig.presencePenalty]}
                      onValueChange={([value]) =>
                        setPromptConfig({ ...promptConfig, presencePenalty: value })
                      }
                      min={-2}
                      max={2}
                      step={0.01}
                      disabled={true}
                    />
                    <p className="text-xs text-muted-foreground">Incentiva novos tópicos (somente leitura)</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* JSON Schema */}
            <TabsContent value="schema" className="mt-0">
              <div className="flex gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">JSON Schema (Output Format)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Defina o schema JSON para estruturar a resposta do modelo
                    </p>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={jsonSchema}
                      onChange={(e) => setJsonSchema(e.target.value)}
                      className="font-mono text-sm min-h-[400px]"
                      disabled={isReadOnly}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="w-64 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Status do Schema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Schema JSON válido</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Documentação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-2">
                        O JSON Schema define a estrutura esperada da resposta do modelo.
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        Ver documentação completa
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Histórico */}
            <TabsContent value="history" className="mt-0">
              <div>
                <h3 className="text-lg font-semibold mb-2">Histórico de Versões</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Visualize e restaure versões anteriores deste prompt
                </p>
              </div>
              <div className="space-y-3">
                {[7, 6, 5, 4, 3, 2, 1].map((version) => (
                  <Card key={version} className={cn(version === 7 && "bg-green-50 border-green-200")}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            "bg-green-600 text-white",
                            version !== 7 && "bg-muted text-muted-foreground"
                          )}>
                            v{version}
                          </Badge>
                          {version === 7 && (
                            <Badge className="bg-green-600 text-white">Mais recente</Badge>
                          )}
                          <div className="text-sm">
                            <p className="font-medium">
                              {version === 7 ? '20/01/2026, 13:18' : version === 6 ? '20/01/2026, 13:10' : '17/01/2026, 12:02'} • por {version === 7 ? 'Odair Marcos' : 'Reinan'}
                            </p>
                            <p className="text-muted-foreground">{editedPrompt.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">Modelo</Badge>
                            {version <= 3 && <Badge variant="secondary" className="text-xs">Conteúdo</Badge>}
                            {version <= 2 && <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">Parâmetros</Badge>}
                          </div>
                          <Button variant="ghost" size="sm">
                            Comparar
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Modelo: {version <= 2 ? 'gpt-4.1' : 'gpt-4.1-mini'}, Provider: OpenAI, Temp: {version <= 2 ? '1.0' : version === 3 ? '0.2' : '0.1'}, Max Tokens: {version <= 2 ? '1024' : '512'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
