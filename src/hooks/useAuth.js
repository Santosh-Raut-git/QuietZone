/**
 * Auth Context and Provider
 * 
 * Manages the Supabase authentication session state across the app.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserExt = async (authUser) => {
      if (!authUser) {
        setUser(null);
        return;
      }
      const { data, error } = await supabase
        .from('users')
        .select('admin')
        .eq('id', authUser.id)
        .single();
        
      console.log('fetchUserExt fetched for id:', authUser.id, 'data:', data, 'error:', error);

      if (!error && data) {
        setUser({ ...authUser, admin: data.admin });
      } else {
        // If error (e.g. row doesn't exist because user signed up before the trigger was added),
        // we fallback to the normal auth user.
        setUser(authUser);
      }
    };

    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserExt(session?.user);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchUserExt(session?.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
