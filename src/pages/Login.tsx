"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/contexts/SessionContext';
import { BrandLogo } from '@/components/BrandLogo';

const Login = () => {
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] p-4">
      <Card className="w-full max-w-md border-none shadow-sm overflow-hidden">
        <CardHeader className="brand-navy text-white text-center py-12 space-y-6">
          <div className="flex justify-center">
            <BrandLogo className="w-20 h-20 shadow-lg border-2 border-white/10" />
          </div>
          <div className="space-y-1">
            <h2 className="brand-script text-white/70 text-lg italic tracking-normal">Space for awakening</h2>
            <CardTitle className="text-2xl font-light tracking-widest uppercase">Admin Login</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1e2a5e',
                    brandAccent: '#2b3a7a',
                  },
                },
              },
              className: {
                button: 'rounded-none uppercase tracking-widest text-[10px] h-11',
                input: 'rounded-none border-0 border-b border-gray-200 px-0 h-10 focus:ring-0 focus:border-[#1e2a5e]',
                label: 'uppercase tracking-widest text-[9px] text-gray-500 font-medium',
              }
            }}
            theme="light"
            magicLink={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;