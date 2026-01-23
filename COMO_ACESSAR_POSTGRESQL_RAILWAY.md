# Como Acessar PostgreSQL no Railway

## 🎯 Método Mais Fácil: Usar o Endpoint da API

**Não precisa acessar o PostgreSQL diretamente!** Use o endpoint que criamos:

### Passo 1: Abra o Console do Navegador
1. Na página de **Integrações** (onde está o erro)
2. Pressione **F12** (ou clique com botão direito → "Inspecionar")
3. Vá na aba **"Console"**

### Passo 2: Execute o Comando
Cole e execute este comando:

```javascript
fetch('https://api.sdrjuridico.com.br/api/apply-migrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: 'fix-migration-2026' })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resultado:', data);
  if (data.success) {
    alert('Migration aplicada com sucesso! Recarregue a página.');
  } else {
    alert('Erro: ' + JSON.stringify(data));
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('Erro ao aplicar migration: ' + err.message);
});
```

### Passo 3: Recarregue a Página
Após ver a mensagem de sucesso, recarregue a página (F5) e tente salvar a chave da OpenAI novamente.

---

## 🔧 Método Alternativo: Acessar PostgreSQL no Railway

Se preferir acessar diretamente o PostgreSQL:

### Opção 1: Via Railway Dashboard (Mais Fácil)

1. **Acesse:** https://railway.app
2. **Faça login** na sua conta
3. **Selecione o projeto** "SDR Advogados" ou similar
4. **Encontre o serviço do PostgreSQL:**
   - Procure por um serviço com ícone de banco de dados (🔷)
   - Ou um serviço chamado "Postgres" / "PostgreSQL"
5. **Clique no serviço do PostgreSQL**
6. **Na aba "Data":**
   - Você verá uma seção "Connect" ou "Query"
   - Clique em **"Query"** ou **"Open in pgAdmin"** ou **"Open in TablePlus"**
7. **Ou use a aba "Variables":**
   - Copie a variável `DATABASE_URL`
   - Use em um cliente PostgreSQL (DBeaver, pgAdmin, etc.)

### Opção 2: Via Railway CLI

1. **Instale o Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Faça login:**
   ```bash
   railway login
   ```

3. **Conecte ao projeto:**
   ```bash
   railway link
   ```

4. **Acesse o PostgreSQL:**
   ```bash
   railway connect postgres
   ```

### Opção 3: Via URL de Conexão

1. **No Railway Dashboard:**
   - Vá para o serviço PostgreSQL
   - Aba **"Variables"**
   - Copie o valor de `DATABASE_URL`

2. **Use um cliente PostgreSQL:**
   - **DBeaver** (gratuito): https://dbeaver.io/
   - **pgAdmin** (gratuito): https://www.pgadmin.org/
   - **TablePlus** (pago, mas tem trial): https://tableplus.com/

3. **Cole a `DATABASE_URL`** no cliente

---

## 🚀 Método Recomendado: Usar o Endpoint

**O método mais fácil é usar o endpoint `/api/apply-migrations`** que criamos. Não precisa acessar o PostgreSQL diretamente!

---

## 📝 SQL para Executar Manualmente (se necessário)

Se mesmo assim quiser executar manualmente, use este SQL:

```sql
-- Criar tabela AgentConfig
CREATE TABLE IF NOT EXISTS "AgentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "communicationConfig" JSONB,
    "followUpConfig" JSONB,
    "scheduleConfig" JSONB,
    "humanizationConfig" JSONB,
    "knowledgeBase" JSONB,
    "intentions" JSONB,
    "templates" JSONB,
    "funnelStages" JSONB,
    "lawyers" JSONB,
    "rotationRules" JSONB,
    "reminders" JSONB,
    "eventConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- Criar índices
CREATE UNIQUE INDEX IF NOT EXISTS "AgentConfig_tenantId_key" ON "AgentConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "AgentConfig_tenantId_idx" ON "AgentConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "AgentConfig_isActive_idx" ON "AgentConfig"("isActive");

-- Adicionar foreign key
ALTER TABLE "AgentConfig" ADD CONSTRAINT "AgentConfig_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## ✅ Verificar se Funcionou

Após aplicar a migration (por qualquer método):

1. **Recarregue a página** (F5)
2. **Tente salvar a chave da OpenAI novamente**
3. **Verifique o console** - não deve ter mais erros 500
4. **A chave deve ser salva com sucesso**

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique os logs do Railway:**
   - Vá no serviço do backend
   - Aba "Deployments"
   - Clique no último deploy
   - Veja os logs para erros

2. **Verifique se a migration foi aplicada:**
   - Execute no console do navegador:
   ```javascript
   fetch('https://api.sdrjuridico.com.br/api/apply-migrations', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ secret: 'fix-migration-2026' })
   })
   .then(r => r.json())
   .then(console.log)
   ```

3. **Se der erro 401:** A chave secreta está incorreta
4. **Se der erro 500:** Verifique os logs do Railway
