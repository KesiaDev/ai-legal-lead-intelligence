import { format, addDays, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import { useLeads } from '@/contexts/LeadsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEGAL_AREAS } from '@/types/lead';
import { cn } from '@/lib/utils';

export function ScheduleView() {
  const { leads } = useLeads();
  
  // Safe fallback for leads
  const safeLeads = leads || [];
  const scheduledLeads = safeLeads.filter(l => l.scheduledContact || l.availableForHumanContact);
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: ptBR });
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getLeadsForDay = (day: Date) => {
    return scheduledLeads.filter(lead => {
      if (!lead.scheduledContact) return false;
      return format(lead.scheduledContact, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Agendamentos
        </h2>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie os agendamentos de contato com leads.
        </p>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayLeads = getLeadsForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[200px] rounded-xl border p-3",
                isToday ? "border-secondary bg-secondary/5" : "border-border bg-card"
              )}
            >
              <div className="text-center mb-3">
                <p className={cn(
                  "text-xs font-medium uppercase",
                  isToday ? "text-secondary" : "text-muted-foreground"
                )}>
                  {format(day, 'EEE', { locale: ptBR })}
                </p>
                <p className={cn(
                  "text-lg font-semibold",
                  isToday ? "text-secondary" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </p>
              </div>

              <div className="space-y-2">
                {dayLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="p-2 bg-primary/10 rounded-lg text-xs"
                  >
                    <p className="font-medium text-foreground truncate">
                      {lead.name}
                    </p>
                    {lead.legalArea && (
                      <p className="text-muted-foreground truncate">
                        {LEGAL_AREAS[lead.legalArea]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Contact Requests */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-secondary" />
            Leads Aguardando Contato Humano
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduledLeads.filter(l => l.availableForHumanContact && !l.scheduledContact).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum lead aguardando contato no momento.
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledLeads
                .filter(l => l.availableForHumanContact && !l.scheduledContact)
                .map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {lead.legalArea && (
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {LEGAL_AREAS[lead.legalArea]}
                        </span>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Preferência: {lead.contactPreference || 'Não informado'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
