# 🚨 Aplicar Migration URGENTE

## ⚠️ O Problema

Os erros 500 indicam que a tabela `IntegrationConfig` **não existe** no banco de dados ainda. A migration precisa ser aplicada.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Abra o Console do Navegador
- Pressione **F12**
- Vá na aba **"Console"**

### Passo 2: Cole e Execute Este Código

```javascript
fetch('https://api.sdrjuridico.com.br/api/apply-migrations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: 'fix-migration-2026' })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Resultado:', data);
  if (data.success) {
    alert('✅ Migration aplicada! Recarregue a página agora.');
    window.location.reload();
  } else {
    console.error('❌ Erro:', data);
    alert('❌ Erro ao aplicar migration. Veja o console.');
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('❌ Erro: ' + err.message);
});
```

### Passo 3: Aguarde a Mensagem
- Se aparecer "✅ Migration aplicada!", a página vai recarregar automaticamente
- Se aparecer erro, me avise qual foi

### Passo 4: Teste Novamente
- Após a página recarregar
- Tente **salvar a chave da OpenAI** novamente
- Deve funcionar! 🎉

---

## 🔍 Verificar se Funcionou

Após aplicar a migration, os erros 500 devem desaparecer e você deve conseguir:
- ✅ Carregar configurações
- ✅ Salvar OpenAI API key
- ✅ Salvar outras integrações

---

## ⚠️ Se Ainda Não Funcionar

1. **Verifique os logs do Railway:**
   - Vá no serviço do backend no Railway
   - Aba "Deployments"
   - Veja os logs do último deploy

2. **Verifique se o endpoint existe:**
   - Teste: `https://api.sdrjuridico.com.br/api/apply-migrations`
   - Deve retornar 401 (esperado, precisa da chave secreta)

3. **Me avise o erro específico** que apareceu no console
