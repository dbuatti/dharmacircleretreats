"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define allowed admin emails
const ALLOWED_ADMIN_EMAILS = [
  'samantha@dharmacircle.com.au',
  'dharmacircleretreats@gmail.com'
];

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminAccess(session);
      setLoading(false);
    })
    .catch(error => {
      // Catch potential errors during session retrieval, often due to internal lock issues on rapid unmount/remount
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[SessionContext] Session retrieval aborted.');
      } else {
        console.error('[SessionContext] Error fetching initial session:', error);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      checkAdminAccess(session);
      
      // Handle specific auth events
      if (event === 'SIGNED_IN') {
        const email = session?.user?.email?.toLowerCase();
        if (email && ALLOWED_ADMIN_EMAILS.includes(email)) {
          toast.success('Welcome back! Admin access granted.');
        } else if (email) {
          toast.error('This account is not authorized for admin access.');
        }
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

  const checkAdminAccess = (session: Session | null) => {
    const email = session?.user?.email?.toLowerCase();
    const allowed = email ? ALLOWED_ADMIN_EMAILS.includes(email) : false;
    setIsAdmin(allowed);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      loading, 
      user: session?.user || null,
      signOut,
      isAdmin
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

export { ALLOWED_ADMIN_EMAILS };