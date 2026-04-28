import { useState, useEffect, useCallback } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Phone,
  RefreshCw,
  Search,
  Eye,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadsContext';
import { followupsApi, FollowUpItem } from '@/api/followups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LEGAL_AREAS } from '@/types/lead';
import { cn } from '@/lib/utils';

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 13) return `+${d.slice(0,2)} (${d.slice(2,4)}) ${d.slice(4,9)}-${d.slice(9)}`;
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return phone;
}

function channelLabel(type: string) {
  const map: Record<string, string> = {
    whatsapp: 'WhatsApp',
    whatsapp_followup: 'WhatsApp Follow-up',
    lembrete_consulta: 'Lembrete de Consulta',
    human_review: 'Revisão Humana',
    reativacao: 'Reativação',
    email: 'E-mail',
  };
  return map[type] || type;
}

export function ScheduleView() {
  const { leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [reminders, setReminders] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0 });

  const scheduledLeads = leads.filter(l => l.scheduledContact || l.availableForHumanContact);
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const loadFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const [all, statsData] = await Promise.all([
        followupsApi.list({ limit: 100 }),
        followupsApi.stats(),
      ]);

      // Separa follow-ups de lembretes de consulta
      setFollowUps(all.filter(f => f.type !== 'lembrete_consulta'));
      setReminders(all.filter(f => f.type === 'lembrete_consulta'));
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar follow-ups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  const handleCancel = async (id: string) => {
    try {
      await followupsApi.cancel(id);
      setFollowUps(prev => prev.filter(f => f.id !== id));
      setReminders(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Erro ao cancelar:', err);
    }
  };

  const handleCancelAll = async () => {
    try {
      await followupsApi.cancelAll();
      setFollowUps(prev => prev.filter(f => f.status !== 'pending'));
    } catch (err) {
      console.error('Erro ao cancelar todos:', err);
    }
  };

  const getLeadsForDay = (day: Date) => {
    return scheduledLeads.filter(lead => {
      if (!lead.scheduledContact) return false;
      return format(lead.scheduledContact, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
  };

  const filteredFollowUps = followUps.filter(f =>
    !searchQuery ||
    f.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.lead?.phone?.includes(searchQuery.replace(/\D/g, ''))
  );

  const filteredReminders = reminders.filter(r =>
    !searchQuery ||
    r.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.lead?.phone?.includes(searchQuery.replace(/\D/g, ''))
  );

  const statusBadge = (status: string) => {
    if (status === 'sent') return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Enviado</Badge>;
    if (status === 'failed') return <Badge variant="destructive">Falha</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Pendente</Badge>;
    if (status === 'cancelled') return <Badge variant="secondary">Cancelado</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const ContactTable = ({ data }: { data: FollowUpItem[] }) => (
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium">Contato</th>
              <th className="pb-3 font-medium">Canal</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Agendado para</th>
              <th className="pb-3 font-medium">Enviado em</th>
              <th className="pb-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-3">
                  <div>
                    <p className="font-medium">{row.lead?.name || '—'}</p>
                    <p className="text-sm text-muted-foreground">{formatPhone(row.lead?.phone || '')}</p>
                  </div>
                </td>
                <td className="py-3 text-sm">{channelLabel(row.type)}</td>
                <td className="py-3">{statusBadge(row.status)}</td>
                <td className="py-3 text-sm text-muted-foreground">
                  {format(new Date(row.scheduledAt), "dd/MM HH:mm", { locale: ptBR })}
                </td>
                <td className="py-3 text-sm text-muted-foreground">
                  {row.sentAt ? format(new Date(row.sentAt), "dd/MM HH:mm", { locale: ptBR }) : '—'}
                </td>
                <td className="py-3 text-right">
                  {row.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleCancel(row.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Agenda</h2>
          <p className="text-muted-foreground mt-1">Agendamentos, follow-ups e lembretes</p>
        </div>
        <Button size="sm" variant="outline" onClick={loadFollowUps} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50">
          <TabsTrigger value="calendar">Agendamentos</TabsTrigger>
          <TabsTrigger value="followup-hours">Horário de Envio</TabsTrigger>
          <TabsTrigger value="followup-cadence">Cadência</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups Agendados</TabsTrigger>
          <TabsTrigger value="reminders">Lembretes Cadastrados</TabsTrigger>
          <TabsTrigger value="reminders-scheduled">Lembretes Agendados</TabsTrigger>
        </TabsList>

        {/* ── Calendário Semanal ── */}
        <TabsContent value="calendar" className="mt-6 space-y-6">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayLeads = getLeadsForDay(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[200px] rounded-xl border p-3",
                    isToday ? "border-secondary bg-secondary/5" : "border-border bg-card"
                  )}
                >
                  <div className="text-center mb-3">
                    <p className={cn("text-xs font-medium uppercase", isToday ? "text-secondary" : "text-muted-foreground")}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p className={cn("text-lg font-semibold", isToday ? "text-secondary" : "text-foreground")}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayLeads.map(lead => (
                      <div key={lead.id} className="p-2 bg-primary/10 rounded-lg text-xs">
                        <p className="font-medium text-foreground truncate">{lead.name}</p>
                        {lead.legalArea && (
                          <p className="text-muted-foreground truncate">{LEGAL_AREAS[lead.legalArea]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-secondary" />
                Leads Aguardando Contato Humano
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledLeads.filter(l => l.availableForHumanContact && !l.scheduledContact).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum lead aguardando contato no momento.</p>
              ) : (
                <div className="space-y-3">
                  {scheduledLeads
                    .filter(l => l.availableForHumanContact && !l.scheduledContact)
                    .map(lead => (
                      <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{lead.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {lead.legalArea && (
                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                              {LEGAL_AREAS[lead.legalArea]}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Preferência: {lead.contactPreference || 'Não informado'}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Horário de Envio ── */}
        <TabsContent value="followup-hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários para envio de follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configure em: Agente IA → Follow-up → Horário de Envio</p>
              <div className="space-y-2">
                {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day) => (
                  <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <span className="w-12 font-medium text-sm">{day}</span>
                    <span className="text-sm text-muted-foreground">
                      {['SAB', 'DOM'].includes(day) ? 'Fechado' : '08:00 até 18:00'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cadência ── */}
        <TabsContent value="followup-cadence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadência de mensagens</CardTitle>
              <p className="text-sm text-muted-foreground">Intervalos entre follow-ups (horas)</p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure em: Agente IA → Follow-up → Cadência de Mensagens</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Follow-ups Agendados ── */}
        <TabsContent value="followups" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.sent}</p>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Follow-ups por Contato</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Dados em tempo real do banco</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou telefone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[280px]"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={loadFollowUps} disabled={loading}>
                    <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleCancelAll}>
                    Cancelar Todos os Pendentes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactTable data={filteredFollowUps} />
              <p className="text-sm text-muted-foreground mt-4">{filteredFollowUps.length} follow-up(s)</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Lembretes Cadastrados ── */}
        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lembretes de Consulta</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Criados automaticamente pelo agente ao agendar consultas
              </p>
            </CardHeader>
            <CardContent>
              <ContactTable data={reminders.slice(0, 20)} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Lembretes Agendados ── */}
        <TabsContent value="reminders-scheduled" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{reminders.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{reminders.filter(r => r.status === 'sent').length}</p>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{reminders.filter(r => r.status === 'failed').length}</p>
                  <p className="text-sm text-muted-foreground">Falhas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Lembretes por Contato</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Histórico de lembretes de consulta enviados</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou telefone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[280px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactTable data={filteredReminders} />
              <p className="text-sm text-muted-foreground mt-4">{filteredReminders.length} lembrete(s)</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
