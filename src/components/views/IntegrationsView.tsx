import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Calendar,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Settings2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: 'whatsapp' | 'crm' | 'calendar' | 'legal';
  connected: boolean;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
  docsUrl?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'chatguru',
    name: 'ChatGuru',
    description: 'Canal WhatsApp oficial via ChatGuru. Envie mensagens, áudios e documentos.',
    icon: MessageSquare,
    color: 'text-green-600',
    category: 'whatsapp',
    connected: false,
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'cg_live_xxxxxxxxxxxx' },
      { key: 'channelId', label: 'Channel ID', placeholder: 'ch_xxxxxxxx' },
    ],
  },
  {
    id: 'zapi',
    name: 'Z-API',
    description: 'Conector WhatsApp não oficial. Altamente usado no Brasil para automação.',
    icon: MessageSquare,
    color: 'text-emerald-600',
    category: 'whatsapp',
    connected: false,
    fields: [
      { key: 'instanceId', label: 'ID da Instância', placeholder: 'xxxxxxxxxx' },
      { key: 'instanceToken', label: 'Token da Instância', placeholder: 'xxxxxxxxxx' },
      { key: 'clientToken', label: 'Client Token', placeholder: 'xxxxxxxxxx' },
    ],
  },
  {
    id: 'rdstation',
    name: 'RD Station CRM',
    description: 'Sincronize leads automaticamente com RD Station. Cria contato + oportunidade.',
    icon: Zap,
    color: 'text-blue-600',
    category: 'crm',
    connected: false,
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'Obtido no painel RD Station' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'Obtido no painel RD Station' },
    ],
    docsUrl: 'https://developers.rdstation.com/',
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    description: 'Envie leads qualificados direto para o Pipedrive como negócios no funil.',
    icon: Briefcase,
    color: 'text-orange-600',
    category: 'crm',
    connected: false,
    fields: [
      { key: 'apiToken', label: 'API Token', placeholder: 'Obtido em Configurações > API no Pipedrive' },
      { key: 'pipelineId', label: 'Pipeline ID', placeholder: '1' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Integre com HubSpot CRM. Cria contatos e negócios automaticamente.',
    icon: Briefcase,
    color: 'text-red-500',
    category: 'crm',
    connected: false,
    fields: [
      { key: 'accessToken', label: 'Access Token (Private App)', placeholder: 'pat-na1-xxxxxxxx' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sincronize leads com Salesforce CRM via API REST.',
    icon: Briefcase,
    color: 'text-blue-500',
    category: 'crm',
    connected: false,
    fields: [
      { key: 'instanceUrl', label: 'Instance URL', placeholder: 'https://yourdomain.salesforce.com' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Obtido via OAuth 2.0' },
    ],
  },
  {
    id: 'advbox',
    name: 'Advbox',
    description: 'CRM jurídico especializado. Cria clientes e processos diretamente.',
    icon: Briefcase,
    color: 'text-indigo-600',
    category: 'legal',
    connected: false,
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Obtido nas configurações do Advbox' },
      { key: 'subdomain', label: 'Subdomínio', placeholder: 'meuescritorio' },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Crie eventos de consulta automaticamente no Google Calendar do advogado.',
    icon: Calendar,
    color: 'text-blue-500',
    category: 'calendar',
    connected: false,
    fields: [
      { key: 'clientId', label: 'Client ID', placeholder: 'Google OAuth Client ID' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'Google OAuth Client Secret' },
      { key: 'calendarId', label: 'Calendar ID', placeholder: 'primary ou email@gmail.com' },
    ],
    docsUrl: 'https://console.cloud.google.com/',
  },
  {
    id: 'outlook',
    name: 'Outlook / Microsoft 365',
    description: 'Agende consultas no Outlook Calendar via Microsoft Graph API.',
    icon: Calendar,
    color: 'text-blue-700',
    category: 'calendar',
    connected: false,
    fields: [
      { key: 'tenantId', label: 'Tenant ID', placeholder: 'Azure AD Tenant ID' },
      { key: 'clientId', label: 'Client ID', placeholder: 'Azure App Client ID' },
      { key: 'clientSecret', label: 'Client Secret', placeholder: 'Azure App Client Secret' },
    ],
  },
];

const CATEGORY_LABELS = {
  whatsapp: 'WhatsApp',
  crm: 'CRM',
  calendar: 'Calendário',
  legal: 'Jurídico',
};

export function IntegrationsView() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [configOpen, setConfigOpen] = useState<Integration | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const { toast } = useToast();

  function openConfig(integration: Integration) {
    setFormValues({});
    setConfigOpen(integration);
  }

  async function handleConnect() {
    if (!configOpen) return;
    const allFilled = configOpen.fields.every(f => formValues[f.key]?.trim());
    if (!allFilled) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    try {
      // In production: POST /api/integrations with { type: configOpen.id, config: formValues }
      setConnected(prev => ({ ...prev, [configOpen.id]: true }));
      toast({ title: `${configOpen.name} conectado com sucesso!` });
      setConfigOpen(null);
    } catch {
      toast({ title: 'Erro ao conectar', variant: 'destructive' });
    }
  }

  function handleDisconnect(id: string) {
    setConnected(prev => ({ ...prev, [id]: false }));
    toast({ title: 'Integração desconectada' });
  }

  const connectedCount = INTEGRATIONS.filter(i => connected[i.id]).length;

  const renderCard = (integration: Integration) => {
    const isConnected = connected[integration.id];
    const Icon = integration.icon;
    return (
      <Card key={integration.id} className={`transition-all ${isConnected ? 'border-green-200 bg-green-50/30' : ''}`}>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${integration.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{integration.name}</h3>
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="w-3 h-3 mr-1" />
                      Não conectado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {integration.description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {isConnected ? (
              <>
                <Button size="sm" variant="outline" onClick={() => openConfig(integration)} className="flex-1">
                  <Settings2 className="w-3.5 h-3.5 mr-1.5" />
                  Reconfigurar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDisconnect(integration.id)}
                >
                  Desconectar
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => openConfig(integration)} className="flex-1">
                Conectar
              </Button>
            )}
            {integration.docsUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a href={integration.docsUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-indigo-600">{INTEGRATIONS.length}</div>
            <div className="text-xs text-muted-foreground">Integrações disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-green-600">{connectedCount}</div>
            <div className="text-xs text-muted-foreground">Conectadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="text-2xl font-bold text-amber-600">{INTEGRATIONS.length - connectedCount}</div>
            <div className="text-xs text-muted-foreground">Disponíveis</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="legal">Jurídico</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {INTEGRATIONS.map(renderCard)}
          </div>
        </TabsContent>

        {(['whatsapp', 'crm', 'calendar', 'legal'] as const).map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {INTEGRATIONS.filter(i => i.category === cat).map(renderCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Config dialog */}
      <Dialog open={!!configOpen} onOpenChange={() => setConfigOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configOpen && <configOpen.icon className={`w-5 h-5 ${configOpen.color}`} />}
              Configurar {configOpen?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{configOpen?.description}</p>
            {configOpen?.fields.map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                <Input
                  type={field.type || 'text'}
                  value={formValues[field.key] || ''}
                  onChange={e => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(null)}>Cancelar</Button>
            <Button onClick={handleConnect}>Conectar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
