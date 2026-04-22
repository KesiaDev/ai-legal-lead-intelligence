import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Users, Pencil, Trash2, RefreshCw, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface Department {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  _count?: { members: number };
  members?: { user: { id: string; name: string; email: string }; role: string }[];
}

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#14b8a6', '#ec4899', '#0ea5e9', '#f97316', '#84cc16',
];

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: '1', name: 'Triagem', color: '#6366f1', isActive: true,
    _count: { members: 3 },
    members: [
      { user: { id: 'u1', name: 'Ana Paula', email: 'ana@escritorio.com' }, role: 'member' },
      { user: { id: 'u2', name: 'Carlos Lima', email: 'carlos@escritorio.com' }, role: 'leader' },
    ],
  },
  {
    id: '2', name: 'Trabalhista', color: '#22c55e', isActive: true,
    _count: { members: 2 },
    members: [
      { user: { id: 'u3', name: 'Dra. Fernanda', email: 'fernanda@escritorio.com' }, role: 'leader' },
    ],
  },
  {
    id: '3', name: 'Família e Sucessões', color: '#f59e0b', isActive: true,
    _count: { members: 1 },
    members: [
      { user: { id: 'u4', name: 'Dr. Marcos', email: 'marcos@escritorio.com' }, role: 'leader' },
    ],
  },
];

export function DepartmentsView() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/departments');
      setDepartments(res.data);
    } catch {
      setDepartments(MOCK_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setFormName('');
    setFormColor(COLORS[0]);
    setEditTarget(null);
    setShowCreate(true);
  }

  function openEdit(dept: Department) {
    setFormName(dept.name);
    setFormColor(dept.color);
    setEditTarget(dept);
    setShowCreate(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    try {
      if (editTarget) {
        await apiClient.put(`/api/departments/${editTarget.id}`, { name: formName, color: formColor });
        toast({ title: 'Departamento atualizado' });
      } else {
        await apiClient.post('/api/departments', { name: formName, color: formColor });
        toast({ title: 'Departamento criado' });
      }
      setShowCreate(false);
      loadData();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.delete(`/api/departments/${id}`);
      toast({ title: 'Departamento removido' });
      loadData();
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  }

  async function handleToggleActive(dept: Department) {
    try {
      await apiClient.patch(`/api/departments/${dept.id}/toggle`);
      loadData();
    } catch {
      setDepartments(prev =>
        prev.map(d => d.id === dept.id ? { ...d, isActive: !d.isActive } : d)
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-indigo-600">{departments.length}</div>
            <div className="text-xs text-muted-foreground">Departamentos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-green-600">
              {departments.filter(d => d.isActive).length}
            </div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-amber-600">
              {departments.reduce((sum, d) => sum + (d._count?.members || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Membros total</div>
          </CardContent>
        </Card>
      </div>

      {/* Header + action */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5" />
            Departamentos ({departments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Carregando...
            </div>
          ) : departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Users className="w-10 h-10 opacity-30" />
              <p>Nenhum departamento criado</p>
              <Button size="sm" onClick={openCreate}>Criar primeiro</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Membros</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="font-medium text-sm">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <UserPlus className="w-4 h-4" />
                        {dept._count?.members ?? dept.members?.length ?? 0} membro(s)
                      </div>
                      {dept.members && dept.members.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dept.members.slice(0, 3).map(m => (
                            <span
                              key={m.user.id}
                              className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                            >
                              {m.user.name}
                              {m.role === 'leader' && ' ⭐'}
                            </span>
                          ))}
                          {(dept.members.length > 3) && (
                            <span className="text-xs text-muted-foreground">
                              +{dept.members.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleToggleActive(dept)}>
                        <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                          {dept.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => openEdit(dept)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(dept.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar Departamento' : 'Novo Departamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome</label>
              <Input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Ex: Trabalhista, Família, Triagem..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cor</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${formColor === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formName.trim()}>
              {editTarget ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
