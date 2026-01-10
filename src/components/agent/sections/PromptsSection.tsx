import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, MoreVertical } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PromptsSection() {
  const { prompts } = useAgent();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-semibold">Prompts do Agente</h2>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="orquestrador">Orquestrador</SelectItem>
                  <SelectItem value="qualificador">Qualificador</SelectItem>
                  <SelectItem value="followup">Follow Up</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os provedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os provedores</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="w-10">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-success/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-success" />
                      </div>
                      <span className="font-medium">{prompt.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{prompt.type}</TableCell>
                  <TableCell className="text-muted-foreground">{prompt.version}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={prompt.status === 'ativo' 
                        ? 'bg-success/20 text-success hover:bg-success/30' 
                        : 'bg-muted text-muted-foreground'
                      }
                    >
                      {prompt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{prompt.provider}</TableCell>
                  <TableCell className="text-muted-foreground">{prompt.model}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-accent rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Visualizar</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
