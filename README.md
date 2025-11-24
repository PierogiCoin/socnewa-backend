# Social Media Manager - Backend API

Backend API dla aplikacji Social Media Manager.

## 🚀 Stack Technologiczny

- **Node.js** + **TypeScript**
- **Express.js** - Framework HTTP
- **Google Gemini AI** - Generowanie treści
- **Supabase** - Baza danych i autoryzacja
- **OpenAI** (opcjonalne) - DALL-E dla obrazów
- **Luma AI** / **Replicate** (opcjonalne) - Generowanie wideo

## 📋 Wymagane Zmienne Środowiskowe

```bash
# Google AI (wymagane)
GOOGLE_API_KEY=your_google_api_key

# Supabase (wymagane)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Node Environment
NODE_ENV=production
PORT=3001

# Opcjonalne
OPENAI_API_KEY=your_openai_key
LUMA_API_KEY=your_luma_key
REPLICATE_API_TOKEN=your_replicate_token
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

## 🐳 Docker

```bash
# Build image
docker build -t socnew-backend .

# Run container
docker run -p 3001:3001 \
  -e GOOGLE_API_KEY=your_key \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  socnew-backend
```

## 🚂 Railway Deployment

1. Create new service from this repository
2. Add environment variables
3. Railway will auto-deploy using Dockerfile

## 📡 API Endpoints

- `GET /health` - Health check
- `POST /api/generate-content` - Generate social media content
- `POST /api/generate-content-stream` - Stream content generation
- `POST /api/generate-image` - Generate images
- `POST /api/generate-video` - Generate videos
- More endpoints in routes/

## 📄 License

Private
