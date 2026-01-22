# 🚨 CORRIGIR DOMÍNIO FRONTEND - URGENTE!

## 🔴 PROBLEMA IDENTIFICADO

**Você está tentando acessar:**
- ❌ `sdrjuridico.com.br` (sem www) → **ERRO DNS_PROBE_FINISHED_NXDOMAIN**

**No Railway você tem:**
- ❌ `sdrjuridico.com.br` configurado → **"Aguardando atualização de DNS"** (nunca vai funcionar!)
- ❓ `www.sdrjuridico.com.br` → **Precisa verificar**

**Problema:**
- Você não conseguiu configurar CNAME para o domínio raiz (`@`)
- Só conseguiu configurar para `www`
- Então o domínio `sdrjuridico.com.br` (sem www) **NUNCA vai funcionar** sem DNS!

---

## ✅ SOLUÇÃO: REMOVER DOMÍNIO SEM DNS E USAR APENAS WWW

### **Passo 1: Remover Domínio Sem DNS do Railway**

1. **Railway Dashboard** → **"SDR Advogados Front"** (Frontend)
2. Aba **"Settings"** → **"Networking"**
3. Na seção **"Redes públicas"**
4. Encontre o domínio: `sdrjuridico.com.br` (sem www)
5. Clique no **ícone de lixeira** 🗑️ ao lado
6. Confirme a remoção

**Por quê?**
- Esse domínio não tem DNS configurado
- Está "Aguardando atualização de DNS" para sempre
- Está causando confusão

---

### **Passo 2: Adicionar/Verificar Domínio WWW**

1. **Ainda na mesma tela** (Networking)
2. Verifique se existe: `www.sdrjuridico.com.br`
3. **Se NÃO existir:**
   - Clique em **"+ Domínio personalizado"**
   - Digite: `www.sdrjuridico.com.br`
   - Clique em **"Add"**
4. **Se JÁ existir:**
   - Verifique se está configurado para porta **8080**
   - Se não estiver, clique no **ícone de editar** (lápis) e corrija

---

### **Passo 3: Verificar DNS para WWW**

**No seu provedor de DNS (Registro.br, GoDaddy, etc.):**

1. Acesse o painel de DNS
2. Verifique se existe um registro **CNAME**:
   - **Nome/Host:** `www`
   - **Valor/Destino:** `legal-lead-scout-production.up.railway.app` (ou a URL que o Railway mostrar)
   - **TTL:** 3600 (ou padrão)

**Se NÃO existir:**
- Adicione o registro CNAME acima

**Se existir mas estiver errado:**
- Edite para apontar para: `legal-lead-scout-production.up.railway.app`

---

### **Passo 4: Verificar URL do Railway**

**No Railway → Frontend → Networking:**

1. Veja qual é a URL do Railway que aparece
2. Deve ser algo como: `legal-lead-scout-production.up.railway.app`
3. **Anote essa URL!**

**Se for diferente, atualize o DNS:**
- CNAME `www` → deve apontar para essa URL do Railway

---

### **Passo 5: Aguardar Propagação**

**Após configurar:**
- Aguarde **5-30 minutos** para propagação DNS
- Aguarde **5-10 minutos** para SSL ser gerado pelo Railway

---

## 🧪 TESTAR

**Após aguardar a propagação:**

1. **Teste:** `https://www.sdrjuridico.com.br`
2. **Deve abrir:** A plataforma normalmente! ✅

**NÃO teste:**
- ❌ `sdrjuridico.com.br` (sem www) → **Nunca vai funcionar sem DNS!**

---

## ⚠️ IMPORTANTE

### **Por que `sdrjuridico.com.br` (sem www) não funciona?**

**Muitos provedores de DNS não permitem CNAME no domínio raiz (`@`):**
- Conflita com registros NS (Name Server)
- Conflita com registros SOA (Start of Authority)
- Padrão do DNS não permite CNAME junto com outros registros

**Isso é NORMAL!** ✅

**Solução:**
- Use `www.sdrjuridico.com.br` (já funciona!)
- OU configure redirecionamento no provedor de DNS (opcional)

---

## ✅ CONFIGURAÇÃO FINAL CORRETA

### **No Railway (Frontend):**
- ✅ **Domínio:** `www.sdrjuridico.com.br`
- ✅ **Porta:** `8080`
- ❌ **Remover:** `sdrjuridico.com.br` (sem www)

### **No DNS:**
- ✅ **CNAME:** `www` → `legal-lead-scout-production.up.railway.app`

### **Resultado:**
- ✅ **Frontend:** `https://www.sdrjuridico.com.br` ✅
- ✅ **Backend:** `https://api.sdrjuridico.com.br` ✅

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Remover `sdrjuridico.com.br` (sem www) do Railway
- [ ] Adicionar/Verificar `www.sdrjuridico.com.br` no Railway (porta 8080)
- [ ] Verificar DNS: CNAME `www` → URL do Railway
- [ ] Aguardar propagação DNS (5-30 minutos)
- [ ] Testar: `https://www.sdrjuridico.com.br`

---

## 🚀 PRÓXIMOS PASSOS

1. **Agora:** Remover domínio sem DNS do Railway
2. **Agora:** Verificar/Adicionar domínio www
3. **Aguardar:** Propagação DNS + SSL
4. **Testar:** `https://www.sdrjuridico.com.br`

**Depois disso, tudo vai funcionar!** ✅
