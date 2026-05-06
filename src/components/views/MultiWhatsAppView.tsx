import { useState } from 'react';
import { Smartphone, Plus, Wifi, WifiOff, QrCode, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'connected' | 'disconnected' | 'awaiting_qr';
type ConnectionType = 'evolution' | 'zapi' | 'chatguru' | 'meta';

interface WhatsAppNumber {
  id: string;
  name: string;
  phone: string;
  status: ConnectionStatus;
  type: ConnectionType;
  token: string;
  instanceId: string;
}

const TYPE_LABELS: Record<ConnectionType, string> = {
  evolution: 'Evolution API',
  zapi: 'Z-API',
  chatguru: 'ChatGuru',
  meta: 'API Oficial Meta',
};

const INITIAL_NUMBERS: WhatsAppNumber[] = [
  {
    id: '1',
    name: 'Atendimento Principal',
    phone: '+55 11 99000-0001',
    status: 'connected',
    type: 'evolution',
    token: 'tok_***************',
    instanceId: 'inst_001',
  },
  {
    id: '2',
    name: 'Captação Trabalhista',
    phone: '+55 11 98000-0002',
    status: 'disconnected',
    type: 'zapi',
    token: 'zapi_***********',
    instanceId: 'inst_002',
  },
  {
    id: '3',
    name: 'Suporte Família',
    phone: '+55 21 97000-0003',
    status: 'awaiting_qr',
    type: 'chatguru',
    token: 'cg_**************',
    instanceId: 'inst_003',
  },
];

const statusConfig: Record<
  ConnectionStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  connected: {
    label: 'Conectado',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: <Wifi className="w-3 h-3" />,
  },
  disconnected: {
    label: 'Desconectado',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: <WifiOff className="w-3 h-3" />,
  },
  awaiting_qr: {
    label: 'Aguardando QR',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: <QrCode className="w-3 h-3" />,
  },
};

interface ConnectModalState {
  open: boolean;
  numberId: string | null;
  token: string;
  instanceId: string;
}

interface AddModalState {
  open: boolean;
  name: string;
  phone: string;
  type: ConnectionType;
  token: string;
  instanceId: string;
}

export function MultiWhatsAppView() {
  const [numbers, setNumbers] = useState<WhatsAppNumber[]>(INITIAL_NUMBERS);
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<WhatsAppNumber | null>(null);

  const [connectModal, setConnectModal] = useState<ConnectModalState>({
    open: false,
    numberId: null,
    token: '',
    instanceId: '',
  });

  const [addModal, setAddModal] = useState<AddModalState>({
    open: false,
    name: '',
    phone: '',
    type: 'evolution',
    token: '',
    instanceId: '',
  });

  const openConnectModal = (num: WhatsAppNumber) => {
    setConnectModal({
      open: true,
      numberId: num.id,
      token: num.token,
      instanceId: num.instanceId,
    });
  };

  const handleConnect = () => {
    const id = connectModal.numberId;
    if (!id) return;
    setConnectModal((m) => ({ ...m, open: false }));
    setConnecting((prev) => new Set(prev).add(id));

    setTimeout(() => {
      setNumbers((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: 'connected',
                token: connectModal.token,
                instanceId: connectModal.instanceId,
              }
            : n
        )
      );
      setConnecting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    setNumbers((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'disconnected' } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAddNumber = () => {
    const { name, phone, type, token, instanceId } = addModal;
    if (!name.trim() || !phone.trim()) return;

    const newNum: WhatsAppNumber = {
      id: Date.now().toString(),
      name,
      phone,
      type,
      token,
      instanceId,
      status: 'disconnected',
    };
    setNumbers((prev) => [...prev, newNum]);
    setAddModal({
      open: false,
      name: '',
      phone: '',
      type: 'evolution',
      token: '',
      instanceId: '',
    });
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    setNumbers((prev) =>
      prev.map((n) => (n.id === editTarget.id ? editTarget : n))
    );
    setEditTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Números WhatsApp</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie múltiplos números e instâncias de WhatsApp conectadas ao SDR.
          </p>
        </div>
        <Button onClick={() => setAddModal((m) => ({ ...m, open: true }))}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar número
        </Button>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {numbers.map((num) => {
          const config = statusConfig[num.status];
          const isConnecting = connecting.has(num.id);

          return (
            <Card key={num.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{num.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {num.phone}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn('text-xs flex items-center gap-1', config.className)}
                  >
                    {config.icon}
                    {isConnecting ? 'Conectando...' : config.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Tipo</span>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[num.type]}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {num.status !== 'connected' && !isConnecting && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openConnectModal(num)}
                    >
                      <Wifi className="w-3 h-3 mr-1" />
                      Conectar
                    </Button>
                  )}

                  {num.status === 'connected' && !isConnecting && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDisconnect(num.id)}
                    >
                      <WifiOff className="w-3 h-3 mr-1" />
                      Desconectar
                    </Button>
                  )}

                  {isConnecting && (
                    <Button size="sm" disabled className="flex-1">
                      Conectando...
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditTarget({ ...num })}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:border-red-400"
                    onClick={() => handleDelete(num.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal: Conectar */}
      <Dialog
        open={connectModal.open}
        onOpenChange={(open) =>
          setConnectModal((m) => ({ ...m, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar número</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Token / API Key</Label>
              <Input
                value={connectModal.token}
                onChange={(e) =>
                  setConnectModal((m) => ({ ...m, token: e.target.value }))
                }
                placeholder="Insira o token..."
              />
            </div>
            <div className="space-y-1">
              <Label>Instance ID</Label>
              <Input
                value={connectModal.instanceId}
                onChange={(e) =>
                  setConnectModal((m) => ({
                    ...m,
                    instanceId: e.target.value,
                  }))
                }
                placeholder="ID da instância..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConnectModal((m) => ({ ...m, open: false }))}
            >
              Cancelar
            </Button>
            <Button onClick={handleConnect}>Conectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Adicionar número */}
      <Dialog
        open={addModal.open}
        onOpenChange={(open) => setAddModal((m) => ({ ...m, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar número WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={addModal.name}
                onChange={(e) =>
                  setAddModal((m) => ({ ...m, name: e.target.value }))
                }
                placeholder="Ex: Atendimento Principal"
              />
            </div>
            <div className="space-y-1">
              <Label>Número de telefone</Label>
              <Input
                value={addModal.phone}
                onChange={(e) =>
                  setAddModal((m) => ({ ...m, phone: e.target.value }))
                }
                placeholder="+55 11 99999-0000"
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo de conexão</Label>
              <Select
                value={addModal.type}
                onValueChange={(v) =>
                  setAddModal((m) => ({ ...m, type: v as ConnectionType }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(TYPE_LABELS) as [ConnectionType, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Token / API Key</Label>
              <Input
                value={addModal.token}
                onChange={(e) =>
                  setAddModal((m) => ({ ...m, token: e.target.value }))
                }
                placeholder="Insira o token..."
              />
            </div>
            <div className="space-y-1">
              <Label>Instance ID</Label>
              <Input
                value={addModal.instanceId}
                onChange={(e) =>
                  setAddModal((m) => ({ ...m, instanceId: e.target.value }))
                }
                placeholder="ID da instância..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddModal((m) => ({ ...m, open: false }))}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddNumber}
              disabled={!addModal.name.trim() || !addModal.phone.trim()}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar número */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar número</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  value={editTarget.name}
                  onChange={(e) =>
                    setEditTarget((t) => t ? { ...t, name: e.target.value } : t)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Número de telefone</Label>
                <Input
                  value={editTarget.phone}
                  onChange={(e) =>
                    setEditTarget((t) => t ? { ...t, phone: e.target.value } : t)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo de conexão</Label>
                <Select
                  value={editTarget.type}
                  onValueChange={(v) =>
                    setEditTarget((t) => t ? { ...t, type: v as ConnectionType } : t)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(TYPE_LABELS) as [ConnectionType, string][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Token / API Key</Label>
                <Input
                  value={editTarget.token}
                  onChange={(e) =>
                    setEditTarget((t) => t ? { ...t, token: e.target.value } : t)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Instance ID</Label>
                <Input
                  value={editTarget.instanceId}
                  onChange={(e) =>
                    setEditTarget((t) =>
                      t ? { ...t, instanceId: e.target.value } : t
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
