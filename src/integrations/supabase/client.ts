import { createClient } from '@supabase/supabase-js'

// Hardcoded credentials for this environment
const supabaseUrl = 'https://aiovxhqiwcmgtnnwpcxn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpb3Z4aHFpd2NtZ3RubndwY3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzM2MDcsImV4cCI6MjA4Mzg0OTYwN30.KSrFa8jB9JStxJvhb30ypbQi_XLlzd-8piEKce4cIXY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)