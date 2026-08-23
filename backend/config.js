/**
 * SafarAI backend configuration.
 *
 * Automatically loads a .env file from the backend directory if present.
 * Copy backend/.env.example → backend/.env and fill in your credentials.
 *
 * Env var names intentionally match the frontend VITE_ prefix so a single
 * .env file can serve both sides during development.
 */

import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

// Auto-load .env from the backend directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  try {
    const require = createRequire(import.meta.url);
    const dotenv = require('dotenv');
    dotenv.config({ path: envPath });
  } catch {
    // dotenv not installed — env vars must be set externally
  }
}

export const config = {
  /** Supabase */
  supabaseUrl: process.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || '',

  /** Groq AI */
  groqApiKey: process.env.VITE_GROQ_API_KEY || '',

  /** App */
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default config;