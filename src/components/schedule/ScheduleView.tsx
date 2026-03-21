import { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LEGAL_AREAS } from '@/types/lead';
import { cn } from '@/lib/utils';

export function ScheduleView() {
  const { leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  
  const scheduledLeads = leads.filter(l => l.scheduledContact || l.availableForHumanContact);
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock follow-ups e lembretes (para demonstração da UI)
  const mockFollowUps = [
    { id: '1', name: 'Vitor Aquino', phone: '(11) 99999-1111', channel: 'Central de Atendimento', pending: 1, nextSend: '22/03 10:28', sent: 2, failed: 0 },
    { id: '2', name: 'Rodrigo Campos', phone: '(11) 99999-2222', channel: 'Central de Atendimento', pending: 1, nextSend: '22/03 14:00', sent: 1, failed: 0 },
    { id: '3', name: 'Nilverton Menezes', phone: '(11) 99999-3333', channel: 'Disparador API Oficial', pending: 0, nextSend: '-', sent: 1, failed: 1 },
    { id: '4', name: 'Kesia Nandi', phone: '(11) 99999-4444', channel: 'Central de Atendimento', pending: 0, nextSend: '-', sent: 1, failed: 1 },
  ];

  const mockReminders = [
    { id: '1', name: 'Cris Mendes', phone: '(11) 99999-5555', channel: 'Central de Atendimento', pending: 0, nextSend: '-', sent: 1, failed: 0 },
    { id: '2', name: 'Gilmar Ramalho', phone: '(11) 99999-6666', channel: 'Central de Atendimento', pending: 0, nextSend: '-', sent: 1, failed: 0 },
    { id: '3', name: 'Henrique', phone: '(11) 99999-7777', channel: 'Central de Atendimento', pending: 0, nextSend: '-', sent: 1, failed: 0 },
  ];

  const totalPending = mockFollowUps.reduce((a, f) => a + f.pending, 0);
  const totalSent = mockFollowUps.reduce((a, f) => a + f.sent, 0) + mockReminders.reduce((a, r) => a + r.sent, 0);
  const totalFailed = mockFollowUps.reduce((a, f) => a + f.failed, 0) + mockReminders.reduce((a, r) => a + r.failed, 0);

  const filteredFollowUps = mockFollowUps.filter(
    (f) =>
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.phone.includes(searchQuery) ||
      f.phone.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, ''))
  );

  const filteredReminders = mockReminders.filter(
    (r) =>
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery)
  );

  const getLeadsForDay = (day: Date) => {
    return scheduledLeads.filter(lead => {
      if (!lead.scheduledContact) return false;
      return format(lead.scheduledContact, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
  };

  const ContactTable = ({ data }: { data: typeof mockFollowUps }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium">Contato</th>
            <th className="pb-3 font-medium">Canal</th>
            <th className="pb-3 font-medium">Pendentes</th>
            <th className="pb-3 font-medium">Próximos Envios</th>
            <th className="pb-3 font-medium">Enviados</th>
            <th className="pb-3 font-medium">Falhas</th>
            <th className="pb-3 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="py-3">
                <div>
                  <p className="font-medium">{row.name}</p>
                  <p className="text-sm text-muted-foreground">{row.phone}</p>
                </div>
              </td>
              <td className="py-3 text-sm">{row.channel}</td>
              <td className="py-3">
                {row.pending > 0 ? (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                    {row.pending}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
              <td className="py-3 text-sm">{row.nextSend}</td>
              <td className="py-3">
                <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                  {row.sent}
                </Badge>
              </td>
              <td className="py-3">
                {row.failed > 0 ? (
                  <Badge variant="destructive" className="bg-red-500/20">
                    {row.failed}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </td>
              <td className="py-3 text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="w-4 h-4" />
                </Button>
                {row.pending > 0 && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Agenda
          </h2>
          <p className="text-muted-foreground mt-1">
            Agendamentos, follow-ups e lembretes
          </p>
        </div>
        <Button size="sm" variant="outline">Salvar configurações</Button>
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

        {/* Calendário semanal */}
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
                    <p className={cn(
                      "text-xs font-medium uppercase",
                      isToday ? "text-secondary" : "text-muted-foreground"
                    )}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isToday ? "text-secondary" : "text-foreground"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {dayLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="p-2 bg-primary/10 rounded-lg text-xs"
                      >
                        <p className="font-medium text-foreground truncate">{lead.name}</p>
                        {lead.legalArea && (
                          <p className="text-muted-foreground truncate">
                            {LEGAL_AREAS[lead.legalArea]}
                          </p>
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
                <p className="text-muted-foreground text-center py-8">
                  Nenhum lead aguardando contato no momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduledLeads
                    .filter(l => l.availableForHumanContact && !l.scheduledContact)
                    .map(lead => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
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

        <TabsContent value="followup-hours" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários para envio de follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure os horários permitidos para envio de mensagens automáticas
              </p>
              <div className="space-y-2">
                {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((day) => (
                  <div key={day} className="flex items-center gap-4 py-2">
                    <span className="w-12 font-medium text-sm">{day}</span>
                    <span className="text-sm text-muted-foreground">08:00 até 18:00</span>
                    <span className="text-muted-foreground text-xs">(exceto SAB/DOM: Fechado)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup-cadence" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadência de mensagens</CardTitle>
              <p className="text-sm text-muted-foreground">
                Intervalos entre follow-ups (horas)
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure em: Agente IA → Follow-up → Cadência de Mensagens
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow-ups Agendados */}
        <TabsContent value="followups" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{totalPending}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{totalSent}</p>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{totalFailed}</p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique no contato para ver detalhes dos follow-ups
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, telefone ou email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[280px]"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm">Cancelar Todos os Follow-ups</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactTable data={filteredFollowUps} />
              <p className="text-sm text-muted-foreground mt-4">
                {filteredFollowUps.length} contato(s) com follow-ups
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lembretes Cadastrados</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure em: Agente IA → Agenda → Lembretes
              </p>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="bg-success hover:bg-success/90">+ Novo Lembrete</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lembretes Agendados */}
        <TabsContent value="reminders-scheduled" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">7</p>
                  <p className="text-sm text-muted-foreground">Enviados</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Histórico de lembretes de reunião enviados
                  </p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="🔍 buscar por nome, telefone ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[280px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ContactTable data={filteredReminders} />
              <p className="text-sm text-muted-foreground mt-4">
                {filteredReminders.length} contato(s) com lembretes
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
