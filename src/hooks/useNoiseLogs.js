import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useNoiseLogs(boundingBox = null, filters = {}) {
  const { search = '', category = 'All', isPredictive = false, targetDay, targetHour } = filters;

  return useQuery({
    queryKey: ['noise_logs', boundingBox, search, category, isPredictive, targetDay, targetHour],
    queryFn: async () => {
      let query = isPredictive && targetDay !== undefined && targetHour !== undefined
        ? supabase.rpc('get_predictive_noise', { target_day: targetDay, target_hour: targetHour })
        : supabase.from('noise_logs').select('*').order('created_at', { ascending: false });

      if (category && category !== 'All') query = query.ilike('source', `%${category}%`);
      if (search?.trim()) query = query.or(`description.ilike.%${search}%,source.ilike.%${search}%`);

      const { data, error } = await query.limit(100);
      if (error) throw new Error(error.message);
      
      return data.map(log => ({ ...log, is_predictive: isPredictive }));
    },
  });
}
