# 🚀 Guia Completo: Recriar Projeto no Vercel

## 📋 Pré-requisitos

✅ Conta no Vercel (https://vercel.com)  
✅ Repositório GitHub conectado  
✅ Backend rodando no Railway  

---

## 🎯 Passo 1: Acessar o Vercel

1. Acesse: **https://vercel.com**
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"** ou **"New Project"**

---

## 🎯 Passo 2: Importar o Repositório

1. Na lista de repositórios, encontre: **`KesiaDev/legal-lead-scout`**
2. Se não aparecer, clique em **"Adjust GitHub App Permissions"** e autorize o acesso
3. Clique em **"Import"** ao lado do repositório

---

## 🎯 Passo 3: Configurar o Projeto

### **Configurações Básicas:**

Na tela de configuração, preencha:

- **Framework Preset:** `Vite` (deve detectar automaticamente)
- **Root Directory:** `.` (raiz do projeto)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### ⚠️ IMPORTANTE: Não clique em "Deploy" ainda!

---

## 🎯 Passo 4: Adicionar Variáveis de Ambiente

**ANTES de fazer o deploy**, adicione as variáveis de ambiente:

1. Na mesma tela de configuração, role até a seção **"Environment Variables"**
2. Clique em **"Add"** ou **"Add Variable"**
3. Adicione a seguinte variável:

   **Nome:** `VITE_API_URL`  
   **Valor:** `https://sdradvogados.up.railway.app`  
   **Ambientes:** Marque todos (Production, Preview, Development)

4. Clique em **"Save"** ou **"Add"**

### 📝 Variável Necessária:

```
VITE_API_URL=https://sdradvogados.up.railway.app
```

---

## 🎯 Passo 5: Fazer o Deploy

1. Após adicionar a variável de ambiente, clique em **"Deploy"**
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Você verá o progresso em tempo real nos logs

---

## 🎯 Passo 6: Verificar o Deploy

Após o deploy completar:

1. **Status:** Deve aparecer "Ready" (verde)
2. **URL:** Você receberá uma URL como: `legal-lead-scout.vercel.app`
3. **Teste:** Clique em **"Visit"** ou acesse a URL diretamente

---

## 🎯 Passo 7: Testar a Aplicação

1. Acesse a URL do Vercel (ex: `https://legal-lead-scout.vercel.app`)
2. Teste a rota `/login` (ex: `https://legal-lead-scout.vercel.app/login`)
3. Deve carregar a página de login sem erro 404
4. Teste fazer login (se tiver credenciais)

---

## 🔧 Configurações Adicionais (Opcional)

### **Domínio Customizado:**

Se quiser usar um domínio próprio:

1. Vá em **Settings → Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio
4. Configure o DNS conforme as instruções do Vercel

### **Configurações de Build:**

O projeto já está configurado com `vercel.json`, então não precisa de ajustes adicionais.

---

## ✅ Checklist Final

Após recriar o projeto, verifique:

- [ ] Deploy completou sem erros
- [ ] Variável `VITE_API_URL` está configurada
- [ ] URL principal carrega corretamente
- [ ] Rota `/login` funciona (não dá 404)
- [ ] Frontend consegue se conectar ao backend
- [ ] Login funciona (se tiver credenciais)

---

## 🚨 Problemas Comuns

### **Erro 404 nas rotas:**

✅ **Solução:** O `vercel.json` já está configurado. Se ainda der erro, verifique se o arquivo está na raiz do projeto.

### **Erro de conexão com backend:**

✅ **Solução:** Verifique se a variável `VITE_API_URL` está configurada corretamente no Vercel.

### **Build falha:**

✅ **Solução:** Verifique os logs do build no Vercel. Geralmente é problema de dependências ou TypeScript.

---

## 📞 Próximos Passos

Após o deploy funcionar:

1. **Atualizar CORS no Railway:**
   - Vá no Railway → Settings → Variables
   - Adicione/atualize: `CORS_ORIGIN=https://legal-lead-scout.vercel.app`

2. **Testar todas as funcionalidades:**
   - Login
   - Dashboard
   - Leads
   - Conversas
   - Configurações

---

## 🎉 Pronto!

Seu projeto está recriado no Vercel e deve funcionar perfeitamente!

Se encontrar algum problema durante o processo, me avise que eu ajudo a resolver! 🚀
