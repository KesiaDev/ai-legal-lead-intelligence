# 🔧 Corrigir Espaço no Nome da Instância

## 🎯 Problema Identificado

**Nome da instância com espaço:**
```
SDR Advogados2
```

**Problema:**
- ❌ URLs não aceitam espaços
- ❌ O espaço pode causar 404 Not Found
- ❌ Precisa ser codificado ou removido

---

## ✅ SOLUÇÃO: Remover ou Codificar o Espaço

### **Opção 1: Remover o Espaço (Recomendado)**

**No node "HTTP Request", altere a URL de:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR Advogados2
```

**Para:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
```

**OU se a instância realmente tem espaço, use codificação:**

---

### **Opção 2: Codificar o Espaço (URL Encoding)**

**Se a instância REALMENTE tem espaço no nome:**

**Espaço codificado:** `%20`

**URL com espaço codificado:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

---

### **Opção 3: Verificar Nome Real da Instância**

**IMPORTANTE:** Verifique qual é o nome REAL da instância:

1. Acesse o Evolution API Manager
2. Veja a lista de instâncias
3. Verifique o nome exato:
   - `SDR Advogados2` (com espaço)?
   - `SDRAdvogados2` (sem espaço)?
   - `SDR-Advogados2` (com hífen)?
   - Outro nome?

**Use o nome EXATO que aparece no dashboard!**

---

## 🔍 Como Verificar

### **Passo 1: Acessar Evolution API Manager**

1. Acesse o dashboard da Evolution API
2. Vá em **Instances** ou **Instâncias**
3. Veja a lista de instâncias
4. Copie o nome EXATO da instância

---

### **Passo 2: Testar Diferentes Formatos**

**Teste 1: Sem espaço**
```bash
curl -X POST https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2 \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY" \
  -d '{
    "number": "5527998597005",
    "textMessage": {
      "text": "Teste"
    }
  }'
```

**Teste 2: Com espaço codificado**
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

**Qual funcionar, use no N8N!**

---

## ✅ Configuração Correta no N8N

### **Se a instância NÃO tem espaço:**

**URL:**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDRAdvogados2
```

---

### **Se a instância TEM espaço:**

**URL (com codificação):**
```
https://drybee-evolution.cloudfy.live/message/sendText/SDR%20Advogados2
```

**OU use expressão N8N:**
```
https://drybee-evolution.cloudfy.live/message/sendText/{{ encodeURIComponent('SDR Advogados2') }}
```

---

## 📋 Checklist

- [ ] Verifiquei o nome exato da instância no Evolution API Manager?
- [ ] A instância tem espaço ou não?
- [ ] Testei com curl para ver qual formato funciona?
- [ ] Configurei a URL correta no N8N?
- [ ] Configurei autenticação (API Key)?
- [ ] Testei no N8N e funcionou?

---

## ✅ Resumo

**Problema:**
- Espaço no nome da instância pode causar 404

**Solução:**
1. ✅ Verificar nome exato da instância
2. ✅ Se não tem espaço: usar `SDRAdvogados2`
3. ✅ Se tem espaço: usar `SDR%20Advogados2` ou `encodeURIComponent()`
4. ✅ Testar com curl primeiro
5. ✅ Configurar no N8N

---

**Pronto! Verifique o nome exato da instância e corrija a URL!** 🚀
