// ==============================================================================
// SlotCare Browser Supabase Client & Configuration Guard
// Safe instantiation with Hybrid Preview Fallback
// ==============================================================================

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks whether valid Supabase environment variables have been configured
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return false;
  }

  // Reject placeholder defaults from template
  if (
    url.includes('your-project') ||
    url.includes('example.com') ||
    anonKey.includes('your-anon-public-key') ||
    anonKey.length < 20
  ) {
    return false;
  }

  return true;
}

let browserClient: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client, or null if in local preview/demo mode
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  return browserClient;
}
