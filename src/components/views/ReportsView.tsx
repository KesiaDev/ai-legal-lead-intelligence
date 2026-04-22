import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react';
import api from '@/api/client';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const AREA_LABELS: Record<string, string> = {
  trabalhista: 'Trabalhista',
  previdenciario: 'Previdenciário',
  familia: 'Família',
  penal: 'Penal',
  empresarial: 'Empresarial',
  civil: 'Cível',
  imobiliario: 'Imobiliário',
  consumidor: 'Consumidor',
  null: 'Não informado',
};

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_triagem: 'Em triagem',
  qualificado: 'Qualificado',
  consulta_agendada: 'Consulta agendada',
  compareceu: 'Compareceu',
  contrato_enviado: 'Contrato enviado',
  contrato_assinado: 'Contrato assinado',
  perdido: 'Perdido',
};

// Dados mock para quando API não estiver disponível
const MOCK_DATA = {
  summary: { totalLeads: 87, leadsToday: 5, activeConversations: 12, scheduledLeads: 8 },
  leads: {
    totalLeads: 87,
    last7Days: [
      { date: '2026-04-16', count: 6 },
      { date: '2026-04-17', count: 9 },
      { date: '2026-04-18', count: 4 },
      { date: '2026-04-19', count: 11 },
      { date: '2026-04-20', count: 7 },
      { date: '2026-04-21', count: 8 },
      { date: '2026-04-22', count: 5 },
    ],
    byStatus: [
      { status: 'novo', count: 22 },
      { status: 'em_triagem', count: 18 },
      { status: 'qualificado', count: 25 },
      { status: 'consulta_agendada', count: 12 },
      { status: 'perdido', count: 10 },
    ],
    byLegalArea: [
      { area: 'trabalhista', count: 28 },
      { area: 'previdenciario', count: 19 },
      { area: 'familia', count: 14 },
      { area: 'penal', count: 9 },
      { area: 'empresarial', count: 7 },
      { area: 'civil', count: 10 },
    ],
    byUrgency: [
      { urgency: 'urgente', count: 11 },
      { urgency: 'alta', count: 23 },
      { urgency: 'media', count: 34 },
      { urgency: 'baixa', count: 19 },
    ],
  },
  conversations: {
    totalConversations: 94,
    totalMessages: 1247,
    avgMessagesPerConversation: 13,
    byChannel: [{ channel: 'whatsapp', count: 94 }],
    byStatus: [
      { status: 'active', count: 12 },
      { status: 'closed', count: 72 },
      { status: 'paused', count: 10 },
    ],
    byAssignedType: [
      { type: 'ai', count: 78 },
      { type: 'human', count: 11 },
      { type: 'hybrid', count: 5 },
    ],
  },
};

export function ReportsView() {
  const [period, setPeriod] = useState('7d');
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [period]);

  async function loadReports() {
    setLoading(true);
    try {
      const to = new Date().toISOString();
      const from = new Date(
        Date.now() - (period === '7d' ? 7 : period === '30d' ? 30 : 90) * 86400000
      ).toISOString();

      const [summaryRes, leadsRes, convsRes] = await Promise.all([
        api.get('/api/reports/summary'),
        api.get('/api/reports/leads', { params: { from, to } }),
        api.get('/api/reports/conversations', { params: { from, to } }),
      ]);
      setData({ summary: summaryRes.data, leads: leadsRes.data, conversations: convsRes.data });
    } catch {
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            Métricas detalhadas do seu SDR Jurídico
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', value: data.summary.totalLeads, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Leads Hoje', value: data.summary.leadsToday, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Conversas Ativas', value: data.summary.activeConversations, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Consultas Agendadas', value: data.summary.scheduledLeads, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                  <div className="text-xs text-muted-foreground">{kpi.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leads por dia */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novos Leads por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.leads.last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={d => new Date(d).toLocaleDateString('pt-BR')}
                formatter={(v: any) => [v, 'Leads']}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Por área jurídica */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por Área Jurídica</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.leads.byLegalArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="area"
                  type="category"
                  tick={{ fontSize: 11 }}
                  tickFormatter={a => AREA_LABELS[a] || a}
                  width={90}
                />
                <Tooltip formatter={(v: any) => [v, 'Leads']} labelFormatter={a => AREA_LABELS[a] || a} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.leads.byLegalArea.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Por status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.leads.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${STATUS_LABELS[name] || name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.leads.byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [v, STATUS_LABELS[name] || name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversas por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atendimentos: IA vs Humano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {data.conversations.byAssignedType.map((item, i) => {
                const total = data.conversations.totalConversations;
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                const labels: Record<string, string> = { ai: 'IA Automatizado', human: 'Humano', hybrid: 'Híbrido' };
                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{labels[item.type] || item.type}</span>
                      <span className="text-sm text-muted-foreground">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t text-sm text-muted-foreground">
                Total: {data.conversations.totalConversations} conversas •{' '}
                {data.conversations.totalMessages} mensagens •{' '}
                Média: {data.conversations.avgMessagesPerConversation} msg/conversa
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Por urgência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leads por Urgência</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.leads.byUrgency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="urgency"
                  tick={{ fontSize: 12 }}
                  tickFormatter={u => ({ urgente: '🔴 Urgente', alta: '🟠 Alta', media: '🟡 Média', baixa: '🟢 Baixa' }[u] || u)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [v, 'Leads']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#eab308" />
                  <Cell fill="#22c55e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
