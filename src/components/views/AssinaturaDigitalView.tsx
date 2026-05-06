import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  FileSignature, ExternalLink, Settings, ShieldCheck,
  FolderOpen, LayoutTemplate, Clock, Star, CheckCircle2,
  ChevronRight, LayoutDashboard, FileText, AlertCircle,
  Plus, Users,
} from 'lucide-react';

const STORAGE_KEY = 'assinacomia_url';
const DEFAULT_URL  = 'https://assinacomia.lovable.app';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',   path: '/dashboard',         icon: LayoutDashboard },
  { id: 'envelopes',  label: 'Envelopes',   path: '/envelopes',         icon: FolderOpen },
  { id: 'new',        label: 'Novo envelope',path: '/envelopes/new',    icon: Plus },
  { id: 'documents',  label: 'Documentos',  path: '/documents',         icon: FileText },
  { id: 'templates',  label: 'Templates',   path: '/templates',         icon: LayoutTemplate },
];

export function AssinaturaDigitalView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState<'portal' | 'app' | 'config'>('portal');
  const [moduleUrl, setModuleUrl] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { localStorage.setItem(STORAGE_KEY, DEFAULT_URL); }
    return stored || DEFAULT_URL;
  });
  const [urlInput, setUrlInput] = useState(moduleUrl);

  const openExternal = (path?: string) =>
    window.open(`${moduleUrl.replace(/\/$/, '')}${path ?? (TABS.find(t => t.id === activeTab)?.path ?? '/dashboard')}`, '_blank');

  const handleSave = () => {
    let url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) url = 'https://' + url;
    localStorage.setItem(STORAGE_KEY, url);
    setModuleUrl(url);
    setMode('portal');
    toast({ title: 'URL salva!', description: url });
  };

  if (mode === 'config') {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Configurar URL — Assina com IA</h3>
            <p className="text-xs text-muted-foreground">URL atual: {moduleUrl}</p>
          </div>
        </div>
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex gap-2">
            <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://assinacomia.lovable.app" onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <Button onClick={handleSave} disabled={!urlInput.trim()} className="bg-amber-500 hover:bg-amber-600 text-black flex-shrink-0">Salvar</Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMode('portal')}>← Voltar</Button>
      </div>
    );
  }

  if (mode === 'app') {
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <FileSignature className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-sm">Assina com IA</span>
            <Badge className="bg-amber-500 text-black text-[10px]">● Ativo</Badge>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t.id ? 'bg-amber-500 text-black' : 'text-muted-foreground hover:bg-muted'
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
            src={`${moduleUrl.replace(/\/$/, '')}${TABS.find(t => t.id === activeTab)?.path ?? '/dashboard'}`}
            className="w-full h-full border-0"
            title="Assina com IA"
            allow="camera; microphone"
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <FileSignature className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-bold">Assina com IA</h2>
              <Badge className="bg-amber-500 text-black gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Módulo Ativo
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Assinatura digital com validade jurídica · PAdES/ICP-Brasil
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openExternal('/envelopes/new')} className="bg-amber-500 hover:bg-amber-600 text-black gap-2">
            <Plus className="w-4 h-4" />
            Novo envelope
          </Button>
          <Button onClick={() => setMode('app')} variant="outline" className="gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Abrir módulo
          </Button>
          <Button onClick={() => setMode('config')} variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Envelopes enviados', value: '—',  icon: FolderOpen,     color: 'text-amber-500' },
          { label: 'Documentos assinados', value: '—', icon: FileSignature, color: 'text-emerald-500' },
          { label: 'Templates criados', value: '—',   icon: LayoutTemplate, color: 'text-blue-500' },
          { label: 'Signatários únicos', value: '—',  icon: Users,          color: 'text-violet-500' },
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
              { icon: ShieldCheck,    label: 'Validade jurídica PAdES/ICP-Brasil', desc: 'Padrão aceito em todo o território nacional' },
              { icon: FolderOpen,     label: 'Envelopes com múltiplos signatários', desc: 'Ordem de assinatura configurável' },
              { icon: LayoutTemplate, label: 'Templates reutilizáveis',             desc: 'Contratos e documentos prontos para usar' },
              { icon: Clock,          label: 'Auditoria completa',                  desc: 'Log de cada ação e assinatura com timestamp' },
              { icon: FileSignature,  label: 'Verificação de documentos',           desc: 'QR Code e hash para validação pública' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileSignature className="w-4 h-4 text-amber-500" />
            Como funciona
          </h3>
          <div className="space-y-3">
            {[
              { step: '1', label: 'Crie o envelope', desc: 'Faça upload do documento ou use um template' },
              { step: '2', label: 'Adicione signatários', desc: 'Informe nome, e-mail e ordem de assinatura' },
              { step: '3', label: 'Envie para assinar', desc: 'Os signatários recebem um link seguro por e-mail' },
              { step: '4', label: 'Assinatura digital', desc: 'Cada parte assina com certificado ICP-Brasil' },
              { step: '5', label: 'Documento finalizado', desc: 'PDF assinado e auditado disponível para download' },
            ].map(f => (
              <div key={f.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {f.step}
                </div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Novo envelope',        path: '/envelopes/new', icon: Plus,          color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
            { label: 'Ver envelopes',         path: '/envelopes',     icon: FolderOpen,    color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' },
            { label: 'Documentos assinados',  path: '/documents',     icon: FileText,      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
            { label: 'Templates',             path: '/templates',     icon: LayoutTemplate,color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
            { label: 'Dashboard',             path: '/dashboard',     icon: LayoutDashboard,color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
            { label: 'Abrir completo',        path: '/dashboard',     icon: ExternalLink,  color: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20' },
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
    </div>
  );
}
