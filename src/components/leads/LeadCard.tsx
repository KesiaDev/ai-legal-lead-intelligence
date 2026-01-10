import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { Lead, LEGAL_AREAS, URGENCY_LABELS } from '@/types/lead';
import { LeadStatusBadge } from './LeadStatusBadge';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  selected?: boolean;
}

export function LeadCard({ lead, onClick, selected }: LeadCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "card-elevated rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-xl animate-slide-up",
        selected && "ring-2 ring-secondary"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{lead.name}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            {lead.phone}
          </div>
        </div>
        <LeadStatusBadge status={lead.status} />
      </div>

      {lead.legalArea && (
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">
            {LEGAL_AREAS[lead.legalArea]}
          </span>
          {lead.urgency && (
            <span className={cn(
              "inline-block px-2.5 py-1 text-xs font-medium rounded-md ml-2",
              lead.urgency === 'alta' && "bg-urgent/10 text-urgent",
              lead.urgency === 'media' && "bg-warning/10 text-warning",
              lead.urgency === 'baixa' && "bg-muted text-muted-foreground",
            )}>
              Urgência: {URGENCY_LABELS[lead.urgency]}
            </span>
          )}
        </div>
      )}

      {lead.demandDescription && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {lead.demandDescription}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          {lead.city && lead.state && (
            <>
              <MapPin className="w-3 h-3" />
              {lead.city}, {lead.state}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {lead.messages.length}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(lead.updatedAt, { addSuffix: true, locale: ptBR })}
          </div>
        </div>
      </div>
    </div>
  );
}
