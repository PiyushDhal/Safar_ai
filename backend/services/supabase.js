/**
 * SafarAI Supabase client — Node.js / backend edition.
 *
 * Uses process.env (via config.js) instead of import.meta.env.
 * Safe to use in Node scripts, server-side tasks, and CI pipelines.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

if (!config.supabaseUrl || config.supabaseUrl === '') {
  console.warn(
    '[SafarAI Supabase] VITE_SUPABASE_URL is not set. ' +
      'Copy backend/.env.example to backend/.env and fill in your credentials.'
  );
}

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseAnonKey || 'placeholder-key'
);

export default supabase;