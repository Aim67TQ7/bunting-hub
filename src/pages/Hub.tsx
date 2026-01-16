import { HubLayout } from '@/components/hub/HubLayout';
import { HubHeader } from '@/components/hub/HubHeader';
import { ActivityFeed } from '@/components/hub/ActivityFeed';
import { AppCardGrid } from '@/components/hub/AppCardGrid';
import { useEffect } from 'react';
import { logLogin } from '@/lib/activity-logger';
import { useAuth } from '@/contexts/AuthContext';

export default function Hub() {
  const { session } = useAuth();

  // Log login on first load if we have a session
  useEffect(() => {
    if (session) {
      // Only log if this looks like a fresh session
      const lastLoginKey = `last-login-${session.user.id}`;
      const lastLogin = sessionStorage.getItem(lastLoginKey);
      
      if (!lastLogin) {
        logLogin();
        sessionStorage.setItem(lastLoginKey, new Date().toISOString());
      }
    }
  }, [session]);

  return (
    <HubLayout>
      <div className="min-h-screen flex flex-col">
        {/* Header with logo */}
        <HubHeader />

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Activity Feed - Top Half */}
            <div className="h-[300px] sm:h-[350px]">
              <ActivityFeed />
            </div>

            {/* App Cards Grid - Bottom Half */}
            <AppCardGrid />
          </div>
        </main>
      </div>
    </HubLayout>
  );
}
