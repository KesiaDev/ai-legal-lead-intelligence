# 🔧 Corrigir DNS Duplicado

## 🎯 Problema Identificado

**Você tem DOIS registros CNAME com o mesmo nome:**

1. ✅ **Registro CORRETO** (círculo verde):
   - Nome: `api.sdrjuridico.com.br`
   - Dados: `ltzoi1pw.up.railway.app` ✅

2. ❌ **Registro ANTIGO** (círculo cinza):
   - Nome: `api.sdrjuridico.com.br`
   - Dados: `legal-lead-scout-production.up.railway.app` ❌

**Problema:**
- Ter dois registros com o mesmo nome pode causar conflito
- O DNS pode usar o registro errado
- Precisa deletar o registro antigo

---

## ✅ SOLUÇÃO: Deletar o Registro Antigo

### **Passo 1: Deletar o Registro Antigo**

1. Encontre o registro com:
   - Dados: `legal-lead-scout-production.up.railway.app`
   - Círculo cinza

2. Clique no **"X"** abaixo do campo "Dados"
   - Ou clique na seta curva (ícone de edição) e depois delete

3. O registro será removido

---

### **Passo 2: Verificar que Restou Apenas o Correto**

**Após deletar, você deve ter apenas:**

- ✅ Tipo: CNAME
- ✅ Nome: `api.sdrjuridico.com.br`
- ✅ Dados: `ltzoi1pw.up.railway.app`

**NÃO deve ter mais:**
- ❌ `legal-lead-scout-production.up.railway.app`

---

### **Passo 3: Salvar Alterações**

1. Clique no botão verde **"SALVAR ALTERAÇÕES"**
2. Aguarde confirmação

---

## ⏱️ Após Salvar

1. **Aguarde 5-30 minutos** (propagação DNS)

2. **Teste a rota:**
   ```bash
   curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
     -H "Content-Type: application/json" \
     -d '{
       "lead_id": "test-123",
       "mensagem": "Teste",
       "canal": "whatsapp"
     }'
   ```

3. **Resposta esperada (200 OK):**
   ```json
   {
     "lead_id": "test-123",
     "canal": "whatsapp",
     "analise": {
       ...
     }
   }
   ```

---

## 🔍 Como Verificar se Funcionou

### **Teste 1: Verificar DNS**

Use: https://dnschecker.org

1. Digite: `api.sdrjuridico.com.br`
2. Verifique se está apontando para: `ltzoi1pw.up.railway.app`

**Se estiver:** ✅ DNS correto!

**Se ainda estiver apontando para o antigo:** ⏱️ Aguarde mais tempo (propagação)

---

### **Teste 2: Testar Rota Diretamente**

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste",
    "canal": "whatsapp"
  }'
```

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 502:** ⏱️ DNS ainda não propagou (aguarde mais)

---

## 📋 Checklist

- [ ] Deletei o registro antigo (`legal-lead-scout-production.up.railway.app`)
- [ ] Mantive apenas o registro correto (`ltzoi1pw.up.railway.app`)
- [ ] Cliquei em "SALVAR ALTERAÇÕES"
- [ ] Aguardei propagação DNS (5-30 minutos)
- [ ] Testei a rota e funcionou?

---

## ✅ Resumo

**O que fazer:**
1. ✅ Delete o registro antigo (com `legal-lead-scout-production.up.railway.app`)
2. ✅ Mantenha apenas o correto (com `ltzoi1pw.up.railway.app`)
3. ✅ Salve as alterações
4. ✅ Aguarde propagação DNS
5. ✅ Teste a rota

**Resultado:**
- ✅ Apenas um registro CNAME
- ✅ Apontando para o valor correto
- ✅ Rota funcionando

---

**Pronto! Delete o registro antigo, salve e aguarde a propagação DNS!** 🚀
