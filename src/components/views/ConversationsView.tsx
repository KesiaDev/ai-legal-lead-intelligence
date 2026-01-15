import { useState } from 'react';
import { ChatLive } from '@/components/chat/ChatLive';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot, Shield, Clock } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { conversationsApi } from '@/api/conversations';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function ConversationsView() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { leads } = useLeads();

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleStartNewConversation = async () => {
    // Pegar primeiro lead disponível ou criar um novo
    const firstLead = leads[0];
    if (!firstLead) {
      // TODO: Mostrar modal para criar lead primeiro
      return;
    }

    try {
      // Verificar se já existe conversa para este lead
      const existing = await conversationsApi.getAll({ leadId: firstLead.id });
      if (existing.data.conversations.length > 0) {
        setSelectedConversationId(existing.data.conversations[0].id);
        return;
      }

      // Criar nova conversa
      const newConversation = await conversationsApi.create({
        leadId: firstLead.id,
        channel: 'chat',
        assignedType: 'ai',
      });
      setSelectedConversationId(newConversation.data.conversation.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Chat ao Vivo
          </h2>
          <p className="text-muted-foreground mt-1">
            Atendimento em tempo real com leads
          </p>
        </div>
        <Button onClick={handleStartNewConversation}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Lista de Conversas */}
        <ConversationsList
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />

        {/* Chat Live */}
        <div className="flex-1">
          <ChatLive
            conversationId={selectedConversationId}
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
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
  );
}
