# 🔧 Solução Alternativa: Aplicar Migration

## ⚠️ Se o Console Não Funcionar

Se você não conseguir colar o código no console, tente estas alternativas:

### Opção 1: Usar o Navegador Diretamente (Mais Fácil)

1. **Abra uma nova aba** no navegador
2. **Cole esta URL na barra de endereço:**
   ```
   javascript:fetch('https://api.sdrjuridico.com.br/api/apply-migrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:'fix-migration-2026'})}).then(r=>r.json()).then(d=>{console.log(d);alert(d.success?'✅ Migration aplicada!':'❌ Erro: '+JSON.stringify(d))});void(0);
   ```
3. **Pressione Enter**
4. **Aguarde a mensagem** (pode pedir permissão)
5. **Recarregue a página** de configurações

### Opção 2: Usar Postman ou Insomnia

1. **Crie uma requisição POST:**
   - URL: `https://api.sdrjuridico.com.br/api/apply-migrations`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "secret": "fix-migration-2026"
     }
     ```
2. **Envie a requisição**
3. **Verifique a resposta** - deve retornar `{"success": true}`

### Opção 3: Usar curl (Terminal)

Se você tiver acesso ao terminal:

```bash
curl -X POST https://api.sdrjuridico.com.br/api/apply-migrations \
  -H "Content-Type: application/json" \
  -d '{"secret":"fix-migration-2026"}'
```

### Opção 4: Verificar se a Migration Já Foi Aplicada

Talvez a migration já tenha sido aplicada automaticamente! Teste:

1. **Recarregue a página** de configurações (F5)
2. **Tente salvar a chave da OpenAI** novamente
3. **Se ainda der erro 500**, a migration não foi aplicada

---

## 🆘 Se Nada Funcionar

Me avise e eu posso:
1. Verificar os logs do Railway
2. Criar um endpoint alternativo mais simples
3. Aplicar a migration manualmente via SQL
