# ⚡ Resolver Migration Falhada - AGORA

## 🎯 Solução Rápida via Railway CLI

### **Passo 1: Login no Railway**

```bash
railway login
```

Isso vai abrir o navegador para você fazer login.

### **Passo 2: Conectar ao Projeto**

```bash
railway link
```

Selecione o projeto **"SDR Advogados"** quando perguntado.

### **Passo 3: Executar o SQL de Correção**

```bash
cd backend
railway run psql $DATABASE_URL -f fix-migration-direct.sql
```

---

## 🎯 Se Railway CLI Não Funcionar

### **Opção: Copiar SQL e Executar Manualmente**

1. **Abra o arquivo:** `backend/fix-migration-direct.sql`
2. **Copie TODO o conteúdo**
3. **No Railway Dashboard:**
   - Vá em **"Data"** → **"Postgres"**
   - Procure por **"Query"**, **"SQL"**, **"Execute"** ou similar
   - Se não encontrar, tente clicar em uma tabela e procurar por opções de SQL
4. **Cole o SQL completo e execute**

---

## 🎯 Método Alternativo: Via Endpoint (Após Deploy)

Se o deploy do endpoint `/api/fix-migration` já foi feito:

1. **Fazer login na plataforma**
2. **Obter token** (via DevTools ou API)
3. **Executar:**
   ```bash
   curl -X POST https://sdradvogados.up.railway.app/api/fix-migration \
     -H "Authorization: Bearer SEU_TOKEN" \
     -H "Content-Type: application/json"
   ```

---

## ✅ O Que o SQL Faz

1. ✅ **Remove** a migration falhada do histórico
2. ✅ **Cria** as tabelas que faltam (Pipeline, Deal, CrmIntegration)
3. ✅ **Adiciona** colunas ao PipelineHistory
4. ✅ **Cria** índices necessários
5. ✅ **Adiciona** foreign keys
6. ✅ **Marca** a migration como aplicada

---

## 🔍 Verificar se Funcionou

Após executar, verifique:

```bash
railway run psql $DATABASE_URL -c "\dt"
```

Deve aparecer: `Pipeline`, `Deal`, `CrmIntegration`

Ou no Railway Dashboard → Data, deve aparecer essas tabelas.

---

## 🚨 IMPORTANTE

**Depois de resolver, o próximo deploy deve funcionar sem erros!**

Se ainda der erro, me avise qual erro apareceu.
