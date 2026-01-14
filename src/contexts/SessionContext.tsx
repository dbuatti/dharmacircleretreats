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
    
    // Clean up URL hash immediately if it contains auth tokens
    // This prevents the hash from being processed again on page refresh
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Listen for auth changes - this is the primary mechanism
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      console.log(`[SessionContext] Auth state change: ${event}`, session ? 'Session found' : 'No session');
      
      // Handle all session-related events
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(session);
        checkAdminAccess(session);
        setLoading(false);
        
        // Show appropriate toast for sign-in
        if (event === 'SIGNED_IN' && session?.user?.email) {
          const email = session.user.email.toLowerCase();
          if (ALLOWED_ADMIN_EMAILS.includes(email)) {
            toast.success(`Welcome back, ${session.user.user_metadata?.full_name || 'Admin'}!`);
          } else {
            toast.error('Account not authorized for admin access.');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
        toast.success('Signed out successfully');
      }
    });

    // Also check for existing session on mount (handles page refreshes)
    const checkInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession && isMounted) {
          setSession(currentSession);
          checkAdminAccess(currentSession);
        }
      } catch (error) {
        console.error('[SessionContext] Error checking initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only check initial session if we're not in the middle of an OAuth flow
    // The onAuthStateChange will handle OAuth redirects
    if (!window.location.hash.includes('access_token')) {
      checkInitialSession();
    }

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