# 🏗️ ESTRUTURA DE IMPLEMENTAÇÃO
## Guia Prático para Evolução do SDR Jurídico

---

## 📁 ESTRUTURA DE PASTAS PROPOSTA

```
legal-lead-scout/
├── frontend/                    # React + Vite (atual)
│   ├── src/
│   │   ├── api/                 # ✨ NOVO: Cliente API
│   │   │   ├── client.ts        # Axios/Fetch configurado
│   │   │   ├── leads.ts         # Endpoints de leads
│   │   │   ├── conversations.ts # Endpoints de conversas
│   │   │   ├── ai.ts            # Endpoints de IA
│   │   │   └── auth.ts          # Autenticação
│   │   ├── hooks/               # ✨ NOVO: Hooks customizados
│   │   │   ├── useLeads.ts      # Hook para leads (substitui context)
│   │   │   ├── useConversation.ts
│   │   │   ├── usePipeline.ts
│   │   │   └── useRealtime.ts   # WebSocket hook
│   │   ├── services/
│   │   │   ├── aiService.ts     # ✏️ ATUALIZAR: Integração real
│   │   │   └── websocket.ts     # ✨ NOVO: WebSocket service
│   │   └── components/
│   │       ├── chat/
│   │       │   ├── ChatLive.tsx # ✨ NOVO: Substitui ChatSimulator
│   │       │   ├── ChatMessage.tsx
│   │       │   ├── ChatSidebar.tsx # ✨ NOVO: Painel lateral
│   │       │   └── ChatActions.tsx  # ✨ NOVO: Ações diretas
│   │       └── pipeline/
│   │           ├── PipelineView.tsx # ✨ NOVO
│   │           └── StageTransition.tsx
│   │
├── backend/                     # ✨ NOVO: Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts      # Prisma/TypeORM config
│   │   │   └── env.ts           # Variáveis de ambiente
│   │   ├── models/              # Modelos de dados
│   │   │   ├── Lead.ts
│   │   │   ├── Conversation.ts
│   │   │   ├── Message.ts
│   │   │   └── Pipeline.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── leads.routes.ts
│   │   │   ├── conversations.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── services/
│   │   │   ├── ai.service.ts    # Serviço de IA real
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── pipeline.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── tenant.middleware.ts
│   │   └── server.ts            # Entry point
│   │
└── database/                    # ✨ NOVO: Migrations
    ├── migrations/
    └── seeds/
```

---

## 🔄 MIGRAÇÃO DE CÓDIGO EXISTENTE

### **1. LeadsContext → API Hook**

**ANTES (Context):**
```typescript
// src/contexts/LeadsContext.tsx
const [leads, setLeads] = useState<Lead[]>(mockLeads);
```

**DEPOIS (Hook + API):**
```typescript
// src/hooks/useLeads.ts
export function useLeads() {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => leadsApi.getAll(),
  });
  
  const addLead = useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => queryClient.invalidateQueries(['leads']),
  });
  
  return { leads, isLoading, addLead };
}

// src/api/leads.ts
export const leadsApi = {
  getAll: () => api.get<Lead[]>('/leads'),
  create: (lead: CreateLeadDto) => api.post<Lead>('/leads', lead),
  update: (id: string, updates: UpdateLeadDto) => 
    api.patch<Lead>(`/leads/${id}`, updates),
};
```

### **2. ChatSimulator → ChatLive**

**ANTES:**
```typescript
// src/components/chat/ChatSimulator.tsx
// Simulador local, sem persistência
```

**DEPOIS:**
```typescript
// src/components/chat/ChatLive.tsx
export function ChatLive({ conversationId }: Props) {
  const { messages, sendMessage } = useConversation(conversationId);
  const { lead } = useLead(conversationId);
  const { isAI, takeOver, returnToAI } = useChatControl(conversationId);
  
  return (
    <div className="flex h-full">
      <ChatSidebar lead={lead} />
      <div className="flex-1">
        <ChatMessages messages={messages} />
        <ChatInput onSend={sendMessage} disabled={!isAI && !isAssigned} />
        <ChatActions 
          onSchedule={() => openScheduleModal()}
          onSendPayment={() => sendPaymentLink()}
        />
      </div>
    </div>
  );
}
```

### **3. aiService Simulado → IA Real**

**ANTES:**
```typescript
// src/services/aiService.ts
export async function analyzeMessage(message: string) {
  // Simulação com regex
  return simulateAPICall(result);
}
```

**DEPOIS:**
```typescript
// src/services/aiService.ts
export async function analyzeMessage(
  message: string,
  context: ConversationContext
): Promise<AIAnalysisResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(context),
      },
      {
        role: 'user',
        content: message,
      },
    ],
    functions: [
      {
        name: 'detect_intent',
        description: 'Detecta intenção do lead',
      },
      {
        name: 'qualify_lead',
        description: 'Qualifica lead usando SPIN',
      },
    ],
  });
  
  return parseAIResponse(response);
}
```

---

## 📊 MODELOS DE DADOS EXPANDIDOS

### **Lead Expandido**

```typescript
// src/types/lead.ts (ATUALIZADO)
export interface Lead {
  // Campos existentes
  id: string;
  name: string;
  phone: string;
  // ...
  
  // ✨ NOVOS CAMPOS
  origin: LeadOrigin; // 'whatsapp' | 'instagram' | 'site' | 'indicacao'
  estimatedTicket: number; // Valor estimado do caso
  tags: string[]; // Tags customizáveis
  caseType: string; // Tipo específico do caso
  riskScore: number; // 0-100
  riskLevel: 'baixo' | 'medio' | 'alto';
  pipelineStage: string; // ID do estágio atual
  assignedTo?: string; // ID do operador/advogado
  assignedType: 'ai' | 'human' | 'hybrid';
  
  // Histórico de pipeline
  pipelineHistory: PipelineTransition[];
}

export interface PipelineTransition {
  id: string;
  fromStage: string;
  toStage: string;
  userId: string;
  reason?: string;
  notes?: string;
  createdAt: Date;
}
```

### **Conversation (NOVO)**

```typescript
// src/types/conversation.ts (NOVO)
export interface Conversation {
  id: string;
  leadId: string;
  channel: 'whatsapp' | 'instagram' | 'site' | 'chat';
  status: 'active' | 'paused' | 'closed';
  assignedTo?: string;
  assignedType: 'ai' | 'human' | 'hybrid';
  slaDeadline?: Date;
  messages: Message[];
  metadata: {
    firstResponseTime?: number;
    averageResponseTime?: number;
    satisfactionScore?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderType: 'lead' | 'ai' | 'human';
  senderId?: string;
  isAI: boolean;
  metadata?: {
    intent?: string;
    aiAnalysis?: AIAnalysisResult;
    attachments?: Attachment[];
  };
  createdAt: Date;
}
```

---

## 🔌 INTEGRAÇÕES PROPOSTAS

### **1. WhatsApp Business API**

```typescript
// backend/src/services/whatsapp.service.ts
export class WhatsAppService {
  async sendMessage(to: string, message: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        }),
      }
    );
    return response.json();
  }
  
  async handleWebhook(payload: any) {
    // Processar mensagem recebida
    // Criar/atualizar conversa
    // Enviar para IA se necessário
  }
}
```

### **2. OpenAI Integration**

```typescript
// backend/src/services/ai.service.ts
import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;
  
  async analyzeMessage(message: string, context: Context) {
    const prompt = this.buildPrompt(message, context);
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      functions: INTENT_FUNCTIONS,
      temperature: 0.7,
    });
    
    return this.parseResponse(response);
  }
  
  async qualifyLead(conversation: Conversation) {
    // Implementar qualificação SPIN
    // Usar few-shot learning com casos de sucesso
  }
}
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: FUNDAÇÃO**

#### **Backend Setup**
- [ ] Criar projeto Node.js + TypeScript
- [ ] Configurar Express/Fastify
- [ ] Setup Prisma/TypeORM
- [ ] Criar schema de banco de dados
- [ ] Configurar migrations
- [ ] Setup variáveis de ambiente

#### **Autenticação**
- [ ] Implementar JWT
- [ ] Criar middleware de autenticação
- [ ] Implementar refresh tokens
- [ ] Criar rotas de login/registro

#### **Multi-tenancy**
- [ ] Adicionar campo `tenant_id` em todas as tabelas
- [ ] Criar middleware de tenant
- [ ] Implementar isolamento de dados

#### **API Básica**
- [ ] CRUD de Leads
- [ ] CRUD de Conversas
- [ ] CRUD de Mensagens
- [ ] Endpoints de Pipeline

### **FASE 2: CORE**

#### **Chat Real**
- [ ] WebSocket server
- [ ] Cliente WebSocket no frontend
- [ ] Componente ChatLive
- [ ] Painel lateral com contexto
- [ ] Controle IA vs Humano

#### **Pipeline**
- [ ] Componente PipelineView
- [ ] Transições de estágio
- [ ] Histórico de mudanças
- [ ] Integração com dashboard

#### **IA Real**
- [ ] Integração OpenAI
- [ ] Substituir aiService simulado
- [ ] Detecção de intenção
- [ ] Análise de área jurídica

### **FASE 3: ENTERPRISE**

#### **Controle Operacional**
- [ ] Botões assumir/devolver
- [ ] Transferência entre operadores
- [ ] SLA configurável
- [ ] Alertas de espera

#### **Ações Diretas**
- [ ] Modal de agendamento
- [ ] Integração pagamento
- [ ] Envio de contratos
- [ ] Solicitação de documentos

#### **Relatórios**
- [ ] Conversão por área
- [ ] Conversão por origem
- [ ] Tempo médio até agendamento
- [ ] Taxa de comparecimento
- [ ] Taxa de fechamento
- [ ] Performance IA vs Humano

---

## 🚀 COMANDOS ÚTEIS

### **Setup Inicial**

```bash
# Backend
cd backend
npm init -y
npm install express prisma @prisma/client
npm install -D @types/node @types/express typescript ts-node

# Database
npx prisma init
npx prisma migrate dev --name init

# Frontend (atualizar)
cd frontend
npm install @tanstack/react-query axios socket.io-client
```

### **Desenvolvimento**

```bash
# Backend
npm run dev

# Frontend
npm run dev

# Database
npx prisma studio
```

---

## 📚 RECURSOS E DOCUMENTAÇÃO

### **APIs Externas**
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [OpenAI API](https://platform.openai.com/docs)
- [Google Calendar API](https://developers.google.com/calendar)

### **Bibliotecas Recomendadas**
- **Backend:** Express, Prisma, Socket.io, JWT
- **Frontend:** React Query, Axios, Socket.io-client
- **IA:** OpenAI SDK, LangChain (opcional)

---

*Documento complementar ao ANALISE_EVOLUCAO_SDR_JURIDICO.md*
