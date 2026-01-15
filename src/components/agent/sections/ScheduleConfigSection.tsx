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
} from 'lucide-react';

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
  } = useAgent();

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
            <TabsList className="grid w-full grid-cols-5 bg-muted/50">
              <TabsTrigger value="rules">Regras</TabsTrigger>
              <TabsTrigger value="event">Evento</TabsTrigger>
              <TabsTrigger value="hours">Horários</TabsTrigger>
              <TabsTrigger value="rotation">Rodízio</TabsTrigger>
              <TabsTrigger value="reminders">Lembretes</TabsTrigger>
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
            <TabsContent value="reminders" className="space-y-6 mt-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Lembretes Automáticos</h3>
                </div>
                <Button onClick={() => setIsReminderDialogOpen(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Lembrete
                </Button>
              </div>

              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{reminder.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reminder.triggerBefore >= 1440 
                            ? `${Math.floor(reminder.triggerBefore / 1440)}h antes`
                            : `${reminder.triggerBefore} min antes`
                          } via {reminder.channel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{reminder.channel}</Badge>
                      <Switch
                        checked={reminder.isActive}
                        onCheckedChange={(checked) => updateReminder(reminder.id, { isActive: checked })}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
