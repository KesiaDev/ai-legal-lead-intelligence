# ✅ Configurar DNS no Railway - Guia Completo

## 🎯 O Que Está Acontecendo

**O Railway está pedindo para configurar DNS** - isso é **NORMAL** e **NECESSÁRIO**!

**O que você vê:**
- Tipo: **CNAME**
- Nome: **api**
- Valor: **ltzoi1pw.up.railway.app**

**Aviso em laranja:**
- Valor atual no DNS: `legal-lead-scout-production.up.railway.app` (incorreto)
- Valor correto: `ltzoi1pw.up.railway.app` (o que o Railway está mostrando)

---

## ✅ O Que Fazer

### **Passo 1: Copiar os Valores**

1. No modal do Railway, copie:
   - **Nome:** `api`
   - **Valor:** `ltzoi1pw.up.railway.app`

---

### **Passo 2: Acessar Seu Provedor de Domínio**

1. Acesse o painel do seu provedor de domínio:
   - GoDaddy
   - Namecheap
   - Registro.br
   - Cloudflare
   - Outro

2. Vá em **DNS Management** ou **Gerenciamento de DNS**

---

### **Passo 3: Configurar o Registro CNAME**

1. Procure por registros DNS existentes para `api.sdrjuridico.com.br`
2. Se existir um registro CNAME com valor `legal-lead-scout-production.up.railway.app`:
   - **Edite** e altere para: `ltzoi1pw.up.railway.app`
3. Se NÃO existir:
   - **Adicione** um novo registro:
     - **Tipo:** CNAME
     - **Nome/Host:** `api`
     - **Valor/Target:** `ltzoi1pw.up.railway.app`
     - **TTL:** 3600 (ou padrão)

4. **Salve** as alterações

---

## ⚠️ IMPORTANTE: Isso Não Vai Quebrar Nada!

### **Por Que Está Aparecendo Isso:**

1. ✅ Você moveu o domínio para o serviço correto (backend)
2. ✅ O Railway gerou uma nova URL interna: `ltzoi1pw.up.railway.app`
3. ✅ O DNS precisa apontar para essa nova URL
4. ✅ Isso é **NORMAL** e **NECESSÁRIO**

### **O Que Vai Acontecer:**

- ✅ Após configurar o DNS, o domínio vai funcionar
- ✅ A rota `/api/agent/intake` vai responder
- ✅ O 502 Bad Gateway vai ser resolvido
- ✅ Nada vai quebrar!

---

## ⏱️ Tempo de Propagação DNS

**O Railway avisa:**
> "As alterações de DNS podem levar até 72 horas para se propagarem mundialmente"

**Na prática:**
- ⏱️ Geralmente: **5-30 minutos**
- ⏱️ Máximo: **72 horas** (raro)
- ⏱️ Média: **1-2 horas**

**Como verificar:**
- Use: https://dnschecker.org
- Digite: `api.sdrjuridico.com.br`
- Verifique se está apontando para `ltzoi1pw.up.railway.app`

---

## 🧪 Testar Após Configurar DNS

### **Aguarde alguns minutos** (propagação DNS)

Depois teste:

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste",
    "canal": "whatsapp"
  }'
```

**Resposta esperada (200 OK):**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "analise": {
    ...
  }
}
```

---

## 📋 Checklist

- [ ] Copiei o valor correto: `ltzoi1pw.up.railway.app`
- [ ] Acessei o painel do provedor de domínio
- [ ] Editei/Adicionei registro CNAME:
  - Nome: `api`
  - Valor: `ltzoi1pw.up.railway.app`
- [ ] Salvei as alterações
- [ ] Aguardei propagação DNS (5-30 minutos)
- [ ] Testei a rota e funcionou?

---

## 🆘 Se Não Souber Onde Configurar DNS

### **Provedores Comuns:**

**GoDaddy:**
1. Login → Meus Produtos → Domínios
2. Clique no domínio `sdrjuridico.com.br`
3. Aba "DNS" ou "Gerenciamento de DNS"
4. Adicione/Edite registro CNAME

**Namecheap:**
1. Login → Domain List
2. Clique em "Manage" no domínio
3. Aba "Advanced DNS"
4. Adicione/Edite registro CNAME

**Registro.br:**
1. Login → Meus Domínios
2. Clique no domínio
3. Aba "DNS" ou "Zona DNS"
4. Adicione/Edite registro CNAME

**Cloudflare:**
1. Login → Selecione o domínio
2. Aba "DNS"
3. Adicione/Edite registro CNAME

---

## ✅ Resumo

**O que fazer:**
1. ✅ Copiar valor: `ltzoi1pw.up.railway.app`
2. ✅ Acessar provedor de domínio
3. ✅ Configurar CNAME: `api` → `ltzoi1pw.up.railway.app`
4. ✅ Salvar
5. ✅ Aguardar propagação (5-30 min)
6. ✅ Testar

**Isso não vai quebrar nada!** É o processo normal de configuração de domínio customizado.

---

**Pronto! Configure o DNS e aguarde a propagação. Depois teste a rota!** 🚀
