# 🚀 Como Aplicar Migration no Railway

## ⚠️ Problema

Você tentou rodar `npx prisma migrate dev` localmente, mas o banco está no Railway e não é acessível localmente.

## ✅ Solução: Aplicar Migration no Railway

### **Opção 1: Deploy Automático (Recomendado)**

O Railway vai aplicar a migration automaticamente quando você fizer push:

1. **Fazer commit e push:**
   ```bash
   git add .
   git commit -m "feat: adicionar sistema de funis de campanha e integrações CRM"
   git push origin main
   ```

2. **Railway aplica automaticamente:**
   - O script `postinstall` roda `prisma generate`
   - O script `db:migrate` roda `prisma migrate deploy` (se configurado)
   - Ou você pode configurar um script de deploy no Railway

### **Opção 2: Aplicar Manualmente via Railway CLI**

1. **Instalar Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Fazer login:**
   ```bash
   railway login
   ```

3. **Conectar ao projeto:**
   ```bash
   railway link
   ```

4. **Aplicar migration:**
   ```bash
   cd backend
   railway run npx prisma migrate deploy
   ```

### **Opção 3: Aplicar SQL Diretamente no Railway**

1. Acesse o Railway Dashboard
2. Vá no serviço do backend
3. Clique em **"Data"** ou **"Postgres"**
4. Abra o **"Query"** ou **"SQL Editor"**
5. Cole o conteúdo do arquivo `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
6. Execute o SQL

### **Opção 4: Usar Prisma Studio (Recomendado para desenvolvimento)**

1. **Conectar ao banco do Railway:**
   ```bash
   cd backend
   railway run npx prisma studio
   ```

2. Isso abre o Prisma Studio conectado ao banco do Railway

---

## 📋 Verificar se Migration Foi Aplicada

### **Via Railway Dashboard:**

1. Acesse o serviço do backend
2. Vá em **"Deployments"**
3. Veja os logs do último deploy
4. Procure por: `Prisma schema loaded` ou `Migration applied`

### **Via API/Health Check:**

A migration não afeta o health check, mas você pode testar os novos endpoints:

```bash
# Listar pipelines (deve retornar array vazio se não houver pipelines)
curl https://sdradvogados.up.railway.app/api/pipelines \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🔧 Configurar Deploy Automático no Railway

Se quiser que o Railway aplique migrations automaticamente:

1. No Railway Dashboard, vá em **Settings**
2. Adicione um script de deploy:
   - **Deploy Command:** `npm run db:migrate && npm start`
   - Ou configure um script separado

---

## ✅ Próximos Passos Após Migration

1. ✅ Migration aplicada
2. ✅ Prisma Client gerado (`prisma generate`)
3. ✅ Backend reiniciado
4. ✅ Testar endpoints de pipelines
5. ✅ Criar pipelines via API ou interface

---

## 🆘 Se Der Erro

### **Erro: "Migration already applied"**
- ✅ Tudo certo! A migration já foi aplicada

### **Erro: "Table already exists"**
- A migration foi aplicada parcialmente
- Você pode ignorar ou fazer rollback manual

### **Erro: "Connection timeout"**
- Verifique se o banco está ativo no Railway
- Verifique as variáveis de ambiente `DATABASE_URL`

---

**A migration SQL já está criada em:** `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`

Basta fazer commit e push! 🚀
