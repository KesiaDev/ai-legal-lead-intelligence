# 🚀 SETUP FASE 1 - SDR Jurídico

Guia completo para configurar e executar a Fase 1 do projeto.

---

## 📋 PRÉ-REQUISITOS

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- Conta OpenAI (opcional por enquanto)

---

## 🗄️ SETUP DO BANCO DE DADOS

### 1. Criar banco de dados PostgreSQL

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE sdr_juridico;

# Sair
\q
```

### 2. Configurar variáveis de ambiente do backend

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sdr_juridico?schema=public"
JWT_SECRET="sua-chave-secreta-super-longa-aqui-minimo-32-caracteres"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="sk-sua-chave-openai"  # Opcional por enquanto
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

---

## ⚙️ SETUP DO BACKEND

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Executar migrations

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrations (cria todas as tabelas)
npm run db:migrate
```

### 3. (Opcional) Abrir Prisma Studio

```bash
npm run db:studio
```

Isso abrirá uma interface visual para ver os dados no banco.

### 4. Iniciar servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

---

## 🎨 SETUP DO FRONTEND

### 1. Instalar dependências

```bash
# Na raiz do projeto
npm install
```

Isso instalará o `axios` que foi adicionado.

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001
```

### 3. Iniciar frontend

```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

---

## ✅ TESTAR A INTEGRAÇÃO

### 1. Registrar primeiro usuário

Faça uma requisição POST para `http://localhost:3001/register`:

```bash
curl -X POST http://localhost:3001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "name": "Admin",
    "password": "senha123",
    "tenantName": "Escritório Teste"
  }'
```

Isso retornará um token JWT. Salve esse token.

### 2. Testar API de Leads

```bash
# Listar leads (substitua TOKEN pelo token recebido)
curl -X GET http://localhost:3001/leads \
  -H "Authorization: Bearer TOKEN"
```

### 3. Criar um lead

```bash
curl -X POST http://localhost:3001/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "phone": "(11) 99999-1234",
    "email": "joao@teste.com",
    "city": "São Paulo",
    "state": "SP",
    "legalArea": "trabalhista",
    "urgency": "alta",
    "lgpdConsent": true
  }'
```

---

## 🔧 ESTRUTURA CRIADA

### Backend (`backend/`)
```
backend/
├── src/
│   ├── config/          # Database, env
│   ├── middleware/      # Auth, tenant
│   ├── routes/          # API routes
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
└── package.json
```

### Frontend (`src/`)
```
src/
├── api/                 # Cliente API
│   ├── client.ts
│   ├── leads.ts
│   ├── conversations.ts
│   ├── auth.ts
│   └── pipeline.ts
├── hooks/               # React Query hooks
│   ├── useLeads.ts
│   └── useConversation.ts
└── contexts/
    └── LeadsContext.tsx # Atualizado para usar API
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@prisma/client'"

```bash
cd backend
npm run db:generate
```

### Erro: "Database connection failed"

Verifique:
1. PostgreSQL está rodando
2. `DATABASE_URL` no `.env` está correto
3. Credenciais estão corretas

### Erro: "JWT_SECRET must be at least 32 characters"

Edite `backend/.env` e use uma chave mais longa.

### Frontend não conecta ao backend

1. Verifique se backend está rodando em `http://localhost:3001`
2. Verifique `VITE_API_URL` no `.env` do frontend
3. Verifique CORS no backend (`CORS_ORIGIN`)

---

## 📝 PRÓXIMOS PASSOS

Após setup completo:

1. ✅ Backend rodando
2. ✅ Frontend conectado
3. ⏳ Criar componente ChatLive
4. ⏳ Atualizar Dashboard
5. ⏳ Implementar WebSocket completo

---

## 🎯 CHECKLIST DE VALIDAÇÃO

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `sdr_juridico` criado
- [ ] Backend `.env` configurado
- [ ] Backend dependências instaladas
- [ ] Migrations executadas
- [ ] Backend rodando em `:3001`
- [ ] Frontend `.env` configurado
- [ ] Frontend dependências instaladas
- [ ] Frontend rodando em `:5173`
- [ ] Registro de usuário funcionando
- [ ] Criação de lead funcionando
- [ ] Listagem de leads funcionando

---

*Documento criado para Fase 1 - Setup Inicial*
