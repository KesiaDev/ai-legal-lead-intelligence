import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function KnowledgeBaseSection() {
  const { knowledgeBase, removeKnowledgeItem } = useAgent();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-semibold">Base de Conhecimento</h2>
        <Button className="bg-success hover:bg-success/90">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Itens da Base de Conhecimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {knowledgeBase.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Criado em {format(item.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeKnowledgeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {knowledgeBase.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum item na base de conhecimento</p>
              <p className="text-sm">Adicione documentos para o agente usar como referência</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
