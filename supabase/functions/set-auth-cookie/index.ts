import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://auth.buntinggpt.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};

const COOKIE_NAME = 'sb-refresh-token';
const COOKIE_DOMAIN = '.buntinggpt.com';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refresh_token, access_token } = await req.json();

    if (!refresh_token) {
      console.error('set-auth-cookie: Missing refresh_token');
      return new Response(
        JSON.stringify({ error: 'Missing refresh_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the tokens by creating a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the session is valid by getting user
    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);
    
    if (userError || !user) {
      console.error('set-auth-cookie: Invalid session', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('set-auth-cookie: Setting cookie for user', user.email);

    // Set the HttpOnly cookie with the refresh token
    const cookieValue = encodeURIComponent(refresh_token);
    const cookieHeader = `${COOKIE_NAME}=${cookieValue}; Domain=${COOKIE_DOMAIN}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;

    return new Response(
      JSON.stringify({ success: true, user_id: user.id }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader
        } 
      }
    );
  } catch (error) {
    console.error('set-auth-cookie: Error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
