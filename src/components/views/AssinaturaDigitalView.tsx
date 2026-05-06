import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileSignature, ExternalLink, Settings, RefreshCw,
  LayoutDashboard, FileText, FolderOpen, LayoutTemplate,
  Plus, Eye, Link, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, ShieldCheck, Clock, Users,
} from 'lucide-react';

const STORAGE_KEY = 'assinacomia_url';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'documents', label: 'Documentos', path: '/documents', icon: FileText },
  { id: 'envelopes', label: 'Envelopes', path: '/envelopes', icon: FolderOpen },
  { id: 'templates', label: 'Templates', path: '/templates', icon: LayoutTemplate },
];

const QUICK_ACTIONS = [
  { label: 'Novo envelope', path: '/envelopes/new', icon: Plus, color: 'bg-amber-500 hover:bg-amber-600 text-black' },
  { label: 'Ver documentos', path: '/documents', icon: Eye, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { label: 'Novo template', path: '/templates', icon: LayoutTemplate, color: 'bg-violet-600 hover:bg-violet-700 text-white' },
];

export function AssinaturaDigitalView() {
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
    toast({ title: 'URL salva!', description: 'Conectando ao Assina com IA...' });
  };

  const handleQuickAction = (path: string) => {
    if (!savedUrl) { setShowConfig(true); return; }
    const url = `${savedUrl.replace(/\/$/, '')}${path}`;
    window.open(url, '_blank');
  };

  const handleOpenExternal = () => {
    if (!savedUrl) return;
    window.open(`${savedUrl.replace(/\/$/, '')}${currentPath}`, '_blank');
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
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <FileSignature className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-semibold">Assina com IA</h2>
            <p className="text-sm text-muted-foreground">Plataforma de assinatura digital PAdES/ICP-Brasil</p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ShieldCheck, label: 'PAdES/ICP-Brasil', desc: 'Assinatura com validade jurídica' },
            { icon: FolderOpen, label: 'Envelopes digitais', desc: 'Múltiplos signatários por documento' },
            { icon: LayoutTemplate, label: 'Templates', desc: 'Contratos prontos para reutilizar' },
            { icon: Clock, label: 'Auditoria completa', desc: 'Rastreabilidade de cada assinatura' },
          ].map(f => (
            <div key={f.label} className="border rounded-xl p-4 flex items-start gap-3">
              <f.icon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* URL config */}
        <div className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Conectar ao Assina com IA</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole a URL onde o <strong>Assina com IA</strong> está publicado (ex: Cloudflare Pages ou Workers).
          </p>
          <div className="flex gap-2">
            <Input
              value={editingUrl}
              onChange={e => setEditingUrl(e.target.value)}
              placeholder="https://assinacomia.pages.dev"
              onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
              className="flex-1"
            />
            <Button
              onClick={handleSaveUrl}
              disabled={!editingUrl.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black gap-2 flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
              Conectar
            </Button>
          </div>
          <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              O Assina com IA usa <strong>TanStack Start + Cloudflare Workers</strong>. Faça deploy com{' '}
              <code className="bg-muted px-1 rounded">wrangler deploy</code> e cole a URL aqui.
              O repositório é: <span className="text-amber-500">github.com/KesiaDev/assinacomia</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://github.com/KesiaDev/assinacomia', '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir repositório
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Assina com IA</h2>
              <Badge
                variant="outline"
                className={`text-[10px] ${iframeStatus === 'loaded' ? 'border-green-500 text-green-600' : iframeStatus === 'error' ? 'border-red-500 text-red-500' : 'border-amber-500 text-amber-600'}`}
              >
                {iframeStatus === 'loaded' ? '● Conectado' : iframeStatus === 'error' ? '● Erro' : '● Conectando...'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{savedUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick actions */}
          {QUICK_ACTIONS.map(a => (
            <Button
              key={a.label}
              size="sm"
              onClick={() => handleQuickAction(a.path)}
              className={`gap-1.5 text-xs ${a.color}`}
            >
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </Button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <Button type="button" size="sm" variant="ghost" onClick={handleRefresh} title="Recarregar">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleOpenExternal} title="Abrir em nova aba">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setShowConfig(true); setEditingUrl(savedUrl); }} title="Configurações">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {TABS.map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Iframe container */}
      <div className="relative flex-1 border rounded-xl overflow-hidden bg-muted/20 min-h-[500px]">
        {iframeStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Carregando Assina com IA...</p>
            </div>
          </div>
        )}
        {iframeStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="font-medium">Não foi possível carregar a plataforma</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                A plataforma pode bloquear exibição em iframe (X-Frame-Options). Tente abrir em nova aba.
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" onClick={handleOpenExternal} className="gap-2 bg-amber-500 hover:bg-amber-600 text-black">
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
          title="Assina com IA"
          allow="camera; microphone"
          onLoad={() => setIframeStatus('loaded')}
          onError={() => setIframeStatus('error')}
        />
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>Documentos assinados aqui têm validade jurídica PAdES/ICP-Brasil</span>
        </div>
        <button
          type="button"
          className="underline hover:text-foreground transition-colors"
          onClick={handleOpenExternal}
        >
          Abrir em tela cheia →
        </button>
      </div>
    </div>
  );
}
