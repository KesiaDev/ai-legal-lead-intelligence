# 🔧 Executar SQL no Railway via CLI

## 📋 Passo a Passo

### **1. Instalar Railway CLI**

```bash
npm i -g @railway/cli
```

### **2. Fazer Login**

```bash
railway login
```

Isso vai abrir o navegador para você fazer login.

### **3. Conectar ao Projeto**

```bash
railway link
```

Selecione o projeto "SDR Advogados" quando perguntado.

### **4. Executar o SQL**

```bash
cd backend
railway run psql $DATABASE_URL -c "$(cat prisma/migrations/20250120000000_add_pipelines_and_deals/migration_safe.sql)"
```

Ou execute diretamente:

```bash
railway run psql $DATABASE_URL << 'EOF'
-- Cole todo o SQL aqui
EOF
```

---

## 🎯 Método Alternativo: Via Arquivo

1. **Criar arquivo temporário com o SQL:**
   - Copie o conteúdo de `migration_safe.sql`
   - Salve como `fix_migration.sql` na raiz do projeto

2. **Executar:**
   ```bash
   railway run psql $DATABASE_URL -f fix_migration.sql
   ```

---

## 🆘 Se Railway CLI Não Funcionar

### **Opção: Usar Cliente PostgreSQL Externo**

1. **Obter DATABASE_URL:**
   - Railway Dashboard → Backend → Variables
   - Copie o valor de `DATABASE_URL`

2. **Usar DBeaver, pgAdmin ou outro cliente:**
   - Conecte usando a `DATABASE_URL`
   - Execute o SQL

---

## ✅ Verificar se Funcionou

Após executar, verifique se as tabelas foram criadas:

```bash
railway run psql $DATABASE_URL -c "\dt"
```

Deve aparecer: `Pipeline`, `Deal`, `CrmIntegration`
