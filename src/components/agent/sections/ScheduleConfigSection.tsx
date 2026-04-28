import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  Plus,
  Users,
  Bell,
  Calendar,
  Settings2,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  Shuffle,
  Target,
  MapPin,
  Video,
  Phone,
  Eye,
  Search,
  Zap,
} from 'lucide-react';
import { followupsApi, FollowUpItem, FollowUpStats } from '@/api/followups';
import { cn } from '@/lib/utils';

export function ScheduleConfigSection() {
  const {
    scheduleConfig,
    updateScheduleConfig,
    lawyers,
    addLawyer,
    updateLawyer,
    deleteLawyer,
    rotationRules,
    updateRotationRule,
    reminders,
    updateReminder,
    addReminder,
    deleteReminder,
    eventConfig,
    updateEventConfig,
    prompts,
  } = useAgent();

  const [scheduledReminders, setScheduledReminders] = useState<FollowUpItem[]>([]);
  const [reminderStats, setReminderStats] = useState<FollowUpStats>({ pending: 0, sent: 0, failed: 0 });
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [reminderSearch, setReminderSearch] = useState('');

  const loadScheduledReminders = async () => {
    setLoadingReminders(true);
    try {
      const items = await followupsApi.list({ limit: 500 });
      const rem = items.filter(i => i.type === 'lembrete_consulta');
      setScheduledReminders(rem);
      const pending = rem.filter(r => r.status === 'pending').length;
      const sent = rem.filter(r => r.status === 'sent').length;
      const failed = rem.filter(r => r.status === 'failed').length;
      setReminderStats({ pending, sent, failed });
    } catch {}
    setLoadingReminders(false);
  };

  useEffect(() => { loadScheduledReminders(); }, []);

  const [isLawyerDialogOpen, setIsLawyerDialogOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<any>(null);
  const [lawyerForm, setLawyerForm] = useState({
    name: '',
    email: '',
    phone: '',
    legalAreas: [] as string[],
    maxDailyMeetings: 8,
  });

  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    name: '',
    triggerBefore: 60,
    channel: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
  });

  const legalAreaOptions = [
    { value: 'trabalhista', label: 'Trabalhista' },
    { value: 'civil', label: 'Civil' },
    { value: 'familia', label: 'Família' },
    { value: 'consumidor', label: 'Consumidor' },
    { value: 'previdenciario', label: 'Previdenciário' },
    { value: 'empresarial', label: 'Empresarial' },
    { value: 'criminal', label: 'Criminal' },
  ];

  const handleSaveLawyer = () => {
    if (editingLawyer) {
      updateLawyer(editingLawyer.id, lawyerForm);
    } else {
      addLawyer({
        id: `lawyer-${Date.now()}`,
        ...lawyerForm,
        isActive: true,
        meetingsToday: 0,
      });
    }
    setIsLawyerDialogOpen(false);
    resetLawyerForm();
  };

  const handleEditLawyer = (lawyer: any) => {
    setEditingLawyer(lawyer);
    setLawyerForm({
      name: lawyer.name,
      email: lawyer.email,
      phone: lawyer.phone,
      legalAreas: lawyer.legalAreas,
      maxDailyMeetings: lawyer.maxDailyMeetings,
    });
    setIsLawyerDialogOpen(true);
  };

  const resetLawyerForm = () => {
    setEditingLawyer(null);
    setLawyerForm({
      name: '',
      email: '',
      phone: '',
      legalAreas: [],
      maxDailyMeetings: 8,
    });
  };

  const handleSaveReminder = () => {
    addReminder({
      id: `reminder-${Date.now()}`,
      ...reminderForm,
      templateId: '',
      isActive: true,
    });
    setIsReminderDialogOpen(false);
    setReminderForm({ name: '', triggerBefore: 60, channel: 'whatsapp' });
  };

  const toggleLegalArea = (area: string) => {
    setLawyerForm(prev => ({
      ...prev,
      legalAreas: prev.legalAreas.includes(area)
        ? prev.legalAreas.filter(a => a !== area)
        : [...prev.legalAreas, area],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Configuração de Agenda
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure eventos, horários, rodízio e lembretes
          </p>
        </div>
      </div>

      <Card>
        <Tabs defaultValue="rules" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-6 bg-muted/50">
              <TabsTrigger value="rules">Regras</TabsTrigger>
              <TabsTrigger value="event">Evento</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
              <TabsTrigger value="rotation">Rodízio</TabsTrigger>
              <TabsTrigger value="reminders">Lembretes</TabsTrigger>
              <TabsTrigger value="scheduled">Agendados</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Regras de Agendamento</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select
                    value={scheduleConfig.timezone}
                    onValueChange={(value) => updateScheduleConfig({ timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="São Paulo (BRT)">São Paulo (BRT)</SelectItem>
                      <SelectItem value="Brasília (BRT)">Brasília (BRT)</SelectItem>
                      <SelectItem value="Manaus (AMT)">Manaus (AMT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duração da Reunião (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.meetingDuration}
                    onChange={(e) => updateScheduleConfig({ meetingDuration: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Incrementos de Horário (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.timeIncrement}
                    onChange={(e) => updateScheduleConfig({ timeIncrement: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Antecedência Mínima (minutos)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.minAdvanceTime}
                    onChange={(e) => updateScheduleConfig({ minAdvanceTime: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Antecedência Máxima (dias)</Label>
                  <Input
                    type="number"
                    value={scheduleConfig.maxAdvanceDays}
                    onChange={(e) => updateScheduleConfig({ maxAdvanceDays: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/30 mt-6">
                <Checkbox
                  id="qualified-only"
                  checked={scheduleConfig.onlyQualifiedLeads}
                  onCheckedChange={(checked) => 
                    updateScheduleConfig({ onlyQualifiedLeads: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="qualified-only" className="font-medium cursor-pointer">
                    Agendar somente com leads qualificados
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Restringe agendamentos apenas para leads que passaram pelo processo de qualificação
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Event Tab */}
            <TabsContent value="event" className="space-y-6 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Configuração do Evento</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Título do Evento</Label>
                  <Input
                    value={eventConfig.title}
                    onChange={(e) => updateEventConfig({ title: e.target.value })}
                    placeholder="Ex: Consulta Inicial"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Evento</Label>
                  <Select
                    value={eventConfig.type}
                    onValueChange={(value: any) => updateEventConfig({ type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="audiencia">Audiência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Local</Label>
                  <Select
                    value={eventConfig.location}
                    onValueChange={(value: any) => updateEventConfig({ location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          Online (Videochamada)
                        </div>
                      </SelectItem>
                      <SelectItem value="presencial">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Presencial
                        </div>
                      </SelectItem>
                      <SelectItem value="telefone">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {eventConfig.location === 'online' && (
                  <div className="space-y-2">
                    <Label>Link da Reunião</Label>
                    <Input
                      value={eventConfig.meetingLink || ''}
                      onChange={(e) => updateEventConfig({ meetingLink: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Descrição do Evento</Label>
                <Textarea
                  value={eventConfig.description}
                  onChange={(e) => updateEventConfig({ description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/30">
                <Checkbox
                  id="require-confirmation"
                  checked={eventConfig.requireConfirmation}
                  onCheckedChange={(checked) => 
                    updateEventConfig({ requireConfirmation: checked as boolean })
                  }
                />
                <div>
                  <Label htmlFor="require-confirmation" className="font-medium cursor-pointer">
                    Exigir confirmação do lead
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar lembrete e solicitar confirmação antes da reunião
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Hours Tab */}
            <TabsContent value="hours" className="space-y-6 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Horários Disponíveis</h3>
              </div>

              <div className="space-y-3">
                {scheduleConfig.availableHours.map((hour, index) => (
                  <div key={hour.day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12">
                      <span className="font-medium">{hour.day}</span>
                    </div>
                    <Switch
                      checked={hour.isOpen}
                      onCheckedChange={(checked) => {
                        const updated = [...scheduleConfig.availableHours];
                        updated[index] = { ...hour, isOpen: checked };
                        updateScheduleConfig({ availableHours: updated });
                      }}
                    />
                    {hour.isOpen && (
                      <>
                        <Input
                          type="time"
                          value={hour.startTime}
                          onChange={(e) => {
                            const updated = [...scheduleConfig.availableHours];
                            updated[index] = { ...hour, startTime: e.target.value };
                            updateScheduleConfig({ availableHours: updated });
                          }}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={hour.endTime}
                          onChange={(e) => {
                            const updated = [...scheduleConfig.availableHours];
                            updated[index] = { ...hour, endTime: e.target.value };
                            updateScheduleConfig({ availableHours: updated });
                          }}
                          className="w-32"
                        />
                      </>
                    )}
                    {!hour.isOpen && (
                      <span className="text-muted-foreground">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Rotation Tab */}
            <TabsContent value="rotation" className="space-y-6 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Advogados e Rodízio</h3>
                </div>
                <Button onClick={() => setIsLawyerDialogOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Advogado
                </Button>
              </div>

              {/* Lawyers List */}
              <div className="space-y-3">
                {lawyers.map((lawyer) => (
                  <Card key={lawyer.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{lawyer.name}</p>
                            <p className="text-sm text-muted-foreground">{lawyer.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              {lawyer.meetingsToday}/{lawyer.maxDailyMeetings} reuniões
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lawyer.legalAreas.map(area => (
                                <Badge key={area} variant="secondary" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Switch
                            checked={lawyer.isActive}
                            onCheckedChange={(checked) => updateLawyer(lawyer.id, { isActive: checked })}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1 hover:bg-accent rounded">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditLawyer(lawyer)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteLawyer(lawyer.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Rotation Rules */}
              <div className="mt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shuffle className="w-4 h-4" />
                  Regras de Rodízio
                </h4>
                <div className="space-y-2">
                  {rotationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {rule.type === 'round_robin' && 'Distribui igualmente entre advogados'}
                            {rule.type === 'load_balance' && 'Prioriza quem tem menos reuniões'}
                            {rule.type === 'area_match' && 'Direciona por especialidade'}
                            {rule.type === 'manual' && 'Seleção manual'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => updateRotationRule(rule.id, { isActive: checked })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Horários para envio de lembretes</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">24/7</span>
                  <Switch />
                </div>
              </div>
              {/* Per-day reminder hours */}
              <div className="space-y-2 pb-4 border-b">
                {(scheduleConfig.availableHours ?? []).map((h, idx) => (
                  <div key={h.day} className="flex items-center gap-3 text-sm py-1">
                    <span className="w-10 font-medium">{h.day}</span>
                    {h.isOpen ? (
                      <>
                        <Input type="time" value={h.startTime} onChange={e => {
                          const arr = [...(scheduleConfig.availableHours ?? [])];
                          arr[idx] = { ...arr[idx], startTime: e.target.value };
                          updateScheduleConfig({ availableHours: arr });
                        }} className="w-28 h-8" />
                        <span className="text-muted-foreground">até</span>
                        <Input type="time" value={h.endTime} onChange={e => {
                          const arr = [...(scheduleConfig.availableHours ?? [])];
                          arr[idx] = { ...arr[idx], endTime: e.target.value };
                          updateScheduleConfig({ availableHours: arr });
                        }} className="w-28 h-8" />
                        <button className="text-destructive">×</button>
                        <button className="text-primary">+</button>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch checked={h.is24h ?? false} onCheckedChange={v => {
                            const arr = [...(scheduleConfig.availableHours ?? [])];
                            arr[idx] = { ...arr[idx], is24h: v };
                            updateScheduleConfig({ availableHours: arr });
                          }} />
                          <span className="text-xs text-muted-foreground">24h</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">Fechado</span>
                        <button
                          onClick={() => {
                            const arr = [...(scheduleConfig.availableHours ?? [])];
                            arr[idx] = { ...arr[idx], isOpen: true };
                            updateScheduleConfig({ availableHours: arr });
                          }}
                          className="ml-auto text-primary text-xs hover:underline"
                        >Ativar</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Registered reminders */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Lembretes Cadastrados</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{reminders.length}/∞</Badge>
                  <Button onClick={() => setIsReminderDialogOpen(true)} size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Novo Lembrete
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {reminders.map((reminder, idx) => (
                  <div key={reminder.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">Lembrete {idx + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(reminder as any).reminderType === 'estatica' ? 'Estática' : 'Dinâmica'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.isActive}
                          onCheckedChange={v => updateReminder(reminder.id, { isActive: v })}
                        />
                        <button onClick={() => deleteReminder(reminder.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo</label>
                        <Select
                          value={(reminder as any).reminderType ?? 'dinamica'}
                          onValueChange={v => updateReminder(reminder.id, { reminderType: v as any })}
                        >
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dinamica">Dinâmica (Prompt)</SelectItem>
                            <SelectItem value="estatica">Estática (Mensagem)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Antecedência (Minutos)</label>
                        <Input
                          type="number"
                          min={1}
                          value={reminder.triggerBefore}
                          onChange={e => updateReminder(reminder.id, { triggerBefore: Number(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                    </div>
                    {((reminder as any).reminderType ?? 'dinamica') === 'dinamica' && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Prompt Selecionado</label>
                        <Select
                          value={(reminder as any).promptId ?? ''}
                          onValueChange={v => updateReminder(reminder.id, { promptId: v } as any)}
                        >
                          <SelectTrigger className="h-9"><SelectValue placeholder="Selecione um prompt..." /></SelectTrigger>
                          <SelectContent>
                            {prompts.filter(p => p.status === 'ativo').map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">Desligar IA após envio</span>
                      <Switch
                        checked={(reminder as any).disableAiAfterSend ?? false}
                        onCheckedChange={v => updateReminder(reminder.id, { disableAiAfterSend: v } as any)}
                      />
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum lembrete cadastrado
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Lembretes Agendados Tab */}
            <TabsContent value="scheduled" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="ml-auto text-2xl font-bold">{reminderStats.pending}</span>
                </div>
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Enviados</span>
                  <span className="ml-auto text-2xl font-bold text-green-600">{reminderStats.sent}</span>
                </div>
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Falhas</span>
                  <span className="ml-auto text-2xl font-bold text-red-600">{reminderStats.failed}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Lembretes Agendados</h3>
                <Button variant="ghost" size="sm" onClick={loadScheduledReminders} disabled={loadingReminders}>
                  <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingReminders && 'animate-spin')} />
                  Atualizar
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={reminderSearch}
                  onChange={e => setReminderSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Contato</th>
                      <th className="text-left px-4 py-3 font-medium">Tipo</th>
                      <th className="text-center px-4 py-3 font-medium">Status</th>
                      <th className="text-center px-4 py-3 font-medium">Agendado para</th>
                      <th className="text-center px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingReminders ? (
                      <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Carregando...
                      </td></tr>
                    ) : scheduledReminders.filter(r =>
                      !reminderSearch ||
                      r.lead?.name?.toLowerCase().includes(reminderSearch.toLowerCase()) ||
                      r.lead?.phone?.includes(reminderSearch)
                    ).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Nenhum lembrete agendado</td></tr>
                    ) : (
                      scheduledReminders.filter(r =>
                        !reminderSearch ||
                        r.lead?.name?.toLowerCase().includes(reminderSearch.toLowerCase()) ||
                        r.lead?.phone?.includes(reminderSearch)
                      ).map(r => (
                        <tr key={r.id} className="border-t hover:bg-muted/20">
                          <td className="px-4 py-3">
                            <div className="font-medium">{r.lead?.name || '—'}</div>
                            <div className="text-xs text-muted-foreground">{r.lead?.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{r.type}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={r.status === 'sent' ? 'default' : r.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                              {r.status === 'pending' ? 'Pendente' : r.status === 'sent' ? 'Enviado' : r.status === 'failed' ? 'Falha' : r.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                            {new Date(r.scheduledAt).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-muted-foreground hover:text-foreground"><Eye className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Lawyer Dialog */}
      <Dialog open={isLawyerDialogOpen} onOpenChange={(open) => {
        setIsLawyerDialogOpen(open);
        if (!open) resetLawyerForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLawyer ? 'Editar Advogado' : 'Adicionar Advogado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={lawyerForm.name}
                onChange={(e) => setLawyerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Dr. Nome Sobrenome"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={lawyerForm.email}
                  onChange={(e) => setLawyerForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={lawyerForm.phone}
                  onChange={(e) => setLawyerForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Áreas de Atuação</Label>
              <div className="flex flex-wrap gap-2">
                {legalAreaOptions.map(area => (
                  <Badge
                    key={area.value}
                    variant={lawyerForm.legalAreas.includes(area.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleLegalArea(area.value)}
                  >
                    {area.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Máximo de Reuniões/Dia</Label>
              <Input
                type="number"
                value={lawyerForm.maxDailyMeetings}
                onChange={(e) => setLawyerForm(prev => ({ ...prev, maxDailyMeetings: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLawyerDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLawyer} disabled={!lawyerForm.name}>
              {editingLawyer ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lembrete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={reminderForm.name}
                onChange={(e) => setReminderForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Lembrete 1h antes"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Antecedência (minutos)</Label>
                <Input
                  type="number"
                  value={reminderForm.triggerBefore}
                  onChange={(e) => setReminderForm(prev => ({ ...prev, triggerBefore: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select
                  value={reminderForm.channel}
                  onValueChange={(value: any) => setReminderForm(prev => ({ ...prev, channel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReminder} disabled={!reminderForm.name}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
