# 🔧 Resolver Conflito em Record CNAME

## 🎯 Problema Identificado

**Erro:**
```
Não é possível adicionar record(s) - Conflito em Record CNAME
```

**O que significa:**
- ❌ Já existe um registro CNAME com o nome `api.sdrjuridico.com.br`
- ❌ Não é possível criar outro registro com o mesmo nome
- ✅ Precisa **EDITAR** o registro existente (não criar novo)

---

## ✅ SOLUÇÃO: Editar o Registro Existente

### **Passo 1: Fechar o Modal "Nova entrada"**

1. Clique no **"X"** no canto superior direito do modal
2. Ou clique em **"CANCELAR"**

---

### **Passo 2: Encontrar o Registro Existente**

1. Na lista de registros DNS, encontre o registro CNAME:
   - Nome: `api.sdrjuridico.com.br`
   - Dados: `legal-lead-scout-production.up.railway.app` (valor antigo)

---

### **Passo 3: Editar o Registro Existente**

1. Clique no registro existente
2. Ou clique no ícone de **edição** (seta curva ou lápis)
3. Você verá os campos editáveis:
   - **Tipo:** CNAME (não precisa mudar)
   - **Nome:** `api.sdrjuridico.com.br` (não precisa mudar)
   - **Dados** ou **Nome do servidor:** `legal-lead-scout-production.up.railway.app`

---

### **Passo 4: Alterar o Valor**

1. No campo **"Dados"** ou **"Nome do servidor"**, altere de:
   ```
   legal-lead-scout-production.up.railway.app
   ```
   
   Para:
   ```
   ltzoi1pw.up.railway.app
   ```

2. **Salve** as alterações

---

## 🔄 Alternativa: Deletar e Criar Novo

**Se não conseguir editar, faça assim:**

### **Passo 1: Deletar o Registro Antigo**

1. Encontre o registro com:
   - Nome: `api.sdrjuridico.com.br`
   - Dados: `legal-lead-scout-production.up.railway.app`

2. Clique no **"X"** para deletar
3. **Salve** as alterações

---

### **Passo 2: Criar Novo Registro**

1. Após deletar, clique em **"NOVA ENTRADA"**
2. Preencha:
   - **Tipo:** CNAME
   - **Nome:** `api`
   - **Nome do servidor:** `ltzoi1pw.up.railway.app`
3. Clique em **"ADICIONAR"**
4. Clique em **"SALVAR ALTERAÇÕES"**

---

## ✅ Resultado Final

**Após editar ou criar novo, você deve ter:**

- ✅ Tipo: CNAME
- ✅ Nome: `api.sdrjuridico.com.br`
- ✅ Dados: `ltzoi1pw.up.railway.app`

**E NÃO deve ter mais:**
- ❌ `legal-lead-scout-production.up.railway.app`

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

3. **Se retornar 200 OK:** ✅ Funcionando!

---

## 📋 Checklist

- [ ] Fechei o modal "Nova entrada"
- [ ] Encontrei o registro CNAME existente
- [ ] Editei o campo "Dados" para `ltzoi1pw.up.railway.app`
- [ ] Salvei as alterações
- [ ] Aguardei propagação DNS (5-30 minutos)
- [ ] Testei a rota e funcionou?

---

## ✅ Resumo

**O que fazer:**
1. ✅ **Cancele** o modal "Nova entrada"
2. ✅ **Edite** o registro CNAME existente
3. ✅ Altere o valor para `ltzoi1pw.up.railway.app`
4. ✅ Salve as alterações

**OU:**

1. ✅ **Delete** o registro antigo
2. ✅ **Crie** um novo registro
3. ✅ Salve as alterações

---

**Pronto! Cancele o modal e edite o registro existente!** 🚀
