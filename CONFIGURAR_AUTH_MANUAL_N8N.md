# 🔧 Configurar Autenticação Manual no N8N

## 🎯 Problema: Dropdown Vazio

**Problema:**
- Dropdown "Generic Auth Type" não mostra opções
- Não consegue selecionar "Header Auth"

**Solução:** Configurar headers manualmente!

---

## ✅ SOLUÇÃO: Usar "Send Headers" Manualmente

### **Passo 1: Desabilitar Authentication**

1. No campo **"Authentication"**
2. Selecione: **"None"**
3. Isso vai limpar a configuração de autenticação

---

### **Passo 2: Ativar "Send Headers"**

1. Encontre o campo **"Send Headers"**
2. Ative o toggle (mude de OFF para ON)
3. O toggle deve ficar **verde/azul** (ativado)

---

### **Passo 3: Configurar Headers**

**Após ativar "Send Headers", aparecerá uma seção para adicionar headers:**

1. Clique em **"+ Add Header"** ou **"Add"**
2. Configure:
   - **Name:** `apikey`
   - **Value:** Cole a API Key aqui
3. Clique em **"Add"** ou **"Save"**

**OU se já houver campos:**

1. **Header Name:** Digite `apikey`
2. **Header Value:** Cole a API Key

---

## 📋 Configuração Final

### **Node: "HTTP Request" (Evolution API)**

**Method:** `POST`

**URL:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**Authentication:** `None` ✅

**Send Headers:** `ON` ✅ (ativado)
- **Name:** `apikey`
- **Value:** `[Sua API Key]`

**Send Body:** `ON`

**Body Content Type:** `JSON`

**JSON:**
```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.texto }}"
  }
}
```

---

## 🔄 Alternativa: Criar Credential Separada

**Se "Send Headers" também não funcionar:**

### **Passo 1: Criar Credential**

1. No N8N, vá em **"Credentials"** (menu lateral)
2. Clique em **"+ Add Credential"**
3. Procure por **"HTTP Header Auth"** ou **"Header Auth"**
4. Configure:
   - **Name:** `apikey`
   - **Value:** Sua API Key
5. **Salve** a credential

### **Passo 2: Usar no Node**

1. No node "HTTP Request"
2. Campo **"Authentication"**
3. Selecione a credential que você criou

---

## 🧪 Testar

1. Após configurar tudo
2. Clique em **"Execute step"**
3. Verifique o OUTPUT

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 401/403:** ❌ API Key incorreta

**Se retornar 404:** ❌ URL ou nome da instância incorreto

---

## 📋 Checklist

- [ ] Authentication: `None`
- [ ] Send Headers: `ON` (ativado)
- [ ] Header Name: `apikey`
- [ ] Header Value: API Key colada
- [ ] URL está com `SDR%20Advogados2`
- [ ] Payload está correto
- [ ] Testei e funcionou?

---

## ✅ Resumo

**Problema:**
- Dropdown "Generic Auth Type" vazio

**Solução:**
1. ✅ Authentication: `None`
2. ✅ Send Headers: `ON`
3. ✅ Adicionar header:
   - Name: `apikey`
   - Value: API Key

**Pronto! Use "Send Headers" manualmente!** 🚀
