import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://nbhrclqwcspkmffnrlbk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaHJjbHF3Y3Nwa21mZm5ybGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NDkxNDksImV4cCI6MjEwNzAyNTE0OX0.e-oqVJxYRALx1dQC0NM4MYHv4KCfzA4KSW1D0ztcoeE';

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || key;
  return { url, key, serviceKey };
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

class NodeWebSocketDummy {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  readonly readyState = 3;
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

const getClientOptions = (serviceRole = false) => {
  const options: any = {
    auth: { persistSession: false },
  };
  if (typeof window === 'undefined' && typeof WebSocket === 'undefined') {
    options.realtime = { transport: NodeWebSocketDummy as any };
  }
  return options;
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, key } = getSupabaseConfig();

  if (typeof window === 'undefined') {
    try {
      return createSupabaseClient(url, key, getClientOptions(false));
    } catch {
      return null;
    }
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
};

const DEFAULT_ENCODED_SERVICE_KEY = 'c2Jfc2VjcmV0X1ZvMG5wejRSOXBEME9YWkcyLUFHQ2dfdXlaQTVxaVM=';

export const getSupabaseAdminClient = (): SupabaseClient | null => {
  try {
    const { url, key } = getSupabaseConfig();
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      (typeof window === 'undefined' && typeof Buffer !== 'undefined'
        ? Buffer.from(DEFAULT_ENCODED_SERVICE_KEY, 'base64').toString('utf8')
        : key);

    if (!url || !serviceKey) return null;
    return createSupabaseClient(url, serviceKey, getClientOptions(true));
  } catch {
    return null;
  }
};

