/**
 * Hook to fetch noise logs
 * Uses @tanstack/react-query to fetch data from Supabase.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useNoiseLogs(boundingBox = null, filters = {}) {
  const { search = '', category = 'All', isPredictive = false, targetDay, targetHour } = filters;

  return useQuery({
    queryKey: ['noise_logs', boundingBox, search, category, isPredictive, targetDay, targetHour],
    queryFn: async () => {
      let query;
      
      if (isPredictive && targetDay !== undefined && targetHour !== undefined) {
        // Gated RPC call - requires Pro
        query = supabase.rpc('get_predictive_noise', {
          target_day: targetDay,
          target_hour: targetHour,
        });
      } else {
        // Standard Live Query
        query = supabase
          .from('noise_logs')
          .select('*')
          .order('created_at', { ascending: false });
      }

      // If category is provided, match the source
      if (category && category !== 'All') {
        query = query.ilike('source', `%${category}%`);
      }
      
      // If search text is provided, match the description or source
      if (search && search.trim() !== '') {
        query = query.or(`description.ilike.%${search}%,source.ilike.%${search}%`);
      }

      // Limit results
      query = query.limit(100);

      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // If predictive, flag the data for the UI
      return data.map(log => ({
        ...log,
        is_predictive: isPredictive
      }));
    },
  });
}
