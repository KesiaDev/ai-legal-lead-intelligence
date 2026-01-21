# 🔧 Completar Configuração de Autenticação

## 🎯 Onde Você Está

**Você já fez:**
- ✅ Selecionou "Generic Credential Type"
- ✅ "Fixed" está selecionado (correto)

**Agora precisa:**
- ❌ Selecionar o tipo de autenticação no dropdown
- ❌ Configurar Name e Value

---

## 📋 Passo a Passo

### **Passo 1: Selecionar Tipo de Autenticação**

1. No dropdown que mostra **"Select"** (com borda roxa)
2. Clique para abrir
3. Selecione: **"Header Auth"** ou **"HTTP Header Auth"**

**Opções que podem aparecer:**
- Header Auth ← **SELECIONE ESTE!**
- Basic Auth
- OAuth2
- etc.

---

### **Passo 2: Configurar Name e Value**

**Após selecionar "Header Auth", aparecerão 2 campos:**

1. **"Name"** ou **"Header Name":**
   - Digite: **`apikey`**
   - (Ou `Authorization` - verifique documentação da Evolution API)

2. **"Value"** ou **"Header Value":**
   - Cole aqui a **API Key** que você copiou
   - (Do campo mascarado do Evolution API Manager)

---

### **Passo 3: Verificar Configuração**

**Após preencher, você deve ter:**

- ✅ Authentication: `Generic Credential Type`
- ✅ Generic Auth Type: `Fixed` (selecionado)
- ✅ Type: `Header Auth` (selecionado)
- ✅ Name: `apikey`
- ✅ Value: `[Sua API Key aqui]`

---

## 🔍 Se o Dropdown Não Abrir ou Não Mostrar Opções

**Tente:**
1. Clique no dropdown novamente
2. Role para baixo se houver muitas opções
3. Digite "Header" para filtrar
4. Se não aparecer, tente "HTTP Header Auth"

---

## 📋 Checklist

- [ ] Dropdown "Select" foi clicado?
- [ ] Selecionou "Header Auth"?
- [ ] Campos Name e Value apareceram?
- [ ] Preencheu Name: `apikey`?
- [ ] Colou a API Key no Value?
- [ ] Salvou as alterações?

---

## ✅ Configuração Final Esperada

**Authentication:**
- Generic Credential Type ✅
- Generic Auth Type: Fixed ✅
- Type: **Header Auth** ← Selecionar
- Name: **`apikey`** ← Preencher
- Value: **`[Sua API Key]`** ← Colar

---

## 🧪 Após Configurar

1. Salve o node
2. Clique em **"Execute step"**
3. Verifique o OUTPUT

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 401/403:** ❌ API Key incorreta

**Se retornar 404:** ❌ URL ou nome da instância incorreto

---

## ✅ Resumo

**O que fazer agora:**
1. ✅ Clique no dropdown "Select"
2. ✅ Selecione "Header Auth"
3. ✅ Preencha Name: `apikey`
4. ✅ Cole a API Key no Value
5. ✅ Salve e teste

**Pronto! Selecione "Header Auth" no dropdown e configure Name e Value!** 🚀
