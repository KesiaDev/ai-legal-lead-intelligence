# 🔧 Resolver Erro no Teste Z-API

## ❌ Problemas Identificados

1. **Frontend usando URL antiga:** `sdradvogados.up.railway.app`
2. **Cache do navegador:** Código antigo ainda em cache
3. **Variável de ambiente:** `VITE_API_URL` pode não estar configurada no Vercel

---

## ✅ Solução 1: Limpar Cache do Navegador

### **Chrome/Edge:**
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Período: "Última hora"
4. Clique em "Limpar dados"
5. **Recarregue a página** com `Ctrl + F5` (hard refresh)

### **Ou use o DevTools:**
1. Abra DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione **"Esvaziar cache e recarregar forçadamente"**

---

## ✅ Solução 2: Verificar Variável de Ambiente no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Vá no projeto **legal-lead-scout**
3. **Settings** → **Environment Variables**
4. Verifique se existe:
   - **Nome:** `VITE_API_URL`
   - **Valor:** `https://api.sdrjuridico.com.br`
5. Se não existir, **adicione**:
   - Key: `VITE_API_URL`
   - Value: `https://api.sdrjuridico.com.br`
   - Environment: `Production`, `Preview`, `Development`
6. **Salve** e faça **redeploy**

---

## ✅ Solução 3: Forçar Redeploy do Frontend

1. No Vercel, vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **"Redeploy"**
4. Aguarde o deploy concluir
5. **Limpe o cache** do navegador
6. **Teste novamente**

---

## ✅ Solução 4: Verificar se Backend Está Funcionando

Teste o endpoint diretamente:

```bash
curl -X POST https://api.sdrjuridico.com.br/api/zapi/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "instanceId": "3EDAA0991A2272AFA1183EBEF7B316F4",
    "token": "147E1F8CFCAACFFE1799DFAE",
    "baseUrl": "https://api.z-api.io"
  }'
```

**Se retornar erro 404:** Backend não está deployado ou rota não existe
**Se retornar erro 401:** Token de autenticação inválido
**Se retornar erro 400:** Credenciais do Z-API inválidas

---

## 🎯 Passo a Passo Completo

1. ✅ **Verificar Vercel:**
   - `VITE_API_URL` = `https://api.sdrjuridico.com.br`
   - Fazer redeploy se necessário

2. ✅ **Limpar cache do navegador:**
   - `Ctrl + Shift + Delete`
   - Ou `Ctrl + F5` para hard refresh

3. ✅ **Aguardar deploy:**
   - Backend: Railway
   - Frontend: Vercel

4. ✅ **Testar novamente:**
   - Abrir a página
   - Ir em Configurações → Integrações → Z-API
   - Clicar em "Testar Conexão"

---

## 🔍 Verificar no Console

Após limpar o cache, abra o console (F12) e verifique:

**✅ Correto:**
```
POST https://api.sdrjuridico.com.br/api/zapi/test-connection
```

**❌ Errado:**
```
POST sdradvogados.up.railway.app/api/...
POST api.z-api.io/instances/.../status
```

---

## 📞 Se Ainda Não Funcionar

1. **Abra o console** (F12)
2. **Abra a aba Network**
3. **Tente testar a conexão**
4. **Veja qual requisição está falhando**
5. **Copie a URL completa** da requisição
6. **Compartilhe** para investigação

---

## ✅ Checklist Final

- [ ] `VITE_API_URL` configurada no Vercel
- [ ] Frontend redeployado no Vercel
- [ ] Backend deployado no Railway
- [ ] Cache do navegador limpo
- [ ] Hard refresh feito (`Ctrl + F5`)
- [ ] Console verificado (sem erros de URL antiga)
- [ ] Teste executado novamente
