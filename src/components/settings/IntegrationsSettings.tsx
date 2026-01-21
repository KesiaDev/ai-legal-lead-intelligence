import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Key, Webhook, Database, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IntegrationConfig {
  openaiApiKey?: string;
  n8nWebhookUrl?: string;
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  evolutionInstance?: string;
}

export function IntegrationsSettings() {
  const { tenant, refreshTenant } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IntegrationConfig>({
    openaiApiKey: '',
    n8nWebhookUrl: '',
    evolutionApiUrl: '',
    evolutionApiKey: '',
    evolutionInstance: '',
  });

  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending' | null>>({});

  useEffect(() => {
    // Carregar configurações salvas (se houver endpoint)
    // Por enquanto, carrega do localStorage ou deixa vazio
    const saved = localStorage.getItem('integration_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Salvar no localStorage por enquanto
      // No futuro, salvar no backend via API
      localStorage.setItem('integration_config', JSON.stringify(formData));

      toast({
        title: 'Configurações salvas!',
        description: 'As integrações foram configuradas com sucesso.',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: err.response?.data?.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (type: 'openai' | 'n8n' | 'evolution') => {
    setTestResults({ ...testResults, [type]: 'pending' });

    try {
      if (type === 'openai' && formData.openaiApiKey) {
        // Testar OpenAI
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${formData.openaiApiKey}`,
          },
        });
        
        if (response.ok) {
          setTestResults({ ...testResults, openai: 'success' });
          toast({
            title: 'Conexão bem-sucedida!',
            description: 'OpenAI API está funcionando corretamente.',
            variant: 'default',
          });
        } else {
          throw new Error('Falha na autenticação');
        }
      } else if (type === 'n8n' && formData.n8nWebhookUrl) {
        // Testar N8N webhook
        const response = await fetch(formData.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });
        
        if (response.ok || response.status === 404) {
          setTestResults({ ...testResults, n8n: 'success' });
          toast({
            title: 'Webhook acessível!',
            description: 'N8N webhook está respondendo.',
            variant: 'default',
          });
        } else {
          throw new Error('Webhook não acessível');
        }
      } else if (type === 'evolution' && formData.evolutionApiUrl && formData.evolutionInstance) {
        // Testar Evolution API
        const url = `${formData.evolutionApiUrl}/instance/fetchInstances`;
        const response = await fetch(url, {
          headers: {
            'apikey': formData.evolutionApiKey || '',
          },
        });
        
        if (response.ok) {
          setTestResults({ ...testResults, evolution: 'success' });
          toast({
            title: 'Conexão bem-sucedida!',
            description: 'Evolution API está funcionando corretamente.',
            variant: 'default',
          });
        } else {
          throw new Error('Falha na conexão');
        }
      }
    } catch (err: any) {
      setTestResults({ ...testResults, [type]: 'error' });
      toast({
        title: 'Erro ao testar conexão',
        description: err.message || 'Não foi possível conectar. Verifique as credenciais.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="n8n">N8N</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
        </TabsList>

        {/* OpenAI Integration */}
        <TabsContent value="openai" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    OpenAI API
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure sua chave da OpenAI para habilitar análise inteligente de leads e respostas automáticas.
                  </CardDescription>
                </div>
                {testResults.openai === 'success' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {testResults.openai === 'error' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">API Key da OpenAI</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    placeholder="sk-..."
                    value={formData.openaiApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtenha sua API key em{' '}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testConnection('openai')}
                    disabled={!formData.openaiApiKey || isLoading}
                  >
                    Testar Conexão
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Como funciona:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>A OpenAI analisa mensagens de leads automaticamente</li>
                        <li>Classifica leads como quente, morno ou frio</li>
                        <li>Gera respostas inteligentes no chat</li>
                        <li>Se não configurar, usa análise básica (fallback)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* N8N Integration */}
        <TabsContent value="n8n" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    N8N Workflow
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure o webhook do seu workflow N8N para receber leads automaticamente.
                  </CardDescription>
                </div>
                {testResults.n8n === 'success' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {testResults.n8n === 'error' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n8n-webhook">URL do Webhook N8N</Label>
                  <Input
                    id="n8n-webhook"
                    type="url"
                    placeholder="https://seu-n8n.com/webhook/..."
                    value={formData.n8nWebhookUrl || ''}
                    onChange={(e) => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL do webhook do seu workflow N8N que receberá os leads.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testConnection('n8n')}
                    disabled={!formData.n8nWebhookUrl || isLoading}
                  >
                    Testar Conexão
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Como funciona:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Leads criados na plataforma são enviados para o N8N</li>
                        <li>N8N processa e envia para WhatsApp via Evolution API</li>
                        <li>Respostas do agente IA voltam para a plataforma</li>
                        <li>Você pode ter múltiplos workflows N8N (um por cliente)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolution API Integration */}
        <TabsContent value="evolution" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Evolution API (WhatsApp)
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure sua Evolution API para envio e recebimento de mensagens via WhatsApp.
                  </CardDescription>
                </div>
                {testResults.evolution === 'success' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {testResults.evolution === 'error' && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution-url">URL da Evolution API</Label>
                  <Input
                    id="evolution-url"
                    type="url"
                    placeholder="https://seu-evolution.com"
                    value={formData.evolutionApiUrl || ''}
                    onChange={(e) => setFormData({ ...formData, evolutionApiUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-api-key">API Key</Label>
                  <Input
                    id="evolution-api-key"
                    type="password"
                    placeholder="Sua API key da Evolution"
                    value={formData.evolutionApiKey || ''}
                    onChange={(e) => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-instance">Nome da Instância</Label>
                  <Input
                    id="evolution-instance"
                    placeholder="SDRAdvogados2"
                    value={formData.evolutionInstance || ''}
                    onChange={(e) => setFormData({ ...formData, evolutionInstance: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da instância criada no Evolution API Manager.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testConnection('evolution')}
                    disabled={!formData.evolutionApiUrl || !formData.evolutionInstance || isLoading}
                  >
                    Testar Conexão
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Como funciona:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Evolution API gerencia conexão com WhatsApp</li>
                        <li>N8N usa Evolution para enviar mensagens</li>
                        <li>Mensagens recebidas no WhatsApp chegam via N8N</li>
                        <li>Configure no N8N, não diretamente aqui (por enquanto)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CRM Integrations (Futuro) */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações CRM (Em Breve)</CardTitle>
          <CardDescription>
            Conecte com Pipedrive, HubSpot, Salesforce e outros CRMs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="font-medium mb-1">Pipedrive</div>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="font-medium mb-1">HubSpot</div>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="font-medium mb-1">Salesforce</div>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </div>
            <div className="p-4 border rounded-lg text-center opacity-50">
              <div className="font-medium mb-1">Advbox</div>
              <Badge variant="outline" className="text-xs">Em breve</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
