# Yatri AI Backend — Vercel Deployment Guide

This guide walks through deploying the Yatri AI Express API backend directly to **Vercel** as a Serverless Function.

---

## 📋 Overview

The Yatri AI backend is configured with `@vercel/node` and `vercel.json` to run seamlessly on Vercel Serverless Functions.

Available endpoints on your Vercel deployment:
- 🏥 `GET /health` — Health check status
- 🤖 `POST /api/chat` — Groq AI assistant chat
- 🗺️ `GET /api/destinations` — Destination catalogue & search
- 📅 `POST /api/itinerary` — Trip itinerary generator engine
- 📊 `GET /api/status` — Backend diagnostics

---

## 🛠️ Vercel Deployment Steps

### Option A — Deploy via Vercel Web Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import `PiyushDhal/Safar_ai`.
2. Select **Framework Preset**: `Other`.
3. Set **Root Directory**: `backend`.
4. In **Environment Variables**, add:

| Environment Variable | Value / Description |
|---|---|
| `VITE_GROQ_API_KEY` | *(Your Groq API key starting with `gsk_...`)* |
| `VITE_SUPABASE_URL` | `https://<your-project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(Your Supabase anon key)* |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://getsafarai.vercel.app,http://localhost:5173` |

5. Click **Deploy**.

---

### Option B — Deploy via Vercel CLI

```bash
cd backend
npm i -g vercel
vercel --prod
```

---

## 🧪 Testing Your Vercel API

Once deployed, test your Vercel URL (e.g. `https://yatriai-backend.vercel.app`):

```bash
# Health Check
curl https://yatriai-backend.vercel.app/health

# Output:
# {"status":"ok","service":"Yatri AI Backend","environment":"production",...}
```

---

## 🔗 Connecting Frontend to Vercel Backend

In your frontend Vercel project environment variables:

```env
VITE_API_URL=https://yatriai-backend.vercel.app
```
