# ✅ CHECKLIST FINAL - RAILWAY (Para ChatGPT)

## 🎯 OBJETIVO
Identificar qual service no Railway está realmente em uso e garantir que o frontend aponte para ele.

---

## 1️⃣ RAILWAY → SERVICES (PASSO CRÍTICO)

### Perguntas para o Usuário:

**1. Quantos services existem nesse projeto no Railway?**

**Instrução para o usuário:**
- Acesse: https://railway.app/dashboard
- Selecione o projeto
- Conte quantos "services" aparecem na lista

**Resposta esperada:**
```
Exemplo: "Vejo 2 services" ou "Vejo 3 services"
```

---

**2. Quais são os nomes dos services?**

**Instrução para o usuário:**
- Liste o nome de cada service que aparece

**Resposta esperada:**
```
Exemplo:
- Service 1: "legal-lead-scout-backend"
- Service 2: "legal-lead-scout-frontend"
- Service 3: "sdradvogados" (ou nome similar)
```

---

**3. Qual service tem o domínio `sdradvogados.up.railway.app`?**

**Instrução para o usuário:**
- Para cada service, clique nele
- Vá em **Settings** → **Networking** → **Custom Domain** ou **Public Domain**
- Verifique qual service mostra a URL: `sdradvogados.up.railway.app`

**Resposta esperada:**
```
Exemplo: "O service 'sdradvogados' tem o domínio sdradvogados.up.railway.app"
```

**⚠️ IMPORTANTE:** Esse é o service que importa agora!

---

## 2️⃣ RAILWAY → DEPLOYMENTS

### Pergunta para o Usuário:

**4. Qual é o último commit hash no service que tem `sdradvogados.up.railway.app`?**

**Instrução para o usuário:**
- No service identificado acima, clique na aba **Deployments**
- Clique no deployment mais recente (primeiro da lista)
- Procure por:
  - **Commit hash** (ex: `c66fc31`, `223162a`, `800a0ec`)
  - **Commit message** (deve conter palavras como "validacao", "auto-create", "tenantId")

**Resposta esperada:**
```
Exemplo:
- Commit hash: "c66fc31"
- Commit message: "docs: adicionar guia completo de como fazer login no frontend"
```

**❌ Se o commit não contém:**
- "validacao robusta de tenantId" (commit `800a0ec`)
- "auto-create de configuracoes" (commit `47298a4`)
- "remover migration em runtime" (commit `d84221f`)

**Então você está olhando o service errado!**

---

## 3️⃣ RAILWAY → RESTART FORÇADO

### Pergunta para o Usuário:

**5. Após fazer restart, o que aparece nos logs?**

**Instrução para o usuário:**
- No service correto, clique em **Restart** (ou **Redeploy**)
- Aguarde o deploy completar
- Vá em **Logs**
- Procure por estas linhas (na ordem):

```
prisma migrate deploy
prisma generate
Server listening on port 3001
```

**Resposta esperada:**
```
✅ "Vejo todas as 3 linhas nos logs"
ou
❌ "Não vejo prisma migrate deploy"
ou
❌ "Não vejo prisma generate"
ou
❌ "Vejo erro nos logs"
```

**⚠️ Se não aparecer essas linhas → não é o backend certo!**

---

## 4️⃣ TESTE DIRETO (SEM FRONTEND)

### Pergunta para o Usuário:

**6. O que acontece quando você acessa `https://sdradvogados.up.railway.app/api/integrations`?**

**Instrução para o usuário:**
- Abra no navegador: `https://sdradvogados.up.railway.app/api/integrations`
- Ou use curl:
  ```bash
  curl https://sdradvogados.up.railway.app/api/integrations
  ```
- Observe a resposta

**Resposta esperada:**

| Resultado | Significado |
|-----------|-------------|
| **401** com `{"error": "Não autenticado"}` | ✅ Backend correto e atualizado |
| **200** com dados JSON | ✅ Backend correto (se autenticado) |
| **500** com erro | ❌ Backend errado ou não atualizado |
| **404** | ❌ Service não é backend |
| **502/503** | ❌ Service não está rodando |

**Resposta do usuário:**
```
Exemplo: "Retorna 401 com mensagem 'Não autenticado'"
ou
"Retorna 500 com erro interno"
```

---

## 5️⃣ FRONTEND (CONFIRMAÇÃO FINAL)

### Pergunta para o Usuário:

**7. Qual é o valor de `VITE_API_URL` no Vercel?**

**Instrução para o usuário:**
- Acesse: https://vercel.com/dashboard
- Selecione o projeto do frontend
- Vá em **Settings** → **Environment Variables**
- Procure por `VITE_API_URL`
- Diga qual é o valor

**Resposta esperada:**
```
Exemplo:
✅ "VITE_API_URL = https://api.sdrjuridico.com.br"
ou
✅ "VITE_API_URL = https://sdradvogados.up.railway.app"
ou
❌ "VITE_API_URL = https://outro-dominio.com"
ou
❌ "VITE_API_URL não existe"
```

**⚠️ Se o valor for diferente de `https://sdradvogados.up.railway.app` ou `https://api.sdrjuridico.com.br`:**
- O frontend nunca vai funcionar
- Precisa corrigir no Vercel

---

## 📊 RESUMO PARA CHATGPT

### Informações Necessárias do Usuário:

1. **Quantos services existem?** → Número
2. **Nome do service com `sdradvogados.up.railway.app`?** → Nome exato
3. **Último commit hash desse service?** → Hash (ex: `c66fc31`)
4. **Logs mostram `prisma migrate deploy` e `prisma generate`?** → Sim/Não
5. **Teste direto retorna 401 ou 500?** → Status code
6. **Valor de `VITE_API_URL` no Vercel?** → URL completa

### Análise Esperada:

**Se o usuário responder:**
- Service com domínio `sdradvogados.up.railway.app` existe
- Commit hash é recente (contém validação/auto-create)
- Logs mostram `prisma migrate deploy` e `prisma generate`
- Teste retorna 401 (não 500)
- `VITE_API_URL` aponta para o service correto

**Então:** ✅ Tudo está correto, o problema pode ser outra coisa.

**Se o usuário responder:**
- Service com domínio `sdradvogados.up.railway.app` não existe ou é diferente
- Commit hash é antigo (não contém validação/auto-create)
- Logs não mostram `prisma migrate deploy` e `prisma generate`
- Teste retorna 500
- `VITE_API_URL` aponta para URL errada

**Então:** ❌ O backend em produção NÃO é o backend que foi alterado. Precisa:
1. Identificar o service correto
2. Fazer deploy do código atualizado nele
3. Atualizar `VITE_API_URL` no Vercel

---

## 🎯 RESPOSTA FINAL ESPERADA DO USUÁRIO

**Formato:**
```
1. Quantos services: [número]
2. Service com sdradvogados.up.railway.app: [nome exato]
3. Último commit hash: [hash]
4. Logs mostram prisma: [Sim/Não]
5. Teste retorna: [401/500/outro]
6. VITE_API_URL: [URL ou "não existe"]
```

**Exemplo de resposta:**
```
1. Quantos services: 2
2. Service com sdradvogados.up.railway.app: legal-lead-scout-backend
3. Último commit hash: c66fc31
4. Logs mostram prisma: Sim
5. Teste retorna: 401
6. VITE_API_URL: https://api.sdrjuridico.com.br
```

---

## 🔧 AÇÕES BASEADAS NAS RESPOSTAS

### Se Service Correto + Commit Atualizado + Teste 401:
✅ **Backend está correto!**
- Próximo passo: Verificar frontend
- Verificar se `VITE_API_URL` está configurada
- Fazer redeploy do frontend

### Se Service Correto + Commit Antigo + Teste 500:
❌ **Backend não está atualizado!**
- Fazer novo deploy no service correto
- Ou verificar se há outro service que deveria ser usado

### Se Service Errado:
❌ **Service errado identificado!**
- Identificar qual service DEVERIA ter o domínio
- Atualizar domínio customizado no Railway
- Ou atualizar `VITE_API_URL` para apontar para o service correto

---

**Última Atualização:** 2026-01-23
**Status:** Aguardando respostas do usuário
