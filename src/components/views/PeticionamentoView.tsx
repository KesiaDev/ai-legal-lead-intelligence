import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FilePen, ExternalLink, Settings, RefreshCw,
  LayoutDashboard, FileText, FolderOpen, Users,
  BookOpen, Bell, SlidersHorizontal, Plus, Link,
  Loader2, AlertCircle, CheckCircle2, ArrowRight,
  Mic, Gavel, FileCheck, ScrollText, Briefcase,
} from 'lucide-react';

const STORAGE_KEY = 'peticionamento_url';
const DEFAULT_URL = 'https://peticionamentocomia.lovable.app';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',      path: '/dashboard',          icon: LayoutDashboard },
  { id: 'documents',    label: 'Documentos',      path: '/ai/documents',       icon: FileText },
  { id: 'new-doc',      label: 'Nova Petição',    path: '/ai/documents/new',   icon: Plus },
  { id: 'cases',        label: 'Processos',       path: '/cases',              icon: FolderOpen },
  { id: 'clients',      label: 'Clientes',        path: '/clients',            icon: Users },
  { id: 'publications', label: 'Publicações',     path: '/publications',       icon: Bell },
  { id: 'settings',     label: 'Config. IA',      path: '/settings?tab=ai',    icon: SlidersHorizontal },
];

const DOCUMENT_TYPES = [
  { cat: 'Petições',       items: ['Petição Inicial', 'Contestação', 'Réplica', 'Reconvenção', 'Petição Simples'] },
  { cat: 'Recursos',       items: ['Apelação', 'Agravo de Instrumento', 'Agravo Interno', 'Embargos de Declaração', 'Recurso Especial', 'Recurso Extraordinário'] },
  { cat: 'Contratos',      items: ['Contratos (geral)'] },
  { cat: 'Extrajudiciais', items: ['Notificação Extrajudicial', 'Requerimento', 'Parecer Jurídico', 'Procuração'] },
  { cat: 'Outros',         items: ['Alegações Finais', 'Outro'] },
];

export function PeticionamentoView() {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [savedUrl, setSavedUrl] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) localStorage.setItem(STORAGE_KEY, DEFAULT_URL);
    return stored || DEFAULT_URL;
  });
  const [editingUrl, setEditingUrl] = useState(savedUrl);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (savedUrl) setIframeStatus('loading');
  }, [savedUrl, activeTab]);

  const currentPath = TABS.find(t => t.id === activeTab)?.path ?? '/dashboard';
  const iframeSrc = savedUrl ? `${savedUrl.replace(/\/$/, '')}${currentPath}` : '';

  const handleSaveUrl = () => {
    let url = editingUrl.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    localStorage.setItem(STORAGE_KEY, url);
    setSavedUrl(url);
    setShowConfig(false);
    setIframeStatus('loading');
    toast({ title: 'URL salva!', description: 'Conectando ao Peticionamento com IA...' });
  };

  const handleOpenExternal = (path = currentPath) => {
    if (!savedUrl) return;
    window.open(`${savedUrl.replace(/\/$/, '')}${path}`, '_blank');
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIframeStatus('loading');
      iframeRef.current.src = iframeSrc;
    }
  };

  if (showConfig) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FilePen className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-semibold">Peticionamento com IA</h2>
            <p className="text-sm text-muted-foreground">Geração automatizada de peças jurídicas com Inteligência Artificial</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Gavel,     label: '18 tipos de peças',         desc: 'Petições, recursos, contratos e mais' },
            { icon: Mic,       label: 'Preenchimento por voz',      desc: 'Fale os dados, a IA preenche o formulário' },
            { icon: ScrollText,label: 'Editor jurídico completo',   desc: 'Com busca de jurisprudência integrada' },
            { icon: FileCheck, label: 'Clientes e processos',       desc: 'Gestão completa vinculada aos documentos' },
          ].map(f => (
            <div key={f.label} className="border rounded-xl p-4 flex items-start gap-3">
              <f.icon className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Document types */}
        <div className="border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipos de peças disponíveis</p>
          <div className="space-y-2">
            {DOCUMENT_TYPES.map(cat => (
              <div key={cat.cat} className="flex items-start gap-2">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 w-24 flex-shrink-0 pt-0.5">{cat.cat}</span>
                <div className="flex flex-wrap gap-1">
                  {cat.items.map(item => (
                    <Badge key={item} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* URL config */}
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold">Conectar ao Peticionamento com IA</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole a URL onde o <strong>Peticionamento com IA</strong> está publicado (Lovable, Vercel ou qualquer host).
          </p>
          <div className="flex gap-2">
            <Input
              value={editingUrl}
              onChange={e => setEditingUrl(e.target.value)}
              placeholder="https://peticionamento-com-ia.lovable.app"
              onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
              className="flex-1"
            />
            <Button
              onClick={handleSaveUrl}
              disabled={!editingUrl.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              Conectar
            </Button>
          </div>
          <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Stack: <strong>React + Vite + Supabase + shadcn/ui</strong>. Publique pelo Lovable ou com{' '}
              <code className="bg-muted px-1 rounded">npm run build</code>.
              Repo: <span className="text-emerald-500">github.com/KesiaDev/peticionamento-com-ia</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('https://github.com/KesiaDev/peticionamento-com-ia', '_blank')}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir repositório
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FilePen className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Peticionamento com IA</h2>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  iframeStatus === 'loaded'
                    ? 'border-green-500 text-green-600'
                    : iframeStatus === 'error'
                    ? 'border-red-500 text-red-500'
                    : 'border-emerald-500 text-emerald-600'
                }`}
              >
                {iframeStatus === 'loaded' ? '● Conectado' : iframeStatus === 'error' ? '● Erro' : '● Conectando...'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{savedUrl}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => { setActiveTab('new-doc'); handleOpenExternal('/ai/documents/new'); }}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova petição
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenExternal('/clients')}
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Users className="w-3.5 h-3.5" />
            Clientes
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenExternal('/cases')}
            className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Processos
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button type="button" size="sm" variant="ghost" onClick={handleRefresh} title="Recarregar">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => handleOpenExternal()} title="Abrir em nova aba">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => { setShowConfig(true); setEditingUrl(savedUrl); }}
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Iframe */}
      <div className="relative flex-1 border rounded-xl overflow-hidden bg-muted/20 min-h-[500px]">
        {iframeStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Carregando Peticionamento com IA...</p>
            </div>
          </div>
        )}
        {iframeStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="font-medium">Não foi possível carregar a plataforma</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                A plataforma pode bloquear exibição em iframe. Use "Abrir em nova aba" para acesso completo.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  onClick={() => handleOpenExternal()}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir em nova aba
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowConfig(true); setEditingUrl(savedUrl); }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reconfigurar URL
                </Button>
              </div>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          title="Peticionamento com IA"
          allow="camera; microphone"
          onLoad={() => setIframeStatus('loaded')}
          onError={() => setIframeStatus('error')}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>18 tipos de peças · Editor jurídico · Preenchimento por voz · Busca de jurisprudência</span>
        </div>
        <button
          type="button"
          className="underline hover:text-foreground transition-colors"
          onClick={() => handleOpenExternal()}
        >
          Abrir em tela cheia →
        </button>
      </div>
    </div>
  );
}
