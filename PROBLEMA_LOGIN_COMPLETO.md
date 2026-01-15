# 🔴 PROBLEMA: Login/Autenticação Não Funciona

## 📋 RESUMO DO PROBLEMA

O frontend no Vercel (`legal-lead-scout.vercel.app`) está retornando:
- **404 Not Found** na rota `/login`
- **Tela branca** após tentar fazer login
- **Erro 500** do backend ao tentar `/login` ou `/register`

O backend no Railway (`sdradvogados.up.railway.app`) está:
- ✅ **Online e funcionando**
- ✅ **Health check** (`/health`) retorna 200 OK
- ✅ **Database conectado**
- ❌ **Erro 500** nas rotas `/login` e `/register`

---

## 🏗️ ARQUITETURA ATUAL

```
Frontend (Vercel)
├── URL: https://legal-lead-scout.vercel.app
├── Framework: React + Vite + TypeScript
├── Roteamento: React Router v6
└── Estado: React Context (AuthContext)

Backend (Railway)
├── URL: https://sdradvogados.up.railway.app
├── Framework: Fastify + TypeScript
├── Runtime: Node.js 18 (via tsx)
├── Database: PostgreSQL (Railway)
└── ORM: Prisma
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### Frontend

```
src/
├── App.tsx                    # Rotas principais
├── contexts/
│   └── AuthContext.tsx       # Context de autenticação
├── components/
│   └── auth/
│       ├── LoginView.tsx     # Tela de login/registro
│       └── ProtectedRoute.tsx # Proteção de rotas
└── api/
    ├── client.ts              # Axios configurado
    └── auth.ts                # API calls de autenticação
```

### Backend

```
backend/
├── src/
│   ├── server.ts              # Servidor principal
│   ├── config/
│   │   ├── env.ts             # Validação de variáveis
│   │   └── database.ts        # Prisma Client
│   └── prisma/
│       └── schema.prisma      # Schema do banco
├── package.json
└── nixpacks.toml              # Config Railway
```

---

## 🔧 CONFIGURAÇÕES ATUAIS

### Frontend (Vercel)

**Variáveis de Ambiente:**
```
VITE_API_URL=https://sdradvogados.up.railway.app
VITE_WS_URL=wss://sdradvogados.up.railway.app
```

**vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend (Railway)

**Variáveis de Ambiente:**
```
DATABASE_URL=postgresql://postgres:...@postgres.railway.internal:5432/railway
JWT_SECRET=uma-chave-super-segura-com-mais-de-32-caracteres-123456789
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://legal-lead-scout.vercel.app
OPENAI_API_KEY=
```

**package.json:**
```json
{
  "scripts": {
    "start": "tsx src/server.ts",
    "db:generate": "prisma generate",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "tsx": "^4.19.1",
    "fastify": "^4.28.1",
    "@fastify/cors": "^9.0.1",
    "@fastify/jwt": "^7.2.4",
    "@prisma/client": "^5.19.1",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.8"
  }
}
```

**nixpacks.toml:**
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm"]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run db:generate"]

[start]
cmd = "npm start"
```

---

## 📝 CÓDIGO ATUAL

### Frontend - src/App.tsx

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginView } from "@/components/auth/LoginView";
import Index from "./pages/Index";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);
```

### Frontend - src/api/client.ts

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://sdradvogados.up.railway.app';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Frontend - src/api/auth.ts

```typescript
import api from './client';

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  tenantName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>('/register', data),
  
  login: (data: LoginDto) =>
    api.post<AuthResponse>('/login', data),
  
  me: () =>
    api.get<{ user: any }>('/me'),
  
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
};
```

### Backend - src/server.ts (resumo)

```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import prisma from './config/database';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function build() {
  // CORS - suporta múltiplas origens
  const corsOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  await fastify.register(cors, {
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // POST /register
  fastify.post('/register', async (request: any, reply: any) => {
    try {
      const body = request.body as any;
      const { email, name, password, tenantName } = body || {};
      
      if (!email || !name || !password || !tenantName) {
        return reply.status(400).send({ error: 'Missing required fields' });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already registered' });
      }

      const tenant = await prisma.tenant.create({
        data: { name: tenantName },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email,
          name,
          password: hashedPassword,
          role: 'admin',
        },
      });

      const token = fastify.jwt.sign({ id: user.id, tenantId: tenant.id });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      };
    } catch (error: any) {
      fastify.log.error('Register error:', error);
      return reply.status(500).send({ 
        error: 'Failed to register',
        message: error.message || 'Internal server error'
      });
    }
  });

  // POST /login
  fastify.post('/login', async (request: any, reply: any) => {
    try {
      const body = request.body as any;
      const { email, password } = body || {};

      if (!email || !password) {
        return reply.status(400).send({ error: 'Email and password required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({ id: user.id, tenantId: user.tenantId });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
        },
      };
    } catch (error: any) {
      fastify.log.error('Login error:', error);
      return reply.status(500).send({ 
        error: 'Failed to login',
        message: error.message || 'Internal server error'
      });
    }
  });

  return fastify;
}

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    const app = await build();
    const PORT = Number(process.env.PORT) || Number(env.PORT) || 3001;
    
    await app.listen({
      port: PORT,
      host: '0.0.0.0',
    });

    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err: any) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
```

### Backend - src/config/env.ts

```typescript
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
}).catchall(z.any());

export const env = envSchema.parse(process.env);
```

### Backend - prisma/schema.prisma

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("user")
  isActive  Boolean  @default(true)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tenantId])
}

model Tenant {
  id        String   @id @default(uuid())
  name      String
  plan      String   @default("free")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users     User[]
  leads     Lead[]
}
```

---

## ❌ ERROS ENCONTRADOS

### 1. Frontend (Vercel)

**Erro 404 na rota `/login`:**
- O `vercel.json` está configurado corretamente
- O deploy foi feito várias vezes
- Ainda retorna 404

**Console do navegador:**
```
Failed to load resource: the server responded with a status of 500 ()
sdradvogados.up.railway.app/login:1

Failed to load resource: the server responded with a status of 404 ()
login:1

NotFoundError: Failed to execute 'removeChild' on 'Node'
```

### 2. Backend (Railway)

**Logs do Deploy:**
```
✅ Database connected
🚀 Server running on port 3001
🌐 Environment: production
🌐 CORS Origin: https://legal-lead-scout.vercel.app
```

**HTTP Logs:**
```
GET /health → 200 OK (70ms)
GET /favicon.ico → 404 (2ms)
```

**Problema:**
- Não aparecem logs de requisições POST para `/login` ou `/register`
- Quando testado, retorna erro 500

---

## 🔍 TENTATIVAS REALIZADAS

### 1. Configuração do Vercel
- ✅ Criado `vercel.json` com rewrites para SPA
- ✅ Variáveis de ambiente configuradas
- ✅ Múltiplos deploys realizados
- ❌ Ainda retorna 404

### 2. Configuração do Backend
- ✅ CORS configurado para aceitar origem do Vercel
- ✅ JWT configurado corretamente
- ✅ Prisma Client gerado
- ✅ Database conectado
- ✅ Health check funcionando
- ❌ Rotas `/login` e `/register` retornam 500

### 3. Código
- ✅ Tratamento de erros melhorado
- ✅ Logs adicionados
- ✅ Suporte a múltiplas origens CORS
- ✅ Validação de variáveis de ambiente
- ❌ Erro 500 persiste

### 4. Testes
- ✅ Health check funciona (`/health` → 200)
- ✅ Rota raiz funciona (`/` → JSON com info da API)
- ❌ `/login` → 500
- ❌ `/register` → 500

---

## 🧪 TESTES REALIZADOS

### Backend (via curl/browser)

```bash
# Health check - FUNCIONA
curl https://sdradvogados.up.railway.app/health
# Retorna: {"status":"ok","timestamp":"..."}

# Rota raiz - FUNCIONA
curl https://sdradvogados.up.railway.app/
# Retorna: JSON com informações da API

# Login - FALHA
curl -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
# Retorna: 500 Internal Server Error
```

### Frontend (Vercel)

- Acessar `https://legal-lead-scout.vercel.app/login`
- Resultado: **404 Not Found** (página do Vercel)
- Console: Erros de 500 e 404

---

## 📊 STATUS ATUAL

| Componente | Status | Detalhes |
|------------|--------|----------|
| Backend Railway | ✅ Online | Servidor rodando, DB conectado |
| Health Check | ✅ Funciona | `/health` retorna 200 |
| Rota Raiz | ✅ Funciona | `/` retorna JSON |
| CORS | ✅ Configurado | Origin do Vercel permitida |
| Database | ✅ Conectado | Prisma Client funcionando |
| Login/Register | ❌ Erro 500 | Não funciona |
| Frontend Vercel | ❌ 404 | Rota `/login` não encontrada |
| Autenticação | ❌ Quebrada | Não consegue fazer login |

---

## 🤔 HIPÓTESES

1. **Fastify não está parseando JSON body:**
   - Pode precisar do plugin `@fastify/formbody` ou similar
   - O `request.body` pode estar vindo como `undefined`

2. **Prisma Schema não está sincronizado:**
   - As migrations podem não ter sido aplicadas
   - O schema pode estar diferente do banco

3. **Vercel não está servindo SPA corretamente:**
   - O `vercel.json` pode não estar sendo aplicado
   - Pode precisar de configuração adicional

4. **CORS preflight:**
   - Requisições POST podem estar sendo bloqueadas no preflight
   - Pode precisar configurar OPTIONS

---

## 🎯 OBJETIVO

Fazer com que:
1. ✅ Frontend no Vercel carregue a rota `/login` sem 404
2. ✅ Backend no Railway aceite requisições POST para `/login` e `/register`
3. ✅ Login e registro funcionem end-to-end
4. ✅ Usuário seja redirecionado para dashboard após login

---

## 📦 DEPENDÊNCIAS

### Frontend
- react: ^18.3.1
- react-router-dom: ^6.30.1
- axios: ^1.6.0
- @tanstack/react-query: ^5.83.0

### Backend
- fastify: ^4.28.1
- @fastify/cors: ^9.0.1
- @fastify/jwt: ^7.2.4
- @prisma/client: ^5.19.1
- bcryptjs: ^2.4.3
- tsx: ^4.19.1
- zod: ^3.23.8

---

## 🔗 URLs IMPORTANTES

- **Frontend:** https://legal-lead-scout.vercel.app
- **Backend:** https://sdradvogados.up.railway.app
- **Health Check:** https://sdradvogados.up.railway.app/health
- **GitHub:** https://github.com/KesiaDev/legal-lead-scout

---

## 📝 NOTAS ADICIONAIS

- O backend está rodando com `tsx` (TypeScript direto, sem build)
- O frontend está usando Vite para build
- Ambos estão em produção (não desenvolvimento local)
- O problema persiste mesmo após múltiplos deploys
- Os logs do Railway não mostram erros específicos nas rotas de auth

---

**Data:** 15 de Janeiro de 2026
**Última atualização:** Após múltiplas tentativas de correção
