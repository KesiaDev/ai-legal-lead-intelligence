# 🔐 Como Fazer Login no Frontend

## 📋 GUIA COMPLETO DE LOGIN

---

## 1. ✅ ACESSAR PÁGINA DE LOGIN

### Opção 1: URL Direta
Acesse no navegador:
```
https://www.sdrjuridico.com.br/login
```

### Opção 2: Redirecionamento Automático
- Se você não estiver autenticado e tentar acessar qualquer página protegida
- O sistema redireciona automaticamente para `/login`

---

## 2. 📝 OPÇÕES DISPONÍVEIS

A página de login possui **duas abas**:

### Aba 1: **"Entrar"** (Login)
- Para usuários que já têm conta
- Requer: **Email** e **Senha**

### Aba 2: **"Criar Conta"** (Register)
- Para novos usuários
- Requer: **Nome**, **Email**, **Senha** e **Nome do Escritório**

---

## 3. 🔑 FAZER LOGIN (Se já tem conta)

### Passo a Passo:

1. **Acesse:** `https://www.sdrjuridico.com.br/login`

2. **Certifique-se de estar na aba "Entrar"** (primeira aba)

3. **Preencha os campos:**
   - **Email:** Seu email cadastrado
   - **Senha:** Sua senha

4. **Clique em "Entrar"**

5. **Aguarde:**
   - Se as credenciais estiverem corretas, você será redirecionado para o dashboard
   - Se houver erro, uma mensagem será exibida

### ⚠️ Se não lembrar a senha:
- Por enquanto, não há recuperação de senha implementada
- Você precisará criar uma nova conta ou entrar em contato com o suporte

---

## 4. ✨ CRIAR NOVA CONTA (Primeiro acesso)

### Passo a Passo:

1. **Acesse:** `https://www.sdrjuridico.com.br/login`

2. **Clique na aba "Criar Conta"** (segunda aba)

3. **Preencha os campos:**
   - **Nome:** Seu nome completo
   - **Email:** Seu email (será usado para login)
   - **Nome do Escritório:** Nome do seu escritório de advocacia
   - **Senha:** Mínimo de 6 caracteres

4. **Clique em "Criar Conta"**

5. **Aguarde:**
   - Se tudo estiver correto, sua conta será criada e você será redirecionado para o dashboard
   - Um **Tenant** (escritório) será criado automaticamente
   - Você será o **admin** do seu tenant

### 📌 Importante:
- O primeiro usuário criado em um tenant recebe a role **"admin"**
- Cada tenant é isolado (multi-tenancy)
- Você pode criar múltiplos usuários para o mesmo tenant depois

---

## 5. 🧪 TESTAR LOGIN DIRETAMENTE (Via API)

Se quiser testar o login diretamente via API:

### Obter Token:
```bash
curl -X POST https://api.sdrjuridico.com.br/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "sua_senha"
  }'
```

### Resposta Esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "seu@email.com",
    "name": "Seu Nome",
    "role": "admin"
  },
  "tenant": {
    "id": "uuid",
    "name": "Nome do Escritório"
  }
}
```

### Usar Token:
```bash
# Salvar token em variável
TOKEN="seu_token_aqui"

# Testar endpoint autenticado
curl -X GET https://api.sdrjuridico.com.br/api/integrations \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. 🔍 VERIFICAR SE ESTÁ LOGADO

### No Console do Navegador (F12):

```javascript
// Verificar token
console.log('Token:', localStorage.getItem('auth_token'));

// Verificar usuário (se disponível no contexto)
// Isso depende da implementação do AuthContext
```

### No Frontend:
- Se você estiver logado, verá o dashboard
- Se não estiver logado, será redirecionado para `/login`

---

## 7. 🚪 FAZER LOGOUT

### Opção 1: Via Interface
- Clique no menu do usuário (canto superior direito)
- Selecione "Sair" ou "Logout"

### Opção 2: Via Console
```javascript
localStorage.removeItem('auth_token');
window.location.href = '/login';
```

---

## 8. ⚠️ PROBLEMAS COMUNS

### Problema: "Erro ao fazer login"
**Possíveis causas:**
1. Email ou senha incorretos
2. Backend não está acessível
3. URL da API incorreta no frontend

**Solução:**
1. Verificar credenciais
2. Verificar se backend está rodando: `https://api.sdrjuridico.com.br/health`
3. Verificar variável `VITE_API_URL` no Vercel

### Problema: "Email já cadastrado"
**Causa:** Tentando criar conta com email que já existe

**Solução:**
- Use a aba "Entrar" em vez de "Criar Conta"
- Ou use um email diferente

### Problema: Redirecionamento infinito
**Causa:** Token inválido ou expirado

**Solução:**
1. Limpar localStorage: `localStorage.clear()`
2. Recarregar página
3. Fazer login novamente

---

## 9. 📊 ESTRUTURA DE AUTENTICAÇÃO

### Fluxo de Login:
1. Usuário preenche email e senha
2. Frontend envia `POST /login` para backend
3. Backend valida credenciais
4. Backend retorna token JWT + dados do usuário
5. Frontend salva token no `localStorage`
6. Frontend redireciona para dashboard
7. Todas as requisições subsequentes incluem token no header `Authorization: Bearer <token>`

### Token JWT:
- Contém: `{ id, tenantId }`
- Armazenado em: `localStorage.getItem('auth_token')`
- Enviado em: Header `Authorization: Bearer <token>`
- Expiração: Configurada no backend (verificar `JWT_SECRET`)

---

## 10. ✅ CHECKLIST DE LOGIN

- [ ] Acessar `https://www.sdrjuridico.com.br/login`
- [ ] Página de login carrega corretamente
- [ ] Aba "Entrar" funciona
- [ ] Aba "Criar Conta" funciona
- [ ] Login com credenciais válidas funciona
- [ ] Redirecionamento para dashboard após login
- [ ] Token é salvo no localStorage
- [ ] Requisições autenticadas funcionam
- [ ] Logout funciona

---

## 11. 🔗 LINKS ÚTEIS

- **Frontend:** https://www.sdrjuridico.com.br/login
- **Backend API:** https://api.sdrjuridico.com.br
- **Health Check:** https://api.sdrjuridico.com.br/health

---

**Última Atualização:** 2026-01-23
**Status:** Funcional - Aguardando primeiro acesso ou credenciais existentes
