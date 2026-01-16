import { useAppItems } from '@/hooks/useAppItems';
import { AppCard } from './AppCard';
import { Grid, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AppCardGridProps {
  filterCategory?: string;
  title?: string;
}

export function AppCardGrid({ filterCategory, title = 'Applications' }: AppCardGridProps) {
  const { data: allApps, isLoading, error } = useAppItems();

  // Filter apps by category if specified
  const apps = allApps?.filter(app => {
    if (filterCategory) {
      return app.category === filterCategory;
    }
    // Default: show non-report apps
    return app.category !== 'report';
  });

  const Icon = filterCategory === 'report' ? FileText : Grid;

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--accent-glow))]" />
        <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
        {apps && (
          <span className="text-xs sm:text-sm text-white/40 ml-2">
            {apps.length} available
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-3 sm:p-4">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 mb-2 sm:mb-3" />
              <Skeleton className="h-4 sm:h-5 w-3/4 bg-white/10 mb-1.5" />
              <Skeleton className="h-3 sm:h-4 w-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 text-white/40">
          <p className="text-sm">Failed to load {title.toLowerCase()}</p>
        </div>
      ) : apps && apps.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} compact />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/40">
          <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No {title.toLowerCase()} available</p>
        </div>
      )}
    </div>
  );
}
