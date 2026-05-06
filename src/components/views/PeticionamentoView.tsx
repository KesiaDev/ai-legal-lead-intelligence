import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FilePen, ExternalLink, Settings, Mic, Gavel,
  FileCheck, ScrollText, Briefcase, Users, Bell,
  CheckCircle2, Star, Lock, ChevronRight,
  LayoutDashboard, FileText, FolderOpen, SlidersHorizontal, Plus,
} from 'lucide-react';

const MODULE_URL = 'https://peticionamentocomia.lovable.app';

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',     path: '/dashboard',          icon: LayoutDashboard },
  { id: 'new',          label: 'Nova Petição',   path: '/ai/documents/new',   icon: Plus },
  { id: 'documents',   label: 'Documentos',     path: '/ai/documents',       icon: FileText },
  { id: 'cases',        label: 'Processos',      path: '/cases',              icon: FolderOpen },
  { id: 'clients',      label: 'Clientes',       path: '/clients',            icon: Users },
  { id: 'publications', label: 'Publicações',    path: '/publications',       icon: Bell },
  { id: 'aiconfig',     label: 'Config. IA',     path: '/settings?tab=ai',   icon: SlidersHorizontal },
];

const DOCUMENT_TYPES = [
  'Petição Inicial', 'Contestação', 'Réplica', 'Reconvenção',
  'Apelação', 'Agravo de Instrumento', 'Agravo Interno',
  'Embargos de Declaração', 'Recurso Especial', 'Recurso Extraordinário',
  'Contrato', 'Notificação Extrajudicial', 'Requerimento',
  'Parecer Jurídico', 'Procuração', 'Alegações Finais', 'Petição Simples', 'Outro',
];

export function PeticionamentoView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mode, setMode] = useState<'portal' | 'app'>('portal');

  const openExternal = (path = '/dashboard') =>
    window.open(`${MODULE_URL}${path}`, '_blank');

  if (mode === 'app') {
    return (
      <div className="flex flex-col gap-3 h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FilePen className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="font-semibold text-sm">Peticionamento com IA</span>
            <Badge className="bg-emerald-600 text-white text-[10px]">● Ativo</Badge>
          </div>
          <div className="flex items-center gap-2">
            {TABS.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === t.id
                    ? 'bg-emerald-500 text-black'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <t.icon className="w-3 h-3" />
                {t.label}
              </button>
            ))}
            <div className="w-px h-5 bg-border" />
            <Button type="button" size="sm" variant="ghost" onClick={() => openExternal(TABS.find(t => t.id === activeTab)?.path)}>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setMode('portal')}>
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 border rounded-xl overflow-hidden min-h-[550px] bg-muted/10">
          <iframe
            src={`${MODULE_URL}${TABS.find(t => t.id === activeTab)?.path ?? '/dashboard'}`}
            className="w-full h-full border-0"
            title="Peticionamento com IA"
            allow="camera; microphone"
            onError={() => openExternal(TABS.find(t => t.id === activeTab)?.path)}
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FilePen className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-display font-bold">Peticionamento com IA</h2>
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Módulo Ativo
              </Badge>
            </div>
            <p className="text-muted-foreground mt-0.5">
              Geração automática de peças jurídicas com Inteligência Artificial
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => openExternal('/ai/documents/new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova petição
          </Button>
          <Button
            onClick={() => setMode('app')}
            variant="outline"
            className="gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Abrir módulo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tipos de peças', value: '18', icon: FileText, color: 'text-emerald-500' },
          { label: 'Clientes cadastrados', value: '—', icon: Users, color: 'text-blue-500' },
          { label: 'Documentos gerados', value: '—', icon: FilePen, color: 'text-violet-500' },
          { label: 'Processos ativos', value: '—', icon: Briefcase, color: 'text-amber-500' },
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

      {/* Features + Doc types */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Funcionalidades
          </h3>
          <div className="space-y-3">
            {[
              { icon: Gavel,      label: '18 tipos de peças jurídicas',       desc: 'Petições, recursos, contratos e extrajudiciais' },
              { icon: Mic,        label: 'Preenchimento por voz',              desc: 'Fale os dados, a IA preenche o formulário' },
              { icon: ScrollText, label: 'Editor jurídico completo',           desc: 'Com busca de jurisprudência integrada' },
              { icon: FileCheck,  label: 'Gestão de clientes e processos',     desc: 'Vinculados automaticamente aos documentos' },
              { icon: Bell,       label: 'Publicações do diário oficial',      desc: 'Monitoramento automático de intimações' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Peças disponíveis
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {DOCUMENT_TYPES.map(t => (
              <Badge key={t} variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="border rounded-xl p-5">
        <h3 className="font-semibold mb-4">Ações rápidas</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Nova petição',        path: '/ai/documents/new',   icon: Plus,          color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
            { label: 'Ver documentos',      path: '/ai/documents',       icon: FileText,      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
            { label: 'Gerenciar clientes',  path: '/clients',            icon: Users,         color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
            { label: 'Meus processos',      path: '/cases',              icon: FolderOpen,    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
            { label: 'Publicações',         path: '/publications',       icon: Bell,          color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20' },
            { label: 'Config. IA',          path: '/settings?tab=ai',    icon: SlidersHorizontal, color: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20' },
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
