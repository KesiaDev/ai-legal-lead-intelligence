import { useState, useEffect } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  MoreVertical,
  UserPlus,
  MessageSquare,
  Volume2,
  Calendar,
  Briefcase,
  Bot,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/client';
import { cn } from '@/lib/utils';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserIntegration {
  id: string;
  userId: string;
  type: string;
  provider: string;
  isActive: boolean;
}

interface Department {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  members?: { userId: string; role: string }[];
  _count?: { members: number };
}

interface TenantIntegrations {
  evolutionApiUrl?: string | null;
  evolutionApiKey?: string | null;
  evolutionInstance?: string | null;
}

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#14b8a6', '#ec4899', '#0ea5e9', '#f97316', '#84cc16',
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  user: 'Agente',
  sdr: 'IA',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  user: 'bg-blue-100 text-blue-700',
  sdr: 'bg-green-100 text-green-700',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string) {
  const colors = ['bg-indigo-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface IntegrationBadgeProps {
  label: string;
  connected: boolean;
  icon: React.ReactNode;
}
function IntegrationBadge({ label, connected, icon }: IntegrationBadgeProps) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors',
      connected
        ? 'border-green-300 bg-green-50 text-green-700'
        : 'border-border bg-muted/30 text-muted-foreground'
    )}>
      {icon}
      {label}
    </div>
  );
}

export function DepartmentsView() {
  const [activeTab, setActiveTab] = useState<'users' | 'departments'>('users');

  // Users state
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [tenantIntegrations, setTenantIntegrations] = useState<TenantIntegrations>({});
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // User dialog
  const [userDialog, setUserDialog] = useState<'create' | 'edit' | null>(null);
  const [editUser, setEditUser] = useState<TenantUser | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [userSaving, setUserSaving] = useState(false);

  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(true);
  const [deptDialog, setDeptDialog] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ name: '', color: COLORS[0] });

  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const [usersRes, intRes, tenantIntRes] = await Promise.all([
        api.get('/api/users').catch(() => null),
        api.get('/api/integrations/third-party').catch(() => null),
        api.get('/api/integrations').catch(() => null),
      ]);
      setUsers(usersRes?.data?.users || []);
      setUserIntegrations(intRes?.data?.data || []);
      setTenantIntegrations(tenantIntRes?.data || {});
    } catch {}
    setUsersLoading(false);
  }

  async function loadDepartments() {
    setDeptsLoading(true);
    try {
      const res = await api.get('/api/departments');
      setDepartments(res.data);
    } catch {}
    setDeptsLoading(false);
  }

  // User CRUD
  function openCreateUser() {
    setEditUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'user' });
    setUserDialog('create');
  }

  function openEditUser(user: TenantUser) {
    setEditUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setUserDialog('edit');
  }

  async function handleSaveUser() {
    if (!userForm.name || !userForm.email) return;
    setUserSaving(true);
    try {
      if (editUser) {
        const body: any = { name: userForm.name, email: userForm.email, role: userForm.role };
        if (userForm.password) body.password = userForm.password;
        await api.patch(`/api/users/${editUser.id}`, body);
        toast({ title: 'Usuário atualizado' });
      } else {
        if (!userForm.password) { toast({ title: 'Senha obrigatória', variant: 'destructive' }); setUserSaving(false); return; }
        await api.post('/api/users', userForm);
        toast({ title: 'Usuário criado' });
      }
      setUserDialog(null);
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    }
    setUserSaving(false);
  }

  async function handleDeleteUser(id: string) {
    try {
      await api.delete(`/api/users/${id}`);
      toast({ title: 'Usuário removido' });
      loadUsers();
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  }

  async function handleToggleUserStatus(user: TenantUser) {
    try {
      await api.patch(`/api/users/${user.id}/status`);
      loadUsers();
    } catch {}
  }

  // Department CRUD
  function openCreateDept() {
    setEditDept(null);
    setDeptForm({ name: '', color: COLORS[0] });
    setDeptDialog(true);
  }

  function openEditDept(dept: Department) {
    setEditDept(dept);
    setDeptForm({ name: dept.name, color: dept.color });
    setDeptDialog(true);
  }

  async function handleSaveDept() {
    if (!deptForm.name.trim()) return;
    try {
      if (editDept) {
        await api.put(`/api/departments/${editDept.id}`, deptForm);
        toast({ title: 'Departamento atualizado' });
      } else {
        await api.post('/api/departments', deptForm);
        toast({ title: 'Departamento criado' });
      }
      setDeptDialog(false);
      loadDepartments();
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  }

  async function handleDeleteDept(id: string) {
    try {
      await api.delete(`/api/departments/${id}`);
      toast({ title: 'Departamento removido' });
      loadDepartments();
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  }

  // Helpers
  function getUserIntegrations(userId: string) {
    return userIntegrations.filter(i => i.userId === userId && i.isActive);
  }

  function getUserDepts(userId: string) {
    return departments.filter(d => d.members?.some(m => m.userId === userId));
  }

  const hasEvolution = !!(tenantIntegrations.evolutionApiUrl && tenantIntegrations.evolutionApiKey);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchDept = deptFilter === 'all' || getUserDepts(u.id).some(d => d.id === deptFilter);
    return matchSearch && matchRole && matchDept;
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Usuários e Departamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie usuários, permissões e departamentos do sistema</p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'users' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4" />
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'departments' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Briefcase className="w-4 h-4" />
          Departamentos
        </button>
      </div>

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Agente</SelectItem>
                <SelectItem value="sdr">IA / SDR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Todos Departamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Departamentos</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={usersLoading}>
                <RefreshCw className={cn('w-4 h-4 mr-2', usersLoading && 'animate-spin')} />
                Atualizar
              </Button>
              <Button size="sm" onClick={openCreateUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>

          {/* Users table */}
          <div className="border rounded-lg overflow-hidden bg-background">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Agente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Função</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Voz</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Calendário</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">CRM</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-muted-foreground">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Carregando usuários...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Nenhum usuário encontrado</p>
                      <Button size="sm" variant="outline" onClick={openCreateUser} className="mt-3">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Criar usuário
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const uInts = getUserIntegrations(user.id);
                    const hasCalendar = uInts.some(i => i.type === 'calendar');
                    const calendarProvider = uInts.find(i => i.type === 'calendar')?.provider;
                    const hasCrm = uInts.some(i => i.type === 'crm');
                    const crmProvider = uInts.find(i => i.type === 'crm')?.provider;
                    const userDepts = getUserDepts(user.id);

                    return (
                      <tr key={user.id} className="border-t hover:bg-muted/20 transition-colors">
                        {/* Nome */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0', avatarColor(user.name))}>
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email || 'Sem email vinculado'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Agente */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Bot className={cn('w-4 h-4', userDepts.length > 0 ? 'text-green-500' : 'text-muted-foreground')} />
                            {userDepts.length > 0 ? (
                              <div>
                                <div className="text-sm font-medium">{userDepts[0].name}</div>
                                {userDepts.length > 1 && <div className="text-xs text-muted-foreground">+{userDepts.length - 1} depto</div>}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">Sem departamento</span>
                            )}
                          </div>
                        </td>

                        {/* Função */}
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md', ROLE_COLORS[user.role] || 'bg-muted text-muted-foreground')}>
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>

                        {/* WhatsApp */}
                        <td className="px-4 py-3">
                          <IntegrationBadge
                            label={hasEvolution ? 'Evolution' : 'ChatGuru'}
                            connected={hasEvolution}
                            icon={<MessageSquare className="w-3 h-3" />}
                          />
                        </td>

                        {/* Voz */}
                        <td className="px-4 py-3">
                          <IntegrationBadge
                            label="ElevenLabs"
                            connected={false}
                            icon={<Volume2 className="w-3 h-3" />}
                          />
                        </td>

                        {/* Calendário */}
                        <td className="px-4 py-3">
                          <IntegrationBadge
                            label={calendarProvider ? (calendarProvider === 'outlook' ? 'Outlook' : 'Calendário') : 'Calendário'}
                            connected={hasCalendar}
                            icon={<Calendar className="w-3 h-3" />}
                          />
                        </td>

                        {/* CRM */}
                        <td className="px-4 py-3">
                          <IntegrationBadge
                            label={crmProvider ? (crmProvider === 'pipedrive' ? 'Pipedrive' : crmProvider) : 'CRM'}
                            connected={hasCrm}
                            icon={<Briefcase className="w-3 h-3" />}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditUser(user)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.isActive ? 'Desativar' : 'Ativar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS TAB ── */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={loadDepartments} disabled={deptsLoading}>
              <RefreshCw className={cn('w-4 h-4 mr-2', deptsLoading && 'animate-spin')} />
              Atualizar
            </Button>
            <Button size="sm" onClick={openCreateDept}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Departamento
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-background">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Departamento</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Membros</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="w-24 px-4 py-3 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {deptsLoading ? (
                  <tr><td colSpan={4} className="text-center py-14 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Carregando...
                  </td></tr>
                ) : departments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-14 text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum departamento</p>
                    <Button size="sm" variant="outline" onClick={openCreateDept} className="mt-3">Criar primeiro</Button>
                  </td></tr>
                ) : (
                  departments.map(dept => (
                    <tr key={dept.id} className="border-t hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: dept.color }} />
                          <span className="font-medium text-sm">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {dept._count?.members ?? dept.members?.length ?? 0} membro(s)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={dept.isActive ? 'default' : 'secondary'} className="text-xs">
                          {dept.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDept(dept)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteDept(dept.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── USER DIALOG ── */}
      <Dialog open={!!userDialog} onOpenChange={() => setUserDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome *</label>
              <Input value={userForm.name} onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))} placeholder="Nome completo" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">E-mail *</label>
              <Input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="email@escritorio.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {editUser ? 'Nova Senha (opcional)' : 'Senha *'}
              </label>
              <Input type="password" value={userForm.password} onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Função</label>
              <Select value={userForm.role} onValueChange={v => setUserForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Agente</SelectItem>
                  <SelectItem value="sdr">IA / SDR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialog(null)}>Cancelar</Button>
            <Button onClick={handleSaveUser} disabled={userSaving || !userForm.name || !userForm.email}>
              {userSaving ? 'Salvando...' : editUser ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DEPARTMENT DIALOG ── */}
      <Dialog open={deptDialog} onOpenChange={setDeptDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editDept ? 'Editar Departamento' : 'Novo Departamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Nome</label>
              <Input value={deptForm.name} onChange={e => setDeptForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Trabalhista, Família..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Cor</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setDeptForm(p => ({ ...p, color: c }))}
                    className={cn('w-7 h-7 rounded-full transition-all', deptForm.color === c && 'ring-2 ring-offset-2 ring-indigo-500 scale-110')}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeptDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveDept} disabled={!deptForm.name.trim()}>
              {editDept ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
