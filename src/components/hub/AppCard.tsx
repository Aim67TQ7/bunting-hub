import { AppItem } from '@/hooks/useAppItems';
import { logAppLaunch } from '@/lib/activity-logger';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  app: AppItem;
  compact?: boolean;
}

// Default icon based on category
const categoryIcons: Record<string, string> = {
  application: '🚀',
  report: '📊',
  tool: '🔧',
  dashboard: '📈',
};

export function AppCard({ app, compact = false }: AppCardProps) {
  const handleClick = async () => {
    // Log the app launch
    await logAppLaunch(app.id, app.name, app.url);
    
    // Navigate to app
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const defaultIcon = categoryIcons[app.category] || '📱';

  return (
    <button
      onClick={handleClick}
      disabled={app.coming_soon}
      className={`glass-card text-left w-full group relative overflow-hidden touch-manipulation active:scale-[0.98] transition-transform ${
        compact ? 'p-3 sm:p-4 min-h-[90px] sm:min-h-[100px]' : 'p-4 sm:p-6 min-h-[120px]'
      } ${app.coming_soon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Badges */}
      <div className={`absolute flex gap-1 ${compact ? 'top-1.5 right-1.5 sm:top-2 sm:right-2' : 'top-2 right-2 sm:top-3 sm:right-3'}`}>
        {app.is_new && (
          <Badge className={`bg-[hsl(var(--accent-glow))] text-white border-0 ${compact ? 'text-[8px] px-1 py-0' : 'text-[10px] sm:text-xs px-1.5 sm:px-2'}`}>
            <Sparkles className={compact ? 'h-2 w-2 mr-0.5' : 'h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1'} />
            NEW
          </Badge>
        )}
        {app.coming_soon && (
          <Badge variant="secondary" className={`bg-white/20 text-white border-0 ${compact ? 'text-[8px] px-1 py-0' : 'text-[10px] sm:text-xs px-1.5 sm:px-2'}`}>
            Soon
          </Badge>
        )}
      </div>

      {/* Icon */}
      <div className={`rounded-lg bg-white/10 flex items-center justify-center overflow-hidden group-hover:scale-110 group-active:scale-105 transition-transform duration-300 ${
        compact ? 'w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-2.5' : 'w-12 h-12 sm:w-16 sm:h-16 rounded-xl mb-3 sm:mb-4'
      }`}>
        {app.icon_path ? (
          <img 
            src={app.icon_path} 
            alt={app.name}
            className={compact ? 'w-5 h-5 sm:w-6 sm:h-6 object-contain' : 'w-8 h-8 sm:w-12 sm:h-12 object-contain'}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="${compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}">${defaultIcon}</span>`;
            }}
          />
        ) : (
          <span className={compact ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}>{defaultIcon}</span>
        )}
      </div>

      {/* Content */}
      <h3 className={`font-semibold text-white group-hover:text-[hsl(var(--accent-glow))] group-active:text-[hsl(var(--accent-glow))] transition-colors ${
        compact ? 'text-xs sm:text-sm mb-1 pr-10 sm:pr-12 line-clamp-1' : 'text-base sm:text-lg mb-1.5 sm:mb-2 pr-16 sm:pr-20'
      }`}>
        {app.name}
      </h3>
      
      <p className={`text-white/60 line-clamp-2 ${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm mb-3 sm:mb-4'}`}>
        {app.description}
      </p>

      {/* Category tag - only show on non-compact */}
      {!compact && (
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[10px] sm:text-xs text-white/40 capitalize">
            {app.category}
          </span>
          
          {!app.coming_soon && (
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40 group-hover:text-[hsl(var(--accent-glow))] group-active:text-[hsl(var(--accent-glow))] transition-colors" />
          )}
        </div>
      )}

      {/* Hover/Active glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-glow)/0.1)] to-transparent" />
      </div>
    </button>
  );
}
