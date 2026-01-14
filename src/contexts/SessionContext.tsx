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

  const checkAdminAccess = (session: Session | null) => {
    const email = session?.user?.email?.toLowerCase();
    const allowed = email ? ALLOWED_ADMIN_EMAILS.includes(email) : false;
    setIsAdmin(allowed);
    return allowed;
  };

  useEffect(() => {
    let isMounted = true;
    
    // 1. Manual URL hash processing (Fallback for redirects)
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      console.log('[SessionContext] Found access token in hash. Attempting to set session.');
      // This call tells Supabase to process the hash and store the session.
      // We don't need the result, as onAuthStateChange will fire next.
      supabase.auth.getSession().catch(e => {
        if (e instanceof Error && e.name === 'AbortError') {
          console.warn('[SessionContext] Manual getSession aborted during hash processing.');
        } else {
          console.error('[SessionContext] Error during manual hash processing:', e);
        }
      });
      // Clean up the hash immediately after processing is initiated
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Listen for auth changes (Primary mechanism)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log(`[SessionContext] Auth state change: ${event}`);
      
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setSession(session);
        const allowed = checkAdminAccess(session);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          const email = session?.user?.email?.toLowerCase();
          if (email && allowed) {
            toast.success('Welcome back! Admin access granted.');
          } else if (email) {
            toast.error('This account is not authorized for admin access.');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
        toast.success('Signed out successfully');
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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