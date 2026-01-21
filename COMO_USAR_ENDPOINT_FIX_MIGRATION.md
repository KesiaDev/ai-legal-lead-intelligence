# 🔧 Como Usar o Endpoint de Fix Migration

## ✅ Método Mais Simples Agora!

Criei um endpoint temporário no backend que executa o SQL automaticamente.

### **Passo 1: Fazer Login na Plataforma**

1. Acesse sua plataforma (frontend)
2. Faça login com uma conta de **administrador**

### **Passo 2: Executar o Endpoint**

**Opção A: Via Navegador (mais fácil)**

1. Abra o navegador
2. Acesse: `https://sdradvogados.up.railway.app/api/fix-migration`
3. Mas isso vai dar erro porque precisa ser POST e autenticado

**Opção B: Via curl (recomendado)**

1. **Primeiro, faça login e pegue o token:**
   ```bash
   curl -X POST https://sdradvogados.up.railway.app/login \
     -H "Content-Type: application/json" \
     -d '{"email":"seu-email@exemplo.com","password":"sua-senha"}'
   ```

2. **Copie o token da resposta** (campo `token`)

3. **Execute o fix:**
   ```bash
   curl -X POST https://sdradvogados.up.railway.app/api/fix-migration \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

**Opção C: Via Postman/Insomnia**

1. Método: `POST`
2. URL: `https://sdradvogados.up.railway.app/api/fix-migration`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer SEU_TOKEN`
4. Clique em "Send"

---

## 🎯 Método Alternativo: Railway CLI

Se preferir usar o CLI:

```bash
# 1. Login
railway login

# 2. Link
railway link

# 3. Executar script
cd backend
railway run node fix-migration.js
```

---

## ✅ Após Executar

1. **Verificar se funcionou:**
   - A resposta deve mostrar `"success": true`
   - E uma lista de comandos executados

2. **Verificar tabelas:**
   - No Railway Dashboard → Data
   - Deve aparecer: `Pipeline`, `Deal`, `CrmIntegration`

3. **Reiniciar serviço:**
   - Railway Dashboard → Settings → Redeploy

---

## ⚠️ IMPORTANTE

**Depois de aplicar a migration com sucesso, REMOVA o endpoint `/api/fix-migration` do código por segurança!**
