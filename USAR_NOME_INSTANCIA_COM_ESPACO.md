# 🔧 Usar Nome da Instância com Espaço

## ✅ Confirmado: Nome da Instância

**Nome da instância:** `SDR Advogados2` (com espaço)

**Problema:**
- URLs não aceitam espaços diretamente
- Precisa codificar o espaço como `%20`

---

## ✅ SOLUÇÃO: Codificar o Espaço na URL

### **Opção 1: Usar Codificação Manual (Mais Simples)**

**No node "HTTP Request", altere a URL para:**

```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**Onde:**
- `%20` = espaço codificado
- `SDR%20Advogados2` = `SDR Advogados2`

---

### **Opção 2: Usar Expressão N8N (Recomendado)**

**No campo URL, use:**

```
https://drybee-evolution.cloudfy.live/message/sendText/{{ encodeURIComponent('SDR Advogados2') }}
```

**Isso vai codificar automaticamente:**
- Espaço → `%20`
- Outros caracteres especiais também

---

### **Opção 3: Usar Variável**

1. Crie uma variável no início do workflow:
   - Nome: `INSTANCIA_EVOLUTION`
   - Valor: `SDR Advogados2`

2. No node "HTTP Request", use:
   ```
   https://drybee-evolution.cloudfy.live/message/sendText/{{ encodeURIComponent($env.INSTANCIA_EVOLUTION) }}
   ```

---

## 🔧 Configuração Correta no N8N

### **Node: "HTTP Request" (Evolution API)**

**Method:** `POST`

**URL:**
```
https://drybee-evolution.cloudfy.live/message/sendText/{{ encodeURIComponent('SDR Advogados2') }}
```

**OU (mais simples):**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**Authentication:** `Header Auth`
- Name: `apikey`
- Value: Sua API key da Evolution API

**Send Body:** `ON`

**Body Content Type:** `JSON`

**JSON:**
```json
{
  "number": "{{ $json.number }}",
  "textMessage": {
    "text": "{{ $json.texto }}"
  }
}
```

---

## 🧪 Teste com curl

**Teste com espaço codificado:**
```bash
curl -X POST https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2 \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY" \
  -d '{
    "number": "5527998597005",
    "textMessage": {
      "text": "Teste"
    }
  }'
```

**Se funcionar:** Use `SDR%20Advogados2` no N8N

---

## ⚠️ IMPORTANTE: Verificar API Key

**Na imagem você mostra:**
- Campo com texto mascarado (provavelmente API Key)
- Ícone de copiar e visualizar

**Certifique-se de:**
1. Copiar a API Key correta
2. Configurar no N8N:
   - Authentication: `Header Auth`
   - Name: `apikey`
   - Value: Cole a API Key aqui

---

## 📋 Checklist

- [ ] URL usa `SDR%20Advogados2` (espaço codificado)?
- [ ] OU usa `{{ encodeURIComponent('SDR Advogados2') }}`?
- [ ] API Key configurada no Authentication?
- [ ] Payload está correto: `{ number, textMessage: { text } }`?
- [ ] Testou com curl e funcionou?

---

## ✅ Resumo

**Nome da instância:** `SDR Advogados2` (com espaço)

**URL correta:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**OU:**
```
https://drybee-evolution.cloudfy.live/message/sendText/{{ encodeURIComponent('SDR Advogados2') }}
```

**Não esqueça:**
- ✅ Configurar autenticação (API Key)
- ✅ Payload correto
- ✅ Testar antes de usar no workflow completo

---

**Pronto! Use `SDR%20Advogados2` na URL e configure a autenticação!** 🚀
