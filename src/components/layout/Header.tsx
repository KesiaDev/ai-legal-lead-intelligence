import { Bell, Search, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLeads } from '@/contexts/LeadsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { leads } = useLeads();
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const urgentCount = leads.filter((l: any) => l.status === 'urgente' || l.urgency === 'alta').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                {getUserInitials()}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                {tenant && (
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {tenant.name}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
