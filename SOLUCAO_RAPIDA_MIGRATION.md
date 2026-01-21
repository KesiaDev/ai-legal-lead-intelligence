# ⚡ Solução Rápida: Aplicar Migration no Railway

## 🎯 Método Mais Simples (Recomendado)

### **Opção 1: Via Railway CLI (Já Instalado!)**

1. **Fazer login no Railway:**
   ```bash
   railway login
   ```
   Isso vai abrir o navegador para você fazer login.

2. **Conectar ao projeto:**
   ```bash
   railway link
   ```
   Selecione o projeto "SDR Advogados".

3. **Executar o script de correção:**
   ```bash
   cd backend
   railway run node fix-migration.js
   ```

---

## 🎯 Método 2: Via Script Node.js Direto

Se o método acima não funcionar:

1. **Executar o script:**
   ```bash
   cd backend
   railway run node fix-migration.js
   ```

---

## 🎯 Método 3: Executar SQL Direto via Railway CLI

```bash
# 1. Login
railway login

# 2. Link
railway link

# 3. Executar SQL
cd backend
railway run psql $DATABASE_URL -f prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql
```

---

## 🎯 Método 4: Criar Endpoint Temporário no Backend

Se nenhum método acima funcionar, posso criar um endpoint temporário no backend que executa o SQL quando você acessar uma URL específica.

---

## ✅ Qual Método Usar?

**Comece pelo Método 1** (Railway CLI + script Node.js) - é o mais simples e seguro!

Se der erro, me avise qual erro apareceu e eu te ajudo a resolver.
