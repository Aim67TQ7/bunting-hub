import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { cookieStorage, ensureCleanAuthState, purgeAllAuthCookies } from '@/lib/supabase-storage';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

// Ensure clean auth state before creating client
const hasValidSession = ensureCleanAuthState();
if (!hasValidSession) {
  console.log('[Supabase] No valid session found, starting fresh');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: cookieStorage,
    storageKey: 'bunting-auth-token', // CRITICAL: Must match across ALL apps
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Export purge function for logout handlers
export { purgeAllAuthCookies };
