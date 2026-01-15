import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, MapPin, Calendar, Tag, AlertTriangle, User, FileText } from 'lucide-react';
import { Lead } from '@/types/lead';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEGAL_AREAS, URGENCY_LABELS, STATUS_LABELS } from '@/types/lead';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  lead: Lead | null;
  isLoading?: boolean;
}

export function ChatSidebar({ lead, isLoading }: ChatSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-80 border-r border-border bg-card p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="w-80 border-r border-border bg-card p-4">
        <p className="text-muted-foreground text-sm text-center py-8">
          Nenhum lead selecionado
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-display font-semibold text-lg text-foreground">
          {lead.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {lead.phone}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Status e Urgência */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Status
              </p>
              <Badge variant="outline">
                {STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS] || lead.status}
              </Badge>
            </div>
            {lead.urgency && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  Urgência
                </p>
                <Badge
                  className={cn(
                    lead.urgency === 'alta' && 'bg-urgent/10 text-urgent',
                    lead.urgency === 'media' && 'bg-warning/10 text-warning',
                    lead.urgency === 'baixa' && 'bg-success/10 text-success',
                  )}
                >
                  {URGENCY_LABELS[lead.urgency]}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Lead */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lead.legalArea && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Área do Direito</p>
                  <p className="text-sm font-medium">
                    {lead.legalArea === 'outra' && lead.customLegalArea
                      ? lead.customLegalArea
                      : LEGAL_AREAS[lead.legalArea as keyof typeof LEGAL_AREAS] || lead.legalArea}
                  </p>
                </div>
              </div>
            )}
            {lead.city && lead.state && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Localização</p>
                  <p className="text-sm font-medium">
                    {lead.city}, {lead.state}
                  </p>
                </div>
              </div>
            )}
            {lead.contactPreference && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Preferência</p>
                  <p className="text-sm font-medium">{lead.contactPreference}</p>
                </div>
              </div>
            )}
            {lead.scheduledContact && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Agendado para</p>
                  <p className="text-sm font-medium">
                    {format(new Date(lead.scheduledContact), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demanda */}
        {lead.demandDescription && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {lead.demandDescription}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {(lead as any).tags && (lead as any).tags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(lead as any).tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
          <p>
            Criado em: {format(new Date(lead.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          <p>
            Atualizado: {format(new Date(lead.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
    </div>
  );
}
