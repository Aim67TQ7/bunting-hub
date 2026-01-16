import { useAppItems } from '@/hooks/useAppItems';
import { AppCard } from './AppCard';
import { Grid, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AppCardGrid() {
  const { data: apps, isLoading, error } = useAppItems();

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Grid className="h-5 w-5 text-[hsl(var(--accent-glow))]" />
        <h2 className="text-lg font-semibold text-white">Applications</h2>
        {apps && (
          <span className="text-sm text-white/40 ml-2">
            {apps.length} available
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-6">
              <Skeleton className="w-16 h-16 rounded-xl bg-white/10 mb-4" />
              <Skeleton className="h-6 w-3/4 bg-white/10 mb-2" />
              <Skeleton className="h-4 w-full bg-white/10 mb-1" />
              <Skeleton className="h-4 w-2/3 bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-white/40">
          <p>Failed to load applications</p>
        </div>
      ) : apps && apps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-white/40">
          <Grid className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No applications available</p>
        </div>
      )}
    </div>
  );
}
