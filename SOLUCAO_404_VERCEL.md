# 🔧 Solução: Erro 404 no Vercel

## 🐛 Problema

Ao acessar `https://legal-lead-scout.vercel.app/login`, retorna erro 404.

## ✅ Solução Aplicada

Atualizei o `vercel.json` com configuração mais explícita para SPAs.

### **Mudanças:**
1. Adicionado `framework: "vite"` explicitamente
2. Adicionado `buildCommand`, `outputDirectory`, etc.
3. Ajustado regex do rewrite para excluir rotas `/api/`

---

## 🚀 Próximos Passos

### **1. Fazer Redeploy no Vercel**

**Opção A - Via Dashboard:**
1. Acesse: https://vercel.com/dashboard
2. Encontre o projeto `legal-lead-scout`
3. Clique em **"Redeploy"** ou **"Deploy"**
4. Aguarde o build completar

**Opção B - Via Git (Recomendado):**
```bash
# Fazer commit das mudanças
git add vercel.json
git commit -m "fix: ajustar configuração Vercel para SPA"
git push
```

O Vercel vai fazer deploy automaticamente após o push.

---

### **2. Verificar Build**

Após o deploy, verifique:
1. Build completou sem erros
2. `dist/index.html` foi gerado
3. Arquivos estáticos estão em `dist/`

---

### **3. Testar**

Após o redeploy:
1. Acesse: `https://legal-lead-scout.vercel.app/login`
2. Deve carregar a página de login (não mais 404)
3. Teste navegação entre rotas

---

## 🔍 Se Ainda Não Funcionar

### **Verificar no Vercel Dashboard:**

1. **Settings → General:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Settings → Environment Variables:**
   - Verifique se `VITE_API_URL` está configurado
   - Formato: `https://sdradvogados.up.railway.app`

3. **Deployments:**
   - Veja os logs do último deploy
   - Verifique se há erros de build

---

## 🆘 Troubleshooting Avançado

### **Se o problema persistir:**

1. **Limpar cache do Vercel:**
   - Settings → General → Clear Build Cache
   - Fazer novo deploy

2. **Verificar se `dist/` está sendo gerado:**
   ```bash
   npm run build
   ls -la dist/
   ```
   Deve ter `index.html` e outros arquivos.

3. **Testar localmente:**
   ```bash
   npm run build
   npm run preview
   ```
   Acesse `http://localhost:8080/login` e veja se funciona.

---

## ✅ Checklist

- [ ] `vercel.json` atualizado
- [ ] Commit e push feito
- [ ] Deploy no Vercel completado
- [ ] Testado acesso a `/login`
- [ ] Testado navegação entre rotas
- [ ] Verificado logs do deploy

---

**Após o redeploy, o erro 404 deve desaparecer!** 🚀
