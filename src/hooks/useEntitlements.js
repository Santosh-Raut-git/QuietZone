import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useEntitlements() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['entitlements', userId],
    queryFn: async () => {
      if (!userId) return { is_pro: false };

      const { data, error } = await supabase
        .from('user_entitlements')
        .select('is_pro')
        .eq('user_id', userId)
        .single();

      // If no row exists, we treat it as not pro (rather than throwing an error)
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      return { is_pro: data?.is_pro ?? false };
    },
    enabled: !!userId,
    initialData: { is_pro: false },
  });
}
