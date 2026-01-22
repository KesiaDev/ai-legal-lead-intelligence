# 🌐 Configurar Domínio Customizado para Frontend (.com.br)

## 🎯 OBJETIVO

**Configurar o frontend para abrir em:**
- `sdrjuridico.com.br` OU
- `www.sdrjuridico.com.br`

**Ao invés de:**
- `legal-lead-scout-production.up.railway.app`

---

## ✅ PASSO A PASSO

### **1️⃣ Adicionar Domínio Customizado no Railway (Frontend)**

1. Railway Dashboard → **"SDR Advogados Front"** (Frontend)
2. Vá em **"Settings"** → **"Networking"**
3. Na seção **"Public Networking"**
4. Clique em **"+ Custom Domain"**
5. Digite o domínio:
   - `sdrjuridico.com.br` (sem www)
   - OU `www.sdrjuridico.com.br` (com www)
6. Clique em **"Add"** ou **"Save"**

---

### **2️⃣ Configurar DNS no Provedor do Domínio**

**Você precisa configurar um registro CNAME no seu provedor de DNS:**

#### **Se escolheu `sdrjuridico.com.br` (sem www):**

**No seu provedor de DNS (Registro.br, GoDaddy, etc.):**

1. Acesse o painel de DNS
2. Adicione um registro **CNAME**:
   - **Nome/Host:** `@` ou deixe em branco (domínio raiz)
   - **Valor/Destino:** `legal-lead-scout-production.up.railway.app`
   - **TTL:** 3600 (ou padrão)

**⚠️ IMPORTANTE:** Alguns provedores não permitem CNAME no domínio raiz (`@`). Nesse caso, você precisa usar um registro **A** apontando para o IP do Railway (verifique no Railway qual IP usar).

#### **Se escolheu `www.sdrjuridico.com.br` (com www):**

1. Acesse o painel de DNS
2. Adicione um registro **CNAME**:
   - **Nome/Host:** `www`
   - **Valor/Destino:** `legal-lead-scout-production.up.railway.app`
   - **TTL:** 3600 (ou padrão)

---

### **3️⃣ Verificar Porta no Railway**

**No Railway → Frontend → Networking:**

Verifique se a porta está configurada corretamente:
- **Port:** `8080` (padrão do frontend)

Se estiver diferente, ajuste para `8080`.

---

### **4️⃣ Aguardar Propagação DNS**

**Após configurar o DNS:**
- Aguarde **5-30 minutos** para propagação
- Pode verificar em: https://www.whatsmydns.net/

---

### **5️⃣ Verificar SSL/HTTPS**

**O Railway configura SSL automaticamente via Let's Encrypt:**
- Aguarde alguns minutos após adicionar o domínio
- O certificado será gerado automaticamente
- Você verá "Setup complete" no Railway

---

## 📋 RESUMO DA CONFIGURAÇÃO

### **No Railway:**
- ✅ Frontend → Settings → Networking
- ✅ Adicionar Custom Domain: `sdrjuridico.com.br` ou `www.sdrjuridico.com.br`
- ✅ Porta: `8080`

### **No Provedor DNS:**
- ✅ CNAME: `@` ou `www` → `legal-lead-scout-production.up.railway.app`

### **Resultado:**
- ✅ `https://sdrjuridico.com.br` abre o frontend
- ✅ `https://api.sdrjuridico.com.br` continua sendo o backend

---

## 🔍 VERIFICAÇÃO

**Após configurar, teste:**

1. Acesse `https://sdrjuridico.com.br` (ou `www.sdrjuridico.com.br`)
2. Deve abrir a plataforma normalmente
3. Verifique se o SSL está funcionando (cadeado verde)

---

## ⚠️ IMPORTANTE

**Se o domínio raiz (`@`) não aceitar CNAME:**

Alguns provedores (como alguns no Brasil) não permitem CNAME no domínio raiz. Nesse caso:

1. Use `www.sdrjuridico.com.br` (com www) - aceita CNAME
2. OU configure um registro **A** apontando para o IP do Railway
3. OU use um serviço de proxy (Cloudflare, etc.)

---

## ✅ PRONTO!

**Após configurar:**
- ✅ Frontend: `https://sdrjuridico.com.br`
- ✅ Backend: `https://api.sdrjuridico.com.br`

**Tudo funcionando!** 🚀
