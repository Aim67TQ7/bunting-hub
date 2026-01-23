import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Check if we're in a development environment
 */
function isDevelopment(): boolean {
  return typeof window !== 'undefined' && !window.location.hostname.includes('buntinggpt.com');
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuthState();

  useEffect(() => {
    if (!loading && !user && !isDevelopment()) {
      // No session - redirect to gate with return URL
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://gate.buntinggpt.com?returnUrl=${returnUrl}`;
    }
  }, [loading, user]);

  // Show loading state
  if (loading) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-hub-gradient">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // In development, allow access without auth for testing
  if (isDevelopment() && !user) {
    console.warn('[ProtectedRoute] Development mode: Allowing access without authentication');
    return <>{children}</>;
  }

  // No user and not in dev - will redirect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
