# Backend API - SDR Jurídico

Backend API construído com Fastify, PostgreSQL e Prisma.

## 🚀 Setup Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite `.env` com suas configurações:
- `DATABASE_URL`: URL do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (mínimo 32 caracteres)
- `OPENAI_API_KEY`: Chave da API OpenAI (opcional por enquanto)

### 3. Setup do banco de dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrations
npm run db:migrate

# (Opcional) Abrir Prisma Studio para visualizar dados
npm run db:studio
```

### 4. Iniciar servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm run build
npm start
```

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (database, env)
│   ├── middleware/      # Middlewares (auth, tenant)
│   ├── routes/          # Rotas da API
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Schema do banco de dados
└── package.json
```

## 🔌 Endpoints

### Autenticação
- `POST /register` - Registrar novo tenant e usuário
- `POST /login` - Login
- `GET /me` - Obter usuário atual

### Leads
- `GET /leads` - Listar leads
- `GET /leads/:id` - Obter lead por ID
- `POST /leads` - Criar lead
- `PATCH /leads/:id` - Atualizar lead
- `DELETE /leads/:id` - Deletar lead

### Conversas
- `GET /conversations` - Listar conversas
- `GET /conversations/:id` - Obter conversa por ID
- `POST /conversations` - Criar conversa
- `POST /conversations/:id/messages` - Enviar mensagem
- `PATCH /conversations/:id` - Atualizar conversa

### Pipeline
- `GET /pipeline/stages` - Listar estágios
- `POST /leads/:id/transition` - Transicionar lead
- `GET /leads/:id/transitions` - Histórico de transições

### WebSocket
- `WS /ws/:conversationId` - Chat ao vivo

## 🔐 Autenticação

Todas as rotas (exceto `/register`, `/login`, `/health`) requerem autenticação via JWT.

Envie o token no header:
```
Authorization: Bearer <token>
```

## 📊 Banco de Dados

O schema está em `prisma/schema.prisma`. Principais modelos:

- **Tenant**: Multi-tenancy
- **User**: Usuários do sistema
- **Lead**: Leads jurídicos
- **Conversation**: Conversas
- **Message**: Mensagens
- **PipelineStage**: Estágios do pipeline
- **PipelineTransition**: Transições de estágio

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Database
npm run db:migrate      # Criar migration
npm run db:generate     # Gerar cliente Prisma
npm run db:studio       # Abrir Prisma Studio
npm run db:seed         # Popular banco (quando implementado)

# Produção
npm start
```

## 📝 Próximos Passos

1. ✅ Estrutura básica criada
2. ⏳ Implementar seed de dados iniciais
3. ⏳ Integração OpenAI
4. ⏳ WebSocket completo para chat
5. ⏳ Integração WhatsApp
