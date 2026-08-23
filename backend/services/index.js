/**
 * Backend services barrel export.
 * Import from here to get both services in one line:
 *   import { generateAITravelResponse, supabase } from './services/index.js';
 */

export { generateAITravelResponse, aiStatus, default as generateAI } from './aiService.js';
export { supabase, default as db } from './supabase.js';
