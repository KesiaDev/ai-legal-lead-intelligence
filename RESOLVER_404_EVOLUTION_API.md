# 🔧 Resolver 404 Not Found na Evolution API

## 🎯 Problema Identificado

**Erro:**
```
The resource you are requesting could not be found
Not Found (404)
```

**URL usada:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
```

**Payload (correto):**
```json
{
  "number": "5527998597005",
  "textMessage": {
    "text": "Eu vendo agentes de ia e automações para..."
  }
}
```

---

## 🔍 Possíveis Causas

### **1. URL Incorreta**

A URL pode estar:
- ❌ Instância não existe (`SDRAdvogados2`)
- ❌ Endpoint errado (`/message/sendText/`)
- ❌ Domínio errado

---

### **2. Falta Autenticação**

A Evolution API pode precisar de:
- ❌ API Key no header
- ❌ Token de autenticação
- ❌ Credenciais não configuradas

---

### **3. Método HTTP Errado**

Algumas Evolution APIs usam:
- ❌ `POST` quando deveria ser outro método
- ❌ Endpoint diferente para POST

---

## ✅ SOLUÇÃO: Verificar e Corrigir

### **Passo 1: Verificar URL da Evolution API**

**Opções de URL para Evolution API:**

**Opção 1: Com nome da instância**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
```

**Opção 2: Com ID da instância**
```
https://drybee-evolution.cloudfy.live/message/sendText/{{INSTANCE_ID}}
```

**Opção 3: Endpoint alternativo**
```
https://drybee-evolution.cloudfy.live/message/send
```

**Como verificar:**
1. Acesse o dashboard da Evolution API
2. Veja a documentação da API
3. Verifique qual é a URL correta
4. Verifique qual é o nome exato da instância

---

### **Passo 2: Verificar Nome da Instância**

1. Acesse o Evolution API Manager
2. Veja a lista de instâncias
3. Verifique o nome exato da instância:
   - É `SDRAdvogados2`?
   - É `SDRAdvogados`?
   - É outro nome?

**⚠️ IMPORTANTE:** O nome da instância deve ser **EXATO** (case-sensitive)

---

### **Passo 3: Configurar Autenticação**

A Evolution API geralmente precisa de autenticação:

1. No node "HTTP Request"
2. Campo **"Authentication"**
3. Selecione: **"Header Auth"** ou **"Generic Credential Type"**
4. Configure:
   - **Name:** `apikey` (ou `Authorization`)
   - **Value:** Sua API key da Evolution API

**Como obter a API Key:**
1. Acesse o Evolution API Manager
2. Vá em **Settings** ou **API Keys**
3. Copie a API Key
4. Cole no N8N

---

### **Passo 4: Verificar Método HTTP**

Algumas Evolution APIs usam métodos diferentes:

**Tente:**
- `POST` (atual)
- Ou verifique na documentação

---

### **Passo 5: Verificar Estrutura do Payload**

Algumas Evolution APIs esperam estrutura diferente:

**Estrutura atual:**
```json
{
  "number": "5527998597005",
  "textMessage": {
    "text": "..."
  }
}
```

**Estrutura alternativa (se não funcionar):**
```json
{
  "number": "5527998597005",
  "text": "..."
}
```

**OU:**
```json
{
  "key": {
    "remoteJid": "5527998597005@s.whatsapp.net"
  },
  "message": {
    "conversation": "..."
  }
}
```

**Verifique a documentação da sua Evolution API!**

---

## 🧪 Teste Direto (curl/Postman)

**Teste 1: Sem autenticação**
```bash
curl -X POST https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2 \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5527998597005",
    "textMessage": {
      "text": "Teste"
    }
  }'
```

**Teste 2: Com autenticação**
```bash
curl -X POST https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2 \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY" \
  -d '{
    "number": "5527998597005",
    "textMessage": {
      "text": "Teste"
    }
  }'
```

**Se funcionar:** Copie a configuração exata para o N8N

**Se não funcionar:** Verifique URL e documentação

---

## 📋 Checklist

- [ ] URL da Evolution API está correta?
- [ ] Nome da instância está correto e existe?
- [ ] Autenticação configurada (API Key)?
- [ ] Método HTTP está correto (POST)?
- [ ] Estrutura do payload está correta?
- [ ] Testou diretamente com curl/Postman?
- [ ] Verificou documentação da Evolution API?

---

## 🆘 Se Nada Funcionar

### **Verificar Dashboard da Evolution API:**

1. Acesse o Evolution API Manager
2. Veja a documentação da API
3. Procure por:
   - Endpoint correto para enviar mensagens
   - Formato do payload
   - Método de autenticação
   - Nome exato da instância

---

## ✅ Resumo

**Problema:**
- 404 Not Found na Evolution API
- URL ou autenticação incorreta

**Solução:**
1. ✅ Verificar URL correta da Evolution API
2. ✅ Verificar nome exato da instância
3. ✅ Configurar autenticação (API Key)
4. ✅ Verificar estrutura do payload
5. ✅ Testar diretamente com curl/Postman

---

**Pronto! Verifique a URL e autenticação da Evolution API!** 🚀
