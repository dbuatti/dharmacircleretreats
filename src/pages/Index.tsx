"use client";

import React, { useEffect } from 'react';
import Retreats from "./Retreats";
import { UserMenu } from '@/components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    // Handle OAuth redirect messages
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');

    if (error) {
      toast.error(errorDescription || 'Authentication error');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2a5e]"></div>
      </div>
    );
  }

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="relative">
      {/* User Menu in top-right corner */}
      <div className="absolute top-4 right-4 z-10">
        <UserMenu onLogout={() => navigate('/login')} />
      </div>
      
      <Retreats />
    </div>
  );
};

export default Index;