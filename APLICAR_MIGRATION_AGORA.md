# ⚡ Aplicar Migration AGORA (Método Mais Fácil)

## 🎯 Passo a Passo Simples

### 1️⃣ Abra o Console do Navegador
- Na página onde está o erro (Integrações)
- Pressione **F12**
- Ou clique com botão direito → **"Inspecionar"**
- Vá na aba **"Console"**

### 2️⃣ Cole e Execute Este Código

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
    alert('❌ Erro: ' + JSON.stringify(data));
  }
})
.catch(err => {
  console.error('❌ Erro:', err);
  alert('❌ Erro: ' + err.message);
});
```

### 3️⃣ Aguarde a Mensagem
- Se aparecer "✅ Migration aplicada!", a página vai recarregar automaticamente
- Se aparecer erro, me avise qual foi o erro

### 4️⃣ Teste Novamente
- Após a página recarregar
- Vá em **Configurações** → **Integrações** → **OpenAI**
- Tente **salvar a chave da OpenAI** novamente
- Deve funcionar! 🎉

---

## 🔍 O Que Este Comando Faz?

1. Chama o endpoint `/api/apply-migrations` no backend
2. O backend executa o SQL da migration `20250125000000_add_agent_config`
3. Cria a tabela `AgentConfig` no banco de dados
4. Resolve os erros 500 que estavam acontecendo

---

## ⚠️ Importante

- **Aguarde o deploy do backend terminar** (2-3 minutos após o último push)
- Se der erro 401, a chave secreta está incorreta
- Se der erro 500, verifique os logs do Railway

---

## 🆘 Se Não Funcionar

Me avise qual erro apareceu no console e eu ajudo a resolver!
