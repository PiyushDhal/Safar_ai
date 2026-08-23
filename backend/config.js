/**
 * SafarAI backend configuration.
 *
 * Environment variables are read from process.env (Node.js) or a .env file.
 * Use dotenv (npm i dotenv) to load .env automatically in scripts:
 *   import 'dotenv/config';
 */

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