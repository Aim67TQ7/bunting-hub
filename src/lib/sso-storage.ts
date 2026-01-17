/**
 * Simplified storage adapter for HttpOnly cookie SSO
 * Auth tokens are now managed via Edge Functions with HttpOnly cookies
 * This adapter only handles non-auth localStorage items
 */

/**
 * Storage adapter that ignores auth token storage (handled by HttpOnly cookies)
 * Compatible with Supabase's storage interface
 */
export const ssoStorage = {
  getItem: (key: string): string | null => {
    // Auth tokens are managed via HttpOnly cookies - not accessible from JS
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      return null;
    }
    return localStorage.getItem(key);
  },
  
  setItem: (key: string, value: string): void => {
    // Auth tokens are managed via HttpOnly cookies - don't store locally
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      return;
    }
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: string): void => {
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      return;
    }
    localStorage.removeItem(key);
  },
};

/**
 * Get the login redirect URL
 */
export function getLoginUrl(redirectBack: boolean = true): string {
  const loginBase = 'https://auth.buntinggpt.com';
  
  if (redirectBack) {
    const currentUrl = window.location.href;
    return `${loginBase}?redirect=${encodeURIComponent(currentUrl)}`;
  }
  
  return loginBase;
}

/**
 * Check if we're in a development environment
 */
export function isDevelopment(): boolean {
  return !window.location.hostname.includes('buntinggpt.com');
}

/**
 * Edge function URLs for auth cookie management
 */
const SUPABASE_URL = 'https://qzwxisdfwswsrbzvpzlo.supabase.co';

export const authEndpoints = {
  getSession: `${SUPABASE_URL}/functions/v1/get-session`,
  setAuthCookie: `${SUPABASE_URL}/functions/v1/set-auth-cookie`,
  clearAuthCookie: `${SUPABASE_URL}/functions/v1/clear-auth-cookie`,
};
