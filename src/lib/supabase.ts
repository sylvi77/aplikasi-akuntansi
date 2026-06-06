import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
}

// Singleton — reused across all requests in the same server process.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = supabaseUrl || 'https://placeholder.supabase.co';
    const key = supabaseKey || 'placeholder-key';
    _client = createClient(url, key, {
      auth: { persistSession: false }, // server-side: no session persistence needed
    });
  }
  return _client;
}

// Named export kept for backward-compat with existing API routes.
export const supabase = getSupabase();

