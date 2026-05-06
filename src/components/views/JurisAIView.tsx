import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, ExternalLink, Settings, RefreshCw,
  LayoutDashboard, Search, FileText, History,
  BookOpen, SlidersHorizontal, Plus, Link,
  Loader2, AlertCircle, CheckCircle2, ArrowRight,
  Gavel, Brain, Star, BookMarked,
} from 'lucide-react';

const STORAGE_KEY = 'jurisai_url';

const TABS = [
  { id: 'dashboard',           label: 'Dashboard',         path: '/',                    icon: LayoutDashboard },
  { id: 'search',              label: 'Pesquisar',          path: '/?page=search',        icon: Search },
  { id: 'processos',           label: 'Analisar Processo',  path: '/?page=processos',     icon: FileText },
  { id: 'processos-historico', label: 'Meus Processos',     path: '/?page=processos-historico', icon: History },
  { id: 'library',             label: 'Biblioteca',         path: '/?page=library',       icon: BookOpen },
  { id: 'settings',            label: 'Configurações',      path: '/?page=settings',      icon: SlidersHorizontal },
];

const TRIBUNAIS = [
  'STJ', 'STF', 'TST', 'TJ-SP', 'TJ-RJ', 'TJ-MG', 'TJ-RS', 'TJ-PR',
  'TJ-SC', 'TJ-BA', 'TJ-GO', 'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5',
  'TRT2', 'TRT4', 'TRT15', 'TJDFT', 'TJ-CE', 'TJ-PE',
];

const AREAS_MAP: Record<string, string> = {
  trabalhista: 'Trabalhista',
  familia: 'Família',
  previdenciario: 'Previdenciário',
  civel: 'Civil',
  consumidor: 'Consumidor',
  tributario: 'Tributário',
  criminal: 'Criminal',
  administrativo: 'Administrativo',
};

export function JurisAIView() {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [savedUrl, setSavedUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [editingUrl, setEditingUrl] = useState(savedUrl);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [iframeStatus, setIframeStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showConfig, setShowConfig] = useState(!savedUrl);

  useEffect(() => {
    if (savedUrl) setIframeStatus('loading');
  }, [savedUrl, activeTab]);

  const currentPath = TABS.find(t => t.id === activeTab)?.path ?? '/';
  const iframeSrc = savedUrl ? `${savedUrl.replace(/\/$/, '')}${currentPath}` : '';

  const handleSaveUrl = () => {
    let url = editingUrl.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    localStorage.setItem(STORAGE_KEY, url);
    setSavedUrl(url);
    setShowConfig(false);
    setIframeStatus('loading');
    toast({ title: 'URL salva!', description: 'Conectando ao Juris AI...' });
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
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-semibold">Juris AI</h2>
            <p className="text-sm text-muted-foreground">Análise de Jurisprudência com Inteligência Artificial</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Search,     label: `22+ Tribunais`,            desc: 'STJ, STF, TST, TJs, TRFs e TRTs' },
            { icon: Brain,      label: 'Análise por IA',           desc: 'Tese, fundamentos e argumentação' },
            { icon: BookMarked, label: 'Biblioteca pessoal',       desc: 'Salve e organize jurisprudências' },
            { icon: Gavel,      label: 'Análise de processos',     desc: 'Upload de peças e análise automática' },
          ].map(f => (
            <div key={f.label} className="border rounded-xl p-4 flex items-start gap-3">
              <f.icon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tribunais preview */}
        <div className="border rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tribunais cobertos</p>
          <div className="flex flex-wrap gap-1.5">
            {TRIBUNAIS.map(t => (
              <Badge key={t} variant="outline" className="text-[11px] border-blue-500/30 text-blue-600 dark:text-blue-400">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* URL config */}
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold">Conectar ao Juris AI</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole a URL onde o <strong>Juris AI</strong> está publicado (ex: Lovable, Vercel ou qualquer host).
          </p>
          <div className="flex gap-2">
            <Input
              value={editingUrl}
              onChange={e => setEditingUrl(e.target.value)}
              placeholder="https://juris-com-ai.lovable.app"
              onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
              className="flex-1"
            />
            <Button
              onClick={handleSaveUrl}
              disabled={!editingUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              Conectar
            </Button>
          </div>
          <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              O Juris AI usa <strong>React + Vite + Supabase</strong>. Publique pelo Lovable ou faça deploy
              manual com <code className="bg-muted px-1 rounded">npm run build</code> e cole a URL aqui.
              Repo: <span className="text-blue-500">github.com/KesiaDev/juris-com-ai</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open('https://github.com/KesiaDev/juris-com-ai', '_blank')}
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
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Juris AI</h2>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  iframeStatus === 'loaded'
                    ? 'border-green-500 text-green-600'
                    : iframeStatus === 'error'
                    ? 'border-red-500 text-red-500'
                    : 'border-blue-500 text-blue-600'
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
            onClick={() => handleOpenExternal('/?page=search')}
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="w-3.5 h-3.5" />
            Nova pesquisa
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenExternal('/?page=processos')}
            className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Analisar processo
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
      <div className="flex gap-1 border-b border-border">
        {TABS.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Carregando Juris AI...</p>
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
                <Button size="sm" onClick={() => handleOpenExternal()} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <ExternalLink className="w-4 h-4" />
                  Abrir em nova aba
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowConfig(true); setEditingUrl(savedUrl); }}>
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
          title="Juris AI"
          onLoad={() => setIframeStatus('loaded')}
          onError={() => setIframeStatus('error')}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>Pesquisa em tempo real em 22+ tribunais · Análise jurídica por IA</span>
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
