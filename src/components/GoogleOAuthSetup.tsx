"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Key, Settings } from 'lucide-react';

export const GoogleOAuthSetup: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="border-none shadow-sm bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Google OAuth Setup Required
        </CardTitle>
        <CardDescription className="text-blue-700">
          To enable Google login, you need to configure OAuth credentials in your Supabase project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-blue-800">
          <p className="font-semibold">Steps to complete setup:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
            <li>Create a new project or select existing</li>
            <li>Enable Google+ API or Google People API</li>
            <li>Create OAuth 2.0 credentials (Web application)</li>
            <li>Add authorized redirect URI: <code className="bg-white px-1 rounded">https://your-project.supabase.co/auth/v1/callback</code></li>
            <li>Copy your Client ID and Client Secret</li>
          </ol>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-900">Supabase Configuration:</p>
          <div className="bg-white p-3 rounded border border-blue-200 text-xs font-mono space-y-1">
            <p>Go to: Supabase Dashboard → Authentication → URL Configuration</p>
            <p>Site URL: <code className="text-blue-600">https://your-app.vercel.app</code></p>
            <p>Redirect URLs: <code className="text-blue-600">https://your-app.vercel.app</code></p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => copyToClipboard("https://your-project.supabase.co/auth/v1/callback")}
          >
            <Key className="w-3 h-3 mr-2" />
            Copy Redirect URI
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
            asChild
          >
            <a href="https://supabase.com/docs/guides/auth/social-login/google" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-2" />
              View Guide
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};