"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        toast.success('Signed out successfully');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[Session] Token refreshed');
      } else if (event === 'USER_UPDATED') {
        console.log('[Session] User updated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      loading, 
      user: session?.user || null,
      signOut 
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};