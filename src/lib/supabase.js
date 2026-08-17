import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_anon_key';

const dummyStorage = { getItem: () => null, setItem: () => null, removeItem: () => null };
const webStorage = typeof window !== 'undefined' ? undefined : dummyStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
