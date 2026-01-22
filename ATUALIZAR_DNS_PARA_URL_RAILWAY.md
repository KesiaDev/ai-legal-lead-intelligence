# 🔧 Atualizar DNS para URL Específica do Railway

## ✅ SIM! Precisa Atualizar!

**O Railway está pedindo para usar:**
- `5zo0ywxa.up.railway.app`

**Ao invés de:**
- `legal-lead-scout-production.up.railway.app`

**Por quê?**
- Quando você adiciona um domínio customizado no Railway, ele gera uma **URL específica** para aquele domínio
- Essa URL específica (`5zo0ywxa.up.railway.app`) é diferente da URL geral do serviço
- O DNS **DEVE** apontar para essa URL específica para funcionar corretamente

---

## 🔧 COMO ATUALIZAR

### **Passo 1: Editar o Registro CNAME no DNS**

1. No seu provedor de DNS (onde você configurou o CNAME)
2. Encontre o registro:
   - **Nome:** `www`
   - **Tipo:** `CNAME`
   - **Valor atual:** `legal-lead-scout-production.up.railway.app`
3. **Edite** o registro
4. Altere o **Valor/Dados** para: `5zo0ywxa.up.railway.app`
5. **Salve** as alterações

---

### **Passo 2: Verificar no Railway**

**Após atualizar o DNS:**

1. No Railway, o modal deve mostrar:
   - ✅ **"Record detected"** (ao invés de "Record not yet detected")
2. Aguarde alguns minutos para o Railway detectar
3. O status mudará para **"Setup complete"**

---

## ⏱️ TEMPO DE PROPAGAÇÃO

**Após atualizar o DNS:**
- ⏱️ **5-30 minutos** para propagação DNS
- ⏱️ **Mais alguns minutos** para Railway gerar SSL
- ⏱️ **Total:** ~30-60 minutos

---

## 🧪 VERIFICAR SE FUNCIONOU

**Após aguardar a propagação:**

1. Acesse: `https://www.sdrjuridico.com.br`
2. Deve abrir a plataforma normalmente
3. Verifique se o SSL está funcionando (cadeado verde)

---

## 📋 RESUMO

**O que fazer:**
1. ✅ Editar CNAME no DNS
2. ✅ Alterar valor de `legal-lead-scout-production.up.railway.app` para `5zo0ywxa.up.railway.app`
3. ✅ Salvar
4. ✅ Aguardar propagação (5-30 minutos)
5. ✅ Testar: `https://www.sdrjuridico.com.br`

**Por quê?**
- O Railway gera uma URL específica para cada domínio customizado
- O DNS precisa apontar para essa URL específica
- Isso é **NORMAL** e **NECESSÁRIO**!

---

## ✅ CONFIGURAÇÃO FINAL

**DNS:**
- **Nome:** `www`
- **Tipo:** `CNAME`
- **Valor:** `5zo0ywxa.up.railway.app` ✅

**Railway:**
- **Domínio:** `www.sdrjuridico.com.br`
- **Porta:** `8080`
- **Status:** Aguardando DNS (depois: Setup complete)

**Pronto!** 🚀
