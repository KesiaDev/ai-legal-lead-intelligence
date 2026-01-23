# 👤 Como Criar Usuário de Teste

## 🎯 Opção 1: Usar a Tela de Cadastro (Mais Fácil)

1. Na tela de login, clique na aba **"Criar Conta"**
2. Preencha:
   - **Nome:** Seu nome
   - **Email:** `kesiawnandi@gmail.com` (ou outro email)
   - **Senha:** Uma senha (ex: `123456`)
   - **Nome do Escritório:** Nome do seu escritório
3. Clique em **"Criar Conta"**
4. Depois, faça login com essas credenciais

---

## 🎯 Opção 2: Usar cURL (Via Terminal)

Execute este comando no terminal (substitua os valores):

```bash
curl -X POST https://sdradvogados.up.railway.app/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kesiawnandi@gmail.com",
    "name": "Seu Nome",
    "password": "123456",
    "tenantName": "Meu Escritório"
  }'
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "kesiawnandi@gmail.com",
    "name": "Seu Nome",
    "role": "admin"
  },
  "tenant": {
    "id": "...",
    "name": "Meu Escritório"
  }
}
```

---

## 🎯 Opção 3: Usar Postman ou Insomnia

1. **Método:** POST
2. **URL:** `https://sdradvogados.up.railway.app/register`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (JSON):**
   ```json
   {
     "email": "kesiawnandi@gmail.com",
     "name": "Seu Nome",
     "password": "123456",
     "tenantName": "Meu Escritório"
   }
   ```
5. Clique em **Send**

---

## ✅ Depois de Criar o Usuário

1. Volte para a tela de login
2. Use as credenciais que você criou:
   - **Email:** `kesiawnandi@gmail.com`
   - **Senha:** A senha que você definiu
3. Clique em **"Entrar"**

---

## 🔍 Verificar se o Usuário Foi Criado

Você pode testar o login via cURL:

```bash
curl -X POST https://sdradvogados.up.railway.app/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kesiawnandi@gmail.com",
    "password": "123456"
  }'
```

**Se funcionar, você receberá um token JWT!**

---

## 🚨 Problemas Comuns

### **Erro: "Email já cadastrado"**
- O usuário já existe
- Tente fazer login com esse email
- Ou use outro email para criar

### **Erro: "Campos obrigatórios ausentes"**
- Verifique se todos os campos foram preenchidos:
  - `email`
  - `name`
  - `password`
  - `tenantName`

### **Erro de CORS**
- O backend já está configurado para aceitar requisições do frontend
- Se der erro, verifique se a URL do backend está correta
