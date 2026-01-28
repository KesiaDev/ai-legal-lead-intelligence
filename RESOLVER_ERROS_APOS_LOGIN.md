# 🔧 RESOLVER ERROS APÓS LOGIN

## ❌ PROBLEMAS IDENTIFICADOS

Após fazer login, aparecem 2 erros principais:

### 1️⃣ FRONTEND USANDO URL ANTIGA

**Erro:**
- Console mostra requisições para `sdradvogados.up.railway.app`
- Deveria ser `api.sdrjuridico.com.br`

**Causa:**
- Variável `VITE_API_URL` não configurada no Vercel
- Ou frontend não foi redeployado após configurar

**Solução:**
👉 Ver arquivo: `CORRIGIR_FRONTEND_URL_ANTIGA.md`

### 2️⃣ TABELA PIPELINE NÃO EXISTE

**Erro:**
```
The table `public.Pipeline` does not exist in the current database.
```

**Causa:**
- Migration `20250120000000_add_pipelines_and_deals` não foi aplicada

**Solução:**
👉 Ver arquivo: `APLICAR_MIGRATION_PIPELINE.md`

## ✅ ORDEM DE CORREÇÃO (IMPORTANTE)

Execute na ordem:

### PASSO 1: Corrigir URL do Frontend (Railway)

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. **Identifique o service do FRONTEND** (pode ter nome como "Frontend", "legal-lead-scout", etc.)
4. Clique no service do frontend
5. Vá em **Variables** (aba lateral)
6. Adicione/Corrija:
   - Clique em **"+ New Variable"**
   - Name: `VITE_API_URL`
   - Value: `https://api.sdrjuridico.com.br`
   - Clique em **Add**
7. **Redeploy o frontend:**
   - Vá em **Deployments**
   - Clique nos **3 pontinhos** do último deployment
   - Selecione **Redeploy**
   - Aguarde 3-5 minutos
8. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

### PASSO 2: Aplicar Migration do Pipeline (Railway)

**OPÇÃO A: Forçar Restart do Backend (Mais Rápido)**

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. Vá no service do **backend**
4. Clique em **Restart**
5. Aguarde 30-60 segundos
6. Verifique os logs - deve aparecer:
   ```
   prisma migrate deploy
   prisma generate
   server listening
   ```

**OPÇÃO B: Aplicar Migration Manualmente (Se OPÇÃO A não funcionar)**

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. Vá no service do **PostgreSQL**
4. Clique em **Query**
5. Abra o arquivo: `backend/prisma/migrations/20250120000000_add_pipelines_and_deals/migration.sql`
6. Copie TODO o conteúdo
7. Cole no Query do Railway
8. Clique em **Run**

### PASSO 3: Verificar se Funcionou

1. **Limpe o cache do navegador novamente:**
   - `Ctrl + Shift + R`

2. **Abra o console (F12):**
   - Vá na aba **Network**
   - Recarregue a página

3. **Verifique:**
   - ✅ Requisições devem ir para `api.sdrjuridico.com.br` (não `sdradvogados.up.railway.app`)
   - ✅ Não deve aparecer erro 500 de "Pipeline table does not exist"
   - ✅ Dashboard deve carregar sem erros

## 🔍 DIAGNÓSTICO RÁPIDO

Se após os 3 passos ainda houver erros:

### Erro: "sdradvogados.up.railway.app" ainda aparece
→ **Problema:** Frontend não foi redeployado ou cache do navegador
→ **Solução:** 
   - Verifique se `VITE_API_URL` está configurado no **service do frontend** no Railway
   - Confirme que você está editando o service correto (frontend, não backend)
   - Force um novo deploy (Redeploy no Railway ou commit vazio + push)
   - Limpe cache do navegador completamente

### Erro: "Pipeline table does not exist" ainda aparece
→ **Problema:** Migration não foi aplicada
→ **Solução:**
   - Acesse o PostgreSQL no Railway
   - Execute manualmente a migration (OPÇÃO B acima)
   - Reinicie o backend

### Erro: 500 em `/api/agent/config` ou `/api/voice/config`
→ **Problema:** Auto-create não está funcionando ou `tenantId` inválido
→ **Solução:**
   - Verifique os logs do backend no Railway
   - Confirme que o JWT contém `tenantId`
   - Verifique se as tabelas `AgentConfig` e `VoiceConfig` existem

## 📝 NOTAS IMPORTANTES

1. **O código está correto:**
   - Frontend usa `import.meta.env.VITE_API_URL`
   - Backend aplica migrations automaticamente no boot
   - Auto-create está implementado

2. **Os problemas são de configuração/infraestrutura:**
   - Railway (service do frontend) precisa ter `VITE_API_URL` configurado
   - Railway (service do backend) precisa ter a migration aplicada

3. **Após corrigir:**
   - Tudo deve funcionar normalmente
   - Não será necessário fazer mais nada

## 🚀 RESULTADO ESPERADO

Após corrigir ambos os problemas:

✅ Frontend chama `api.sdrjuridico.com.br`  
✅ Tabela `Pipeline` existe no banco  
✅ Dashboard carrega sem erros  
✅ Funis de vendas funcionam  
✅ Configurações de agente funcionam  
✅ Configurações de voz funcionam  
