import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Bot, Plus, Trash2, ArrowDown, Play, Pause, ChevronRight,
  Zap, Users, ToggleLeft, ToggleRight, Settings, GripVertical,
  CheckCircle2, Clock, MessageSquare, Sparkles,
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  agentName: string;
  agentArea: string;
  agentColor: string;
  trigger: string;
  description: string;
  enabled: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  active: boolean;
  stages: PipelineStage[];
  leadsProcessed: number;
  createdAt: string;
}

const PRESET_AGENTS = [
  { name: 'Sofia', area: 'Trabalhista', color: '#f59e0b' },
  { name: 'Ana', area: 'Família', color: '#ec4899' },
  { name: 'Marco', area: 'Previdenciário', color: '#3b82f6' },
  { name: 'Beatriz', area: 'Cível', color: '#8b5cf6' },
  { name: 'Carlos', area: 'Consumidor', color: '#10b981' },
  { name: 'Thiago', area: 'Plano de Saúde', color: '#ef4444' },
  { name: 'Camila', area: 'Bancário', color: '#06b6d4' },
  { name: 'Ricardo', area: 'Imobiliário', color: '#f97316' },
  { name: 'Helena', area: 'Tributário', color: '#84cc16' },
];

const PRESET_TRIGGERS = [
  'Lead responde pela primeira vez',
  'Lead qualificado (preencheu dados básicos)',
  'Lead solicitou agendamento',
  'Lead inativo há 24h',
  'Lead pediu falar com humano',
  'Agente anterior concluiu triagem',
];

const DEFAULT_PIPELINES: Pipeline[] = [
  {
    id: 'pipe-trabalhista',
    name: 'Funil Trabalhista Completo',
    description: 'Triagem → Qualificação → Agendamento para casos trabalhistas',
    active: true,
    leadsProcessed: 143,
    createdAt: '2025-03-15',
    stages: [
      {
        id: 's1', name: 'Triagem inicial', agentName: 'Sofia', agentArea: 'Trabalhista',
        agentColor: '#f59e0b', trigger: 'Lead responde pela primeira vez',
        description: 'Identifica o tipo de caso trabalhista e coleta dados básicos', enabled: true,
      },
      {
        id: 's2', name: 'Qualificação', agentName: 'Sofia', agentArea: 'Trabalhista',
        agentColor: '#f59e0b', trigger: 'Agente anterior concluiu triagem',
        description: 'Aprofunda coleta de dados: datas, valores, documentos disponíveis', enabled: true,
      },
      {
        id: 's3', name: 'Agendamento', agentName: 'Sofia', agentArea: 'Trabalhista',
        agentColor: '#f59e0b', trigger: 'Lead qualificado (preencheu dados básicos)',
        description: 'Agenda consulta gratuita e envia confirmação', enabled: true,
      },
    ],
  },
  {
    id: 'pipe-multiarea',
    name: 'Multi-Área Jurídica',
    description: 'Triagem geral → Roteamento para especialista certo',
    active: false,
    leadsProcessed: 67,
    createdAt: '2025-04-02',
    stages: [
      {
        id: 's4', name: 'Recepção geral', agentName: 'Beatriz', agentArea: 'Cível',
        agentColor: '#8b5cf6', trigger: 'Lead responde pela primeira vez',
        description: 'Identifica a área jurídica do caso sem aprofundar', enabled: true,
      },
      {
        id: 's5', name: 'Especialista', agentName: 'Carlos', agentArea: 'Consumidor',
        agentColor: '#10b981', trigger: 'Agente anterior concluiu triagem',
        description: 'Assume o caso com expertise na área identificada', enabled: true,
      },
    ],
  },
];

export function MultiAgentsView() {
  const { toast } = useToast();
  const [pipelines, setPipelines] = useState<Pipeline[]>(DEFAULT_PIPELINES);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddStage, setShowAddStage] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newPipelineDesc, setNewPipelineDesc] = useState('');
  const [newStage, setNewStage] = useState({
    name: '', agentIdx: 0, trigger: PRESET_TRIGGERS[0], description: '',
  });

  const togglePipeline = (id: string) => {
    setPipelines(prev => prev.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
    const p = pipelines.find(x => x.id === id);
    toast({
      title: p?.active ? 'Pipeline pausado' : 'Pipeline ativado',
      description: p?.name,
    });
  };

  const deletePipeline = (id: string) => {
    setPipelines(prev => prev.filter(p => p.id !== id));
    if (selectedPipeline?.id === id) setSelectedPipeline(null);
    toast({ title: 'Pipeline removido' });
  };

  const handleCreatePipeline = () => {
    if (!newPipelineName.trim()) return;
    const np: Pipeline = {
      id: `pipe-${Date.now()}`,
      name: newPipelineName,
      description: newPipelineDesc,
      active: false,
      leadsProcessed: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      stages: [],
    };
    setPipelines(prev => [...prev, np]);
    setSelectedPipeline(np);
    setNewPipelineName('');
    setNewPipelineDesc('');
    setShowCreate(false);
    toast({ title: 'Pipeline criado!', description: 'Adicione estágios para configurar o fluxo.' });
  };

  const handleAddStage = () => {
    if (!newStage.name.trim() || !selectedPipeline) return;
    const agent = PRESET_AGENTS[newStage.agentIdx];
    const stage: PipelineStage = {
      id: `s-${Date.now()}`,
      name: newStage.name,
      agentName: agent.name,
      agentArea: agent.area,
      agentColor: agent.color,
      trigger: newStage.trigger,
      description: newStage.description,
      enabled: true,
    };
    const updated = { ...selectedPipeline, stages: [...selectedPipeline.stages, stage] };
    setPipelines(prev => prev.map(p => p.id === selectedPipeline.id ? updated : p));
    setSelectedPipeline(updated);
    setNewStage({ name: '', agentIdx: 0, trigger: PRESET_TRIGGERS[0], description: '' });
    setShowAddStage(false);
    toast({ title: 'Estágio adicionado!', description: `${agent.name} — ${newStage.name}` });
  };

  const removeStage = (stageId: string) => {
    if (!selectedPipeline) return;
    const updated = { ...selectedPipeline, stages: selectedPipeline.stages.filter(s => s.id !== stageId) };
    setPipelines(prev => prev.map(p => p.id === selectedPipeline.id ? updated : p));
    setSelectedPipeline(updated);
  };

  const toggleStage = (stageId: string) => {
    if (!selectedPipeline) return;
    const updated = {
      ...selectedPipeline,
      stages: selectedPipeline.stages.map(s => s.id === stageId ? { ...s, enabled: !s.enabled } : s),
    };
    setPipelines(prev => prev.map(p => p.id === selectedPipeline.id ? updated : p));
    setSelectedPipeline(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
            <Bot className="w-6 h-6 text-amber-500" />
            Multi-Agentes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crie pipelines com múltiplos agentes trabalhando em sequência no mesmo lead
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-amber-500 hover:bg-amber-600 text-black gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo pipeline
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pipelines ativos', value: pipelines.filter(p => p.active).length, icon: Play, color: 'text-green-500' },
          { label: 'Total de pipelines', value: pipelines.length, icon: Bot, color: 'text-amber-500' },
          { label: 'Leads processados', value: pipelines.reduce((s, p) => s + p.leadsProcessed, 0), icon: Users, color: 'text-blue-500' },
        ].map(s => (
          <div key={s.label} className="border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline list */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seus pipelines</p>
          {pipelines.map(pipeline => (
            <div
              key={pipeline.id}
              onClick={() => setSelectedPipeline(pipeline)}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                selectedPipeline?.id === pipeline.id
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-border hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{pipeline.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pipeline.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); togglePipeline(pipeline.id); }}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                      pipeline.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {pipeline.active ? 'Ativo' : 'Pausado'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deletePipeline(pipeline.id); }}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  {pipeline.stages.length} estágios
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {pipeline.leadsProcessed} leads
                </span>
              </div>
              {/* Stage pills */}
              <div className="flex gap-1 flex-wrap mt-2">
                {pipeline.stages.map((s, idx) => (
                  <span
                    key={s.id}
                    className="text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1"
                    style={{ background: s.agentColor + '20', color: s.agentColor }}
                  >
                    {idx + 1}. {s.agentName}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {pipelines.length === 0 && (
            <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum pipeline criado</p>
            </div>
          )}
        </div>

        {/* Pipeline detail / editor */}
        <div className="lg:col-span-2">
          {selectedPipeline ? (
            <div className="border rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedPipeline.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPipeline.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedPipeline.active ? 'default' : 'secondary'} className={selectedPipeline.active ? 'bg-green-600' : ''}>
                    {selectedPipeline.active ? 'Ativo' : 'Pausado'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => togglePipeline(selectedPipeline.id)} className="gap-1">
                    {selectedPipeline.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {selectedPipeline.active ? 'Pausar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              {/* Flow */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fluxo de estágios</p>
                  <Button size="sm" variant="outline" onClick={() => setShowAddStage(true)} className="gap-1 h-7 text-xs">
                    <Plus className="w-3 h-3" />
                    Adicionar estágio
                  </Button>
                </div>

                {selectedPipeline.stages.length === 0 && (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Adicione estágios para definir o fluxo de atendimento</p>
                  </div>
                )}

                {selectedPipeline.stages.map((stage, idx) => (
                  <div key={stage.id}>
                    <div className={`border rounded-xl p-4 transition-all ${stage.enabled ? 'border-border' : 'border-border/40 opacity-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground/40 cursor-grab" />
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: stage.agentColor }}
                          >
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{stage.name}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px]"
                              style={{ borderColor: stage.agentColor + '60', color: stage.agentColor }}
                            >
                              {stage.agentName} · {stage.agentArea}
                            </Badge>
                          </div>
                          {stage.description && (
                            <p className="text-xs text-muted-foreground mb-2">{stage.description}</p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span className="italic">{stage.trigger}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleStage(stage.id)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            title={stage.enabled ? 'Desativar estágio' : 'Ativar estágio'}
                          >
                            {stage.enabled
                              ? <ToggleRight className="w-5 h-5 text-green-500" />
                              : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                          </button>
                          <button
                            onClick={() => removeStage(stage.id)}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {idx < selectedPipeline.stages.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info */}
              {selectedPipeline.stages.length > 0 && (
                <div className="bg-muted/40 rounded-lg p-3 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Quando um lead chega, o <strong>Estágio 1</strong> assume automaticamente. Cada agente passa o lead ao próximo conforme o gatilho configurado.{' '}
                    Estágios desativados são pulados.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed rounded-xl flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
              <Bot className="w-12 h-12 opacity-20" />
              <p className="text-sm">Selecione um pipeline para editar</p>
              <Button variant="outline" size="sm" onClick={() => setShowCreate(true)} className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                Criar novo pipeline
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog: Criar pipeline */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-500" />
              Novo pipeline multi-agentes
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome do pipeline</label>
              <Input
                value={newPipelineName}
                onChange={e => setNewPipelineName(e.target.value)}
                placeholder="Ex: Funil Trabalhista Premium"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Descrição (opcional)</label>
              <Input
                value={newPipelineDesc}
                onChange={e => setNewPipelineDesc(e.target.value)}
                placeholder="Ex: Triagem → Qualificação → Agendamento"
              />
            </div>
            <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Depois de criar, você poderá adicionar estágios com agentes diferentes para cada etapa do atendimento.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePipeline} disabled={!newPipelineName.trim()} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black">
                <ChevronRight className="w-4 h-4 mr-1" />
                Criar pipeline
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Adicionar estágio */}
      <Dialog open={showAddStage} onOpenChange={setShowAddStage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-500" />
              Adicionar estágio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome do estágio</label>
              <Input
                value={newStage.name}
                onChange={e => setNewStage(s => ({ ...s, name: e.target.value }))}
                placeholder="Ex: Triagem inicial"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Agente responsável</label>
              <select
                value={newStage.agentIdx}
                onChange={e => setNewStage(s => ({ ...s, agentIdx: Number(e.target.value) }))}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                {PRESET_AGENTS.map((a, idx) => (
                  <option key={a.name} value={idx}>{a.name} — {a.area}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Gatilho de ativação</label>
              <select
                value={newStage.trigger}
                onChange={e => setNewStage(s => ({ ...s, trigger: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                {PRESET_TRIGGERS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Descrição (opcional)</label>
              <Input
                value={newStage.description}
                onChange={e => setNewStage(s => ({ ...s, description: e.target.value }))}
                placeholder="O que este agente faz nesta etapa?"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStage} disabled={!newStage.name.trim()} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar estágio
              </Button>
              <Button variant="outline" onClick={() => setShowAddStage(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
