const COOKIE_DOMAIN = ".buntinggpt.com";
const COOKIE_MAX_AGE = 604800; // 7 days
const CHUNK_SIZE = 3000; // 3KB chunks

/**
 * Helper to generate chunk key names
 */
const chunkKey = (baseKey: string, index: number) => `${baseKey}.chunks.${index}`;

/**
 * Custom cookie storage for cross-subdomain session sharing
 */
export const cookieStorage = {
  getItem: (key: string): string | null => {
    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, ...valueParts] = cookie.trim().split('=');
        acc[name] = valueParts.join('=');
        return acc;
      }, {} as Record<string, string>);

      // Collect all chunks
      const chunks: string[] = [];
      let index = 0;

      while (true) {
        const cookieName = chunkKey(key, index);
        const value = cookies[cookieName];

        if (!value) break;

        chunks.push(decodeURIComponent(value));
        index++;
      }

      if (chunks.length === 0) {
        // Try single cookie (backwards compatibility)
        const singleValue = cookies[key];
        return singleValue ? decodeURIComponent(singleValue) : null;
      }

      return chunks.join('');
    } catch (error) {
      console.error('[Cookie] Read error:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      // Remove old chunks
      cookieStorage.removeItem(key);

      const encodedValue = encodeURIComponent(value);
      const numChunks = Math.ceil(encodedValue.length / CHUNK_SIZE);

      // Write chunks
      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SIZE;
        const chunk = encodedValue.slice(start, start + CHUNK_SIZE);
        const cookieName = chunkKey(key, i);

        document.cookie = `${cookieName}=${chunk}; path=/; domain=${COOKIE_DOMAIN}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
      }

      console.log(`[Cookie] Set ${numChunks} chunk(s) for ${key} on ${COOKIE_DOMAIN}`);
    } catch (error) {
      console.error('[Cookie] Write error:', error);
    }
  },

  removeItem: (key: string): void => {
    try {
      const cookies = document.cookie.split(';');

      for (const cookie of cookies) {
        const cookieName = cookie.trim().split('=')[0];

        // Remove if it matches pattern: key.chunks.N
        if (cookieName === key || cookieName.startsWith(`${key}.chunks.`)) {
          document.cookie = `${cookieName}=; path=/; domain=${COOKIE_DOMAIN}; max-age=0; SameSite=Lax; Secure`;
        }
      }
    } catch (error) {
      console.error('[Cookie] Remove error:', error);
    }
  }
};

/**
 * Get Supabase auth storage with environment detection
 */
export function getSupabaseAuthStorage() {
  const isProduction =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'buntinggpt.com' ||
      window.location.hostname.endsWith('.buntinggpt.com'));

  return isProduction ? cookieStorage : window.localStorage;
}
