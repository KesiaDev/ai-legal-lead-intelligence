# 🚀 Executar Resolver Migration

## 📋 Passo a Passo

### 1. Obter DATABASE_URL do Railway

1. Acesse **Railway Dashboard**
2. Vá em **Data** → **Postgres**
3. Clique em **Public Network**
4. **Copie a Connection URL completa**

### 2. Executar o Comando

No terminal do Cursor, na pasta `backend`, execute:

```bash
DATABASE_URL="COLE_AQUI_A_DATABASE_URL_DO_RAILWAY" npx prisma migrate resolve --applied 20250120000000_add_pipelines_and_deals --schema=prisma/schema.prisma
```

**Substitua `COLE_AQUI_A_DATABASE_URL_DO_RAILWAY` pela URL que você copiou.**

### 3. Resultado Esperado

Você deve ver:

```
✔ Migration 20250120000000_add_pipelines_and_deals marked as applied.
```

### 4. Redeploy no Railway

Depois de ver a mensagem acima:
1. Railway Dashboard → **Deployments**
2. Clique em **Redeploy**

---

## ✅ Pronto!

Após o redeploy, o servidor deve iniciar normalmente sem erro P3009.
