# 📋 Plano de Implementação - Chat ao Vivo

## 🎯 Objetivo

Implementar interface de Chat ao Vivo similar ao exemplo, com:
- Lista de conversas na sidebar
- Visualização de mensagens em tempo real
- Botões de ação (IA, Pausar, Não Qualificado, Agendado, etc.)
- Detecção de intenções
- Status de conversa

## ✅ Estrutura Atual (Não Quebrar)

- ✅ `ChatSimulator` - Simulador de conversa (manter)
- ✅ `ConversationsView` - View atual (manter ou substituir)
- ✅ Schema `Conversation` e `Message` no Prisma
- ✅ Endpoint `/api/agent/conversation` funcionando
- ✅ WebSocket já configurado no backend

## 🏗️ Nova Estrutura

### Frontend

1. **`ChatLiveView.tsx`** (Nova view principal)
   - Layout: Sidebar esquerda + Chat principal
   - Substitui ou complementa `ConversationsView`

2. **`ConversationsSidebar.tsx`** (Nova sidebar)
   - Lista de conversas
   - Busca e filtros
   - Indicadores de status

3. **`ChatMessages.tsx`** (Componente de mensagens)
   - Histórico de mensagens
   - Bubbles de chat
   - Mensagens do sistema
   - Detecção de intenções

4. **`ChatActions.tsx`** (Barra de ações)
   - Botão IA (ligar/desligar)
   - Botão Pausar
   - Botão Não Qualificado
   - Botão Agendado
   - Botão Transferir

### Backend

1. **`PATCH /api/conversations/:id/status`**
   - Atualizar status (active, paused, closed)

2. **`PATCH /api/conversations/:id/assigned-type`**
   - Atualizar tipo (ai, human, hybrid)

3. **`POST /api/conversations/:id/intentions`**
   - Registrar intenção detectada

4. **`POST /api/conversations/:id/messages`**
   - Enviar mensagem manual

## 🔄 Fluxo de Dados

```
Frontend → API → Backend → Database
         ↓
    WebSocket (tempo real)
```

## 📝 Implementação Incremental

1. ✅ Criar componentes básicos
2. ✅ Integrar com API existente
3. ✅ Adicionar ações
4. ✅ Adicionar WebSocket (opcional, depois)

## 🚫 Não Quebrar

- ✅ ChatSimulator continua funcionando
- ✅ Endpoints existentes continuam funcionando
- ✅ Schema do banco não muda
- ✅ Autenticação JWT mantida
