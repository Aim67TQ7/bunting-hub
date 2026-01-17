import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://auth.buntinggpt.com',
  'https://core.buntinggpt.com',
  'https://hub.buntinggpt.com',
];

const COOKIE_NAME = 'sb-refresh-token';

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace('https://', 'https://').split('.')[0]) || ALLOWED_ORIGINS.includes(origin))
    ? origin 
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join('='));
    }
  });
  return cookies;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const refreshToken = cookies[COOKIE_NAME];

    if (!refreshToken) {
      console.log('get-session: No refresh token cookie found');
      return new Response(
        JSON.stringify({ session: null, user: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create a client and refresh the session using the refresh token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      console.error('get-session: Failed to refresh session', error);
      // Clear the invalid cookie
      const clearCookie = `${COOKIE_NAME}=; Domain=.buntinggpt.com; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
      return new Response(
        JSON.stringify({ session: null, user: null, error: 'Session expired' }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Set-Cookie': clearCookie
          } 
        }
      );
    }

    console.log('get-session: Session refreshed for user', data.user?.email);

    // Update the cookie with the new refresh token
    const newCookieValue = encodeURIComponent(data.session.refresh_token);
    const cookieMaxAge = 60 * 60 * 24 * 7; // 7 days
    const setCookie = `${COOKIE_NAME}=${newCookieValue}; Domain=.buntinggpt.com; Path=/; Max-Age=${cookieMaxAge}; HttpOnly; Secure; SameSite=Lax`;

    // Return the access token (short-lived, client needs it for API calls)
    return new Response(
      JSON.stringify({
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          user_metadata: data.user?.user_metadata,
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': setCookie
        } 
      }
    );
  } catch (error) {
    console.error('get-session: Error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
