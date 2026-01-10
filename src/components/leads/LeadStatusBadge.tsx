import { cn } from '@/lib/utils';
import { LeadStatus, STATUS_LABELS } from '@/types/lead';

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span className={cn(
      "status-badge",
      status === 'frio' && "status-cold",
      status === 'qualificado' && "status-qualified",
      status === 'urgente' && "status-urgent",
      status === 'pronto' && "status-ready",
      className
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}
