import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  PhoneCall,
  Mail,
  Trash2,
  RefreshCw,
  Plus,
  Filter,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';

interface FollowUp {
  id: string;
  leadId: string;
  lead?: { id: string; name: string; phone: string; legalArea?: string };
  type: string;
  status: string;
  scheduledAt: string;
  sentAt?: string;
  content?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  sent: { label: 'Enviado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: XCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600', icon: AlertCircle },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600' },
  call: { label: 'Ligação', icon: PhoneCall, color: 'text-blue-600' },
  email: { label: 'Email', icon: Mail, color: 'text-purple-600' },
  message: { label: 'Mensagem', icon: MessageSquare, color: 'text-gray-600' },
};

export function FollowUpView() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, sent: 0, failed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const [fuRes, statsRes] = await Promise.all([
        apiClient.get('/api/followups', {
          params: statusFilter !== 'all' ? { status: statusFilter } : {},
        }),
        apiClient.get('/api/followups/stats'),
      ]);
      setFollowUps(fuRes.data);
      setStats(statsRes.data);
    } catch {
      // usa dados mock se API ainda não está disponível
      setFollowUps(MOCK_FOLLOW_UPS);
      setStats({ total: 12, pending: 5, sent: 4, failed: 1, cancelled: 2 });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id: string) {
    try {
      await apiClient.delete(`/api/followups/${id}`);
      toast({ title: 'Follow-up cancelado' });
      loadData();
    } catch {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' });
    }
  }

  async function handleBulkCancel() {
    try {
      const res = await apiClient.post('/api/followups/bulk-cancel', {});
      toast({ title: `${res.data.cancelled} follow-ups cancelados` });
      loadData();
    } catch {
      toast({ title: 'Erro ao cancelar em massa', variant: 'destructive' });
    }
  }

  const filtered = followUps.filter(fu => {
    if (statusFilter !== 'all' && fu.status !== statusFilter) return false;
    if (typeFilter !== 'all' && fu.type !== typeFilter) return false;
    return true;
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Pendentes', value: stats.pending, color: 'text-yellow-600' },
          { label: 'Enviados', value: stats.sent, color: 'text-green-600' },
          { label: 'Falharam', value: stats.failed, color: 'text-red-600' },
          { label: 'Cancelados', value: stats.cancelled, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="call">Ligação</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>

        {stats.pending > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkCancel}>
            <Trash2 className="w-4 h-4 mr-2" />
            Cancelar todos pendentes ({stats.pending})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Follow-ups ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Calendar className="w-10 h-10 opacity-30" />
              <p>Nenhum follow-up encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Agendado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conteúdo</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(fu => {
                  const statusCfg = STATUS_CONFIG[fu.status] || STATUS_CONFIG.pending;
                  const typeCfg = TYPE_CONFIG[fu.type] || TYPE_CONFIG.message;
                  const StatusIcon = statusCfg.icon;
                  const TypeIcon = typeCfg.icon;
                  return (
                    <TableRow key={fu.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {fu.lead?.name || 'Lead desconhecido'}
                          </div>
                          {fu.lead?.legalArea && (
                            <div className="text-xs text-muted-foreground">{fu.lead.legalArea}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1.5 text-sm ${typeCfg.color}`}>
                          <TypeIcon className="w-4 h-4" />
                          {typeCfg.label}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(fu.scheduledAt)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-48">
                        {fu.content ? (
                          <p className="text-xs text-muted-foreground truncate">{fu.content}</p>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fu.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => handleCancel(fu.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Mock para fallback enquanto a API não estiver pronta
const MOCK_FOLLOW_UPS: FollowUp[] = [
  {
    id: '1', leadId: 'l1',
    lead: { id: 'l1', name: 'Ana Souza', phone: '54999999999', legalArea: 'Trabalhista' },
    type: 'whatsapp', status: 'pending',
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    content: 'Oi Ana! Você conseguiu reunir os documentos?',
    createdBy: 'ai', createdAt: new Date().toISOString(),
  },
  {
    id: '2', leadId: 'l2',
    lead: { id: 'l2', name: 'Carlos Mendes', phone: '54988888888', legalArea: 'Família' },
    type: 'call', status: 'sent',
    scheduledAt: new Date(Date.now() - 7200000).toISOString(),
    sentAt: new Date(Date.now() - 7000000).toISOString(),
    content: 'Lembrete de consulta amanhã às 14h',
    createdBy: 'ai', createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3', leadId: 'l3',
    lead: { id: 'l3', name: 'Maria Lima', phone: '54977777777', legalArea: 'Previdenciário' },
    type: 'whatsapp', status: 'failed',
    scheduledAt: new Date(Date.now() - 3600000).toISOString(),
    content: 'Seguimento sobre seu processo',
    createdBy: 'ai', createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];
