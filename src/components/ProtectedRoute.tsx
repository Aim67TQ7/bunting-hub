import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Check if we're in a development environment
 */
function isDevelopment(): boolean {
  return typeof window !== 'undefined' && !window.location.hostname.includes('buntinggpt.com');
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // CRITICAL: Show loading state while checking session to prevent premature redirects
  if (isLoading) {
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
  if (isDevelopment() && !user) {
    console.warn('[ProtectedRoute] Development mode: Allowing access without authentication');
    return <>{children}</>;
  }

  // No user - redirect to login
  if (!user) {
    const currentUrl = `${window.location.protocol}//${window.location.host}${location.pathname}${location.search}`;
    const loginUrl = `https://login.buntinggpt.com?redirect=${encodeURIComponent(currentUrl)}`;
    
    console.log('[ProtectedRoute] No session, redirecting to:', loginUrl);
    window.location.href = loginUrl;
    
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
