import { formatDistanceToNow } from 'date-fns';
import { ActivityEvent } from '@/hooks/useActivityFeed';
import { 
  LogIn, 
  LogOut, 
  Rocket, 
  Eye, 
  Bell,
  Activity 
} from 'lucide-react';

interface ActivityItemProps {
  activity: ActivityEvent;
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  login: <LogIn className="h-4 w-4 text-green-400" />,
  logout: <LogOut className="h-4 w-4 text-orange-400" />,
  app_launch: <Rocket className="h-4 w-4 text-blue-400" />,
  page_view: <Eye className="h-4 w-4 text-purple-400" />,
  announcement: <Bell className="h-4 w-4 text-yellow-400" />,
};

const eventTypeLabels: Record<string, string> = {
  login: 'logged in',
  logout: 'logged out',
  app_launch: 'launched',
  page_view: 'viewed',
  announcement: 'posted announcement',
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const icon = eventTypeIcons[activity.event_type] || <Activity className="h-4 w-4 text-white/60" />;
  const actionLabel = eventTypeLabels[activity.event_type] || activity.event_type;
  
  const userName = activity.user_email?.split('@')[0] || 'Unknown user';
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true });

  const getDescription = () => {
    if (activity.event_type === 'app_launch' && activity.app_name) {
      return (
        <>
          <span className="font-medium text-white">{userName}</span>
          <span className="text-white/60"> {actionLabel} </span>
          <span className="font-medium text-[hsl(var(--accent-glow))]">{activity.app_name}</span>
        </>
      );
    }
    
    return (
      <>
        <span className="font-medium text-white">{userName}</span>
        <span className="text-white/60"> {actionLabel}</span>
      </>
    );
  };

  return (
    <div className="activity-item flex items-center gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          {getDescription()}
        </p>
      </div>
      
      <div className="flex-shrink-0 text-xs text-white/40">
        {timeAgo}
      </div>
    </div>
  );
}
