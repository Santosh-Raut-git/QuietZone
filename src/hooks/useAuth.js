import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserExt = async (authUser) => {
      if (!authUser) return setUser(null);
      const { data, error } = await supabase.from('users').select('admin').eq('id', authUser.id).single();
      setUser(error || !data ? authUser : { ...authUser, admin: data.admin });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserExt(session?.user);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUserExt(session?.user);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
