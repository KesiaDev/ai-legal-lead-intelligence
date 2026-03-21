import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageCircle, FileInput, Target, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TriggersSection() {
  const [keywords, setKeywords] = useState<string[]>(['Quero conhecer o Super SDR']);
  const [keywordInput, setKeywordInput] = useState('');
  const [openSections, setOpenSections] = useState<string[]>(['whatsapp-central', 'whatsapp-api']);

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const setSectionOpen = (id: string, open: boolean) => {
    setOpenSections((prev) =>
      open ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((s) => s !== id)
    );
  };

  const TriggerSection = ({
    id,
    title,
    subtitle,
    defaultOpen = true,
  }: {
    id: string;
    title: string;
    subtitle?: string;
    defaultOpen?: boolean;
  }) => (
    <Collapsible
      open={openSections.includes(id)}
      onOpenChange={(open) => setSectionOpen(id, open)}
      defaultOpen={defaultOpen}
    >
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {title}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      openSections.includes(id) && 'rotate-180'
                    )}
                  />
                </CardTitle>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <Label>Mensagem de Ativação</Label>
              <Select defaultValue="specific">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific">Mensagem Específica</SelectItem>
                  <SelectItem value="any">Qualquer mensagem</SelectItem>
                  <SelectItem value="first">Primeira mensagem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de gatilho</Label>
              <Select defaultValue="exact">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Igual a (exato)</SelectItem>
                  <SelectItem value="contains">Contém</SelectItem>
                  <SelectItem value="starts">Começa com</SelectItem>
                  <SelectItem value="ends">Termina com</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Palavras-chave</Label>
              <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="cursor-pointer pr-1"
                      onClick={() => removeKeyword(i)}
                    >
                      {kw}
                      <span className="ml-1 hover:text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite e pressione Enter"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={addKeyword}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground flex items-center gap-2">
          Gatilhos
          <span className="text-muted-foreground cursor-help" title="Configure gatilhos automáticos para o seu agente">ℹ️</span>
        </h2>
        <p className="text-muted-foreground mt-1">
          Configure gatilhos automáticos para o seu agente
        </p>
      </div>

      <Tabs defaultValue="message" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Formulário Nativo
          </TabsTrigger>
          <TabsTrigger value="message" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Mensagem
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2" disabled>
            <FileInput className="w-4 h-4" />
            Formulários Externos
            <Badge variant="secondary" className="ml-1 text-xs">em breve</Badge>
          </TabsTrigger>
          <TabsTrigger value="intentions" className="flex items-center gap-2" disabled>
            <Target className="w-4 h-4" />
            Intenções
            <Badge variant="secondary" className="ml-1 text-xs">em breve</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-12">
                Configure gatilhos baseados em formulários nativos. Em desenvolvimento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="message" className="mt-6 space-y-4">
          <TriggerSection
            id="whatsapp-central"
            title="Central de Atendimento WhatsApp (Chatguru)"
            subtitle="Ative o agente quando o lead enviar mensagens específicas"
          />
          <TriggerSection
            id="whatsapp-api"
            title="Disparador API Oficial WhatsApp (Chatguru)"
            subtitle="Ative o agente via API oficial do WhatsApp"
          />
          <TriggerSection
            id="restart"
            title="Reinício de Conversa"
            subtitle="Permite ao lead reiniciar a conversa enviando a palavra 'reiniciar'"
            defaultOpen={false}
          />
        </TabsContent>

        <TabsContent value="external" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-12">
                Integração com formulários externos. Em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intentions" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-12">
                Gatilhos baseados em intenções detectadas. Em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
