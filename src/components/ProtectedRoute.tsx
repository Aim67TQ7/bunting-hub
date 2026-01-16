import { useAuth } from '@/contexts/AuthContext';
import { getLoginUrl, isDevelopment } from '@/lib/sso-storage';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  useEffect(() => {
    // In production, redirect to login if no session
    if (!loading && !session && !isDevelopment()) {
      window.location.href = getLoginUrl(true);
    }
  }, [session, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hub-gradient">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // In development, allow access without auth for testing
  if (isDevelopment() && !session) {
    console.warn('Development mode: Allowing access without authentication');
    return <>{children}</>;
  }

  // No session and not in dev mode - will redirect
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hub-gradient">
        <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
