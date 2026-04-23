import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  priority?: 'alta' | 'crítico';
  scope?: 'todos';
  push: boolean;
  email: boolean;
}

interface NotificationCategory {
  id: string;
  name: string;
  notifications: NotificationItem[];
}

const initialCategories: NotificationCategory[] = [
  {
    id: 'agents',
    name: 'Agentes',
    notifications: [
      { id: 'agent-inactive', name: 'Agente inativo', description: 'Notificar quando um agente ficar inativo', tags: ['todos', 'alta'], push: true, email: false },
      { id: 'agent-error', name: 'Erro em agente', description: 'Notificar quando houver erro em algum agente', tags: ['todos', 'crítico'], push: true, email: false },
      { id: 'agent-reactivated', name: 'Agente reativado', description: 'Notificar quando um agente voltar a ficar ativo', tags: ['todos'], push: true, email: false },
    ],
  },
  {
    id: 'leads',
    name: 'Leads & Negócios',
    notifications: [
      { id: 'deal-assigned', name: 'Deal atribuído a mim', description: 'Notificar quando um deal for atribuído a você', tags: ['alta'], push: true, email: false },
      { id: 'deal-qualified', name: 'Deal qualificado', description: 'Notificar quando um deal atribuído a você for qualificado', tags: [], push: true, email: false },
      { id: 'stage-change', name: 'Mudança de estágio', description: 'Notificar quando um deal seu mudar de estágio', tags: [], push: true, email: false },
      { id: 'deal-closed', name: 'Deal fechado', description: 'Notificar quando um deal seu for fechado (ganho ou perdido)', tags: [], push: true, email: false },
      { id: 'new-lead-all', name: 'Novo lead criado (todos)', description: 'Notificar sobre QUALQUER novo lead no cliente', tags: ['todos'], push: false, email: false },
    ],
  },
  {
    id: 'schedules',
    name: 'Agendamentos',
    notifications: [
      { id: 'schedule-today', name: 'Agendamentos hoje', description: 'Notificar sobre agendamentos confirmados para hoje', tags: ['alta'], push: true, email: false },
      { id: 'schedule-upcoming', name: 'Agendamentos próximos (2 dias)', description: 'Notificar sobre agendamentos nos próximos 2 dias', tags: [], push: true, email: false },
      { id: 'schedule-canceled', name: 'Agendamento cancelado', description: 'Notificar quando um agendamento for cancelado', tags: [], push: true, email: false },
      { id: 'schedule-no-show', name: 'Falta em agendamento (no-show)', description: 'Notificar quando detectar falta em agendamento', tags: [], push: true, email: false },
    ],
  },
  {
    id: 'integrations',
    name: 'Integrações',
    notifications: [
      { id: 'integration-error', name: 'Erro em integração', description: 'Notificar quando houver erro em integração', tags: ['todos', 'crítico'], push: true, email: false },
      { id: 'integration-added', name: 'Nova integração configurada', description: 'Notificar quando uma nova integração for adicionada', tags: ['todos'], push: true, email: false },
      { id: 'integration-updated', name: 'Integração atualizada', description: 'Notificar quando uma integração for modificada', tags: ['todos'], push: true, email: false },
    ],
  },
  {
    id: 'system',
    name: 'Sistema',
    notifications: [
      { id: 'credit-alert', name: 'Alerta de créditos', description: 'Notificar quando atingir o limite de aviso de créditos', tags: ['todos', 'alta'], push: true, email: false },
      { id: 'credit-critical', name: 'Créditos críticos', description: 'Notificar quando créditos estiverem quase esgotados', tags: ['todos', 'crítico'], push: true, email: false },
      { id: 'user-added', name: 'Novo usuário adicionado', description: 'Notificar quando um novo usuário for adicionado ao cliente', tags: ['todos'], push: true, email: false },
      { id: 'prompt-updated', name: 'Prompt atualizado', description: 'Notificar quando um prompt for atualizado', tags: ['todos'], push: false, email: false },
      { id: 'session-limit', name: 'Limite de sessões atingido', description: 'Notificar quando o cliente atingir o máximo de sessões simultâneas', tags: ['todos', 'alta'], push: true, email: false },
      { id: 'message-failed', name: 'Mensagem não enviada', description: 'Notificar quando houver falha no envio de mensagem', tags: ['todos', 'alta'], push: true, email: false },
      { id: 'operator-assigned', name: 'Operador atribuído', description: 'Notificar quando você for atribuído a um novo chat ou deal', tags: ['alta'], push: true, email: false },
    ],
  },
];

function TagBadge({ tag }: { tag: string }) {
  if (tag === 'crítico') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        crítico
      </span>
    );
  }
  if (tag === 'alta') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        alta
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      todos
    </span>
  );
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<NotificationCategory[]>(initialCategories);

  const handleToggle = (categoryId: string, notificationId: string, type: 'push' | 'email') => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              notifications: cat.notifications.map(n =>
                n.id === notificationId ? { ...n, [type]: !n[type] } : n
              ),
            }
          : cat
      )
    );
    toast({ title: 'Preferência atualizada', description: 'Configuração salva com sucesso.' });
  };

  const handleToggleAll = (categoryId: string, type: 'push' | 'email') => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id !== categoryId) return cat;
        const allEnabled = cat.notifications.every(n => n[type]);
        return {
          ...cat,
          notifications: cat.notifications.map(n => ({ ...n, [type]: !allEnabled })),
        };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Preferências de Notificação</h2>
        <p className="text-sm text-gray-500 mt-1">Gerencie como e quando você deseja receber notificações</p>
      </div>

      {/* Info alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800">
          <strong>Sobre as notificações:</strong> Notificações de agendamentos e deals são filtradas automaticamente para exibir apenas itens atribuídos a você.{' '}
          Para receber notificações de <strong>todos</strong> os itens do cliente, ative as opções marcadas com{' '}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 mx-1">todos</span>.
        </AlertDescription>
      </Alert>

      {/* Operator warning */}
      <Alert className="border-yellow-300 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800">
          Você ainda não tem um operador configurado neste cliente. Algumas notificações podem não funcionar corretamente.
        </AlertDescription>
      </Alert>

      {/* Notification categories */}
      {categories.map((category) => {
        const allPushEnabled = category.notifications.every(n => n.push);
        const allEmailEnabled = category.notifications.every(n => n.email);

        return (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="pb-0 pt-5 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">{category.name}</CardTitle>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-1 min-w-[48px]">
                    <span className="text-xs text-gray-500 font-medium">Push</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Todos</span>
                      <Switch
                        checked={allPushEnabled}
                        onCheckedChange={() => handleToggleAll(category.id, 'push')}
                        className="data-[state=checked]:bg-[#E8A44A]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 min-w-[48px]">
                    <span className="text-xs text-gray-500 font-medium">E-mail</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">Todos</span>
                      <Switch
                        checked={allEmailEnabled}
                        onCheckedChange={() => handleToggleAll(category.id, 'email')}
                        disabled
                        className="opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-2 pt-4">
              <div className="divide-y divide-gray-100">
                {category.notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between py-4">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-gray-900">{notification.name}</span>
                        {notification.tags.map(tag => (
                          <TagBadge key={tag} tag={tag} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{notification.description}</p>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="flex items-center justify-center min-w-[48px]">
                        <Switch
                          checked={notification.push}
                          onCheckedChange={() => handleToggle(category.id, notification.id, 'push')}
                          className="data-[state=checked]:bg-[#E8A44A]"
                        />
                      </div>
                      <div className="flex items-center justify-center min-w-[48px]">
                        <Switch
                          checked={notification.email}
                          onCheckedChange={() => handleToggle(category.id, notification.id, 'email')}
                          disabled
                          className="opacity-40"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
