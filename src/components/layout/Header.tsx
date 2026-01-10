import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLeads } from '@/contexts/LeadsContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { leads } = useLeads();
  const urgentCount = leads.filter(l => l.status === 'urgente').length;

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-display font-semibold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar leads..."
            className="pl-10 w-64 bg-background"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-urgent text-urgent-foreground text-xs rounded-full flex items-center justify-center font-medium">
              {urgentCount}
            </span>
          )}
        </Button>

        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
          AD
        </div>
      </div>
    </header>
  );
}
