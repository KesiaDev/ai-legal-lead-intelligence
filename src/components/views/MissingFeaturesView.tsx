import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Zap, 
  Calendar, 
  Users, 
  MessageSquare, 
  ExternalLink,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  status: 'missing' | 'partial' | 'implemented';
  category: string;
}

const features: FeatureItem[] = [
  // Banco de Mídia
  { id: 'media-1', title: 'Banco de Mídia completo', description: 'Upload e gestão de imagens, vídeos, áudios e documentos com métricas de uso', status: 'partial', category: 'Mídia' },
  { id: 'media-2', title: 'Anexar mídia em mensagens', description: 'Usar arquivos do banco em follow-ups e lembretes', status: 'missing', category: 'Mídia' },
  
  // Gatilhos
  { id: 'trigger-1', title: 'Gatilhos por mensagem', description: 'Ativar agente com palavras-chave (exato, contém, etc.)', status: 'partial', category: 'Gatilhos' },
  { id: 'trigger-2', title: 'Gatilhos por formulário nativo', description: 'Formulários internos que disparam o agente', status: 'missing', category: 'Gatilhos' },
  { id: 'trigger-3', title: 'Gatilhos por intenção', description: 'Regras baseadas em intenções detectadas pela IA', status: 'missing', category: 'Gatilhos' },
  
  // Agenda / Follow-up
  { id: 'agenda-1', title: 'Follow-ups por contato', description: 'Tabela de follow-ups com status (pendentes, enviados, falhas)', status: 'implemented', category: 'Agenda' },
  { id: 'agenda-2', title: 'Cadência de mensagens', description: 'Intervalos configuráveis entre follow-ups', status: 'partial', category: 'Agenda' },
  { id: 'agenda-3', title: 'Lembretes dinâmicos (Prompt)', description: 'Lembretes gerados por IA com variáveis', status: 'partial', category: 'Agenda' },
  { id: 'agenda-4', title: 'Lembretes agendados por contato', description: 'Visualizar histórico de lembretes por lead', status: 'implemented', category: 'Agenda' },
  { id: 'agenda-5', title: 'Cancelar follow-ups em massa', description: 'Ação para cancelar todos os follow-ups pendentes', status: 'implemented', category: 'Agenda' },

  // Usuários e Departamentos
  { id: 'user-1', title: 'Departamentos', description: 'Organização de usuários em departamentos', status: 'implemented', category: 'Usuários' },
  { id: 'user-2', title: 'Integração WhatsApp por usuário', description: 'ChatGuru e Z-API configuráveis por operador', status: 'implemented', category: 'Usuários' },
  { id: 'user-3', title: 'Integração Voz por usuário', description: 'Voz ElevenLabs configurada por operador', status: 'partial', category: 'Usuários' },
  { id: 'user-4', title: 'Integração Calendário por usuário', description: 'Google Calendar e Outlook vinculados por usuário', status: 'implemented', category: 'Usuários' },
  { id: 'user-5', title: 'Integração CRM por usuário', description: 'Pipedrive, HubSpot, RD Station, Advbox por operador', status: 'implemented', category: 'Usuários' },

  // Canais e Integrações
  { id: 'channel-1', title: 'Multi-canal unificado', description: 'Central de Atendimento + API Oficial no mesmo painel', status: 'partial', category: 'Canais' },
  { id: 'channel-2', title: 'Relatórios de conversas', description: 'Métricas detalhadas por canal e período', status: 'implemented', category: 'Canais' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Mídia: <Image className="w-4 h-4" />,
  Gatilhos: <Zap className="w-4 h-4" />,
  Agenda: <Calendar className="w-4 h-4" />,
  Usuários: <Users className="w-4 h-4" />,
  Canais: <MessageSquare className="w-4 h-4" />,
};

const statusConfig = {
  missing: { label: 'Não implementado', variant: 'destructive' as const, icon: XCircle },
  partial: { label: 'Parcial', variant: 'secondary' as const, icon: Zap },
  implemented: { label: 'Implementado', variant: 'default' as const, icon: CheckCircle2 },
};

export function MissingFeaturesView() {
  const categories = [...new Set(features.map((f) => f.category))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Roadmap do Sistema
        </h2>
        <p className="text-muted-foreground mt-1">
          O que o SDR Jurídico já tem e o que ainda falta implementar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <XCircle className="w-4 h-4" />
              <span className="text-2xl font-bold text-destructive">
                {features.filter((f) => f.status === 'missing').length}
              </span>
            </div>
            <p className="text-sm font-medium mt-1">Não implementados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span className="text-2xl font-bold text-yellow-600">
                {features.filter((f) => f.status === 'partial').length}
              </span>
            </div>
            <p className="text-sm font-medium mt-1">Parciais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-2xl font-bold text-success">
                {features.filter((f) => f.status === 'implemented').length}
              </span>
            </div>
            <p className="text-sm font-medium mt-1">Implementados</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {categoryIcons[category]}
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {features
                  .filter((f) => f.category === category)
                  .map((feature) => {
                    const config = statusConfig[feature.status];
                    const Icon = config.icon;
                    return (
                      <div
                        key={feature.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{feature.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                        <Badge
                          variant={config.variant}
                          className="flex items-center gap-1 shrink-0"
                        >
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ExternalLink className="w-4 h-4" />
            <p className="text-sm">
              Referência: Expert Integrado / Super SDR. Este painel mostra o que precisamos evoluir para alcançar paridade de funcionalidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
