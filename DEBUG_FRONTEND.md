# 🔍 Debug Frontend - Railway

## Verificar Logs de Deploy

### Passo 1: Verificar Deploy Logs
1. No Railway Dashboard, clique no serviço **"SDR Advogados Frontend"**
2. Vá na aba **"Deployments"**
3. Clique no deploy mais recente (que está "Active" ou "Successful")
4. Vá na aba **"Deploy Logs"** (não Build Logs)

### O que procurar nos Deploy Logs:

✅ **Servidor iniciou corretamente:**
```
🚀 Server running on http://0.0.0.0:PORT
```

❌ **Erros comuns:**
- `Cannot find module 'express'` → Express não instalado
- `Error: Cannot find module '/app/server.js'` → server.js não encontrado
- `EADDRINUSE` → Porta já em uso
- `Error loading index.html` → Pasta dist não existe ou está vazia

### Passo 2: Verificar Build Logs
1. No mesmo deploy, vá na aba **"Build Logs"**
2. Verifique se o build completou:
   ```
   ✓ built in Xs
   ```

### Passo 3: Verificar HTTP Logs
1. Vá na aba **"HTTP Logs"**
2. Veja se há requisições chegando
3. Veja os códigos de resposta (200, 404, 500, etc.)

---

## Checklist Rápido

- [ ] Deploy está "Active" ou "Successful"?
- [ ] Build completou sem erros?
- [ ] Servidor iniciou nos Deploy Logs?
- [ ] Há requisições nos HTTP Logs?
- [ ] Qual é a porta que o servidor está usando?

---

## Próximos Passos

Compartilhe:
1. O que aparece nos **Deploy Logs** (últimas 20 linhas)
2. Se o servidor iniciou ou não
3. Qualquer mensagem de erro
