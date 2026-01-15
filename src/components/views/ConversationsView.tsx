import { ChatSimulator } from '@/components/chat/ChatSimulator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot, Shield, Clock } from 'lucide-react';

export function ConversationsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Simulador de Conversa
        </h2>
        <p className="text-muted-foreground mt-1">
          Teste o fluxo de atendimento automatizado do SDR Jurídico.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Simulator */}
        <ChatSimulator />

        {/* Info Cards */}
        <div className="space-y-4">
          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Atendimento 24/7</CardTitle>
                  <CardDescription>Nunca perca um lead</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                O SDR Jurídico atende leads a qualquer hora, qualificando e organizando 
                as demandas para que você foque no que importa.
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Compliance Total</CardTitle>
                  <CardDescription>LGPD e Ética OAB</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Todas as conversas seguem as diretrizes da OAB. Nunca prometemos 
                resultados jurídicos ou oferecemos consultoria direta.
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Follow-up Automático</CardTitle>
                  <CardDescription>Cadência inteligente</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mensagens de acompanhamento são enviadas automaticamente após 24h, 
                48h e 72h sem resposta, de forma cordial e não invasiva.
              </p>
            </CardContent>
          </Card>

          <Card className="card-elevated border-secondary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-display text-base">Qualificação Jurídica</CardTitle>
                  <CardDescription>Leads prontos para atendimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Identificamos área do Direito, urgência e detalhes da demanda antes 
                de encaminhar para o advogado responsável.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
