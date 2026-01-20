import { useState } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  FileText,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Plus,
  Settings2,
  Cpu,
  AlertCircle,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { AgentPrompt } from '@/types/agent';
import { PromptDetailView } from './PromptDetailView';

const PROMPT_TYPES = {
  'Orquestrador': 'Orquestrador Conversacional',
  'Qualificador': 'Qualificador Jurídico',
  'Resumo': 'Resumo de Conversa',
  'followup': 'Follow-up',
  'Scheduler': 'Agendamento',
  'Insights': 'Insights',
  'Lembrete': 'Lembrete de Reunião',
  'classificador_area': 'Classificador de Área Jurídica',
  'avaliador_urgencia': 'Avaliador de Urgência Jurídica',
  'pre_diagnostico': 'Pré-Diagnóstico Jurídico',
  'qualificacao_comercial': 'Qualificação Comercial Jurídica',
  'encaminhamento': 'Agente de Encaminhamento',
  'proposta_acao': 'Proposta de Próxima Ação',
  'compliance_oab': 'Compliance OAB',
  'inteligencia_funil': 'Inteligência do Funil',
  'acompanhamento': 'Acompanhamento Jurídico Inteligente',
  'video_transcription': 'Transcrição de Vídeo',
  'document_interpretate': 'Interpretação de Documento',
  'document_interpretation': 'Interpretação de Documento',
  'image_transcription': 'Transcrição de Imagem',
  'conversation_summary': 'Resumo de Conversa',
  'protractor': 'Protractor',
};

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

export function PromptsSection() {
  const { prompts, addPrompt, updatePrompt } = useAgent();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [viewingPrompt, setViewingPrompt] = useState<AgentPrompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<AgentPrompt | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || prompt.type === typeFilter;
    const matchesProvider = providerFilter === 'all' || prompt.provider.toLowerCase() === providerFilter;
    return matchesSearch && matchesType && matchesProvider;
  });

  const handleView = (prompt: AgentPrompt) => {
    setViewingPrompt(prompt);
    setShowDetailView(true);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setViewingPrompt(null);
  };

  const handleEdit = (prompt: AgentPrompt) => {
    setEditingPrompt({ ...prompt });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, editingPrompt);
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
    }
  };

  const handleDuplicate = (prompt: AgentPrompt) => {
    const duplicated: AgentPrompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      name: `${prompt.name} (Cópia)`,
      version: 'v1',
      status: 'inativo',
    };
    addPrompt(duplicated);
  };

  const handleCreateNew = () => {
    const newPrompt: AgentPrompt = {
      id: `prompt-${Date.now()}`,
      name: 'Novo Prompt',
      type: 'Orquestrador',
      version: 'v1',
      status: 'inativo',
      provider: 'OpenAI',
      model: 'gpt-4',
      content: '',
    };
    setEditingPrompt(newPrompt);
    setIsEditDialogOpen(true);
  };

  const handleSaveNew = () => {
    if (editingPrompt && !prompts.find(p => p.id === editingPrompt.id)) {
      addPrompt(editingPrompt);
    } else if (editingPrompt) {
      updatePrompt(editingPrompt.id, editingPrompt);
    }
    setIsEditDialogOpen(false);
    setEditingPrompt(null);
  };

  // Se estiver visualizando detalhes, mostrar a tela de detalhes
  if (showDetailView && viewingPrompt) {
    return (
      <PromptDetailView
        prompt={viewingPrompt}
        onBack={handleBackFromDetail}
        isReadOnly={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Prompts do Agente
          </h2>
          <p className="text-muted-foreground mt-1">
            Visualize, edite e versione os prompts do agente IA
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-success hover:bg-success/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Prompt
        </Button>
      </div>

      {/* Compliance Warning */}
      <Card className="border-warning/50 bg-warning/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Regras de Compliance</p>
              <p className="text-sm text-muted-foreground">
                Todos os prompts devem seguir as regras de ética da OAB. Não é permitido:
                aconselhamento jurídico, promessas de resultado, linguagem informal excessiva.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.keys(PROMPT_TYPES).map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os provedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os provedores</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="google">Google</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="w-10">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = PROMPT_ICONS[prompt.type] || FileText;
                        return (
                          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                        );
                      })()}
                      <span className="font-medium">{prompt.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{prompt.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{prompt.version}</TableCell>
                  <TableCell>
                    <Badge
                      className={prompt.status === 'ativo'
                        ? 'bg-green-600 text-white'
                        : 'bg-muted text-muted-foreground'
                      }
                    >
                      {prompt.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      prompt.provider === 'OpenAI' ? 'border-green-500 text-green-600' : 'border-blue-500 text-blue-600'
                    }>
                      {prompt.provider}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{prompt.model}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-accent rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(prompt)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(prompt)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(prompt)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingPrompt(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              {editingPrompt?.id.startsWith('prompt-') && !prompts.find(p => p.id === editingPrompt.id) 
                ? 'Criar Novo Prompt' 
                : 'Editar Prompt'}
            </DialogTitle>
          </DialogHeader>
          {editingPrompt && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={editingPrompt.type}
                    onValueChange={(value) => setEditingPrompt({ ...editingPrompt, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROMPT_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={editingPrompt.provider}
                    onValueChange={(value: 'OpenAI' | 'Google') => 
                      setEditingPrompt({ ...editingPrompt, provider: value })
                    }
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
                  <Label>Modelo</Label>
                  <Select
                    value={editingPrompt.model}
                    onValueChange={(value) => setEditingPrompt({ ...editingPrompt, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Versão</Label>
                  <Input
                    value={editingPrompt.version}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, version: e.target.value })}
                    placeholder="v1, v2..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conteúdo do Prompt</Label>
                <Textarea
                  value={editingPrompt.content}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Você é um assistente jurídico profissional..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNew}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
