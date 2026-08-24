/**
 * Safar AI Production API Server — Railway Deployable
 *
 * Built with Express.js, featuring CORS, structured JSON APIs,
 * health monitoring, and seamless integration with existing AI,
 * Supabase, destination catalogue, and itinerary engine modules.
 */

import express from 'express';
import cors from 'cors';
import { config } from './config.js';

// Reusable business logic & services
import { generateAITravelResponse, getAiStatus } from './services/aiService.js';
import { supabase } from './services/supabase.js';
import { destinations, findDestination } from './data/destinations.js';
import { generateItinerary, STYLE_OPTIONS } from './lib/itineraryEngine.js';

const app = express();

/* -------------------------------------------------------------------------- */
/* Middleware Configuration                                                   */
/* -------------------------------------------------------------------------- */

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// CORS configuration supporting localhost, Vercel production & previews
const allowedOrigins = new Set(config.allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, cURL, Railway health checks)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.has(origin) ||
        /\.vercel\.app$/.test(origin) ||
        config.nodeEnv !== 'production'
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

/* Helper for async route error protection */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* -------------------------------------------------------------------------- */
/* Endpoints                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Phase 3 — Health Check Endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Safar AI Backend',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    aiConfigured: getAiStatus().configured,
  });
});

/**
 * Root Info Endpoint
 * GET /
 */
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Safar AI Production API Server',
    version: '1.0.0',
    documentation: '/health',
    endpoints: [
      'GET /health',
      'POST /api/chat',
      'GET /api/destinations',
      'POST /api/itinerary',
      'GET /api/status',
    ],
  });
});

/**
 * Phase 4 — AI API Endpoint
 * POST /api/chat
 * Body: { message: string, history?: array, context?: string }
 */
app.post(
  '/api/chat',
  asyncHandler(async (req, res) => {
    const { message, history = [], context = '' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required string field: "message"',
      });
    }

    const aiResponse = await generateAITravelResponse(message, { history, context });

    res.status(200).json({
      success: true,
      response: aiResponse,
    });
  })
);

/**
 * Phase 5 — Destinations API Endpoint
 * GET /api/destinations
 * Query params: ?search=Goa &continent=Asia &slug=goa
 */
app.get('/api/destinations', (req, res) => {
  const { search, continent, slug } = req.query;

  let result = [...destinations];

  if (slug) {
    const single = findDestination(slug);
    if (!single) {
      return res.status(404).json({
        success: false,
        error: `Destination with slug "${slug}" not found`,
      });
    }
    return res.status(200).json({
      success: true,
      destination: single,
    });
  }

  if (continent && continent !== 'All') {
    result = result.filter(
      (item) => item.continent.toLowerCase() === String(continent).toLowerCase()
    );
  }

  if (search && String(search).trim().length > 0) {
    const query = String(search).toLowerCase();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query) ||
        (item.state && item.state.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  }

  res.status(200).json({
    success: true,
    count: result.length,
    destinations: result,
  });
});

/**
 * Phase 6 — Itinerary API Endpoint
 * POST /api/itinerary
 * Body: { destination: string, days?: number|string, budget?: string, style?: string }
 */
app.post('/api/itinerary', (req, res) => {
  const { destination, days = 4, budget, style } = req.body;

  if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: "destination"',
    });
  }

  const travelStyle = style || budget || 'cultural';
  const numDays = parseInt(days, 10) || 4;

  const itinerary = generateItinerary(destination, numDays, travelStyle);

  res.status(200).json({
    success: true,
    destination,
    days: numDays,
    style: travelStyle,
    itinerary,
  });
});

/**
 * Status / Diagnostic Endpoint
 * GET /api/status
 */
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    status: {
      server: 'online',
      nodeEnv: config.nodeEnv,
      ai: getAiStatus(),
      supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
      totalDestinations: destinations.length,
      availableStyles: STYLE_OPTIONS.map((s) => s.value),
    },
  });
});

/* -------------------------------------------------------------------------- */
/* Phase 11 — Error Handling & 404 Handlers                                   */
/* -------------------------------------------------------------------------- */

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
  });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
  console.error('[Safar AI Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

/* -------------------------------------------------------------------------- */
/* Vercel / Standalone Server Listener                                       */
/* -------------------------------------------------------------------------- */

const PORT = config.port || process.env.PORT || 3000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
=====================================================
🚀 Safar AI Express API Server Running
=====================================================
• Environment : ${config.nodeEnv}
• Listening   : http://0.0.0.0:${PORT}
• Health Check: http://0.0.0.0:${PORT}/health
=====================================================
    `);
  });
}

export default app;
