import { HubLayout } from '@/components/hub/HubLayout';
import { HubHeader } from '@/components/hub/HubHeader';
import { ActivityFeed } from '@/components/hub/ActivityFeed';
import { AppCardGrid } from '@/components/hub/AppCardGrid';
import { useEffect } from 'react';
import { logLogin } from '@/lib/activity-logger';
import { useAuth } from '@/contexts/AuthContext';

export default function Hub() {
  const { user } = useAuth();

  // Log login on first load if we have a user
  useEffect(() => {
    if (user) {
      // Only log if this looks like a fresh session
      const lastLoginKey = `last-login-${user.id}`;
      const lastLogin = sessionStorage.getItem(lastLoginKey);
      
      if (!lastLogin) {
        logLogin();
        sessionStorage.setItem(lastLoginKey, new Date().toISOString());
      }
    }
  }, [user]);

  return (
    <HubLayout>
      <div className="min-h-[100dvh] flex flex-col">
        {/* Header with logo */}
        <HubHeader />

        {/* Main content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Activity Feed - Top Half */}
            <div className="h-[250px] sm:h-[300px] lg:h-[350px]">
              <ActivityFeed />
            </div>

            {/* Split Bottom: Applications & Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <AppCardGrid />
              <AppCardGrid filterCategory="report" title="Reports" />
            </div>
          </div>
        </main>
      </div>
    </HubLayout>
  );
}
