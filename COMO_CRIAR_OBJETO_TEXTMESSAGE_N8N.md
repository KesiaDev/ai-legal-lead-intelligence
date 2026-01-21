# 📝 Como Criar Objeto `textMessage` no N8N - Passo a Passo

## 🎯 Objetivo

Criar um campo `textMessage` do tipo **Object** com um subcampo `text` dentro dele no node `EDITAR_CAMPOS_EVOLUÇÃO`.

---

## ✅ SOLUÇÃO SIMPLES (Recomendada)

**Você NÃO precisa criar objeto no node!** Use a solução mais fácil:

### **No Node EDITAR_CAMPOS_EVOLUÇÃO:**

Mantenha os campos assim:

1. **Campo 1:**
   - Nome: `number`
   - Tipo: `String`
   - Valor: `{{ $('Dados Lead').item.json.Telefone }}`

2. **Campo 2:**
   - Nome: `texto` (pode ser qualquer nome, não importa)
   - Tipo: `String`
   - Valor: `{{ $('Mensagem').item.json.mensagens }}`

### **No HTTP Request (POST /message/send):**

Use este JSON:

```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.texto }}"
  }
}
```

**Pronto!** O objeto `textMessage` será criado automaticamente no JSON do HTTP Request.

---

## 🔧 SOLUÇÃO ALTERNATIVA (Se quiser criar o objeto no node)

Se você realmente quiser criar o objeto no node (mais complexo), siga estes passos:

### **Passo 1: Remover o campo `texto` atual**

1. No node `EDITAR_CAMPOS_EVOLUÇÃO`
2. Encontre o campo `texto`
3. Clique no **ícone de lixeira** ou **X** ao lado dele para remover

### **Passo 2: Adicionar campo do tipo Object**

1. Clique no botão **"Adicionar campo"** (ou "Add field")
2. Uma nova linha de campo aparecerá
3. No campo **Nome**, digite: `textMessage`
4. No dropdown **Tipo**, selecione: **`Object`** (não String!)

### **Passo 3: Expandir o objeto para adicionar subcampo**

1. Após selecionar `Object`, você verá um **ícone de seta** ou **"+"** ao lado de `textMessage`
2. Clique nesse ícone para **expandir** o objeto
3. Dentro do objeto expandido, você verá uma área para adicionar propriedades

### **Passo 4: Adicionar subcampo `text`**

1. Dentro do objeto `textMessage` expandido, clique em **"Adicionar campo"** novamente
2. Uma nova linha aparecerá **dentro** do objeto
3. No campo **Nome**, digite: `text`
4. No dropdown **Tipo**, selecione: **`String`**
5. No campo **Valor**, digite: `{{ $('Mensagem').item.json.mensagens }}`

### **Passo 5: Verificar estrutura**

Você deve ver algo assim:

```
📁 textMessage (Object)
   └── text (String) = {{ $('Mensagem').item.json.mensagens }}
```

### **Passo 6: No HTTP Request**

Se você criou o objeto no node, use:

```json
{
  "number": "{{ $json.number }}",
  "textMessage": "{{ $json.textMessage }}"
}
```

---

## 🎯 RECOMENDAÇÃO FINAL

**Use a Solução Simples!** É mais fácil e funciona perfeitamente:

1. **Node EDITAR_CAMPOS_EVOLUÇÃO:**
   - `number`: `{{ $('Dados Lead').item.json.Telefone }}`
   - `texto`: `{{ $('Mensagem').item.json.mensagens }}`

2. **HTTP Request JSON:**
   ```json
   {
     "number": "{{ $json.number }}",
     "textMessage": {
       "text": "{{ $json.texto }}"
     }
   }
   ```

**Isso é suficiente!** O N8N vai criar o objeto `textMessage` automaticamente quando enviar o JSON.

---

## 🆘 Se Não Conseguir Criar Objeto no Node

**Não se preocupe!** A Solução Simples funciona perfeitamente. O importante é que o JSON final enviado para a Evolution API tenha a estrutura correta:

```json
{
  "number": "5527998597005",
  "textMessage": {
    "text": "Mensagem aqui"
  }
}
```

E isso você consegue criando o objeto diretamente no JSON do HTTP Request, sem precisar criar no node anterior.

---

## ✅ Checklist

- [ ] Node tem campo `number` com telefone
- [ ] Node tem campo `texto` (ou qualquer nome) com a mensagem
- [ ] HTTP Request tem JSON com estrutura `textMessage.text`
- [ ] Testou e funcionou!

---

**Pronto! Use a Solução Simples que é mais fácil e funciona!** 🚀
