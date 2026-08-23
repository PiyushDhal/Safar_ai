# SafarAI — AI-Powered Travel Assistant

SafarAI is an AI-powered travel planning platform for Indian destinations, featuring an interactive globe, budget calculator, trip planner, hotel finder, and an AI chat assistant powered by Groq.

---

## 📁 Project Structure

```
safaraifinal-/
├── frontend/          # React + Vite web application (UI layer)
└── backend/           # Node.js services, data layer & dev scripts
```

---

## 🎨 Frontend (`frontend/`)

**Stack:** React 18 · Vite · Tailwind CSS · React Router · Leaflet · Three.js

The frontend is a pure client-side React SPA. It handles all UI, routing, and renders pages for:

- 🌍 Explore destinations (India & World)
- 🗺️ Interactive Globe & India Travel Map
- 🤖 AI Travel Assistant (Groq-powered chat)
- 📅 Trip Planner & My Trips
- 🏨 Hotels Finder
- 🍜 Food & Culture Explorer
- 🚆 Railway Explorer
- 💰 Budget Calculator
- 🛡️ Safety Page
- 👤 Profile & Auth

### Quick Start

```bash
cd frontend
npm install
cp .env.example .env        # add your API keys
npm run dev                 # starts at http://localhost:5173
```

### Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Primitives: Button, Card, Modal, etc.
│   │   ├── charts/         # Chart components
│   │   ├── geo/            # Globe & Map (Three.js / Leaflet)
│   │   └── home/           # Homepage-specific sections
│   ├── pages/              # Route-level page components
│   ├── layouts/            # MainLayout wrapper (Navbar + Footer)
│   ├── context/            # React Context: Auth, Theme, Toast, Workspace, Assistant
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API clients: aiService (Groq), supabase
│   ├── data/               # Static datasets (destinations, hotels, food, world)
│   ├── utils/              # Client-side helpers
│   ├── config/             # Navigation config
│   ├── App.jsx             # Router & context providers
│   ├── main.jsx            # React entry point
│   └── styles.css          # Global styles
├── public/                 # Static public assets
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
```

---

## ⚙️ Backend (`backend/`)

**Stack:** Node.js (ESM) · Groq SDK · Supabase JS

The backend contains the service layer, business logic, raw datasets, and developer utility scripts. It is **not a running server** — it is a logical grouping of non-UI code that can be developed, tested, and reused independently.

### Structure

```
backend/
├── services/
│   ├── aiService.js        # Groq AI travel assistant logic
│   └── supabase.js         # Supabase database client
├── lib/
│   ├── itineraryEngine.js  # Trip itinerary generation engine
│   ├── format.js           # Formatting utilities
│   └── cn.js               # Class name utility
├── data/
│   ├── destinations.js     # Indian destinations dataset
│   ├── hotelsDatabase.js   # Hotel listings
│   ├── foodCultureDatabase.js
│   ├── pointsOfInterest.js
│   ├── imageManifest.js
│   ├── budgetDatabase.js
│   ├── seasonMultipliers.js
│   ├── stateHotelCosts.js
│   ├── transportCosts.js
│   ├── modules.js
│   └── world/              # International destinations by region
│       ├── india.js
│       ├── asia.js
│       ├── europe.js
│       ├── americas-oceania.js
│       ├── africa-middleeast.js
│       └── _shared.js
├── scripts/
│   ├── fetch-images.mjs    # Fetch & cache destination images
│   ├── audit.mjs           # Performance & accessibility audit
│   ├── smoke.jsx           # Smoke test runner
│   ├── flows.jsx           # User flow tests
│   └── a11y.jsx            # Accessibility tests
├── config.js               # Backend configuration (reads process.env)
└── package.json
```

### Running Scripts

```bash
cd backend
npm install
node scripts/fetch-images.mjs   # fetch & cache destination images
node scripts/audit.mjs          # run performance audit
```

---

## 🔗 How They Connect

The frontend **directly imports** static data files from `frontend/src/data/` at build time. The AI service and Supabase client live in `frontend/src/services/` and are called from React components at runtime (browser-side).

The `backend/` directory mirrors the same services and data for:
- Server-side scripting and automation
- Future API server development
- CI/CD pipelines and audit tooling

---

## 🚀 Deployment

The frontend deploys as a static SPA (configured for Vercel via `vercel.json`).

```bash
cd frontend
npm run build        # outputs to frontend/dist/
```
