import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};

export const isSupabaseConfigured = Boolean(
  env.VITE_SUPABASE_URL &&
  env.VITE_SUPABASE_ANON_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(
      env.VITE_SUPABASE_URL as string,
      env.VITE_SUPABASE_ANON_KEY as string
    )
  : null;
