import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationCategory {
  id: string;
  name: string;
  notifications: NotificationItem[];
}

interface NotificationItem {
  id: string;
  name: string;
  description: string;
  tags: string[];
  push: boolean;
  email: boolean;
}

export function NotificationSettings() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<NotificationCategory[]>([
    {
      id: 'agents',
      name: 'Agentes',
      notifications: [
        {
          id: 'agent-inactive',
          name: 'Agente inativo',
          description: 'Notificar quando um agente ficar inativo',
          tags: ['todos', 'alta'],
          push: true,
          email: false,
        },
        {
          id: 'agent-error',
          name: 'Erro em agente',
          description: 'Notificar quando houver erro em algum agente',
          tags: ['todos', 'crítico'],
          push: true,
          email: false,
        },
        {
          id: 'agent-reactivated',
          name: 'Agente reativado',
          description: 'Notificar quando um agente voltar a ficar ativo',
          tags: ['todos'],
          push: true,
          email: false,
        },
      ],
    },
    {
      id: 'leads',
      name: 'Leads & Negócios',
      notifications: [
        {
          id: 'deal-assigned',
          name: 'Deal atribuído a mim',
          description: 'Notificar quando um deal for atribuído a você',
          tags: ['alta'],
          push: true,
          email: false,
        },
        {
          id: 'deal-qualified',
          name: 'Deal qualificado',
          description: 'Notificar quando um deal atribuído a você for qualificado',
          tags: [],
          push: true,
          email: false,
        },
        {
          id: 'stage-change',
          name: 'Mudança de estágio',
          description: 'Notificar quando um deal seu mudar de estágio',
          tags: [],
          push: true,
          email: false,
        },
        {
          id: 'deal-closed',
          name: 'Deal fechado',
          description: 'Notificar quando um deal seu for fechado (ganho ou perdido)',
          tags: [],
          push: true,
          email: false,
        },
        {
          id: 'new-lead-all',
          name: 'Novo lead criado (todos)',
          description: 'Notificar sobre QUALQUER novo lead no cliente',
          tags: ['todos'],
          push: false,
          email: false,
        },
      ],
    },
    {
      id: 'schedules',
      name: 'Agendamentos',
      notifications: [
        {
          id: 'schedule-today',
          name: 'Agendamentos hoje',
          description: 'Notificar sobre agendamentos confirmados para hoje',
          tags: ['alta'],
          push: true,
          email: false,
        },
        {
          id: 'schedule-upcoming',
          name: 'Agendamentos próximos (2 dias)',
          description: 'Notificar sobre agendamentos nos próximos 2 dias',
          tags: [],
          push: true,
          email: false,
        },
        {
          id: 'schedule-canceled',
          name: 'Agendamento cancelado',
          description: 'Notificar quando um agendamento for cancelado',
          tags: [],
          push: true,
          email: false,
        },
        {
          id: 'schedule-no-show',
          name: 'Falta em agendamento',
          description: 'Notificar quando detectar falta em agendamento',
          tags: [],
          push: true,
          email: false,
        },
      ],
    },
    {
      id: 'integrations',
      name: 'Integrações',
      notifications: [
        {
          id: 'integration-error',
          name: 'Erro em integração',
          description: 'Notificar quando houver erro em integração',
          tags: ['todos', 'crítico'],
          push: true,
          email: false,
        },
        {
          id: 'integration-added',
          name: 'Nova integração configurada',
          description: 'Notificar quando uma nova integração for adicionada',
          tags: ['todos'],
          push: true,
          email: false,
        },
        {
          id: 'integration-updated',
          name: 'Integração atualizada',
          description: 'Notificar quando uma integração for modificada',
          tags: ['todos'],
          push: true,
          email: false,
        },
      ],
    },
    {
      id: 'system',
      name: 'Sistema',
      notifications: [
        {
          id: 'credit-alert',
          name: 'Alerta de créditos',
          description: 'Notificar quando atingir o limite de aviso de créditos',
          tags: ['todos', 'alta'],
          push: true,
          email: false,
        },
        {
          id: 'credit-critical',
          name: 'Créditos críticos',
          description: 'Notificar quando créditos estiverem quase esgotados',
          tags: ['todos', 'crítico'],
          push: true,
          email: false,
        },
        {
          id: 'user-added',
          name: 'Novo usuário adicionado',
          description: 'Notificar quando um novo usuário for adicionado ao cliente',
          tags: ['todos'],
          push: true,
          email: false,
        },
        {
          id: 'prompt-updated',
          name: 'Prompt atualizado',
          description: 'Notificar quando um prompt for atualizado',
          tags: ['todos'],
          push: false,
          email: false,
        },
        {
          id: 'session-limit',
          name: 'Limite de sessões atingido',
          description: 'Notificar quando o cliente atingir o máximo de sessões simultâneas',
          tags: ['todos', 'alta'],
          push: true,
          email: false,
        },
        {
          id: 'message-failed',
          name: 'Mensagem não enviada',
          description: 'Notificar quando houver falha no envio de mensagem',
          tags: ['todos', 'alta'],
          push: true,
          email: false,
        },
        {
          id: 'operator-assigned',
          name: 'Operador atribuído',
          description: 'Notificar quando você for atribuído a um novo chat ou deal',
          tags: ['alta'],
          push: true,
          email: false,
        },
      ],
    },
  ]);

  const handleToggle = (categoryId: string, notificationId: string, type: 'push' | 'email') => {
    setCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            notifications: category.notifications.map(notif => {
              if (notif.id === notificationId) {
                return {
                  ...notif,
                  [type]: !notif[type],
                };
              }
              return notif;
            }),
          };
        }
        return category;
      })
    );

    // Salvar no backend (implementar depois)
    toast({
      title: 'Preferência atualizada',
      description: 'A configuração foi salva com sucesso.',
      variant: 'default',
    });
  };

  const handleToggleAll = (categoryId: string, type: 'push' | 'email') => {
    setCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          const allEnabled = category.notifications.every(n => n[type]);
          return {
            ...category,
            notifications: category.notifications.map(notif => ({
              ...notif,
              [type]: !allEnabled,
            })),
          };
        }
        return category;
      })
    );
  };

  const getTagColor = (tag: string) => {
    if (tag === 'crítico') return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (tag === 'alta') return 'bg-green-500/10 text-green-600 border-green-500/20';
    return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Informações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Sobre as notificações: Notificações de agendamentos e deals são filtradas automaticamente para exibir apenas itens atribuídos a você. Para receber notificações de todos os itens do cliente, ative as opções marcadas com{' '}
          <Badge variant="outline" className="mx-1">todos</Badge>.
        </AlertDescription>
      </Alert>

      {/* Categorias de Notificações */}
      {categories.map((category) => {
        const allPushEnabled = category.notifications.every(n => n.push);
        const allEmailEnabled = category.notifications.every(n => n.email);

        return (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{category.name}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${category.id}-push-all`} className="text-sm">
                      Todos
                    </Label>
                    <Switch
                      id={`${category.id}-push-all`}
                      checked={allPushEnabled}
                      onCheckedChange={() => handleToggleAll(category.id, 'push')}
                    />
                    <Label htmlFor={`${category.id}-push-all`} className="text-sm text-muted-foreground">
                      Push
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${category.id}-email-all`}
                      checked={allEmailEnabled}
                      onCheckedChange={() => handleToggleAll(category.id, 'email')}
                      disabled
                    />
                    <Label htmlFor={`${category.id}-email-all`} className="text-sm text-muted-foreground">
                      E-mail
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notification.name}</h4>
                        {notification.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className={getTagColor(tag)}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                    <div className="flex items-center gap-6 ml-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.push}
                          onCheckedChange={() => handleToggle(category.id, notification.id, 'push')}
                        />
                        <Label className="text-sm">Push</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.email}
                          onCheckedChange={() => handleToggle(category.id, notification.id, 'email')}
                          disabled
                        />
                        <Label className="text-sm text-muted-foreground">E-mail</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Aviso sobre E-mail */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Notificações por e-mail: Esta funcionalidade estará disponível em breve. Por enquanto, apenas notificações push estão ativas.
        </AlertDescription>
      </Alert>
    </div>
  );
}
