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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Copy,
  Edit,
  Archive,
  Trash2,
  Variable,
} from 'lucide-react';
import { 
  MessageTemplate, 
  TemplateType, 
  TEMPLATE_TYPES, 
  TEMPLATE_VARIABLES 
} from '@/types/template';

export function TemplatesSection() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useAgent();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'primeira_resposta' as TemplateType,
    content: '',
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    return matches.map(m => m.replace(/\{\{|\}\}/g, ''));
  };

  const handleSave = () => {
    const variables = extractVariables(formData.content);
    
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        ...formData,
        variables,
        updatedAt: new Date(),
      });
    } else {
      const newTemplate: MessageTemplate = {
        id: `tpl-${Date.now()}`,
        ...formData,
        variables,
        status: 'ativo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addTemplate(newTemplate);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      content: template.content,
    });
    setIsDialogOpen(true);
  };

  const handleDuplicate = (template: MessageTemplate) => {
    const duplicated: MessageTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addTemplate(duplicated);
  };

  const handleArchive = (template: MessageTemplate) => {
    updateTemplate(template.id, { status: 'arquivado' });
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({ name: '', type: 'primeira_resposta', content: '' });
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Templates de Mensagem
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie modelos de mensagens com variáveis dinâmicas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-success hover:bg-success/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Boas-vindas Inicial"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: TemplateType) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conteúdo da Mensagem</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Variable className="w-4 h-4 mr-2" />
                        Inserir Variável
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {TEMPLATE_VARIABLES.map(variable => (
                        <DropdownMenuItem 
                          key={variable.key}
                          onClick={() => insertVariable(variable.key)}
                        >
                          <code className="mr-2 text-primary">{variable.key}</code>
                          <span className="text-muted-foreground text-xs">
                            {variable.description}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Digite sua mensagem. Use {{variavel}} para inserir dados dinâmicos."
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis detectadas: {extractVariables(formData.content).join(', ') || 'Nenhuma'}
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {formData.content
                      .replace(/\{\{nome\}\}/g, 'João Silva')
                      .replace(/\{\{area_direito\}\}/g, 'Trabalhista')
                      .replace(/\{\{urgencia\}\}/g, 'Alta')
                      .replace(/\{\{advogado\}\}/g, 'Dr. Ricardo')
                      .replace(/\{\{data_reuniao\}\}/g, '15/01/2025')
                      .replace(/\{\{hora_reuniao\}\}/g, '14:00')
                      .replace(/\{\{escritorio\}\}/g, 'Escritório ABC')
                      .replace(/\{\{telefone\}\}/g, '(11) 99999-9999')
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formData.name || !formData.content}>
                {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(TEMPLATE_TYPES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className={`
            relative transition-all hover:shadow-md
            ${template.status === 'arquivado' ? 'opacity-60' : ''}
          `}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {TEMPLATE_TYPES[template.type]}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(template)}>
                      <Archive className="w-4 h-4 mr-2" />
                      Arquivar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {template.content}
              </p>
              <div className="flex flex-wrap gap-1">
                {template.variables.map(v => (
                  <Badge key={v} variant="secondary" className="text-xs">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  {template.status === 'ativo' ? '✅ Ativo' : '📦 Arquivado'}
                </span>
                <Switch
                  checked={template.status === 'ativo'}
                  onCheckedChange={(checked) => 
                    updateTemplate(template.id, { status: checked ? 'ativo' : 'inativo' })
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
