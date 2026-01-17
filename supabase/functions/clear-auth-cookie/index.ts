import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  'https://auth.buntinggpt.com',
  'https://core.buntinggpt.com',
  'https://hub.buntinggpt.com',
];

const COOKIE_NAME = 'sb-refresh-token';

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('clear-auth-cookie: Clearing auth cookie');

    // Clear the HttpOnly cookie by setting Max-Age=0
    const clearCookie = `${COOKIE_NAME}=; Domain=.buntinggpt.com; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookie
        } 
      }
    );
  } catch (error) {
    console.error('clear-auth-cookie: Error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
