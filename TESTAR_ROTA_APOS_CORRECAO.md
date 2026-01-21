# ✅ Testar Rota Após Correção da Porta

## 🎉 Configuração Corrigida!

**Status Atual:**
- ✅ Domínio: `api.sdrjuridico.com.br`
- ✅ Serviço: "SDR Advogados Backend"
- ✅ Porta: **3001** (corrigida!)
- ✅ Status: "Setup complete"

---

## 🧪 Como Testar

### **Teste 1: Testar no Navegador**

Acesse:
```
https://api.sdrjuridico.com.br/api/agent/intake
```

**Resultado esperado:**
- ❌ `404 Cannot GET` → ✅ **OK!** (rota é POST, não GET)
- ❌ `405 Method Not Allowed` → ✅ **OK!** (rota existe, mas método errado)
- ❌ JSON de erro do Fastify → ✅ **OK!** (rota existe)

**Resultado ERRADO:**
- ❌ Página HTML
- ❌ 404 Not Found
- ❌ Timeout

---

### **Teste 2: Testar com curl (Recomendado)**

```bash
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-123",
    "mensagem": "Teste de mensagem",
    "canal": "whatsapp",
    "clienteId": "test-tenant"
  }'
```

**Resposta esperada (200 OK):**
```json
{
  "lead_id": "test-123",
  "canal": "whatsapp",
  "clienteId": "test-tenant",
  "analise": {
    "area": "Direito Civil",
    "urgencia": "media",
    "score": 75,
    "acao": "qualificar",
    "etapa_funil": "novo",
    "prioridade": "normal"
  },
  "timestamp": "2026-01-20T..."
}
```

**Se retornar 200 com JSON:** ✅ **FUNCIONANDO!**

**Se retornar 404:** ❌ Ainda há problema (verifique logs do backend)

---

### **Teste 3: Testar no N8N**

1. Abra seu workflow no N8N
2. Vá no node **"POST - Inbound Message (Backend)"**
3. Verifique a URL:
   ```
   https://api.sdrjuridico.com.br/api/agent/intake
   ```
4. Execute o workflow
5. Verifique se retorna 200 OK

---

## 🔍 Se Ainda Não Funcionar

### **Verificar Logs do Backend:**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba "Deployments" → Último deploy → "View Logs"
3. Procure por:
   - ✅ `🚀 API rodando na porta 3001`
   - ✅ `Route registered: /api/agent/intake`
   - ❌ Erros de inicialização

---

### **Verificar Variável PORT:**

1. Railway → Serviço "SDR Advogados Backend"
2. Aba "Variables"
3. Verifique se `PORT=3001` está configurado

**Se não estiver:**
- Adicione: `PORT=3001`
- Salve
- Faça redeploy (se necessário)

---

### **Verificar se Backend Está Online:**

1. Railway → Serviço "SDR Advogados Backend"
2. Verifique se status é **"Online"** (bolinha verde)

**Se estiver offline:**
- Vá em "Deployments"
- Clique em "Redeploy" ou verifique erros

---

## ✅ Checklist Final

- [ ] Porta no Networking: **3001** ✅
- [ ] Domínio: `api.sdrjuridico.com.br` ✅
- [ ] Serviço: "SDR Advogados Backend" ✅
- [ ] Status: "Setup complete" ✅
- [ ] Backend está "Online"?
- [ ] Variável `PORT=3001` configurada?
- [ ] Teste com curl retorna 200?
- [ ] N8N consegue enviar requisições?

---

## 🎯 Próximos Passos

1. **Teste a rota** com curl ou Postman
2. **Se funcionar:** Atualize o N8N com a URL correta
3. **Se não funcionar:** Verifique logs do backend

---

**Pronto! Agora teste e me diga o resultado!** 🚀
