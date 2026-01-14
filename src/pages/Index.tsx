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
    // Handle OAuth redirect messages and clean up hash
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.slice(1));
    const error = hashParams.get('error');
    const accessToken = hashParams.get('access_token'); // Check for successful token

    if (error) {
      toast.error(hashParams.get('error_description') || 'Authentication error');
    }
    
    // Clean up the URL if it contains auth parameters (error or success token)
    if (error || accessToken) {
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