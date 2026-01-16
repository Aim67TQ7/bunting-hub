import { useActivityFeed } from '@/hooks/useActivityFeed';
import { ActivityItem } from './ActivityItem';
import { Activity, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ActivityFeed() {
  const { data: activities, isLoading, error } = useActivityFeed(15);

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-[hsl(var(--accent-glow))]" />
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <div className="flex-1" />
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-white/40">Live</span>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2 glass-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-white/40">
            <p>Failed to load activity</p>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as users interact with apps</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
