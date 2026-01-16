import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface LogActivityParams {
  eventType: 'app_launch' | 'login' | 'logout' | 'page_view';
  appId?: string;
  appName?: string;
  eventData?: Json;
}

export async function logActivity({
  eventType,
  appId,
  appName,
  eventData,
}: LogActivityParams): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('admin_analytics').insert([{
      event_type: eventType,
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      app_id: appId ?? null,
      app_name: appName ?? null,
      event_data: eventData ?? null,
    }]);
    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

export async function logAppLaunch(appId: string, appName: string, appUrl: string): Promise<void> {
  await logActivity({
    eventType: 'app_launch',
    appId,
    appName,
    eventData: { url: appUrl },
  });
}

export async function logLogin(): Promise<void> {
  await logActivity({
    eventType: 'login',
    eventData: { source: 'hub' },
  });
}
