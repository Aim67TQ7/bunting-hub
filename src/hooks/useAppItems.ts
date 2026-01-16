import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon_path: string | null;
  category: string;
  is_active: boolean;
  is_new: boolean;
  coming_soon: boolean;
  sidebar_featured: boolean;
}

export function useAppItems() {
  return useQuery({
    queryKey: ['app-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_items')
        .select('id, name, description, url, icon_path, category, is_active, is_new, coming_soon, sidebar_featured')
        .eq('is_active', true)
        .order('sidebar_featured', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as AppItem[];
    },
  });
}
