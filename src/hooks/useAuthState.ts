import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, purgeAllAuthCookies } from '@/integrations/supabase/client';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[useAuthState] Session error:', error);
        purgeAllAuthCookies();
        setState({ session: null, user: null, loading: false, error });
        return;
      }
      
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
        error: null
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuthState] Auth event:', event);
        
        if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
          purgeAllAuthCookies();
        }
        
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    purgeAllAuthCookies();
    // Redirect to gate for fresh login
    window.location.href = 'https://gate.buntinggpt.com';
  };

  return { ...state, signOut };
}
