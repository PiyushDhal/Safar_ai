/**
 * Yatri AI backend configuration.
 *
 * Automatically loads a .env file from the backend directory if present.
 * Supports both standard process.env variables and VITE_ prefixed variables.
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
    // dotenv not installed or already loaded — env vars set externally
  }
}

export const config = {
  /** Server Port */
  port: parseInt(process.env.PORT || '3000', 10),

  /** Supabase */
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',

  /** Groq AI */
  groqApiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || '',

  /** Environment */
  nodeEnv: process.env.NODE_ENV || 'development',

  /** Allowed CORS Origins */
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173',
        'https://getsafarai.vercel.app',
      ],
};

export default config;