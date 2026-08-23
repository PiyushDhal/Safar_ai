# SafarAI Backend — Railway Deployment Guide

This guide walks through deploying the SafarAI API backend to [Railway](https://railway.app/).

---

## 📋 Overview

The SafarAI backend is an ES Modules Node.js/Express service that provides structured APIs for:
- 🤖 **AI Chat** (`POST /api/chat`)
- 🗺️ **Destination Intelligence** (`GET /api/destinations`)
- 📅 **Itinerary Generation** (`POST /api/itinerary`)
- 🏥 **Health Check** (`GET /health`)
- 📊 **Status Telemetry** (`GET /api/status`)

---

## 🛠️ Step-by-step Railway Setup

### 1. Connect Repository
1. Log in to [Railway.app](https://railway.app/).
2. Click **+ New Project** → **Deploy from GitHub repo**.
3. Select `PiyushDhal/Safar_ai`.

### 2. Configure Root Directory
Since SafarAI is organized with separate `frontend/` and `backend/` directories:
1. Go to **Project Settings** → **General**.
2. Set **Root Directory** to:
   ```
   backend
   ```
   *(or `/backend`)*
3. Railway will automatically detect Node.js, run `npm install`, and execute `npm start` (`node server.js`).

### 3. Set Environment Variables
In Railway, navigate to the **Variables** tab for your service and add the following:

| Variable | Recommended Value / Purpose |
|---|---|
| `PORT` | `3000` (or leave empty; Railway automatically injects `PORT`) |
| `NODE_ENV` | `production` |
| `VITE_GROQ_API_KEY` | *(Your Groq API key starting with `gsk_...`)* |
| `VITE_SUPABASE_URL` | `https://<your-project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | *(Your Supabase anon key)* |
| `ALLOWED_ORIGINS` | `https://getsafarai.vercel.app,http://localhost:5173` |

> 💡 Note: Both `VITE_` prefixed and standard variable names (e.g. `GROQ_API_KEY`, `SUPABASE_URL`) are automatically supported by `config.js`.

### 4. Generate Public Domain
1. In Railway, go to the **Settings** tab of your deployed service.
2. Scroll to **Networking** → **Public Networking**.
3. Click **Generate Domain**.
4. Railway will issue a public URL such as:
   ```
   https://safar-ai-production.up.railway.app
   ```

---

## 🧪 Verifying the Deployment

Once Railway finishes building and deploying, test your public URL:

```bash
# Health Check
curl -i https://safar-ai-production.up.railway.app/health

# Output should be:
# HTTP/1.1 200 OK
# {"status":"ok","service":"SafarAI Backend","environment":"production",...}
```

```bash
# Test AI Chat Endpoint
curl -X POST https://safar-ai-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Suggest a 3-day itinerary for Goa"}'
```

```bash
# Test Destinations Endpoint
curl https://safar-ai-production.up.railway.app/api/destinations?search=Goa
```

---

## 🔗 Connecting the Frontend

In your Vercel project or local `frontend/.env` file:

```env
VITE_API_URL=https://safar-ai-production.up.railway.app
```

The frontend uses this environment variable to communicate with the Railway backend.

---

## ❓ Troubleshooting

### Error: `PORT` already in use or application crashed on startup
- **Cause**: Hardcoded port or incorrect binding.
- **Fix**: Ensure `server.js` listens on `process.env.PORT` and binds to `'0.0.0.0'`. This is already pre-configured in `server.js`.

### CORS Policy Error
- **Cause**: Origin not allowed.
- **Fix**: Add your Vercel deployment URL to `ALLOWED_ORIGINS` variable in Railway:
  ```env
  ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
  ```

### Groq API returns offline answers
- **Cause**: `VITE_GROQ_API_KEY` is missing or invalid.
- **Fix**: Check your key at [console.groq.com](https://console.groq.com/) and verify it is set in Railway Variables.
