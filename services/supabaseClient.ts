
import { createClient } from '@supabase/supabase-js';

// ⚠️ REPLACE THESE WITH YOUR ACTUAL SUPABASE PROJECT CREDENTIALS ⚠️
// You can get these from your Supabase Project Settings -> API

// Safe environment variable retrieval
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[key];
  }
  return undefined;
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'your-anon-key';

export const isSupabaseConfigured = () => {
    return SUPABASE_URL !== 'https://your-project.supabase.co' && 
           SUPABASE_ANON_KEY !== 'your-anon-key' &&
           SUPABASE_URL.startsWith('https://');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
