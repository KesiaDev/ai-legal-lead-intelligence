# 🔑 Como Copiar a API Key da Evolution API

## ✅ SIM! Esse Campo Mascarado é a API Key!

**O campo com asteriscos (`************_****_****_************`) é a sua API Key da Evolution API.**

---

## 📋 Como Copiar

### **Passo 1: Revelar a API Key**

1. No Evolution API Manager
2. No campo mascarado (com asteriscos)
3. Clique no **ícone de olho** 👁️ (à direita do campo)
4. A API Key será revelada (aparecerá o texto completo)

---

### **Passo 2: Copiar a API Key**

1. Após revelar, clique no **ícone de copiar** 📋 (dois quadrados sobrepostos)
2. OU selecione todo o texto e pressione `Ctrl+C` (Windows) ou `Cmd+C` (Mac)

---

### **Passo 3: Colar no N8N**

1. No N8N, no node "HTTP Request"
2. Ative **"Send Headers"**
3. Clique em **"+ Add Header"**
4. Configure:
   - **Name:** `apikey`
   - **Value:** Cole a API Key aqui (`Ctrl+V` ou `Cmd+V`)

---

## ⚠️ IMPORTANTE

**A API Key é SENSÍVEL!**

- ✅ **NÃO compartilhe** publicamente
- ✅ **NÃO commite** no GitHub
- ✅ **NÃO envie** por email não seguro
- ✅ Use apenas no N8N (via "Send Headers")

---

## 🧪 Testar

1. Após colar a API Key no N8N
2. Clique em **"Execute step"**
3. Verifique o OUTPUT

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 401/403:** ❌ API Key incorreta

**Se retornar 404:** ❌ URL ou nome da instância incorreto

---

## ✅ Resumo

**SIM, esse campo mascarado é a API Key!**

**Como copiar:**
1. 👁️ Clique no ícone de olho para revelar
2. 📋 Clique no ícone de copiar
3. 📝 Cole no N8N (Send Headers → Name: `apikey`)

**Pronto!** 🚀
