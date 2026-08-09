import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useVerifiedBusinesses() {
  return useQuery({
    queryKey: ['verified_businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verified_businesses')
        .select('*')
        .eq('status', 'approved');

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
}
