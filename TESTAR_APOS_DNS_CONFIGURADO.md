# ✅ Testar Após DNS Configurado

## 🎉 DNS Configurado Corretamente!

**Registro DNS:**
- ✅ Tipo: CNAME
- ✅ Nome: `api.sdrjuridico.com.br`
- ✅ Dados: `ltzoi1pw.up.railway.app`

---

## ⏱️ Aguardar Propagação DNS

**Tempo de propagação:**
- ⏱️ Geralmente: **5-30 minutos**
- ⏱️ Máximo: **72 horas** (raro)
- ⏱️ Média: **1-2 horas**

**O que acontece:**
- O DNS precisa se propagar globalmente
- Servidores DNS ao redor do mundo precisam atualizar
- Após propagar, o domínio vai funcionar

---

## 🧪 Como Testar

### **Teste 1: Verificar Propagação DNS**

Use: https://dnschecker.org

1. Digite: `api.sdrjuridico.com.br`
2. Selecione: **CNAME**
3. Clique em **"Search"**
4. Verifique se está apontando para: `ltzoi1pw.up.railway.app`

**Se estiver:** ✅ DNS propagado!

**Se ainda não estiver:** ⏱️ Aguarde mais tempo

---

### **Teste 2: Testar Rota Diretamente**

**Aguarde 5-30 minutos** e depois teste:

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste de mensagem",
    "canal": "whatsapp"
  }'
```

**Resposta esperada (200 OK):**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "analise": {
    "area": "Direito Civil",
    "urgencia": "media",
    "score": 75,
    "acao": "qualificar",
    "etapa_funil": "novo",
    "prioridade": "normal"
  },
  "timestamp": "2026-01-21T..."
}
```

**Se retornar 200 OK:** ✅ **FUNCIONANDO!**

**Se retornar 502:** ⏱️ DNS ainda não propagou (aguarde mais)

**Se retornar 404:** Verifique se o backend está rodando

---

### **Teste 3: Testar no N8N**

1. Abra seu workflow no N8N
2. Vá no node **"POST - Inbound Message (Backend)"**
3. Verifique se a URL está:
   ```
   https://api.sdrjuridico.com.br/api/agent/intake
   ```
4. Execute o workflow
5. Verifique se retorna **200 OK**

---

## 📋 Checklist Final

- [ ] DNS configurado corretamente ✅
- [ ] Aguardei propagação DNS (5-30 minutos)
- [ ] Verifiquei propagação em https://dnschecker.org
- [ ] Testei a rota com curl/Postman
- [ ] Retornou 200 OK?
- [ ] Testei no N8N
- [ ] Funcionou no workflow?

---

## 🎯 Próximos Passos

### **Se Funcionou:**

1. ✅ Atualize o N8N com a URL correta
2. ✅ Teste o workflow completo
3. ✅ Verifique se leads aparecem na plataforma

---

### **Se Ainda Não Funcionou:**

1. **Verifique propagação DNS:**
   - Use https://dnschecker.org
   - Aguarde mais tempo se necessário

2. **Verifique backend:**
   - Railway → Serviço "SDR Advogados Backend"
   - Status: "Online"?
   - Logs: `🚀 API rodando na porta 3001`?

3. **Teste com URL Railway direta:**
   ```
   https://ltzoi1pw.up.railway.app/api/agent/intake
   ```
   Se funcionar: Problema é DNS (aguarde propagação)
   Se não funcionar: Problema é backend (verifique logs)

---

## ✅ Resumo

**Status:**
- ✅ DNS configurado corretamente
- ⏱️ Aguardando propagação DNS
- 🧪 Próximo passo: Testar a rota

**O que fazer agora:**
1. Aguarde 5-30 minutos
2. Teste a rota com curl/Postman
3. Se funcionar: Teste no N8N
4. Se não funcionar: Verifique propagação DNS

---

**Pronto! Aguarde a propagação DNS e teste a rota!** 🚀
