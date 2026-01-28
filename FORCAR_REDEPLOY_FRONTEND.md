# 🔄 FORÇAR REDEPLOY DO FRONTEND

## ✅ VARIÁVEIS ESTÃO CORRETAS!

Você confirmou que:
- ✅ `VITE_API_URL` = `https://api.sdrjuridico.com.br`
- ✅ `VITE_WS_URL` = `wss://api.sdrjuridico.com.br`

## ❌ PROBLEMA

O frontend ainda está usando a URL antiga porque:
- Variáveis `VITE_*` são injetadas **durante o BUILD**
- Se você adicionou a variável **depois** do último build, o frontend ainda está usando o build antigo
- Precisa fazer um **novo deploy** para o build usar as novas variáveis

## ✅ SOLUÇÃO: REDEPLOY

### OPÇÃO 1: REDEPLOY NO RAILWAY (MAIS RÁPIDO)

1. No Railway, no service **"SDR Advogados Front"**
2. Vá em **Deployments**
3. Clique nos **3 pontinhos** (⋮) do último deployment
4. Selecione **"Redeploy"**
5. Aguarde 3-5 minutos para o build completar

### OPÇÃO 2: COMMIT VAZIO (FORÇA NOVO BUILD)

```bash
git commit --allow-empty -m "fix: force redeploy with correct API URL"
git push origin main
```

O Railway vai detectar o push e fazer um novo deploy automaticamente.

## 🔍 VERIFICAÇÃO

Após o redeploy:

1. **Aguarde o build completar** (veja em Deployments → Build Logs)
2. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (Windows)
   - `Cmd + Shift + R` (Mac)
3. **Abra o console (F12)**
4. **Vá na aba Network**
5. **Recarregue a página**
6. **Verifique as requisições:**
   - ✅ Devem ir para `api.sdrjuridico.com.br`
   - ❌ NÃO devem ir para `sdradvogados.up.railway.app`

## ⚠️ IMPORTANTE

- Variáveis `VITE_*` precisam estar configuradas **ANTES** do build
- Se você adicionou depois, **sempre** precisa fazer redeploy
- O cache do navegador também pode mostrar a versão antiga

## 📝 NOTA

Se após o redeploy ainda aparecer a URL antiga:
1. Verifique os **Build Logs** no Railway
2. Procure por `VITE_API_URL` nos logs
3. Confirme que aparece: `VITE_API_URL=https://api.sdrjuridico.com.br`
4. Se não aparecer, a variável não foi injetada no build
