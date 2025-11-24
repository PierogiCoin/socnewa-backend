# 💰 PRZEJŚCIE NA PŁATNE GOOGLE GEMINI API

## ✅ **Co zostało zmienione w kodzie:**

Aplikacja teraz używa **płatnych modeli Gemini** z wyższymi limitami:
- **Domyślny:** `gemini-1.5-flash-latest` (szybki, tani)
- **Na żądanie:** `gemini-1.5-pro-latest` (advanced, 2M context)

---

## 🔑 **KROK 1: Aktywuj Google Cloud Billing**

### 1.1 Przejdź do Google AI Studio
```
https://aistudio.google.com/
```

### 1.2 Kliknij "Get API Key"
- Wybierz swój projekt Google Cloud
- Jeśli nie masz, stwórz nowy projekt

### 1.3 Aktywuj Billing (Płatności)
```
https://console.cloud.google.com/billing
```
- Kliknij "Link a billing account"
- Dodaj kartę kredytową/debetową
- Google da Ci **$300 FREE CREDITS** na 90 dni!

### 1.4 Włącz Generative Language API
```
https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
```
- Kliknij "Enable"
- Wybierz swój projekt
- Potwierdź aktywację

---

## 🔄 **KROK 2: Zaktualizuj Railway Environment Variables**

### 2.1 Przejdź do Railway Dashboard
```
https://railway.app/dashboard
```

### 2.2 Wybierz swój projekt `socnew-backend`

### 2.3 Sprawdź/zaktualizuj zmienną:
```
GOOGLE_API_KEY=your-api-key-here
```

**⚠️ WAŻNE:** 
- Klucz API z Google AI Studio działa zarówno dla darmowego jak i płatnego tier
- Różnica jest w limitach i modelach dostępnych
- Gdy włączysz billing, automatycznie odblokowują się wyższe limity

---

## 📊 **LIMITY DARMOWE vs PŁATNE**

### **FREE TIER (bez billing):**
```
gemini-2.0-flash-exp:
  - 10 requests per minute (RPM)
  - 1,500 requests per day (RPD)
  - Tylko modele eksperymentalne (-exp)
```

### **PAID TIER (z billing):** ✅ AKTUALNIE
```
gemini-1.5-flash-latest:
  - 2,000 RPM (200x więcej!)
  - 4M TPM (tokens per minute)
  - 10,000 RPD
  - Stabilne modele bez -exp

gemini-1.5-pro-latest:
  - 1,000 RPM
  - 4M TPM
  - 10,000 RPD
  - 2M context window (największy!)
```

---

## 💵 **CENNIK (Paid Tier):**

### **Gemini 1.5 Flash** (domyślny)
```
Input:  $0.075 per 1M tokens  (~$0.000075 za 1000 tokenów)
Output: $0.30 per 1M tokens   (~$0.0003 za 1000 tokenów)

Przykład: Post 500 tokenów wejście + 200 wyjście:
Koszt: $0.000037 + $0.00006 = ~$0.0001 (0.01 centa!)
```

### **Gemini 1.5 Pro** (advanced)
```
Input:  $1.25 per 1M tokens   (~$0.00125 za 1000 tokenów)
Output: $5.00 per 1M tokens   (~$0.005 za 1000 tokenów)

Przykład: Post 500 tokenów wejście + 200 wyjście:
Koszt: $0.000625 + $0.001 = ~$0.0016 (0.16 centa)
```

### **Porównanie z DALL-E:**
```
DALL-E Standard:  $0.04 per image
DALL-E HD:        $0.08 per image

Gemini Flash: $0.0001 per text generation
```

**Gemini jest 400x tańszy od DALL-E!** 🎉

---

## 📈 **PRZYKŁADOWE KOSZTY:**

### **1,000 użytkowników miesięcznie:**
```
Średnio 10 generacji tekstu na użytkownika = 10,000 generacji
10,000 × $0.0001 = $1.00/miesiąc na Gemini Flash
```

### **10,000 użytkowników miesięcznie:**
```
100,000 generacji × $0.0001 = $10/miesiąc
```

### **100,000 użytkowników miesięcznie:**
```
1,000,000 generacji × $0.0001 = $100/miesiąc
```

**Z przychodem $29/user na Pro Plan:**
```
100 userów × $29 = $2,900 przychodu
Koszt Gemini: $1-10
Marża: 99.6%+ 🚀
```

---

## 🎁 **$300 FREE CREDITS**

Google Cloud daje nowym użytkownikom:
- **$300 darmowych kredytów**
- Ważne przez **90 dni**
- Wystarczy na ~4,000,000 generacji Gemini Flash!

**To znaczy:** Możesz obsłużyć 400,000 użytkowników ZA DARMO przez 3 miesiące! 💰

---

## ✅ **WERYFIKACJA:**

### 1. Sprawdź czy billing jest aktywny:
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent \
  -H 'Content-Type: application/json' \
  -H 'x-goog-api-key: YOUR_API_KEY' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

### 2. Sprawdź health endpoint twojego API:
```bash
curl https://your-app.up.railway.app/health
```

Powinno zwrócić:
```json
{
  "status": "ok",
  "model": "gemini-1.5-flash-latest (paid tier)"
}
```

---

## 🚨 **TROUBLESHOOTING:**

### **Błąd 403: "Billing not enabled"**
- Upewnij się że włączyłeś billing w Google Cloud Console
- Sprawdź czy Generative Language API jest enabled
- Poczekaj 5-10 minut po aktywacji

### **Błąd 404: "Model not found"**
- Sprawdź czy używasz najnowszej wersji `@google/generative-ai`
- Zrestartuj Railway deployment

### **Błąd 429: "Quota exceeded"**
- Jeśli nadal widzisz ten błąd, to znaczy że billing NIE JEST aktywny
- Sprawdź ponownie Google Cloud Console → Billing

---

## 📞 **POMOC:**

### Google Cloud Support:
```
https://cloud.google.com/support
```

### Google AI Studio Community:
```
https://discuss.ai.google.dev/
```

### Railway Support:
```
https://help.railway.app/
```

---

## ✨ **GOTOWE!**

Po wykonaniu tych kroków, twoja aplikacja będzie używać:
- ✅ Stabilnych modeli (bez -exp)
- ✅ 200x wyższych limitów
- ✅ Lepszej jakości generacji
- ✅ $300 darmowych kredytów na start

**Koszty są minimalne**, a limity są ogromne! 🚀
