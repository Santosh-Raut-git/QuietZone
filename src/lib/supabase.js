/**
 * Supabase client initialization
 * 
 * Uses env vars from app.config.js extra — never hardcoded.
 * Configured with an SSR-safe storage adapter for session persistence.
 */
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder_anon_key';

// Dummy storage for SSR to prevent any possible window access
const dummyStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};

// Web client gets dummyStorage during SSR, but Supabase-js will use its own internal localStorage wrapper if it detects the window object in the browser. 
// Wait, if we pass dummyStorage, it will always use dummyStorage on web (even on client). 
// So we must pass it conditionally based on window.
const webStorage = typeof window !== 'undefined' ? undefined : dummyStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


