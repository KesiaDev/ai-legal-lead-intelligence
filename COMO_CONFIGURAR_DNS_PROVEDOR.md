# 🔧 Como Configurar DNS no Provedor de Domínio

## 🎯 O Que Você Precisa Fazer

**Na tela que você está vendo:**

### **Opção 1: Editar o Registro Existente (Recomendado)**

1. **Encontre o registro existente:**
   - Tipo: CNAME
   - Nome: `api.sdrjuridico.com.br`
   - Dados: `legal-lead-scout-production.up.railway.app`

2. **Clique no ícone de edição** (lápis ou seta curva azul)

3. **Altere o campo "Dados" ou "Nome do servidor":**
   - **De:** `legal-lead-scout-production.up.railway.app`
   - **Para:** `ltzoi1pw.up.railway.app`

4. **Salve**

---

### **Opção 2: Deletar e Criar Novo**

1. **Delete o registro antigo:**
   - Clique no registro existente
   - Delete ou remova

2. **Crie um novo registro:**
   - Tipo: **CNAME**
   - Nome: **`api`** (já está preenchido)
   - Nome do servidor: **`ltzoi1pw.up.railway.app`** ← **COLOQUE ISSO AQUI!**

3. **Clique em "ADICIONAR"**

4. **Clique em "SALVAR ALTERAÇÕES"**

---

## ✅ O Que Colocar no Campo "Nome do servidor"

**Valor correto:**
```
ltzoi1pw.up.railway.app
```

**⚠️ IMPORTANTE:**
- ✅ Digite exatamente assim (sem espaços)
- ✅ Sem `http://` ou `https://`
- ✅ Apenas o domínio: `ltzoi1pw.up.railway.app`

---

## 📋 Passo a Passo Completo

### **Se Você Vai Editar o Registro Existente:**

1. Clique no registro existente (com a seta azul)
2. Altere o campo "Dados" de:
   ```
   legal-lead-scout-production.up.railway.app
   ```
   Para:
   ```
   ltzoi1pw.up.railway.app
   ```
3. Salve

---

### **Se Você Vai Criar Novo (Após Deletar o Antigo):**

1. No formulário "Nova entrada":
   - **Tipo:** CNAME (já está selecionado) ✅
   - **Nome:** `api` (já está preenchido) ✅
   - **Nome do servidor:** Digite: `ltzoi1pw.up.railway.app` ← **AQUI!**

2. Clique em **"ADICIONAR"**

3. Clique em **"SALVAR ALTERAÇÕES"** (botão verde no final)

---

## ✅ Resultado Final

**Após salvar, você deve ter:**

- Tipo: CNAME
- Nome: `api.sdrjuridico.com.br` (ou apenas `api`)
- Dados/Nome do servidor: `ltzoi1pw.up.railway.app`

---

## ⏱️ Após Salvar

1. **Aguarde 5-30 minutos** (propagação DNS)

2. **Teste:**
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

## 📝 Resumo

**No campo "Nome do servidor", coloque:**
```
ltzoi1pw.up.railway.app
```

**Depois:**
1. Clique em "ADICIONAR" (se criar novo)
2. Clique em "SALVAR ALTERAÇÕES"
3. Aguarde propagação DNS
4. Teste a rota

---

**Pronto! Coloque `ltzoi1pw.up.railway.app` no campo "Nome do servidor" e salve!** 🚀
