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
  const [lastSavedField, setLastSavedField] = useState<string | null>(null);
  // Estado para rastrear quais chaves existem no backend (mascaradas)
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({});

  // Função helper para auto-save de qualquer campo
  const handleAutoSave = (fieldName: keyof IntegrationConfig, value: string) => {
    // Validar que usuário está autenticado antes de auto-save
    if (!user) {
      console.warn('Auto-save ignorado: usuário não autenticado');
      return;
    }

    // Validar que token existe
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('Auto-save ignorado: token não encontrado');
      return;
    }

    // Limpar timeout anterior
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Salvar temporariamente no localStorage para tokens sensíveis
    if (fieldName === 'openaiApiKey' && value) {
      localStorage.setItem('openai_api_key_temp', value);
    } else if (fieldName === 'evolutionApiKey' && value) {
      localStorage.setItem('evolution_api_key_temp', value);
    } else if (fieldName === 'zapiToken' && value) {
      localStorage.setItem('zapi_token_temp', value);
    }

    // Auto-save após 2 segundos de inatividade
    const timeout = window.setTimeout(async () => {
      if (value && value.trim().length > 0 && user && token) {
        try {
          const payload: any = {};
          payload[fieldName] = value.trim();

          await api.patch('/api/integrations', payload);
          
          setLastSavedField(fieldName);
          toast({
            title: 'Salvo automaticamente!',
            description: `O campo ${fieldName} foi salvo automaticamente.`,
            variant: 'default',
          });
        } catch (err: any) {
          // Silenciosamente falha - usuário pode salvar manualmente depois
          console.log(`Auto-save falhou para ${fieldName}:`, err.message);
        }
      }
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  useEffect(() => {
    // Só carregar se o usuário estiver autenticado
    if (!user) {
      return;
    }

    // Validar que token existe antes de carregar
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('Token não encontrado, não carregando configurações');
      return;
    }

    // Carregar configurações do backend
    const loadConfig = async () => {
      try {
        const response = await api.get('/api/integrations');
        const config = response.data;
        
        // Se tiver configurações no backend, usar
        if (config) {
          // Detectar quais chaves existem no backend (vêm mascaradas como ***XXXX)
          const hasOpenAIKey = config.openaiApiKey && config.openaiApiKey !== 'null' && config.openaiApiKey.startsWith('***');
          const hasEvolutionKey = config.evolutionApiKey && config.evolutionApiKey !== 'null' && config.evolutionApiKey.startsWith('***');
          const hasZapiToken = config.zapiToken && config.zapiToken !== 'null' && config.zapiToken.startsWith('***');
          
          // Armazenar as chaves mascaradas para mostrar indicador
          setSavedKeys({
            openaiApiKey: hasOpenAIKey ? config.openaiApiKey : '',
            evolutionApiKey: hasEvolutionKey ? config.evolutionApiKey : '',
            zapiToken: hasZapiToken ? config.zapiToken : '',
          });
          
          setFormData({
            // Para API keys, mostrar valor do localStorage temporário se existir, senão string vazia
            // O indicador visual será mostrado baseado em savedKeys
            openaiApiKey: hasOpenAIKey 
              ? (localStorage.getItem('openai_api_key_temp') || '') 
              : '',
            n8nWebhookUrl: config.n8nWebhookUrl || '',
            evolutionApiUrl: config.evolutionApiUrl || '',
            evolutionApiKey: hasEvolutionKey
              ? (localStorage.getItem('evolution_api_key_temp') || '')
              : '',
            evolutionInstance: config.evolutionInstance || '',
            zapiInstanceId: config.zapiInstanceId || '',
            zapiToken: hasZapiToken
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
    
    // Validar autenticação antes de submeter
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para salvar configurações.',
        variant: 'destructive',
      });
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast({
        title: 'Erro',
        description: 'Token de autenticação não encontrado. Faça login novamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Salvar no backend
      // IMPORTANTE: Enviar openaiApiKey mesmo se for string vazia, para permitir limpar
      const payload: any = {};
      
      // Sempre enviar todos os campos que foram modificados
      // IMPORTANTE: Enviar null para strings vazias para limpar, não undefined
      if (formData.openaiApiKey !== undefined) {
        payload.openaiApiKey = formData.openaiApiKey && formData.openaiApiKey.trim() !== '' ? formData.openaiApiKey : null;
      }
      
      if (formData.n8nWebhookUrl !== undefined) {
        payload.n8nWebhookUrl = formData.n8nWebhookUrl && formData.n8nWebhookUrl.trim() !== '' ? formData.n8nWebhookUrl : null;
      }
      if (formData.evolutionApiUrl !== undefined) {
        payload.evolutionApiUrl = formData.evolutionApiUrl && formData.evolutionApiUrl.trim() !== '' ? formData.evolutionApiUrl : null;
      }
      if (formData.evolutionApiKey !== undefined) {
        payload.evolutionApiKey = formData.evolutionApiKey && formData.evolutionApiKey.trim() !== '' ? formData.evolutionApiKey : null;
      }
      if (formData.evolutionInstance !== undefined) {
        payload.evolutionInstance = formData.evolutionInstance && formData.evolutionInstance.trim() !== '' ? formData.evolutionInstance : null;
      }
      if (formData.zapiInstanceId !== undefined) {
        payload.zapiInstanceId = formData.zapiInstanceId && formData.zapiInstanceId.trim() !== '' ? formData.zapiInstanceId : null;
      }
      if (formData.zapiToken !== undefined) {
        payload.zapiToken = formData.zapiToken && formData.zapiToken.trim() !== '' ? formData.zapiToken : null;
      }
      if (formData.zapiBaseUrl !== undefined) {
        payload.zapiBaseUrl = formData.zapiBaseUrl && formData.zapiBaseUrl.trim() !== '' ? formData.zapiBaseUrl : null;
      }
      
      // DEBUG: Validar token antes de enviar
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔑 Token antes de PATCH /api/integrations:', {
            hasToken: !!token,
            tenantId: tokenPayload.tenantId,
            userId: tokenPayload.id,
            hasTenantId: !!tokenPayload.tenantId,
          });
          
          if (!tokenPayload.tenantId) {
            console.error('❌ ERRO CRÍTICO: Token não contém tenantId!');
            throw new Error('Token inválido: não contém tenantId');
          }
        } catch (e) {
          console.error('❌ ERRO ao validar token:', e);
          throw new Error('Token inválido ou não encontrado');
        }
      } else {
        console.error('❌ ERRO: Nenhum token encontrado no localStorage!');
        throw new Error('Não autenticado. Faça login novamente.');
      }
      
      // Validar que usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('Enviando payload para salvar integrações:', {
        ...payload,
        // Não logar valores completos de tokens por segurança
        openaiApiKey: payload.openaiApiKey ? `***${payload.openaiApiKey.slice(-4)}` : null,
        evolutionApiKey: payload.evolutionApiKey ? `***${payload.evolutionApiKey.slice(-4)}` : null,
        zapiToken: payload.zapiToken ? `***${payload.zapiToken.slice(-4)}` : null,
      });
      
      const response = await api.patch('/api/integrations', payload);

      console.log('Resposta do servidor:', response.data);

      // Atualizar savedKeys com as chaves mascaradas retornadas pelo backend
      if (response.data.config) {
        const newSavedKeys = { ...savedKeys };
        if (response.data.config.openaiApiKey && response.data.config.openaiApiKey.startsWith('***')) {
          newSavedKeys.openaiApiKey = response.data.config.openaiApiKey;
        }
        if (response.data.config.evolutionApiKey && response.data.config.evolutionApiKey.startsWith('***')) {
          newSavedKeys.evolutionApiKey = response.data.config.evolutionApiKey;
        }
        if (response.data.config.zapiToken && response.data.config.zapiToken.startsWith('***')) {
          newSavedKeys.zapiToken = response.data.config.zapiToken;
        }
        setSavedKeys(newSavedKeys);
      }

      // Também salvar no localStorage para referência (sem tokens completos por segurança)
      const safeFormData = {
        ...formData,
        openaiApiKey: formData.openaiApiKey ? '***' : '',
        evolutionApiKey: formData.evolutionApiKey ? '***' : '',
        zapiToken: formData.zapiToken ? '***' : '',
      };
      localStorage.setItem('integration_config', JSON.stringify(safeFormData));

      // Salvar tokens temporariamente no localStorage para não perder ao recarregar
      if (formData.openaiApiKey) {
        localStorage.setItem('openai_api_key_temp', formData.openaiApiKey);
      }
      if (formData.evolutionApiKey) {
        localStorage.setItem('evolution_api_key_temp', formData.evolutionApiKey);
      }
      if (formData.zapiToken) {
        localStorage.setItem('zapi_token_temp', formData.zapiToken);
      }

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
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.';
        } else if (err.response.status === 401) {
          errorMessage = 'Não autenticado. Faça logout e login novamente.';
        } else if (err.response.status === 403) {
          errorMessage = 'Você não tem permissão para realizar esta ação.';
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
    // Validar autenticação antes de testar
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para testar conexões.',
        variant: 'destructive',
      });
      return;
    }

    setTestResults({ ...testResults, [type]: 'pending' });

    try {
      if (type === 'openai' && (formData.openaiApiKey || savedKeys.openaiApiKey)) {
        // Buscar chave completa: primeiro do formData, senão do localStorage temporário
        const apiKey = formData.openaiApiKey || localStorage.getItem('openai_api_key_temp') || '';
        
        if (!apiKey) {
          throw new Error('Chave da OpenAI não encontrada. Digite a chave completa para testar.');
        }
        
        // Testar OpenAI
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
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
                {(savedKeys.openaiApiKey || testResults.openai === 'success') && (
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
                  <div className="relative">
                    <Input
                      id="openai-api-key"
                      type="password"
                      placeholder={savedKeys.openaiApiKey ? `Chave salva (${savedKeys.openaiApiKey})` : "sk-..."}
                      value={formData.openaiApiKey || ''}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData({ ...formData, openaiApiKey: newValue });
                        handleAutoSave('openaiApiKey', newValue);
                        // Limpar indicador de chave salva quando usuário começar a digitar
                        if (newValue && savedKeys.openaiApiKey) {
                          setSavedKeys({ ...savedKeys, openaiApiKey: '' });
                        }
                      }}
                      className={savedKeys.openaiApiKey && !formData.openaiApiKey ? 'bg-green-50 border-green-300' : ''}
                    />
                    {savedKeys.openaiApiKey && !formData.openaiApiKey && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>
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
                    disabled={(!formData.openaiApiKey && !savedKeys.openaiApiKey) || isLoading}
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, n8nWebhookUrl: newValue });
                      handleAutoSave('n8nWebhookUrl', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, evolutionApiUrl: newValue });
                      handleAutoSave('evolutionApiUrl', newValue);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-api-key">API Key</Label>
                  <Input
                    id="evolution-api-key"
                    type="password"
                    placeholder="Sua API key da Evolution"
                    value={formData.evolutionApiKey || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, evolutionApiKey: newValue });
                      handleAutoSave('evolutionApiKey', newValue);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evolution-instance">Nome da Instância</Label>
                  <Input
                    id="evolution-instance"
                    placeholder="SDRAdvogados2"
                    value={formData.evolutionInstance || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, evolutionInstance: newValue });
                      handleAutoSave('evolutionInstance', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, zapiInstanceId: newValue });
                      handleAutoSave('zapiInstanceId', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, zapiToken: newValue });
                      handleAutoSave('zapiToken', newValue);
                    }}
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
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, zapiBaseUrl: newValue });
                      handleAutoSave('zapiBaseUrl', newValue);
                    }}
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
