// lib/supabase.js - UPDATED
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add validation
if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

console.log('Supabase URL present:', !!supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);