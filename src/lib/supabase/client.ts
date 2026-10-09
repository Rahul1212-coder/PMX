import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://nbhrclqwcspkmffnrlbk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaHJjbHF3Y3Nwa21mZm5ybGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDkxNDksImV4cCI6MjEwNzAyNTE0OX0.e-oqVJxYRALx1dQC0NM4MYHv4KCfzA4KSW1D0ztcoeE';

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url !== 'https://your-project.supabase.co' &&
    key !== 'your-anon-key-here'
  );
};

// Singleton browser client instance
let browserClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getSupabaseConfig();

  if (typeof window === 'undefined') {
    return createSupabaseClient(url, key);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
};
