/**
 * VibeVoyage Supabase client — Node.js / backend edition.
 *
 * Uses process.env / config.js (supports VITE_SUPABASE_URL & SUPABASE_URL).
 * Safe to use in Node scripts, server-side tasks, and API endpoints.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const url = config.supabaseUrl || 'https://placeholder.supabase.co';
const key = config.supabaseAnonKey || 'placeholder-key';

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

if (config.nodeEnv === 'development' && !isSupabaseConfigured) {
  console.info(
    '[VibeVoyage Supabase] URL/Key not set. Operating in local guest mode.'
  );
}

export const supabase = createClient(url, key);

export default supabase;