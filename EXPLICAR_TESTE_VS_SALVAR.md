# 🔍 Por Que o Teste Funciona Mas Salvar Não?

## 📊 Diferença Entre Teste e Salvar

### ✅ **Teste de Conexão** (Funciona)
- **O que faz:** Testa diretamente com a API da OpenAI
- **Não precisa:** Banco de dados
- **Como funciona:**
  ```javascript
  // Testa diretamente: https://api.openai.com/v1/models
  fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${chave}` }
  })
  ```
- **Resultado:** Se a chave estiver correta, funciona! ✅

### ❌ **Salvar** (Não Funciona Ainda)
- **O que faz:** Salva a chave no banco de dados da plataforma
- **Precisa:** Tabela `IntegrationConfig` no PostgreSQL
- **Como funciona:**
  ```javascript
  // Salva no backend: PATCH /api/integrations
  api.patch('/api/integrations', { openaiApiKey: chave })
  ```
- **Resultado:** Erro 500 porque a tabela não existe ainda ❌

---

## 🎯 Solução: Aplicar Migration

A tabela `IntegrationConfig` precisa ser criada no banco de dados. Para isso:

### Método 1: Via Console do Navegador (Mais Fácil)

1. **Abra o console** (F12)
2. **Cole e execute:**
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
       alert('✅ Migration aplicada! Agora você pode salvar.');
       window.location.reload();
     }
   })
   .catch(err => alert('❌ Erro: ' + err.message));
   ```

3. **Aguarde a mensagem de sucesso**
4. **Recarregue a página** (F5)
5. **Tente salvar novamente** - deve funcionar! 🎉

---

## 💡 Salvamento Automático Implementado

Agora, quando você digitar a chave da OpenAI:
- **Aguarde 2 segundos** sem digitar
- **Salva automaticamente** no banco
- **Mostra uma mensagem** "Salvo automaticamente!"

Mas **só funciona depois de aplicar a migration!**

---

## 🔄 Fluxo Completo

1. ✅ **Teste de Conexão** → Funciona (testa direto com OpenAI)
2. ⏳ **Aplicar Migration** → Cria tabela no banco
3. ✅ **Salvar** → Funciona (salva no banco)
4. ✅ **Auto-save** → Funciona (salva automaticamente após 2s)

---

## ⚠️ Importante

- **Teste funciona** porque não precisa do banco
- **Salvar não funciona** porque precisa do banco (migration pendente)
- **Após aplicar migration**, ambos funcionam! ✅
