import { AppItem } from '@/hooks/useAppItems';
import { logAppLaunch } from '@/lib/activity-logger';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppCardProps {
  app: AppItem;
}

// Default icon based on category
const categoryIcons: Record<string, string> = {
  application: '🚀',
  report: '📊',
  tool: '🔧',
  dashboard: '📈',
};

export function AppCard({ app }: AppCardProps) {
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
      className={`glass-card p-6 text-left w-full group relative overflow-hidden ${
        app.coming_soon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-2">
        {app.is_new && (
          <Badge className="bg-[hsl(var(--accent-glow))] text-white border-0 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            NEW
          </Badge>
        )}
        {app.coming_soon && (
          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
            Coming Soon
          </Badge>
        )}
      </div>

      {/* Icon */}
      <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {app.icon_path ? (
          <img 
            src={app.icon_path} 
            alt={app.name}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl">${defaultIcon}</span>`;
            }}
          />
        ) : (
          <span className="text-3xl">{defaultIcon}</span>
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[hsl(var(--accent-glow))] transition-colors">
        {app.name}
      </h3>
      
      <p className="text-sm text-white/60 line-clamp-2 mb-4">
        {app.description}
      </p>

      {/* Category tag */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 capitalize">
          {app.category}
        </span>
        
        {!app.coming_soon && (
          <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-[hsl(var(--accent-glow))] transition-colors" />
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-glow)/0.1)] to-transparent" />
      </div>
    </button>
  );
}
