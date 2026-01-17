h/**
 * Custom storage adapter for cross-subdomain SSO
 * Reads auth tokens from the parent domain cookie set by auth.buntinggpt.com
 */

const SSO_COOKIE_NAME = 'sb-auth-token';
const SSO_DOMAIN = '.buntinggpt.com';

// Parse cookies from document.cookie
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValueParts.join('='));
    }
  }
  return null;
}

// Set cookie with parent domain
function setCookie(name: string, value: string, days: number = 7): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Only set domain in production (on actual buntinggpt.com subdomains)
  const isProduction = window.location.hostname.includes('buntinggpt.com');
  const domainPart = isProduction ? `; domain=${SSO_DOMAIN}` : '';
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/${domainPart}; SameSite=Lax; Secure`;
}

// Remove cookie
function removeCookie(name: string): void {
  const isProduction = window.location.hostname.includes('buntinggpt.com');
  const domainPart = isProduction ? `; domain=${SSO_DOMAIN}` : '';
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}`;
}

/**
 * Custom storage adapter that uses cookies for SSO
 * Compatible with Supabase's storage interface
 */
export const ssoStorage = {
  getItem: (key: string): string | null => {
    // For auth token storage, read from SSO cookie
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      const cookieValue = getCookie(SSO_COOKIE_NAME);
      if (cookieValue) {
        return cookieValue;
      }
    }
    // Fallback to localStorage for other items
    return localStorage.getItem(key);
  },
  
  setItem: (key: string, value: string): void => {
    // For auth token storage, set SSO cookie
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      setCookie(SSO_COOKIE_NAME, value);
    }
    // Also store in localStorage as backup
    localStorage.setItem(key, value);
  },
  
  removeItem: (key: string): void => {
    if (key.includes('auth-token') || key.includes('supabase.auth')) {
      removeCookie(SSO_COOKIE_NAME);
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
