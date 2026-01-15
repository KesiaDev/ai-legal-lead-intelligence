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
  FileText, 
  Eye, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Edit, 
  Search,
  FolderOpen,
  BookOpen,
  Power,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { KnowledgeBaseItem } from '@/types/agent';
import { LEGAL_AREAS } from '@/types/lead';

interface ExtendedKnowledgeItem extends KnowledgeBaseItem {
  category?: string;
  legalArea?: string;
  priority?: 'alta' | 'media' | 'baixa';
  isActive?: boolean;
}

export function KnowledgeBaseSection() {
  const { knowledgeBase, addKnowledgeItem, removeKnowledgeItem, updateKnowledgeItem } = useAgent();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExtendedKnowledgeItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ExtendedKnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'geral',
    legalArea: '',
    priority: 'media' as 'alta' | 'media' | 'baixa',
  });

  // Safe fallback for knowledgeBase
  const safeKnowledgeBase = knowledgeBase || [];
  
  const extendedKnowledgeBase: ExtendedKnowledgeItem[] = safeKnowledgeBase.map(item => ({
    ...item,
    category: (item as any).category || 'geral',
    legalArea: (item as any).legalArea || '',
    priority: (item as any).priority || 'media',
    isActive: (item as any).isActive !== false,
  }));

  const filteredItems = extendedKnowledgeBase.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['geral', 'servicos', 'processos', 'faq', 'institucional'];

  const handleSave = () => {
    if (editingItem) {
      updateKnowledgeItem(editingItem.id, {
        ...formData,
        isActive: true,
      } as any);
    } else {
      const newItem: ExtendedKnowledgeItem = {
        id: `kb-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        legalArea: formData.legalArea,
        priority: formData.priority,
        isActive: true,
        createdAt: new Date(),
      };
      addKnowledgeItem(newItem as KnowledgeBaseItem);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (item: ExtendedKnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || 'geral',
      legalArea: item.legalArea || '',
      priority: item.priority || 'media',
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: ExtendedKnowledgeItem) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleToggleActive = (item: ExtendedKnowledgeItem) => {
    updateKnowledgeItem(item.id, { isActive: !item.isActive } as any);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      category: 'geral',
      legalArea: '',
      priority: 'media',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-urgent/20 text-urgent';
      case 'baixa': return 'bg-muted text-muted-foreground';
      default: return 'bg-warning/20 text-warning';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Base de Conhecimento
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie documentos e informações para o agente consultar
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-success hover:bg-success/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar na base de conhecimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Itens da Base ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                !item.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.isActive ? 'bg-success/20' : 'bg-muted'
                }`}>
                  <FileText className={`w-5 h-5 ${item.isActive ? 'text-success' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(item.priority || 'media')}`}>
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      Criado em {format(item.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {item.legalArea && (
                      <Badge variant="secondary" className="text-xs">
                        {LEGAL_AREAS[item.legalArea as keyof typeof LEGAL_AREAS] || item.legalArea}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.isActive}
                  onCheckedChange={() => handleToggleActive(item)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(item)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => removeKnowledgeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item encontrado</p>
              <p className="text-sm">Adicione documentos para o agente usar como referência</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Item' : 'Adicionar Item à Base de Conhecimento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Perguntas Frequentes sobre Trabalhista"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área do Direito</Label>
                <Select
                  value={formData.legalArea}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, legalArea: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {Object.entries(LEGAL_AREAS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'alta' | 'media' | 'baixa') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Conteúdo detalhado que o agente poderá consultar..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.title || !formData.content}>
              {editingItem ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingItem?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{viewingItem.category}</Badge>
                <Badge className={getPriorityColor(viewingItem.priority || 'media')}>
                  Prioridade: {viewingItem.priority}
                </Badge>
                {viewingItem.legalArea && (
                  <Badge variant="secondary">
                    {LEGAL_AREAS[viewingItem.legalArea as keyof typeof LEGAL_AREAS]}
                  </Badge>
                )}
                <Badge variant={viewingItem.isActive ? 'default' : 'secondary'}>
                  {viewingItem.isActive ? '✅ Ativo' : '❌ Inativo'}
                </Badge>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                {viewingItem.content}
              </div>
              <p className="text-xs text-muted-foreground">
                Criado em {format(viewingItem.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
