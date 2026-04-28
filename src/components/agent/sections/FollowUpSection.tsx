import { useState, useEffect } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Plus, Trash2, Zap, RefreshCw, Eye, Search } from 'lucide-react';
import { FupEntry } from '@/types/agent';
import { followupsApi, FollowUpItem, FollowUpStats } from '@/api/followups';
import { cn } from '@/lib/utils';

interface ContactGroup {
  lead: { name: string; phone: string; email?: string };
  canal: string;
  pending: number;
  nextSend: string | null;
  sent: number;
  failed: number;
}

export function FollowUpSection() {
  const { followUpConfig, updateFollowUpConfig, prompts } = useAgent();

  // Follow-ups Agendados state
  const [scheduled, setScheduled] = useState<FollowUpItem[]>([]);
  const [stats, setStats] = useState<FollowUpStats>({ pending: 0, sent: 0, failed: 0 });
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [search, setSearch] = useState('');

  const fups: FupEntry[] = followUpConfig.fups ?? [];

  const loadScheduled = async () => {
    setLoadingScheduled(true);
    try {
      const [items, s] = await Promise.all([
        followupsApi.list({ limit: 500 }),
        followupsApi.stats(),
      ]);
      setScheduled(items.filter(i => i.type !== 'lembrete_consulta'));
      setStats(s);
    } catch {}
    setLoadingScheduled(false);
  };

  useEffect(() => { loadScheduled(); }, []);

  // Group by lead
  const grouped: Record<string, ContactGroup> = {};
  for (const fup of scheduled) {
    const key = fup.leadId;
    if (!grouped[key]) {
      grouped[key] = { lead: fup.lead, canal: 'WhatsApp', pending: 0, nextSend: null, sent: 0, failed: 0 };
    }
    if (fup.status === 'pending') {
      grouped[key].pending++;
      if (!grouped[key].nextSend || fup.scheduledAt < grouped[key].nextSend!) {
        grouped[key].nextSend = fup.scheduledAt;
      }
    }
    if (fup.status === 'sent') grouped[key].sent++;
    if (fup.status === 'failed') grouped[key].failed++;
  }
  const contacts = Object.values(grouped).filter(g =>
    !search || g.lead.name?.toLowerCase().includes(search.toLowerCase()) || g.lead.phone?.includes(search)
  );

  const addFup = () => {
    const newFup: FupEntry = {
      id: `fup-${Date.now()}`,
      type: 'dinamica',
      hours: 24,
      minutes: 0,
      promptId: '',
      isActive: true,
    };
    updateFollowUpConfig({ fups: [...fups, newFup] });
  };

  const updateFup = (id: string, changes: Partial<FupEntry>) => {
    updateFollowUpConfig({ fups: fups.map(f => f.id === id ? { ...f, ...changes } : f) });
  };

  const deleteFup = (id: string) => {
    updateFollowUpConfig({ fups: fups.filter(f => f.id !== id) });
  };

  const promptOptions = prompts.filter(p => p.status === 'ativo');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Follow-up</h2>
        <span className="text-sm text-muted-foreground">Modo somente leitura</span>
      </div>

      <Card>
        <Tabs defaultValue="hours" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="hours">Horário de Envio</TabsTrigger>
              <TabsTrigger value="cadence">Cadência de Mensagens</TabsTrigger>
              <TabsTrigger value="scheduled">Follow-ups Agendados</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            {/* ─── Tab 1: Horário de Envio ─── */}
            <TabsContent value="hours" className="space-y-4 mt-0">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Horários para envio de follow-ups</h3>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">24/7</span>
                  <Switch />
                </div>
              </div>
              <div className="space-y-3">
                {followUpConfig.businessHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <span className="w-12 font-medium text-sm">{schedule.day}</span>
                    {schedule.isOpen ? (
                      <>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => {
                            const h = [...followUpConfig.businessHours];
                            h[index] = { ...h[index], startTime: e.target.value };
                            updateFollowUpConfig({ businessHours: h });
                          }}
                          className="w-28"
                        />
                        <span className="text-muted-foreground text-sm">até</span>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => {
                            const h = [...followUpConfig.businessHours];
                            h[index] = { ...h[index], endTime: e.target.value };
                            updateFollowUpConfig({ businessHours: h });
                          }}
                          className="w-28"
                        />
                        <button
                          onClick={() => {
                            const h = [...followUpConfig.businessHours];
                            h[index] = { ...h[index], isOpen: false };
                            updateFollowUpConfig({ businessHours: h });
                          }}
                          className="text-destructive text-sm hover:underline"
                        >×</button>
                        <button className="text-primary text-sm hover:underline">+</button>
                        <div className="ml-auto flex items-center gap-2">
                          <Switch
                            checked={schedule.is24h || false}
                            onCheckedChange={(checked) => {
                              const h = [...followUpConfig.businessHours];
                              h[index] = { ...h[index], is24h: checked };
                              updateFollowUpConfig({ businessHours: h });
                            }}
                          />
                          <span className="text-xs text-muted-foreground">24h</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground text-sm">Fechado</span>
                        <button
                          onClick={() => {
                            const h = [...followUpConfig.businessHours];
                            h[index] = { ...h[index], isOpen: true };
                            updateFollowUpConfig({ businessHours: h });
                          }}
                          className="ml-auto text-primary text-sm hover:underline"
                        >
                          Ativar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ─── Tab 2: Cadência de Mensagens ─── */}
            <TabsContent value="cadence" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Follow-ups Cadastrados</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{fups.length}/∞</Badge>
                  <Button size="sm" onClick={addFup}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Novo Follow-up
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {fups.map((fup, idx) => (
                  <div key={fup.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-sm">FUP {idx + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {fup.type === 'dinamica' ? 'Dinâmica' : 'Estática'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={fup.isActive}
                          onCheckedChange={(v) => updateFup(fup.id, { isActive: v })}
                        />
                        <button onClick={() => deleteFup(fup.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo</label>
                        <Select value={fup.type} onValueChange={(v: any) => updateFup(fup.id, { type: v })}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dinamica">Dinâmica (Prompt)</SelectItem>
                            <SelectItem value="estatica">Estática (Mensagem)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Horas</label>
                        <Input
                          type="number"
                          min={0}
                          value={fup.hours}
                          onChange={(e) => updateFup(fup.id, { hours: Number(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Minutos</label>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={fup.minutes}
                          onChange={(e) => updateFup(fup.id, { minutes: Number(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    {fup.type === 'dinamica' && (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Prompt Selecionado</label>
                        </div>
                        <Select value={fup.promptId || ''} onValueChange={(v) => updateFup(fup.id, { promptId: v })}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione um prompt..." />
                          </SelectTrigger>
                          <SelectContent>
                            {promptOptions.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}

                {fups.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Nenhum follow-up cadastrado</p>
                    <Button variant="outline" size="sm" onClick={addFup} className="mt-3">
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Criar primeiro follow-up
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ─── Tab 3: Follow-ups Agendados ─── */}
            <TabsContent value="scheduled" className="mt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                  <span className="ml-auto text-2xl font-bold">{stats.pending}</span>
                </div>
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Enviados</span>
                  <span className="ml-auto text-2xl font-bold text-green-600">{stats.sent}</span>
                </div>
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Falhas</span>
                  <span className="ml-auto text-2xl font-bold text-red-600">{stats.failed}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">Follow-ups por Contato</h3>
                  <Button variant="ghost" size="sm" onClick={loadScheduled} disabled={loadingScheduled}>
                    <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingScheduled && 'animate-spin')} />
                    Atualizar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Clique no contato para ver detalhes dos follow-ups.</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Contato</th>
                      <th className="text-left px-4 py-3 font-medium">Canal</th>
                      <th className="text-center px-4 py-3 font-medium">Pendentes</th>
                      <th className="text-center px-4 py-3 font-medium">Próximos Envios</th>
                      <th className="text-center px-4 py-3 font-medium">Enviados</th>
                      <th className="text-center px-4 py-3 font-medium">Falhas</th>
                      <th className="text-center px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingScheduled ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-muted-foreground">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                          Carregando...
                        </td>
                      </tr>
                    ) : contacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                          Nenhum follow-up encontrado
                        </td>
                      </tr>
                    ) : (
                      contacts.map((g, i) => (
                        <tr key={i} className="border-t hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {g.lead.name?.[0] ?? '?'}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{g.lead.name || '—'}</div>
                                <div className="text-xs text-muted-foreground">{g.lead.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="text-xs">{g.canal}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={g.pending > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
                              {g.pending}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                            {g.nextSend ? new Date(g.nextSend).toLocaleDateString('pt-BR') : '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {g.sent > 0
                              ? <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">{g.sent}</span>
                              : <span className="text-muted-foreground">0</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={g.failed > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              {g.failed}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-muted-foreground hover:text-foreground">
                              <Eye className="w-4 h-4" />
                            </button>
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
    </div>
  );
}
