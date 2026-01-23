# ✅ Solução Definitiva: Migration Falhada

## 🎯 O Que Foi Feito

Criei um script `pre-start.js` que:
1. ✅ **Executa ANTES** do servidor iniciar
2. ✅ **Detecta** migrations falhadas
3. ✅ **Remove** a migration falhada do histórico
4. ✅ **Cria** as tabelas que faltam (Pipeline, Deal, CrmIntegration)
5. ✅ **Marca** a migration como aplicada

---

## ⏳ Aguardar Deploy

O Railway está fazendo deploy agora. Aguarde **2-3 minutos** e verifique os logs.

---

## ✅ Verificar se Funcionou

### **1. Verificar Logs do Deploy:**

No Railway Dashboard → Deploy Logs, você deve ver:

```
🔧 Verificando e resolvendo migrations falhadas...
⚠️  Migration falhada encontrada. Resolvendo...
✅ Migration falhada removida do histórico
📝 Criando tabelas que faltam...
✅ Migration resolvida e marcada como aplicada!
✅ Pré-inicialização concluída
🚀 API rodando na porta 3001
```

### **2. Verificar Status:**

- ✅ Status deve ser **"Running"** (não mais "Crashed")
- ✅ Não deve aparecer erro **P3009**
- ✅ Não deve aparecer "failed migrations"

### **3. Verificar Tabelas:**

No Railway Dashboard → Data → Postgres, deve aparecer:
- ✅ `Pipeline`
- ✅ `Deal`
- ✅ `CrmIntegration`

---

## 🚨 Se Ainda Der Erro

### **Opção 1: Executar Endpoint Manualmente**

Aguarde o deploy terminar e execute:

```bash
curl -X POST https://sdradvogados.up.railway.app/api/fix-migration \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"fix-migration-2026\"}"
```

### **Opção 2: Executar SQL Diretamente**

No Railway Dashboard → Data → Postgres → Query, execute:

```sql
-- Remover migration falhada
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250120000000_add_pipelines_and_deals' 
AND finished_at IS NULL;

-- Marcar como aplicada
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

---

## 📝 Como Funciona

1. **`prestart` script** no `package.json` executa `pre-start.js` ANTES de `npm start`
2. **`pre-start.js`** conecta ao banco e resolve a migration
3. **Servidor inicia** normalmente sem erros

---

## ⚠️ IMPORTANTE

**Depois que funcionar:**
- ✅ O sistema de funis estará funcionando
- ⚠️ **REMOVER** o endpoint `/api/fix-migration` por segurança (depois)
- ✅ Próximas migrations funcionarão normalmente

---

## 🆘 Ainda com Problemas?

Me avise qual erro apareceu nos logs e eu te ajudo!
