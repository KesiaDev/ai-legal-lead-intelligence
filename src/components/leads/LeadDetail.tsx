import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Clock,
  Shield,
  User,
  FileText
} from 'lucide-react';
import { Lead, LEGAL_AREAS, URGENCY_LABELS, STATUS_LABELS } from '@/types/lead';
import { LeadStatusBadge } from './LeadStatusBadge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  return (
    <div className="card-elevated rounded-xl h-full flex flex-col animate-slide-up">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-display font-semibold text-foreground">
              {lead.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeadStatusBadge status={lead.status} />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            {lead.legalArea && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Área do Direito
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {lead.legalArea === 'outra' && lead.customLegalArea
                    ? lead.customLegalArea
                    : LEGAL_AREAS[lead.legalArea as LegalArea] || lead.legalArea}
                </p>
              </div>
            )}
            {lead.urgency && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Urgência
                </p>
                <p className={cn(
                  "mt-1 font-medium",
                  lead.urgency === 'alta' && "text-urgent",
                  lead.urgency === 'media' && "text-warning",
                  lead.urgency === 'baixa' && "text-muted-foreground",
                )}>
                  {URGENCY_LABELS[lead.urgency]}
                </p>
              </div>
            )}
            {lead.city && lead.state && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Localização
                </p>
                <div className="mt-1 flex items-center gap-1 text-foreground">
                  <MapPin className="w-4 h-4" />
                  {lead.city}, {lead.state}
                </div>
              </div>
            )}
            {lead.contactPreference && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Preferência de Contato
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {lead.contactPreference}
                </p>
              </div>
            )}
          </div>

          {/* Demand Description */}
          {lead.demandDescription && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Descrição da Demanda
              </p>
              <p className="text-foreground bg-muted/50 p-4 rounded-lg">
                {lead.demandDescription}
              </p>
            </div>
          )}

          <Separator />

          {/* LGPD Consent */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <Shield className={cn(
              "w-5 h-5",
              lead.lgpdConsent ? "text-success" : "text-destructive"
            )} />
            <div>
              <p className="font-medium text-foreground">
                {lead.lgpdConsent ? 'Consentimento LGPD Registrado' : 'Sem Consentimento LGPD'}
              </p>
              {lead.lgpdConsentDate && (
                <p className="text-sm text-muted-foreground">
                  {format(lead.lgpdConsentDate, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Messages History */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Histórico de Mensagens ({lead.messages.length})
            </p>
            <div className="space-y-3">
              {lead.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] p-3 rounded-xl",
                    message.sender === 'lead' 
                      ? "bg-muted ml-auto"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    message.sender === 'lead' ? "text-muted-foreground" : "text-primary-foreground/70"
                  )}>
                    {format(message.timestamp, "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-ups */}
          {lead.followUps.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Follow-ups Programados
                </p>
                <div className="space-y-2">
                  {lead.followUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          followUp.status === 'pending' && "bg-warning/10 text-warning",
                          followUp.status === 'sent' && "bg-muted text-muted-foreground",
                          followUp.status === 'responded' && "bg-success/10 text-success",
                        )}>
                          {followUp.status === 'pending' && 'Pendente'}
                          {followUp.status === 'sent' && 'Enviado'}
                          {followUp.status === 'responded' && 'Respondido'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(followUp.scheduledFor, "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{followUp.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t border-border">
            <p>
              Criado em: {format(lead.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p>
              Última atualização: {format(lead.updatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
