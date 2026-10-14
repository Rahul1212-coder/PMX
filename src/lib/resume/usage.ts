import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase/client';
import fs from 'fs';
import path from 'path';

export { MAX_RESUME_ANALYSES, type ResumeUsageInfo } from './usage-types';
import { MAX_RESUME_ANALYSES, type ResumeUsageInfo } from './usage-types';

function getSafeSupabaseClient(authToken?: string | null): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    const { url, key } = getSupabaseConfig();
    return createSupabaseClient(url, key, {
      auth: { persistSession: false },
      global: authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined,
    } as any);
  } catch {
    return null;
  }
}

// In-memory server fallback map to survive serverless invocations within container
const memoryUsageStore = new Map<string, { count: number; history: any[] }>();

// Server-side persistent storage path
function getServerStoragePath(): string {
  return path.join(process.cwd(), 'data', 'resume-usage.json');
}

function readServerUsage(userId: string): { count: number; history: any[] } {
  // Check memory first
  const inMem = memoryUsageStore.get(userId);
  if (inMem && inMem.count > 0) {
    return inMem;
  }

  try {
    const filePath = getServerStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data[userId]) {
        const parsed = {
          count: Number(data[userId].count) || 0,
          history: Array.isArray(data[userId].history) ? data[userId].history : [],
        };
        memoryUsageStore.set(userId, parsed);
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read server resume usage:', err);
  }
  return { count: 0, history: [] };
}

function writeServerUsage(userId: string, entry: any): number {
  try {
    const filePath = getServerStoragePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let data: Record<string, { count: number; history: any[] }> = {};
    if (fs.existsSync(filePath)) {
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) || {};
      } catch {
        data = {};
      }
    }
    const current = data[userId] || memoryUsageStore.get(userId) || { count: 0, history: [] };
    current.count = Math.min(MAX_RESUME_ANALYSES, (current.count || 0) + 1);
    current.history = current.history || [];
    current.history.push({
      ...entry,
      createdAt: new Date().toISOString(),
    });
    data[userId] = current;
    memoryUsageStore.set(userId, current);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {}
    return current.count;
  } catch (err) {
    console.warn('Could not write server resume usage:', err);
    const fallbackCount = Math.min(MAX_RESUME_ANALYSES, (memoryUsageStore.get(userId)?.count || 0) + 1);
    memoryUsageStore.set(userId, { count: fallbackCount, history: [entry] });
    return fallbackCount;
  }
}

/**
 * Fetch the current resume evaluation usage for a user.
 * Combines account metadata from Supabase Auth, saved_jobs table, client-reported count, and server store.
 */
export async function getUserResumeUsage(
  userId: string,
  options?: {
    authToken?: string | null;
    userEmail?: string | null;
    clientReportedCount?: number;
  }
): Promise<ResumeUsageInfo> {
  if (!userId || userId === 'guest') {
    return {
      usageCount: 0,
      remaining: 0,
      maxAllowed: MAX_RESUME_ANALYSES,
      hasReachedLimit: true,
      history: [],
    };
  }

  let dbCount = 0;
  let metaCount = 0;
  let history: any[] = [];

  const supabase = getSafeSupabaseClient(options?.authToken);

  // 1. If auth token provided, verify with Supabase Auth directly
  if (supabase && options?.authToken) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === userId) {
        const meta = user.user_metadata || {};
        metaCount = Number(
          meta.resume_eval_count ??
          meta.resume_analyses_count ??
          meta.resume_usage_count ??
          0
        );
        if (Array.isArray(meta.resume_eval_history)) {
          history = meta.resume_eval_history;
        }
      }
    } catch {
      // ignore
    }

    // Check saved_jobs table with user's JWT
    try {
      const { count, error } = await supabase
        .from('saved_jobs')
        .select('job_id', { count: 'exact' })
        .eq('user_id', userId)
        .like('job_id', 'resume_eval_%');

      if (!error && typeof count === 'number') {
        dbCount = count;
      }
    } catch {
      // ignore
    }
  }

  // 2. Read server store
  const serverData = readServerUsage(userId);
  const serverCount = serverData.count;
  if (serverData.history.length > history.length) {
    history = serverData.history;
  }

  // 3. Client reported count
  const clientCount = Number(options?.clientReportedCount) || 0;

  // Highest count from any persistent channel
  const effectiveCount = Math.min(
    MAX_RESUME_ANALYSES,
    Math.max(metaCount, dbCount, clientCount, serverCount)
  );
  const remaining = Math.max(0, MAX_RESUME_ANALYSES - effectiveCount);

  return {
    usageCount: effectiveCount,
    remaining,
    maxAllowed: MAX_RESUME_ANALYSES,
    hasReachedLimit: effectiveCount >= MAX_RESUME_ANALYSES,
    history,
  };
}

/**
 * Record a new resume analysis usage for a user.
 */
export async function recordResumeUsage(
  userId: string,
  metadata: {
    resumeId?: string;
    targetRole?: string;
    score?: number;
  },
  options?: {
    authToken?: string | null;
  }
): Promise<{ success: boolean; newCount: number; remaining: number }> {
  if (!userId || userId === 'guest') {
    return { success: false, newCount: MAX_RESUME_ANALYSES, remaining: 0 };
  }

  // 1. Write to server-side store & memory
  const newCount = writeServerUsage(userId, metadata);

  // 2. If auth token available, update Supabase user_metadata and saved_jobs
  if (options?.authToken) {
    try {
      const supabase = getSafeSupabaseClient(options.authToken);
      if (supabase) {
        // Update user_metadata in Supabase Auth
        await supabase.auth.updateUser({
          data: {
            resume_eval_count: newCount,
            resume_analyses_count: newCount,
            resume_usage_count: newCount,
          },
        });

        // Insert audit row in saved_jobs
        await supabase.from('saved_jobs').insert({
          user_id: userId,
          job_id: `resume_eval_${newCount}_${Date.now()}`,
        });
      }
    } catch (err) {
      console.warn('Could not sync usage to Supabase with authToken:', err);
    }
  }

  const remaining = Math.max(0, MAX_RESUME_ANALYSES - newCount);
  return { success: true, newCount, remaining };
}
