# 🔧 CORREÇÃO URGENTE: Frontend Usando URL Antiga

## ❌ PROBLEMA IDENTIFICADO

O frontend em produção está chamando `sdradvogados.up.railway.app` em vez de `api.sdrjuridico.com.br`.

**Evidência:**
- Console mostra erros 500 de `sdradvogados.up.rail...app/api/pipelines`
- Console mostra erros 500 de `sdradvogados.up.rail...app/api/agent/config`
- Console mostra erros 500 de `sdradvogados.up.rail...app/api/voice/config`

## ✅ SOLUÇÃO (3 PASSOS)

### 1️⃣ VERIFICAR VARIÁVEL NO RAILWAY (FRONTEND)

1. Acesse: https://railway.app/dashboard
2. Selecione o projeto
3. **Identifique o service do FRONTEND** (pode ter nome como "Frontend", "legal-lead-scout", etc.)
4. Clique no service do frontend
5. Vá em **Variables** (aba lateral)
6. Procure por `VITE_API_URL`
7. **Confirme que o valor é:**
   ```
   https://api.sdrjuridico.com.br
   ```
8. **Se não existir ou estiver diferente:**
   - Clique em **"+ New Variable"**
   - Name: `VITE_API_URL`
   - Value: `https://api.sdrjuridico.com.br`
   - Clique em **Add**

### 2️⃣ FORÇAR REDEPLOY DO FRONTEND

Após configurar a variável:

1. No Railway, no service do frontend
2. Vá em **Deployments**
3. Clique nos **3 pontinhos** do último deployment
4. Selecione **Redeploy**
5. Aguarde o deploy completar (3-5 minutos)

**OU**

1. Faça um commit vazio:
   ```bash
   git commit --allow-empty -m "fix: force redeploy with correct API URL"
   git push origin main
   ```

### 3️⃣ LIMPAR CACHE DO NAVEGADOR

Após o redeploy:

1. Abra o DevTools (F12)
2. Clique com botão direito no botão de **Recarregar**
3. Selecione **Limpar cache e recarregar forçadamente**
4. **OU** use `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)

## 🔍 VERIFICAÇÃO

Após os 3 passos:

1. Abra o console do navegador (F12)
2. Vá na aba **Network**
3. Recarregue a página
4. Procure por requisições para `/api/pipelines`, `/api/agent/config`, etc.
5. **Confirme que a URL é:**
   ```
   https://api.sdrjuridico.com.br/api/...
   ```
   **NÃO deve ser:**
   ```
   https://sdradvogados.up.railway.app/api/...
   ```

## ⚠️ SE AINDA NÃO FUNCIONAR

Se após os 3 passos o frontend ainda usar a URL antiga:

1. **Verifique os logs de build:**
   - No Railway, no service do frontend
   - Vá em **Deployments** → último deployment
   - Clique em **Build Logs**
   - Procure por `VITE_API_URL` nos logs
   - Confirme que aparece: `VITE_API_URL=https://api.sdrjuridico.com.br`

2. **Verifique se a variável está no service correto:**
   - Confirme que você está editando as variáveis do **service do frontend**
   - Não confunda com o service do backend
   - Cada service no Railway tem suas próprias variáveis

3. **Force um novo build:**
   - No Railway, vá em **Settings** do service do frontend
   - Clique em **Redeploy**
   - Ou faça um novo commit e push
   - Aguarde o novo deploy

## 📝 NOTA IMPORTANTE

O código do frontend está **correto**:
- `src/api/client.ts` usa `import.meta.env.VITE_API_URL`
- Fallback é `https://api.sdrjuridico.com.br`
- Não há URLs hardcoded

O problema é **100% de configuração no Railway** (variável `VITE_API_URL` no service do frontend) ou **cache do navegador**.

**⚠️ LEMBRE-SE:**
- Variáveis `VITE_*` precisam estar configuradas **ANTES** do build
- Se você adicionar a variável depois do build, precisa fazer um **novo deploy**
- Cada service no Railway tem suas próprias variáveis de ambiente
