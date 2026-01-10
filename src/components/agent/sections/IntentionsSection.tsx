import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function IntentionsSection() {
  const { intentions, agent } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Intenções</h2>
          <p className="text-muted-foreground">{agent.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-primary border-primary">
            <Filter className="w-4 h-4 mr-2" />
            Funil CRM
          </Button>
          <Button className="bg-success hover:bg-success/90">
            <Plus className="w-4 h-4 mr-2" />
            Criar intenção
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {intentions.map((intention) => (
          <Card key={intention.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium">{intention.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-accent rounded">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Editar</DropdownMenuItem>
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {intention.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {intention.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Ações:</p>
                {intention.actions.length > 0 ? (
                  <ul className="space-y-0.5">
                    {intention.actions.map((action, index) => (
                      <li key={index} className="text-xs text-primary flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhuma ação configurada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
