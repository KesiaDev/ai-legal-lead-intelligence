import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Scale, ExternalLink, Settings, Search, Brain,
  BookMarked, Gavel, Star, CheckCircle2, ChevronRight,
  LayoutDashboard, FileText, History, BookOpen, SlidersHorizontal,
  Plus, AlertCircle, Lock,
} from 'lucide-react';

const STORAGE_KEY = 'jurisai_url';

const TABS = [
  { id: 'dashboard', label: 'Dashboard',        path: '/?page=dashboard',            icon: LayoutDashboard },
  { id: 'search',    label: 'Pesquisar',         path: '/?page=search',               icon: Search },
  { id: 'processos', label: 'Analisar Processo', path: '/?page=processos',            icon: FileText },
  { id: 'history',   label: 'Meus Processos',    path: '/?page=processos-historico',  icon: History },
  { id: 'library',   label: 'Biblioteca',        path: '/?page=library',              icon: BookOpen },
  { id: 'settings',  label: 'Configurações',     path: '/?page=settings',             icon: SlidersHorizontal },
];

const TRIBUNAIS = [
  'STJ','STF','TST','TJ-SP','TJ-RJ','TJ-MG','TJ-RS','TJ-PR',
  'TJ-SC','TJ-BA','TJ-GO','TRF1','TRF2','TRF3','TRF4','TRF5',
  'TRT2','TRT4','TRT15','TJDFT','TJ-CE','TJ-PE',
];

export function JurisAIView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('search');
  const [mode, setMode] = useState<'portal' | 'app' | 'config'>('portal');
  const [moduleUrl, setModuleUrl] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [urlInput, setUrlInput] = useState(moduleUrl);

  const isConfigured = !!moduleUrl;

  const openExternal = (path?: string) => {
    const url = moduleUrl || urlInput;
    if (!url) return;
    window.open(`${url.replace(/\/$/, '')}${path ?? (TABS.find(t => t.id === activeTab)?.path ?? '/')}`, '_blank');
  };

  const handleSave = () => {
    let url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    localStorage.setItem(STORAGE_KEY, url);
    setModuleUrl(url);
    setMode('portal');
    toast({ title: 'Juris AI configurado!', description: url });
  };

  if (mode === 'config') {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold">Configurar URL — Juris AI</h3>
            <p className="text-xs text-muted-foreground">Informe a URL onde o módulo está publicado</p>
          </div>
        </div>
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Para publicar o Juris AI via Lovable:</p>
              <ol className="list-decimal list-inside space-y-0.5 pl-1">
                <li>Acesse <span className="text-blue-500">lovable.dev</span> e abra o projeto <strong>juris-com-ai</strong></li>
                <li>Clique em <strong>Share → Publish</strong></li>
                <li>Cole a URL gerada abaixo</li>
              </ol>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              placeholder="https://juris-com-ai.lovable.app"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <Button onClick={handleSave} disabled={!urlInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
              Salvar
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMode('portal')}>← Voltar</Button>
      </div>
    );
  }

  if (mode === 'app' && isConfigured) {
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-sm">Juris AI</span>
            <Badge className="bg-blue-600 text-white text-[10px]">● Ativo</Badge>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t.id ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1" />
            <Button type="button" size="sm" variant="ghost" onClick={() => openExternal()}>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode('portal')}>
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 border rounded-xl overflow-hidden min-h-[550px] bg-muted/10">
          <iframe
            src={`${moduleUrl}${TABS.find(t => t.id === activeTab)?.path ?? '/'}`}
            className="w-full h-full border-0"
            title="Juris AI"
            onError={() => openExternal()}
          />
        </div>
      </div>
    );
  }

  // Portal view
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-bold">Juris AI</h2>
              {isConfigured ? (
                <Badge className="bg-blue-600 text-white gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Módulo Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500 text-amber-600 gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Aguardando publicação
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5">
              Análise de Jurisprudência com IA · 22+ Tribunais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <>
              <Button onClick={() => openExternal('/?page=search')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Search className="w-4 h-4" />
                Nova pesquisa
              </Button>
              <Button onClick={() => setMode('app')} variant="outline" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Abrir módulo
              </Button>
            </>
          ) : (
            <Button onClick={() => setMode('config')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Settings className="w-4 h-4" />
              Configurar acesso
            </Button>
          )}
        </div>
      </div>

      {!isConfigured && (
        <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm text-amber-700 dark:text-amber-400">Módulo aguardando publicação</p>
            <p className="text-xs text-muted-foreground mt-1">
              Publique o Juris AI no Lovable e clique em "Configurar acesso" para ativar.
            </p>
          </div>
          <Button size="sm" onClick={() => setMode('config')} variant="outline" className="ml-auto flex-shrink-0 border-amber-500 text-amber-600">
            Configurar
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tribunais cobertos', value: '22+', icon: Gavel,      color: 'text-blue-500' },
          { label: 'Pesquisas realizadas', value: '—',  icon: Search,     color: 'text-violet-500' },
          { label: 'Salvos na biblioteca', value: '—',  icon: BookMarked, color: 'text-emerald-500' },
          { label: 'Análises por IA', value: '—',       icon: Brain,      color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="border rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-6 h-6 ${s.color}`} />
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Features */}
        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Funcionalidades
          </h3>
          <div className="space-y-3">
            {[
              { icon: Search,     label: 'Busca multi-tribunal em tempo real', desc: 'Resultados diretos dos sites dos tribunais' },
              { icon: Brain,      label: 'Análise estratégica por IA',         desc: 'Tese central, fundamentos e argumentação' },
              { icon: BookMarked, label: 'Biblioteca pessoal',                 desc: 'Salve e organize as melhores jurisprudências' },
              { icon: FileText,   label: 'Análise de processos',               desc: 'Upload de peças e análise automática por IA' },
              { icon: Scale,      label: 'Filtro por área jurídica',           desc: 'Civil, Trabalhista, Penal, Tributário e mais' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tribunais */}
        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Gavel className="w-4 h-4 text-blue-500" />
            Tribunais cobertos
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {TRIBUNAIS.map(t => (
              <Badge key={t} variant="outline" className="text-[11px] border-blue-500/30 text-blue-600 dark:text-blue-400">
                {t}
              </Badge>
            ))}
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              Busca em paralelo em todos os tribunais. Resultados em segundos com relevância por IA.
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {isConfigured && (
        <div className="border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Ações rápidas</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Nova pesquisa',       path: '/?page=search',               icon: Search,     color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
              { label: 'Analisar processo',   path: '/?page=processos',            icon: FileText,   color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
              { label: 'Minha biblioteca',    path: '/?page=library',              icon: BookOpen,   color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
              { label: 'Histórico',           path: '/?page=processos-historico',  icon: History,    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
              { label: 'Configurações',       path: '/?page=settings',             icon: SlidersHorizontal, color: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20' },
              { label: 'Abrir completo',      path: '/',                           icon: ExternalLink, color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20' },
            ].map(a => (
              <button
                type="button"
                key={a.label}
                onClick={() => openExternal(a.path)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${a.color}`}
              >
                <a.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{a.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
