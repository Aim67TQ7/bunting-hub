import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityEvent {
  id: string;
  event_type: string;
  user_email: string | null;
  user_id: string | null;
  app_id: string | null;
  app_name: string | null;
  event_data: Record<string, unknown> | null;
  created_at: string;
}

export function useActivityFeed(limit: number = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_analytics')
        .select('id, event_type, user_email, user_id, app_id, app_name, event_data, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ActivityEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('activity-feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_analytics',
        },
        (payload) => {
          console.log('New activity:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['activity-feed'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
