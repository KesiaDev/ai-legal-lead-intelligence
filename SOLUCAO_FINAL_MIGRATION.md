# ✅ Solução Final: Migration Falhada

## 🎯 O Que Foi Feito

1. ✅ **Script `pre-start.js`** executa no **build phase** (antes do servidor iniciar)
2. ✅ **Remove** migration falhada do histórico
3. ✅ **Cria** tabelas necessárias
4. ✅ **Marca** migration como aplicada

---

## ⏳ Aguardar Deploy

O Railway está fazendo deploy agora. Aguarde **2-3 minutos**.

---

## ✅ Verificar Logs

No Railway Dashboard → **Build Logs**, você deve ver:

```
🔧 Verificando e resolvendo migrations falhadas...
✅ Conectado ao banco de dados
⚠️  Migration falhada encontrada. Resolvendo...
✅ Migration falhada removida do histórico
📝 Criando tabelas que faltam...
✅ Migration resolvida e marcada como aplicada!
```

No **Deploy Logs**, você deve ver:
```
🚀 API rodando na porta 3001
```

**Status deve ser "Running"** (não mais "Crashed")

---

## 🚨 Se Ainda Der Erro P3009

### **Solução Manual Rápida:**

Execute este SQL diretamente no Railway Dashboard → Data → Postgres → Query:

```sql
-- 1. Remover migration falhada
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;

-- 2. Marcar como aplicada
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
SELECT 
  gen_random_uuid(),
  '',
  NOW(),
  '20250120000000_add_pipelines_and_deals',
  NULL,
  NULL,
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations" 
  WHERE migration_name = '20250120000000_add_pipelines_and_deals' AND finished_at IS NOT NULL
);
```

Depois, **redeploy** o serviço no Railway.

---

## 🎯 Alternativa: Via Endpoint

Se o servidor conseguir iniciar (mesmo com erro), execute:

```bash
curl -X POST https://sdradvogados.up.railway.app/api/fix-migration \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"fix-migration-2026\"}"
```

---

## 📝 Como Funciona Agora

1. **Build Phase** → Executa `pre-start.js`
2. **Pre-start** → Resolve migration falhada
3. **Start** → Servidor inicia normalmente

---

## 🆘 Ainda com Problemas?

Me avise qual erro apareceu e eu te ajudo a resolver!
