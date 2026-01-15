# 🚂 Configuração do Backend no Railway

## Problema Atual
O Railway está deployando o **frontend** (raiz do projeto), mas precisamos do **backend** rodando.

## Solução: Criar Serviço Backend no Railway

### Opção 1: Serviço Separado (Recomendado)

1. **No Railway Dashboard:**
   - Clique em "New" → "GitHub Repo"
   - Selecione o mesmo repositório `legal-lead-scout`
   - Railway vai detectar o projeto

2. **Configure o Root Directory:**
   - Vá em Settings → Root Directory
   - Defina: `backend`
   - Isso faz o Railway focar na pasta backend

3. **Configure as Variáveis de Ambiente:**
   - Vá em Variables
   - Adicione todas as variáveis do `.env`:
     ```
     DATABASE_URL=postgresql://postgres:senha@postgres.railway.internal:5432/railway
     JWT_SECRET=sua-chave-super-segura-com-mais-de-32-caracteres-123456789
     PORT=3001
     NODE_ENV=production
     CORS_ORIGIN=https://seu-frontend.railway.app
     OPENAI_API_KEY=
     ```

4. **Configure o Build:**
   - O Railway vai usar automaticamente `npm install && npm run build`
   - E iniciar com `npm start`

### Opção 2: Usar railway.json na pasta backend

Os arquivos `backend/railway.json` e `backend/nixpacks.toml` já foram criados.

## Checklist de Deploy

- [ ] Serviço backend criado no Railway
- [ ] Root Directory = `backend`
- [ ] Variáveis de ambiente configuradas
- [ ] PostgreSQL conectado ao serviço backend
- [ ] Build passando
- [ ] Servidor iniciando corretamente

## Verificar Logs

No Railway, vá em Deploy Logs e verifique:
- ✅ Build completo
- ✅ `npm run db:generate` executado
- ✅ `npm run build` executado
- ✅ `npm start` iniciando
- ✅ `🚀 Server running on http://localhost:3001`

## Erros Comuns

1. **"Application failed to respond"**
   - Backend não está rodando
   - Verifique os logs de deploy
   - Verifique se as variáveis de ambiente estão corretas

2. **"Can't reach database"**
   - Verifique se o PostgreSQL está conectado ao serviço backend
   - Verifique a DATABASE_URL

3. **"Invalid environment variables"**
   - JWT_SECRET precisa ter 32+ caracteres
   - Todas as variáveis obrigatórias devem estar configuradas
