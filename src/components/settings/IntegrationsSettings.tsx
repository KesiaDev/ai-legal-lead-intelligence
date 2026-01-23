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
  zapiInstanceId?: string;
  zapiToken?: string;
  zapiBaseUrl?: string;
}

export function IntegrationsSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<IntegrationConfig>({
    openaiApiKey: '',
    n8nWebhookUrl: '',
    evolutionApiUrl: '',
    evolutionApiKey: '',
    evolutionInstance: '',
    zapiInstanceId: '',
    zapiToken: '',
    zapiBaseUrl: 'https://api.z-api.io',
  });

  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending' | null>>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<number | null>(null);

  useEffect(() => {
    // Só carregar se o usuário estiver autenticado
    if (!user) {
      return;
    }

    // Carregar configurações do backend
    const loadConfig = async () => {
      try {
        const response = await api.get('/api/integrations');
        const config = response.data;
        
        // Se tiver configurações no backend, usar
        if (config) {
          setFormData({
            // Para API keys, não mostrar o valor completo por segurança, mas manter indicador
            // Se existe (não é null), manter string vazia para o usuário digitar novamente se quiser
            // OU manter o valor se já estiver no localStorage (para não perder ao recarregar)
            openaiApiKey: (config.openaiApiKey && config.openaiApiKey !== 'null') 
              ? (localStorage.getItem('openai_api_key_temp') || '') 
              : '',
            n8nWebhookUrl: config.n8nWebhookUrl || '',
            evolutionApiUrl: config.evolutionApiUrl || '',
            evolutionApiKey: (config.evolutionApiKey && config.evolutionApiKey !== 'null')
              ? (localStorage.getItem('evolution_api_key_temp') || '')
              : '',
            evolutionInstance: config.evolutionInstance || '',
            zapiInstanceId: config.zapiInstanceId || '',
            zapiToken: (config.zapiToken && config.zapiToken !== 'null')
              ? (localStorage.getItem('zapi_token_temp') || '')
              : '',
            zapiBaseUrl: config.zapiBaseUrl || 'https://api.z-api.io',
          });
        } else {
          // Fallback para localStorage
          const saved = localStorage.getItem('integration_config');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setFormData(parsed);
            } catch (e) {
              console.error('Erro ao carregar configurações:', e);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do backend:', error);
        // Fallback para localStorage
        const saved = localStorage.getItem('integration_config');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setFormData(parsed);
          } catch (e) {
            console.error('Erro ao carregar configurações:', e);
          }
        }
      }
    };

    loadConfig();
  }, [user]);
  
  // Cleanup: limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Salvar no backend
      // IMPORTANTE: Enviar openaiApiKey mesmo se for string vazia, para permitir limpar
      const payload: any = {};
      
      // Sempre enviar openaiApiKey se estiver definido (mesmo que vazio)
      if (formData.openaiApiKey !== undefined) {
        payload.openaiApiKey = formData.openaiApiKey || null; // Enviar null se vazio para limpar
      }
      
      if (formData.n8nWebhookUrl !== undefined) {
        payload.n8nWebhookUrl = formData.n8nWebhookUrl || undefined;
      }
      if (formData.evolutionApiUrl !== undefined) {
        payload.evolutionApiUrl = formData.evolutionApiUrl || undefined;
      }
      if (formData.evolutionApiKey !== undefined) {
        payload.evolutionApiKey = formData.evolutionApiKey || undefined;
      }
      if (formData.evolutionInstance !== undefined) {
        payload.evolutionInstance = formData.evolutionInstance || undefined;
      }
      if (formData.zapiInstanceId !== undefined) {
        payload.zapiInstanceId = formData.zapiInstanceId || undefined;
      }
      if (formData.zapiToken !== undefined) {
        payload.zapiToken = formData.zapiToken || undefined;
      }
      if (formData.zapiBaseUrl !== undefined) {
        payload.zapiBaseUrl = formData.zapiBaseUrl || undefined;
      }
      
      const response = await api.patch('/api/integrations', payload);

      // Também salvar no localStorage para referência
      localStorage.setItem('integration_config', JSON.stringify(formData));

      toast({
        title: 'Configurações salvas!',
        description: 'As integrações foram configuradas com sucesso no backend.',
        variant: 'default',
      });
    } catch (err: any) {
      console.error('Erro completo ao salvar:', err);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Não foi possível salvar as alterações.';
      
      if (err.response) {
        // Erro do servidor
        if (err.response.status === 500) {
          errorMessage = 'Erro no servidor. A migration pode não ter sido aplicada ainda. Aguarde alguns minutos e tente novamente.';
        } else if (err.response.status === 401) {
          errorMessage = 'Não autenticado. Faça logout e login novamente.';
        } else {
          errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        err.message || 
                        errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Erro ao salvar configurações',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const testConnection = async (type: 'openai' | 'n8n' | 'evolution' | 'zapi') => {
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
      } else if (type === 'zapi' && formData.zapiInstanceId && formData.zapiToken) {
        // Testar Z-API via backend
        try {
          const response = await api.post('/api/zapi/test-connection', {
            instanceId: formData.zapiInstanceId,
            token: formData.zapiToken,
            baseUrl: formData.zapiBaseUrl || 'https://api.z-api.io',
          });
          
          if (response.data.success) {
            setTestResults({ ...testResults, zapi: 'success' });
            toast({
              title: 'Conexão bem-sucedida!',
              description: 'Z-API está funcionando corretamente.',
              variant: 'default',
            });
          } else {
            throw new Error(response.data.message || response.data.error || 'Falha na conexão');
          }
        } catch (apiErr: any) {
          // Tratar erros específicos da API
          const errorMessage = apiErr.response?.data?.message || 
                              apiErr.response?.data?.error || 
                              apiErr.message || 
                              'Não foi possível conectar. Verifique as credenciais.';
          
          throw new Error(errorMessage);
        }
      }
    } catch (err: any) {
      setTestResults({ ...testResults, [type]: 'error' });
      
      // Mensagem de erro mais específica
      let errorDescription = err.message || 'Não foi possível conectar. Verifique as credenciais.';
      
      // Se for erro 401, credenciais inválidas
      if (err.response?.status === 401 || err.message?.includes('inválid')) {
        errorDescription = 'Credenciais inválidas. Verifique o ID da Instância e o Token no painel do Z-API.';
      }
      
      // Se for erro 404, endpoint não encontrado (deploy pendente)
      if (err.response?.status === 404) {
        errorDescription = 'Endpoint não encontrado. Aguarde o deploy do backend ou verifique a URL da API.';
      }
      
      toast({
        title: 'Erro ao testar conexão',
        description: errorDescription,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="openai">OpenAI</TabsTrigger>
          <TabsTrigger value="n8n">N8N</TabsTrigger>
          <TabsTrigger value="evolution">Evolution API</TabsTrigger>
          <TabsTrigger value="zapi">Z-API</TabsTrigger>
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, openaiApiKey: newValue });
                      
                      // Salvar temporariamente no localStorage para não perder ao recarregar
                      if (newValue) {
                        localStorage.setItem('openai_api_key_temp', newValue);
                      } else {
                        localStorage.removeItem('openai_api_key_temp');
                      }
                      
                      // Auto-save após 2 segundos sem digitar
                      setAutoSaveTimeout((prevTimeout) => {
                        if (prevTimeout) {
                          clearTimeout(prevTimeout);
                        }
                        
                        const timeout = window.setTimeout(async () => {
                          if (newValue && newValue.length > 10) {
                            try {
                              await api.patch('/api/integrations', {
                                openaiApiKey: newValue,
                              });
                              toast({
                                title: 'Salvo automaticamente!',
                                description: 'A chave da OpenAI foi salva automaticamente.',
                                variant: 'default',
                              });
                            } catch (err: any) {
                              // Silenciosamente falha - usuário pode salvar manualmente depois
                              console.log('Auto-save falhou (pode ser migration pendente):', err.message);
                            }
                          }
                        }, 2000);
                        
                        return timeout;
                      });
                    }}
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
                      <p className="font-medium mb-1">⚠️ Importante:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li><strong>Evolution API funciona no N8N, não aqui!</strong></li>
                        <li>Esta tela é apenas para referência/documentação</li>
                        <li>Configure a Evolution API diretamente no seu workflow N8N</li>
                        <li>Se você usa Evolution compartilhada, não precisa preencher aqui</li>
                        <li>Se cada cliente tem Evolution própria, eles te passam as credenciais e você configura no N8N</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Z-API Integration */}
        <TabsContent value="zapi" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Z-API (WhatsApp)
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Configure sua Z-API para envio e recebimento de mensagens via WhatsApp.
                  </CardDescription>
                </div>
                {testResults.zapi === 'success' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                )}
                {testResults.zapi === 'error' && (
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
                  <Label htmlFor="zapi-instance-id">ID da Instância</Label>
                  <Input
                    id="zapi-instance-id"
                    placeholder="3EDAA0991A2272AFA1183EBEF7B316F4"
                    value={formData.zapiInstanceId || ''}
                    onChange={(e) => setFormData({ ...formData, zapiInstanceId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID da instância do Z-API (encontre em: Dados da instância web).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zapi-token">Token da Instância</Label>
                  <Input
                    id="zapi-token"
                    type="password"
                    placeholder="147E1F8CFCAACFFE1799DFAE"
                    value={formData.zapiToken || ''}
                    onChange={(e) => setFormData({ ...formData, zapiToken: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Token da instância do Z-API (encontre em: Dados da instância web).
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zapi-base-url">URL Base (Opcional)</Label>
                  <Input
                    id="zapi-base-url"
                    type="url"
                    placeholder="https://api.z-api.io"
                    value={formData.zapiBaseUrl || 'https://api.z-api.io'}
                    onChange={(e) => setFormData({ ...formData, zapiBaseUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL base da API Z-API (padrão: https://api.z-api.io).
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => testConnection('zapi')}
                    disabled={!formData.zapiInstanceId || !formData.zapiToken || isLoading}
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
                        <li>Z-API recebe mensagens do WhatsApp e envia webhook para a plataforma</li>
                        <li>Plataforma processa mensagem com agente IA</li>
                        <li>Agente responde via Z-API automaticamente</li>
                        <li>Configure o webhook no Z-API: <strong>https://api.sdrjuridico.com.br/api/webhooks/zapi</strong></li>
                        <li>Configure as variáveis no Railway: ZAPI_INSTANCE_ID, ZAPI_TOKEN</li>
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
