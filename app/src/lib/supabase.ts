import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

// Supabase client singleton
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get or create the Supabase client
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'Supabase URL and Anon Key must be provided. Please check your environment variables.'
      );
    }
    supabaseClient = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

/**
 * Get the Supabase client (alias for convenience)
 */
export const supabase = getSupabaseClient;

