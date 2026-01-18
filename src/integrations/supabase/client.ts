import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseAuthStorage } from '@/lib/cookieStorage';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: getSupabaseAuthStorage(),
    storageKey: 'sb-auth-token', // CRITICAL: Must match login
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

console.log('[Supabase Hub] Initialized');
console.log('[Supabase Hub] Storage:', getSupabaseAuthStorage() === window.localStorage ? 'localStorage' : 'cookies');
console.log('[Supabase Hub] Storage key: sb-auth-token');
```

---

## Configuration Match Verification

Both apps now have:

| Component | Login | Hub |
|-----------|-------|-----|
| Cookie storage file | ✅ `src/lib/cookieStorage.ts` | ✅ `src/lib/cookieStorage.ts` |
| Storage function | ✅ `getSupabaseAuthStorage()` | ✅ `getSupabaseAuthStorage()` |
| Storage key | ✅ `'sb-auth-token'` | ✅ `'sb-auth-token'` |
| Cookie domain | ✅ `.buntinggpt.com` | ✅ `.buntinggpt.com` |
| Cookie naming | ✅ `key.chunks.0`, `key.chunks.1` | ✅ `key.chunks.0`, `key.chunks.1` |

---

## Deploy and Test

1. **Deploy hub.buntinggpt.com** with new files
2. **Clear all cookies** for `.buntinggpt.com`
3. **Test full flow:**
```
Visit: https://login.buntinggpt.com?redirect=https://hub.buntinggpt.com
Click: Sign In with Microsoft
Watch: Should redirect to hub without looping
```

4. **Check cookies in DevTools:**

Should see:
```
Name: sb-auth-token.chunks.0
Domain: .buntinggpt.com
Path: /
Secure: ✓

Name: sb-auth-token.chunks.1
Domain: .buntinggpt.com
Path: /
Secure: ✓