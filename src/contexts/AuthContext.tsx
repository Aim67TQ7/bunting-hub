import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getLoginUrl, isDevelopment, authEndpoints } from '@/lib/sso-storage';

interface SessionUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface AuthContextType {
  user: User | SessionUser | null;
  accessToken: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Refresh token 1 minute before expiry
const REFRESH_BUFFER_SECONDS = 60;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | SessionUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback((expiresIn: number) => {
    clearRefreshTimeout();
    
    // Schedule refresh before token expires
    const refreshIn = Math.max((expiresIn - REFRESH_BUFFER_SECONDS) * 1000, 10000);
    console.log(`Scheduling token refresh in ${refreshIn / 1000} seconds`);
    
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Refreshing session...');
      fetchSession();
    }, refreshIn);
  }, [clearRefreshTimeout]);

  const fetchSession = useCallback(async () => {
    try {
      console.log('Fetching session from edge function...');
      
      const response = await fetch(authEndpoints.getSession, {
        method: 'POST',
        credentials: 'include', // Important: includes cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.status}`);
      }

      const data = await response.json();

      if (data.access_token && data.user) {
        console.log('Session retrieved for user:', data.user.email);
        setUser(data.user);
        setAccessToken(data.access_token);
        
        // Set the access token on the Supabase client for API calls
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: '', // Managed by HttpOnly cookie
        });

        // Schedule next refresh
        if (data.expires_in) {
          scheduleRefresh(data.expires_in);
        }
      } else {
        console.log('No valid session found');
        setUser(null);
        setAccessToken(null);
        
        // In production, redirect to login
        if (!isDevelopment()) {
          window.location.href = getLoginUrl(true);
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setUser(null);
      setAccessToken(null);
      
      // In production, redirect to login on error
      if (!isDevelopment()) {
        window.location.href = getLoginUrl(true);
      }
    } finally {
      setLoading(false);
    }
  }, [scheduleRefresh]);

  const refreshSession = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    try {
      console.log('Signing out...');
      clearRefreshTimeout();
      
      // Clear the HttpOnly cookie via edge function
      await fetch(authEndpoints.clearAuthCookie, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Sign out from Supabase client
      await supabase.auth.signOut();
      
      setUser(null);
      setAccessToken(null);

      // In production, redirect to login after signout
      if (!isDevelopment()) {
        window.location.href = getLoginUrl(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [clearRefreshTimeout]);

  useEffect(() => {
    // Initial session fetch
    fetchSession();

    // Cleanup on unmount
    return () => {
      clearRefreshTimeout();
    };
  }, [fetchSession, clearRefreshTimeout]);

  // Also listen to Supabase auth state changes for local development
  useEffect(() => {
    if (isDevelopment()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Dev auth state change:', event, session?.user?.email);
          if (session) {
            setUser(session.user);
            setAccessToken(session.access_token);
            setLoading(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
