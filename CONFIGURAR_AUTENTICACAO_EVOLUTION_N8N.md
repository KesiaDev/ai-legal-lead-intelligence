# 🔧 Configurar Autenticação Evolution API no N8N

## 🎯 Onde Configurar

**No node "HTTP Request" (Evolution API):**

---

## 📋 Passo a Passo Visual

### **Passo 1: Abrir Campo Authentication**

1. No node "HTTP Request"
2. Encontre o campo **"Authentication"**
3. Clique no dropdown (atualmente mostra "None")
4. O dropdown vai abrir mostrando opções

---

### **Passo 2: Selecionar "Generic Credential Type"**

**No dropdown que abriu, você verá:**

- ❌ "None" (atual)
- ✅ **"Generic Credential Type"** ← **SELECIONE ESTE!**
  - Descrição: "Fully customizable. Choose between basic, header, OAuth2, etc."

**Clique em "Generic Credential Type"**

---

### **Passo 3: Configurar Header Auth**

**Após selecionar "Generic Credential Type", aparecerão novos campos:**

1. **"Auth Type"** ou **"Type":**
   - Selecione: **"Header Auth"** ou **"HTTP Header Auth"**

2. **"Name"** ou **"Header Name":**
   - Digite: **`apikey`**
   - (Ou pode ser `Authorization` - verifique a documentação da Evolution API)

3. **"Value"** ou **"Header Value":**
   - Cole aqui a **API Key** que você copiou do Evolution API Manager
   - (Aquele campo mascarado que você mostrou na imagem)

---

### **Passo 4: Salvar**

1. Após preencher Name e Value
2. Clique fora do campo ou pressione Enter
3. As configurações serão salvas automaticamente

---

## 🔍 Onde Está a API Key?

**Na imagem que você mostrou:**
- Campo com texto mascarado: `************_****_****_************`
- Ícone de **copiar** (dois quadrados sobrepostos)
- Ícone de **visualizar** (olho)

**Como copiar:**
1. Clique no ícone de **copiar**
2. A API Key será copiada para a área de transferência
3. Cole no campo "Value" do N8N

---

## ✅ Configuração Final

### **No node "HTTP Request":**

**Method:** `POST`

**URL:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**Authentication:** `Generic Credential Type`
- **Type:** `Header Auth`
- **Name:** `apikey`
- **Value:** `[Cole a API Key aqui]`

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

## 🧪 Testar

1. Após configurar tudo
2. Clique em **"Execute step"** (botão vermelho)
3. Verifique o OUTPUT

**Se retornar 200 OK:** ✅ Funcionando!

**Se retornar 401/403:** ❌ API Key incorreta

**Se retornar 404:** ❌ URL ou nome da instância incorreto

---

## 📋 Checklist

- [ ] Abri o dropdown "Authentication"
- [ ] Selecionei "Generic Credential Type"
- [ ] Configurei Type: "Header Auth"
- [ ] Configurei Name: `apikey`
- [ ] Copiei a API Key do Evolution API Manager
- [ ] Colei no campo Value
- [ ] URL está com `SDR%20Advogados2` (espaço codificado)
- [ ] Payload está correto
- [ ] Testei e funcionou?

---

## 🆘 Se Não Aparecer "Generic Credential Type"

**Alternativa: Criar Credential Separada**

1. No N8N, vá em **Credentials** (menu lateral)
2. Clique em **"+ Add Credential"**
3. Selecione **"HTTP Header Auth"**
4. Configure:
   - **Name:** `apikey`
   - **Value:** Sua API Key
5. Salve
6. No node "HTTP Request", selecione essa credential

---

## ✅ Resumo

**Onde configurar:**
1. ✅ Node "HTTP Request"
2. ✅ Campo "Authentication"
3. ✅ Selecionar "Generic Credential Type"
4. ✅ Type: "Header Auth"
5. ✅ Name: `apikey`
6. ✅ Value: Cole a API Key

**Pronto! Configure a autenticação e teste!** 🚀
