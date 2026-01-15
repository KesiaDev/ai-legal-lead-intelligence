import { useState } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2,
  Target,
  Zap,
  ArrowRight,
  Settings2,
  GripVertical,
} from 'lucide-react';
import { Intention } from '@/types/agent';
import { FunnelStage, FUNNEL_ACTION_TYPES } from '@/types/funnel';

const AVAILABLE_ACTIONS = [
  'Mover etapa no funil',
  'Delegar para Humano',
  'Criar anotação',
  'Enviar mensagem',
  'Atualizar status',
  'Resumo da conversa',
  'Agendar follow-up',
  'Criar atividade',
  'Mudar status',
  'Arquivar',
];

export function IntentionsSection() {
  const { 
    intentions, 
    addIntention, 
    updateIntention, 
    deleteIntention,
    funnelStages,
    updateFunnelStage,
    addFunnelStage,
    deleteFunnelStage,
    agent 
  } = useAgent();
  
  const [showFunnel, setShowFunnel] = useState(false);
  const [isIntentionDialogOpen, setIsIntentionDialogOpen] = useState(false);
  const [isFunnelDialogOpen, setIsFunnelDialogOpen] = useState(false);
  const [editingIntention, setEditingIntention] = useState<Intention | null>(null);
  const [editingStage, setEditingStage] = useState<FunnelStage | null>(null);
  
  const [intentionForm, setIntentionForm] = useState({
    name: '',
    description: '',
    actions: [] as string[],
  });

  const [stageForm, setStageForm] = useState({
    name: '',
    description: '',
    color: 'hsl(var(--primary))',
  });

  const handleSaveIntention = () => {
    if (editingIntention) {
      updateIntention(editingIntention.id, intentionForm);
    } else {
      addIntention({
        id: `int-${Date.now()}`,
        ...intentionForm,
      });
    }
    setIsIntentionDialogOpen(false);
    resetIntentionForm();
  };

  const handleEditIntention = (intention: Intention) => {
    setEditingIntention(intention);
    setIntentionForm({
      name: intention.name,
      description: intention.description || '',
      actions: intention.actions,
    });
    setIsIntentionDialogOpen(true);
  };

  const handleDuplicateIntention = (intention: Intention) => {
    addIntention({
      ...intention,
      id: `int-${Date.now()}`,
      name: `${intention.name} (Cópia)`,
    });
  };

  const resetIntentionForm = () => {
    setEditingIntention(null);
    setIntentionForm({ name: '', description: '', actions: [] });
  };

  const toggleAction = (action: string) => {
    setIntentionForm(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action],
    }));
  };

  const handleSaveStage = () => {
    if (editingStage) {
      updateFunnelStage(editingStage.id, stageForm);
    } else {
      addFunnelStage({
        id: `stage-${Date.now()}`,
        ...stageForm,
        order: funnelStages.length + 1,
        autoActions: [],
        isActive: true,
      });
    }
    setIsFunnelDialogOpen(false);
    resetStageForm();
  };

  const handleEditStage = (stage: FunnelStage) => {
    setEditingStage(stage);
    setStageForm({
      name: stage.name,
      description: stage.description,
      color: stage.color,
    });
    setIsFunnelDialogOpen(true);
  };

  const resetStageForm = () => {
    setEditingStage(null);
    setStageForm({ name: '', description: '', color: 'hsl(var(--primary))' });
  };

  const colorOptions = [
    { value: 'hsl(var(--primary))', label: 'Primário', class: 'bg-primary' },
    { value: 'hsl(var(--secondary))', label: 'Secundário', class: 'bg-secondary' },
    { value: 'hsl(var(--success))', label: 'Sucesso', class: 'bg-success' },
    { value: 'hsl(var(--warning))', label: 'Aviso', class: 'bg-warning' },
    { value: 'hsl(var(--destructive))', label: 'Erro', class: 'bg-destructive' },
    { value: 'hsl(var(--info))', label: 'Info', class: 'bg-info' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Intenções e Funil CRM
          </h2>
          <p className="text-muted-foreground mt-1">{agent.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={showFunnel ? 'default' : 'outline'} 
            onClick={() => setShowFunnel(!showFunnel)}
            className={showFunnel ? 'bg-primary' : 'text-primary border-primary'}
          >
            <Filter className="w-4 h-4 mr-2" />
            Funil CRM
          </Button>
          <Button 
            onClick={() => setIsIntentionDialogOpen(true)}
            className="bg-success hover:bg-success/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar intenção
          </Button>
        </div>
      </div>

      {/* Funnel View */}
      {showFunnel && (
        <Card className="bg-gradient-to-r from-muted/50 to-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Etapas do Funil CRM
              </CardTitle>
              <Button size="sm" onClick={() => setIsFunnelDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {funnelStages
                .sort((a, b) => a.order - b.order)
                .map((stage, index) => (
                  <div key={stage.id} className="flex items-center">
                    <Card 
                      className="min-w-[180px] cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: stage.color, borderLeftWidth: 4 }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{stage.name}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-accent rounded">
                                <MoreVertical className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditStage(stage)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteFunnelStage(stage.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {stage.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Switch
                            checked={stage.isActive}
                            onCheckedChange={(checked) => updateFunnelStage(stage.id, { isActive: checked })}
                          />
                          <Badge variant="outline" className="text-xs">
                            #{stage.order}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    {index < funnelStages.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground mx-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intentions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {intentions.map((intention) => (
          <Card key={intention.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{intention.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditIntention(intention)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateIntention(intention)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteIntention(intention.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {intention.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {intention.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Ações:</p>
                {intention.actions.length > 0 ? (
                  <ul className="space-y-0.5">
                    {intention.actions.map((action, index) => (
                      <li key={index} className="text-xs text-primary flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhuma ação configurada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intention Dialog */}
      <Dialog open={isIntentionDialogOpen} onOpenChange={(open) => {
        setIsIntentionDialogOpen(open);
        if (!open) resetIntentionForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingIntention ? 'Editar Intenção' : 'Criar Nova Intenção'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Intenção</Label>
              <Input
                value={intentionForm.name}
                onChange={(e) => setIntentionForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Agendou Reunião"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={intentionForm.description}
                onChange={(e) => setIntentionForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Quando esta intenção é detectada..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Ações Automáticas</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Selecione as ações que serão executadas quando esta intenção for detectada
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_ACTIONS.map(action => (
                  <div 
                    key={action}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      intentionForm.actions.includes(action) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => toggleAction(action)}
                  >
                    <Checkbox checked={intentionForm.actions.includes(action)} />
                    <span className="text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIntentionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveIntention} disabled={!intentionForm.name}>
              {editingIntention ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Funnel Stage Dialog */}
      <Dialog open={isFunnelDialogOpen} onOpenChange={(open) => {
        setIsFunnelDialogOpen(open);
        if (!open) resetStageForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStage ? 'Editar Etapa do Funil' : 'Nova Etapa do Funil'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Etapa</Label>
              <Input
                value={stageForm.name}
                onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Em Qualificação"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={stageForm.description}
                onChange={(e) => setStageForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      stageForm.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    onClick={() => setStageForm(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFunnelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStage} disabled={!stageForm.name}>
              {editingStage ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
