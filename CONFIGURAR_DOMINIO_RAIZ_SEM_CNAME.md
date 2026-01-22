# 🌐 Configurar Domínio Raiz Sem CNAME

## ✅ SITUAÇÃO ATUAL

**Você configurou:**
- ✅ `www.sdrjuridico.com.br` → CNAME → `legal-lead-scout-production.up.railway.app`

**Isso está CORRETO!** ✅

---

## 🔍 POR QUE NÃO ACEITA CNAME NO DOMÍNIO RAIZ?

**Muitos provedores de DNS não permitem CNAME no domínio raiz (`@`) porque:**
- Conflita com registros NS (Name Server)
- Conflita com registros SOA (Start of Authority)
- Padrão do DNS não permite CNAME junto com outros registros no mesmo nome

**Isso é NORMAL e ESPERADO!** ✅

---

## ✅ SOLUÇÕES

### **Opção 1: Usar www (Recomendado - Já Configurado!)**

**Você já fez isso!** ✅

- ✅ `www.sdrjuridico.com.br` → CNAME → `legal-lead-scout-production.up.railway.app`
- ✅ Funciona perfeitamente!
- ✅ Acesse: `https://www.sdrjuridico.com.br`

**No Railway:**
- Adicione o domínio: `www.sdrjuridico.com.br`
- Porta: `8080`

---

### **Opção 2: Configurar Redirecionamento (Opcional)**

**Se quiser que `sdrjuridico.com.br` (sem www) também funcione:**

**No seu provedor de DNS, adicione um registro A ou use redirecionamento:**

1. **Registro A (se o Railway fornecer IP):**
   - Tipo: `A`
   - Nome: `@` (ou vazio)
   - Valor: `[IP do Railway]` (verifique no Railway se fornecerem)

2. **OU Redirecionamento HTTP (no servidor/provedor):**
   - Configure redirecionamento: `sdrjuridico.com.br` → `www.sdrjuridico.com.br`

**Mas isso é OPCIONAL!** O `www` já funciona! ✅

---

### **Opção 3: Usar Cloudflare (Avançado)**

**Se quiser usar domínio raiz sem www:**

1. Use Cloudflare como proxy
2. Cloudflare permite CNAME no domínio raiz via "CNAME Flattening"
3. Configure: `sdrjuridico.com.br` → CNAME → `legal-lead-scout-production.up.railway.app`

**Mas isso é OPCIONAL e mais complexo!**

---

## ✅ CONFIGURAÇÃO FINAL RECOMENDADA

### **No Railway (Frontend):**

1. Railway → Frontend → Networking
2. Adicione Custom Domain: `www.sdrjuridico.com.br`
3. Porta: `8080`
4. Salve

### **No DNS (Já Configurado):**

- ✅ `www.sdrjuridico.com.br` → CNAME → `legal-lead-scout-production.up.railway.app`

### **Resultado:**

- ✅ Frontend: `https://www.sdrjuridico.com.br`
- ✅ Backend: `https://api.sdrjuridico.com.br`

---

## 🧪 TESTAR

**Após configurar no Railway:**

1. Aguarde 5-30 minutos (propagação DNS + SSL)
2. Acesse: `https://www.sdrjuridico.com.br`
3. Deve abrir a plataforma normalmente!

---

## ⚠️ IMPORTANTE

**Se quiser que `sdrjuridico.com.br` (sem www) também funcione:**

**Opção mais simples:**
- Configure redirecionamento no seu provedor de DNS
- `sdrjuridico.com.br` → redireciona para → `www.sdrjuridico.com.br`

**OU deixe como está:**
- `www.sdrjuridico.com.br` já funciona perfeitamente! ✅

---

## ✅ RESUMO

1. ✅ **DNS configurado:** `www.sdrjuridico.com.br` → CNAME → `legal-lead-scout-production.up.railway.app`
2. ✅ **Railway:** Adicionar domínio `www.sdrjuridico.com.br` na porta `8080`
3. ✅ **Aguardar:** Propagação DNS + SSL (5-30 minutos)
4. ✅ **Testar:** `https://www.sdrjuridico.com.br`

**Está tudo certo! O `www` funciona perfeitamente!** 🚀
