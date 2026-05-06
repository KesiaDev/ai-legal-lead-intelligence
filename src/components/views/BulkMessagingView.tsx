import { useState, useRef } from 'react';
import { Send, Clock, Users, CheckSquare, Square, Zap, History, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MockLead {
  id: string;
  name: string;
  phone: string;
  area: string;
}

const MOCK_LEADS: MockLead[] = [
  { id: '1', name: 'Ana Paula Ferreira', phone: '(11) 99001-2345', area: 'Trabalhista' },
  { id: '2', name: 'Carlos Eduardo Lima', phone: '(11) 98765-4321', area: 'Família' },
  { id: '3', name: 'Mariana Costa', phone: '(21) 97654-3210', area: 'Cível' },
  { id: '4', name: 'Roberto Souza', phone: '(31) 96543-2109', area: 'Previdenciário' },
  { id: '5', name: 'Fernanda Oliveira', phone: '(41) 95432-1098', area: 'Consumidor' },
  { id: '6', name: 'João Victor Alves', phone: '(51) 94321-0987', area: 'Trabalhista' },
  { id: '7', name: 'Patrícia Nunes', phone: '(61) 93210-9876', area: 'Família' },
  { id: '8', name: 'Thiago Rodrigues', phone: '(71) 92109-8765', area: 'Cível' },
];

const AREAS = ['Todos', 'Trabalhista', 'Família', 'Cível', 'Previdenciário', 'Consumidor'];

interface HistoryEntry {
  date: string;
  recipients: number;
  status: 'Enviado' | 'Parcial' | 'Falhou';
}

const MOCK_HISTORY: HistoryEntry[] = [
  { date: '05/05/2026 14:30', recipients: 24, status: 'Enviado' },
  { date: '04/05/2026 09:15', recipients: 12, status: 'Parcial' },
  { date: '02/05/2026 16:00', recipients: 8, status: 'Enviado' },
];

export function BulkMessagingView() {
  const [message, setMessage] = useState('');
  const [areaFilter, setAreaFilter] = useState('Todos');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [interval, setInterval] = useState(15);
  const [aiVariation, setAiVariation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredLeads =
    areaFilter === 'Todos'
      ? MOCK_LEADS
      : MOCK_LEADS.filter((l) => l.area === areaFilter);

  const allSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedLeads.has(l.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedLeads);
      filteredLeads.forEach((l) => next.delete(l.id));
      setSelectedLeads(next);
    } else {
      const next = new Set(selectedLeads);
      filteredLeads.forEach((l) => next.add(l.id));
      setSelectedLeads(next);
    }
  };

  const toggleLead = (id: string) => {
    const next = new Set(selectedLeads);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLeads(next);
  };

  const previewMessage = message
    .replace('{nome}', 'João da Silva')
    .replace('{area}', 'Trabalhista');

  const handleSend = () => {
    if (isSending || selectedLeads.size === 0 || !message.trim()) return;
    setIsSending(true);
    setSent(false);
    setProgress(0);

    let current = 0;
    const step = () => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        setProgress(100);
        setIsSending(false);
        setSent(true);
      } else {
        setProgress(current);
        timerRef.current = setTimeout(step, 400);
      }
    };
    timerRef.current = setTimeout(step, 400);
  };

  const statusColor: Record<HistoryEntry['status'], string> = {
    Enviado: 'bg-green-500/10 text-green-600 border-green-500/20',
    Parcial: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    Falhou: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Envios em Massa</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Envie mensagens personalizadas para múltiplos leads com controle anti-ban.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="xl:col-span-2 space-y-6">
          {/* Composer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="w-4 h-4" />
                Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Digite sua mensagem. Use {nome} e {area} para personalizar..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none pr-16"
                />
                <Badge
                  variant="outline"
                  className="absolute bottom-3 right-3 text-xs"
                >
                  {message.length} car.
                </Badge>
              </div>

              {message && (
                <div className="rounded-md bg-muted/40 border border-border p-3 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">
                    Pré-visualização
                  </p>
                  <p className="text-sm">{previewMessage}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {['{nome}', '{area}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMessage((m) => m + v)}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seleção de destinatários */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Destinatários
                {selectedLeads.size > 0 && (
                  <Badge className="ml-auto">{selectedLeads.size} selecionados</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filtro por área */}
              <div className="flex flex-wrap gap-2">
                {AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setAreaFilter(area)}
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border transition-colors',
                      areaFilter === area
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Selecionar todos */}
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-primary" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Selecionar todos
              </button>

              {/* Lista de leads */}
              <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => toggleLead(lead.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors',
                      selectedLeads.has(lead.id) && 'bg-primary/5'
                    )}
                  >
                    {selectedLeads.has(lead.id) ? (
                      <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {lead.area}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">
          {/* Agendamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="schedule-toggle" className="text-sm">
                  {scheduleEnabled ? 'Agendar envio' : 'Enviar agora'}
                </Label>
                <Switch
                  id="schedule-toggle"
                  checked={scheduleEnabled}
                  onCheckedChange={setScheduleEnabled}
                />
              </div>

              {scheduleEnabled && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Horário</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações anti-ban */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Anti-ban
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Intervalo entre envios</Label>
                  <span className="text-sm font-medium">{interval}s</span>
                </div>
                <Slider
                  min={5}
                  max={60}
                  step={1}
                  value={[interval]}
                  onValueChange={([v]) => setInterval(v)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5s</span>
                  <span>60s</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    Variação por IA
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Reescreve levemente cada mensagem
                  </p>
                </div>
                <Switch
                  checked={aiVariation}
                  onCheckedChange={setAiVariation}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botão enviar + progresso */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isSending && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Enviando...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {sent && !isSending && (
                <p className="text-sm text-green-600 font-medium text-center">
                  Envio concluído com sucesso!
                </p>
              )}

              <Button
                className="w-full"
                disabled={isSending || selectedLeads.size === 0 || !message.trim()}
                onClick={handleSend}
              >
                <Send className="w-4 h-4 mr-2" />
                {scheduleEnabled
                  ? 'Agendar Envio'
                  : `Enviar para ${selectedLeads.size} lead${selectedLeads.size !== 1 ? 's' : ''}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de Envios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Data / Horário
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Destinatários
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_HISTORY.map((entry, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">{entry.date}</td>
                    <td className="px-4 py-3">{entry.recipients} leads</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', statusColor[entry.status])}
                      >
                        {entry.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
