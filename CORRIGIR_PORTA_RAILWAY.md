# 🔧 Corrigir Porta no Railway

## 🎯 Problema Identificado

**Na imagem você mostra:**
- ✅ Domínio `api.sdrjuridico.com.br` está no serviço correto ("SDR Advogados Backend")
- ✅ Status: "Setup complete"
- ❌ **PORTA:** Configurada como **8080**

**No código do backend:**
- Backend usa: `process.env.PORT || 3001`
- Porta padrão: **3001**

**Problema:**
O Railway está roteando para a porta **8080**, mas o backend pode estar rodando em outra porta (3001 ou a variável PORT do Railway).

---

## ✅ SOLUÇÃO: Verificar e Corrigir a Porta

### **Passo 1: Verificar Variável PORT no Railway**

1. Acesse **Railway Dashboard**
2. Vá no serviço **"SDR Advogados Backend"**
3. Aba **"Variables"**
4. Procure por: `PORT`

**Se NÃO existir:**
- Adicione: `PORT=3001`
- Salve

**Se existir:**
- Verifique qual valor está configurado
- Se for `8080`, mude para `3001` (ou deixe vazio para Railway usar automático)

---

### **Passo 2: Verificar Porta nos Logs**

1. No serviço **"SDR Advogados Backend"**
2. Aba **"Deployments"** → Último deploy → **"View Logs"**
3. Procure por: `🚀 API rodando na porta X`

**O que você deve ver:**
```
🚀 API rodando na porta 3001
```

**OU** (se Railway definir PORT automaticamente):
```
🚀 API rodando na porta 8080
```

**Anote qual porta está sendo usada!**

---

### **Passo 3: Corrigir Porta no Networking**

1. No serviço **"SDR Advogados Backend"**
2. Aba **"Settings"** → **"Networking"**
3. Encontre o domínio `api.sdrjuridico.com.br`
4. Clique no ícone **"Edit"** (lápis) ao lado
5. Altere a porta para a porta que o backend está usando:
   - Se logs mostram `porta 3001` → Use **3001**
   - Se logs mostram `porta 8080` → Use **8080**
   - Se Railway define PORT automaticamente → Deixe vazio ou use a porta que Railway definir

6. Salve

---

### **Passo 4: Verificar Porta do Railway (Automática)**

**IMPORTANTE:** O Railway geralmente define `PORT` automaticamente.

**Como verificar:**
1. No serviço → **"Variables"**
2. Procure por `PORT` (pode estar oculta)
3. Se não existir, o Railway usa uma porta automática (geralmente a que está no Networking)

**Solução mais simples:**
- Deixe a variável `PORT` **vazia** ou **não defina**
- O Railway vai definir automaticamente
- Use a porta que o Railway definir no Networking

---

## 🔍 Diagnóstico Rápido

### **Teste 1: Verificar Qual Porta o Backend Está Usando**

Nos logs do Railway, procure:
```
🚀 API rodando na porta X
```

**X** = Porta que o backend está usando

---

### **Teste 2: Testar Rota Diretamente**

```bash
# Teste com porta 3001
curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"test","mensagem":"teste","canal":"whatsapp"}'

# Se não funcionar, teste com porta explícita
curl -X POST https://api.sdrjuridico.com.br:3001/api/agent/intake \
  -H "Content-Type: application/json" \
  -d '{"lead_id":"test","mensagem":"teste","canal":"whatsapp"}'
```

**Se funcionar com `:3001`:** Porta no Railway está errada (está 8080, deveria ser 3001)

**Se funcionar sem porta:** Porta está correta

---

## ✅ Configuração Correta

### **Opção 1: Usar Porta 3001 (Recomendado)**

**Variáveis de Ambiente:**
```
PORT=3001
```

**Networking:**
- Domínio: `api.sdrjuridico.com.br`
- Porta: **3001**

---

### **Opção 2: Deixar Railway Definir Automaticamente**

**Variáveis de Ambiente:**
```
PORT= (vazio ou não definir)
```

**Networking:**
- Domínio: `api.sdrjuridico.com.br`
- Porta: **8080** (ou a que Railway definir)

**⚠️ IMPORTANTE:** A porta no Networking DEVE corresponder à porta que o backend está usando!

---

## 🎯 Passo a Passo Completo

1. **Verificar logs do backend:**
   - Veja qual porta está sendo usada: `🚀 API rodando na porta X`

2. **Verificar variável PORT:**
   - Se não existir, adicione: `PORT=3001`
   - Se existir, verifique o valor

3. **Corrigir porta no Networking:**
   - Edite o domínio `api.sdrjuridico.com.br`
   - Altere a porta para corresponder à porta dos logs

4. **Testar:**
   ```bash
   curl -X POST https://api.sdrjuridico.com.br/api/agent/intake \
     -H "Content-Type: application/json" \
     -d '{"lead_id":"test","mensagem":"teste","canal":"whatsapp"}'
   ```

5. **Se ainda não funcionar:**
   - Verifique se o backend está rodando
   - Verifique se a rota está registrada
   - Verifique logs para erros

---

## 📝 Resumo

**Problema:**
- Porta no Networking: **8080**
- Porta do backend: Pode ser **3001** ou outra

**Solução:**
1. Verifique qual porta o backend está usando (logs)
2. Altere a porta no Networking para corresponder
3. Ou configure `PORT=3001` nas variáveis e use porta 3001

**Resultado:**
- ✅ Porta no Railway = Porta do backend
- ✅ Rota `/api/agent/intake` funciona

---

**Pronto! Após corrigir a porta, a rota deve funcionar!** 🚀
