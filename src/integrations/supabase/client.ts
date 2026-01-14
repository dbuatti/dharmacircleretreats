import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Hardcoded credentials for this environment
const supabaseUrl = 'https://aiovxhqiwcmgtnnwpcxn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpb3Z4aHFpd2NtZ3RubndwY3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzM2MDcsImV4cCI6MjA4Mzg0OTYwN30.KSrFa8jB9JStxJvhb30ypbQi_XLlzd-8piEKce4cIXY'

// Use a global variable to ensure the client is a singleton across hot reloads
declare global {
  interface Window {
    supabase?: SupabaseClient;
  }
}

if (!window.supabase) {
  window.supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = window.supabase;