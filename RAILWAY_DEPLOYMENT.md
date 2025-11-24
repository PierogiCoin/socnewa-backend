# 🚂 RAILWAY DEPLOYMENT GUIDE

## ✅ **Co jest już skonfigurowane:**

1. ✅ `railway.toml` - konfiguracja build/deploy
2. ✅ `package.json` - start script
3. ✅ `.gitignore` - chroni .env przed commitem
4. ✅ Health check endpoint `/health`

---

## 🚀 **DEPLOY DO RAILWAY - KROK PO KROKU**

### **KROK 1: Połącz z GitHub** (jeśli jeszcze nie)

1. Przejdź do: https://railway.app/dashboard
2. Kliknij **"New Project"**
3. Wybierz **"Deploy from GitHub repo"**
4. Wybierz repository: `PierogiCoin/ocnew-backend`
5. Railway automatycznie wykryje konfigurację z `railway.toml`

---

### **KROK 2: Ustaw zmienne środowiskowe**

W Railway Dashboard → Variables, dodaj:

#### **🔴 WYMAGANE (MUST HAVE):**

```bash
# Google Gemini API
GOOGLE_API_KEY=AIzaSyALQDBI-rOm7u8I-kzCK3twzEUYh6XlJaM

# Supabase (Backend NIE używa prefiksu VITE_ - to tylko dla frontendu!)
SUPABASE_URL=https://xlaccaozpxkmjweovyzm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYWNjYW96cHhrbWp3ZW92eXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjU3NjYsImV4cCI6MjA3OTMwMTc2Nn0.vI44sZQlE-q3A5YB3NJNQsb69bkOh4E2mfpyUiZeq5g
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsYWNjYW96cHhrbWp3ZW92eXptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcyNTc2NiwiZXhwIjoyMDc5MzAxNzY2fQ.BbAE1F3p7hhbq-T9r96V1ykVBPiXrLKqMPPOX0-_BIM

# Server
NODE_ENV=production
PORT=3001
```

#### **🟡 OPCJONALNE (dla pełnej funkcjonalności):**

```bash
# OpenAI (DALL-E) - dla generowania obrazów
OPENAI_API_KEY=your_openai_key

# Luma AI - dla premium wideo (pionowe, dźwięk)
LUMA_API_KEY=your_luma_key

# Replicate - dla budget wideo (poziome)
REPLICATE_API_TOKEN=your_replicate_token

# Stripe - dla płatności
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

---

### **KROK 3: Deploy!**

Railway automatycznie:
1. ✅ Pobierze kod z GitHub
2. ✅ Zainstaluje zależności (`npm install`)
3. ✅ Zbuduje projekt
4. ✅ Uruchomi serwer (`npm start`)
5. ✅ Przyzna publiczny URL (np. `https://your-app.up.railway.app`)

---

## 🔍 **WERYFIKACJA DEPLOYMENT:**

### 1. Sprawdź health endpoint:
```bash
curl https://your-app.up.railway.app/health
```

Powinno zwrócić:
```json
{
  "status": "ok",
  "model": "gemini-1.5-flash-latest (paid tier)",
  "apis": {
    "gemini": true,
    "openai": false,
    "luma": false,
    "replicate": false
  }
}
```

### 2. Sprawdź logi w Railway Dashboard
- Jeśli widzisz `[server] Server running on...` - działa! ✅
- Jeśli widzisz błędy - sprawdź zmienne środowiskowe

---

## 🔄 **AUTOMATYCZNE DEPLOYE:**

Railway automatycznie deployuje przy każdym:
- `git push` do brancha `main`
- Merge PR do `main`
- Manual trigger w Dashboard

---

## 🌍 **FRONTEND CONFIGURATION:**

Po deployment, zaktualizuj frontend `.env.local`:

```bash
# Zamiast localhost, użyj Railway URL
VITE_API_BASE_URL=https://your-app.up.railway.app
```

---

## 📊 **MONITORING:**

Railway automatycznie monitoruje:
- ✅ CPU usage
- ✅ Memory usage
- ✅ Network traffic
- ✅ Response times
- ✅ Health checks (co 30s)

Jeśli health check failuje 3 razy z rzędu, Railway automatycznie restartuje serwer.

---

## 💰 **KOSZTY RAILWAY:**

### **Free Plan:**
- $5 credit/miesiąc (500 godzin)
- Wystarczy na małe projekty
- Automatyczne sleep po bezczynności

### **Hobby Plan ($5/mies):**
- $5 credit + $5/miesiąc
- Bez automatycznego sleep
- Lepsze dla produkcji

### **Pro Plan ($20/mies):**
- $20 credit/miesiąc
- Priority support
- Najlepsze dla skalowania

---

## 🚨 **TROUBLESHOOTING:**

### **Błąd: "Application failed to respond"**
- Sprawdź czy PORT jest ustawiony na `3001` (lub Railway automatyczny)
- Sprawdź czy `/health` endpoint działa
- Zobacz logi w Railway Dashboard

### **Błąd: "GOOGLE_API_KEY not found"**
- Sprawdź zmienne środowiskowe w Railway
- Upewnij się że nazwa zmiennej jest dokładnie `GOOGLE_API_KEY`
- Redeploy po dodaniu zmiennych

### **Błąd: "Module not found"**
- Railway nie zainstalował zależności
- Sprawdź `package.json`
- Trigger manual redeploy

### **Błąd 429: "Quota exceeded"**
- Google API limity przekroczone
- Zobacz `GEMINI_PAID_SETUP.md` dla aktywacji płatnego tier
- Lub zmień model na darmowy (edytuj `index.ts`)

---

## 🔐 **SECURITY BEST PRACTICES:**

1. ✅ **Nigdy nie commituj `.env`** - jest w `.gitignore`
2. ✅ **Używaj różnych kluczy** dla dev/production
3. ✅ **Regularnie rotuj API keys**
4. ✅ **Włącz 2FA** w Railway
5. ✅ **Monitoruj koszty** w Railway Dashboard

---

## 📚 **PRZYDATNE LINKI:**

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app/
- GitHub Repo: https://github.com/PierogiCoin/ocnew-backend
- Gemini API: https://ai.google.dev/
- Supabase: https://supabase.com/

---

## ✨ **GOTOWE!**

Po wykonaniu tych kroków, twoje API będzie:
- ✅ Dostępne globalnie 24/7
- ✅ Automatycznie skalowalne
- ✅ Monitorowane i logowane
- ✅ Deployowane automatycznie z GitHub

**Happy deploying!** 🚀
