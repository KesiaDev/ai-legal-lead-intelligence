# 🔑 Onde Colocar API Key da Evolution API

## ✅ SIM! Precisa Colocar a API Key

**A Evolution API precisa de autenticação via API Key no header.**

---

## 📋 Onde Colocar

### **Opção 1: Via "Send Headers" (Recomendado)**

1. No node "HTTP Request"
2. Ative **"Send Headers"** (toggle ON)
3. Clique em **"+ Add Header"** ou **"Add"**
4. Configure:
   - **Name:** `apikey`
   - **Value:** Cole a API Key da Evolution API aqui

---

### **Opção 2: Via "Authentication" (Se Funcionar)**

1. No node "HTTP Request"
2. Campo **"Authentication"**
3. Selecione **"Generic Credential Type"**
4. Se o dropdown funcionar, selecione **"Header Auth"**
5. Configure:
   - **Name:** `apikey`
   - **Value:** Cole a API Key aqui

---

## 🔍 Onde Está a API Key?

**No Evolution API Manager:**

1. Acesse o dashboard da Evolution API
2. Vá em **Settings** ou **API Keys**
3. Procure por:
   - **API Key**
   - **Token**
   - **Access Token**
   - Campo mascarado (como você mostrou antes)

4. **Copie** a API Key
5. **Cole** no campo "Value" do N8N

---

## ⚠️ IMPORTANTE: Verificar Nome do Header

**Algumas Evolution APIs usam nomes diferentes:**

**Opções comuns:**
- `apikey` ← Mais comum
- `Authorization` ← Algumas usam
- `X-API-Key` ← Algumas usam
- `token` ← Algumas usam

**Como verificar:**
1. Veja a documentação da sua Evolution API
2. Ou teste com `apikey` primeiro
3. Se não funcionar, tente `Authorization`

---

## 📋 Configuração Final

### **Via Send Headers:**

**Send Headers:** `ON`
- **Name:** `apikey`
- **Value:** `[Cole a API Key da Evolution API aqui]`

---

### **Via Authentication (se funcionar):**

**Authentication:** `Generic Credential Type`
- **Type:** `Header Auth`
- **Name:** `apikey`
- **Value:** `[Cole a API Key da Evolution API aqui]`

---

## 🧪 Testar

1. Após colocar a API Key
2. Clique em **"Execute step"**
3. Verifique o OUTPUT

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 401/403:** ❌ API Key incorreta ou nome do header errado

**Se retornar 404:** ❌ URL ou nome da instância incorreto

---

## ✅ Resumo

**SIM, precisa colocar a API Key!**

**Onde:**
1. ✅ Via "Send Headers" (mais fácil)
   - Name: `apikey`
   - Value: Cole a API Key
2. ✅ OU via "Authentication" (se funcionar)

**Onde pegar:**
- Evolution API Manager → Settings → API Keys

**Pronto! Cole a API Key no campo Value!** 🚀
