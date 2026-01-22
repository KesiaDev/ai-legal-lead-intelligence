# 🌐 URL do Dashboard Evolution API

## 🎯 Resposta Rápida

**A URL do dashboard Evolution API depende de onde você hospedou:**

---

## 📋 OPÇÕES COMUNS

### **1. Evolution API Self-Hosted (Você Instalou)**

**Se você instalou o Evolution API no seu próprio servidor:**

**URL do Dashboard:**
```
http://SEU-SERVIDOR:8080
```
ou
```
https://SEU-DOMINIO:8080
```

**Exemplos:**
- `http://localhost:8080` (local)
- `https://evolution.seudominio.com.br` (com domínio)
- `http://192.168.1.100:8080` (IP local)

---

### **2. Evolution API Cloud (Serviço Gerenciado)**

**Se você usa um serviço gerenciado (como Cloudfy, Evolution Cloud, etc.):**

**URL do Dashboard:**
```
https://SEU-PROVEDOR.com.br
```

**Exemplo (Cloudfy):**
```
https://drybee-evolution.cloudfy.live
```

**OU pode ter um subdomínio específico:**
```
https://manager.drybee-evolution.cloudfy.live
https://dashboard.drybee-evolution.cloudfy.live
https://admin.drybee-evolution.cloudfy.live
```

---

### **3. Evolution API via Docker/Container**

**Se você rodou via Docker:**

**URL do Dashboard:**
```
http://localhost:8080
```
ou
```
http://SEU-IP:8080
```

---

## 🔍 COMO DESCOBRIR A URL

### **Método 1: Verificar Documentação do Provedor**

1. Acesse o site do seu provedor de Evolution API
2. Procure por "Dashboard" ou "Manager"
3. Veja a URL de acesso

---

### **Método 2: Verificar Email de Confirmação**

1. Procure no email de confirmação/criação da conta
2. Geralmente contém a URL do dashboard

---

### **Método 3: Verificar URL da API**

**Se você sabe a URL da API:**
- API: `https://drybee-evolution.cloudfy.live`
- Dashboard pode ser: `https://drybee-evolution.cloudfy.live` (mesma URL)
- OU: `https://manager.drybee-evolution.cloudfy.live`
- OU: `https://admin.drybee-evolution.cloudfy.live`

**Tente acessar a URL da API diretamente no navegador!**

---

### **Método 4: Verificar no N8N**

**Se você já configurou no N8N:**
1. Abra o workflow no N8N
2. Veja o node "HTTP Request" para Evolution API
3. A URL base pode ser o dashboard

**Exemplo:**
- URL no N8N: `https://drybee-evolution.cloudfy.live/message/sendText/...`
- Dashboard pode ser: `https://drybee-evolution.cloudfy.live`

---

## 🧪 TESTAR URLS COMUNS

**Tente acessar estas URLs no navegador:**

1. **URL Base da API:**
   ```
   https://drybee-evolution.cloudfy.live
   ```

2. **Com /dashboard:**
   ```
   https://drybee-evolution.cloudfy.live/dashboard
   ```

3. **Com /manager:**
   ```
   https://drybee-evolution.cloudfy.live/manager
   ```

4. **Com /admin:**
   ```
   https://drybee-evolution.cloudfy.live/admin
   ```

5. **Com porta 8080:**
   ```
   https://drybee-evolution.cloudfy.live:8080
   ```

---

## 📋 INFORMAÇÕES QUE VOCÊ TEM

**Baseado no que vi no código:**

- **URL da API:** `https://drybee-evolution.cloudfy.live`
- **Instância:** `SDR Advogados2`

**Tente acessar:**
```
https://drybee-evolution.cloudfy.live
```

**Se abrir um dashboard/login:** ✅ Essa é a URL!

**Se retornar JSON/API:** ❌ Precisa de `/dashboard` ou `/manager`

---

## ✅ O QUE FAZER

1. ✅ **Tente acessar:** `https://drybee-evolution.cloudfy.live`
2. ✅ **Se não funcionar, tente:** `https://drybee-evolution.cloudfy.live/dashboard`
3. ✅ **Verifique** no email de confirmação do provedor
4. ✅ **Verifique** na documentação do provedor

---

## 🆘 SE NÃO ENCONTRAR

**Me informe:**
1. ✅ Qual provedor você usa? (Cloudfy, Evolution Cloud, etc.)
2. ✅ Você instalou ou usa serviço gerenciado?
3. ✅ Qual URL você usa no N8N para a API?

**Com essas informações, posso ajudar a encontrar a URL exata!** 🚀
