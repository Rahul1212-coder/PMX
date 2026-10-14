import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase/client';
import fs from 'fs';
import path from 'path';

export { MAX_RESUME_ANALYSES, type ResumeUsageInfo } from './usage-types';
import { MAX_RESUME_ANALYSES, type ResumeUsageInfo } from './usage-types';

function getSafeSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    const { url, key } = getSupabaseConfig();
    return createSupabaseClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 1 } },
    } as any);
  } catch {
    return null;
  }
}

// Server-side persistent storage path
function getServerStoragePath(): string {
  return path.join(process.cwd(), 'data', 'resume-usage.json');
}

function readServerUsage(userId: string): { count: number; history: any[] } {
  try {
    const filePath = getServerStoragePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data[userId]) {
        return {
          count: Number(data[userId].count) || 0,
          history: Array.isArray(data[userId].history) ? data[userId].history : [],
        };
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
    const current = data[userId] || { count: 0, history: [] };
    current.count = (current.count || 0) + 1;
    current.history = current.history || [];
    current.history.push({
      ...entry,
      createdAt: new Date().toISOString(),
    });
    data[userId] = current;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return current.count;
  } catch (err) {
    console.warn('Could not write server resume usage:', err);
    return 1;
  }
}

/**
 * Fetch the current resume evaluation usage for a user.
 */
export async function getUserResumeUsage(userId: string): Promise<ResumeUsageInfo> {
  if (!userId || userId === 'guest') {
    return {
      usageCount: 0,
      remaining: 0,
      maxAllowed: MAX_RESUME_ANALYSES,
      hasReachedLimit: true,
    };
  }

  let dbCount = 0;
  let history: any[] = [];

  // 1. Try Supabase table if available
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSafeSupabaseClient();
      if (supabase) {
        const { data, count, error } = await supabase
          .from('resume_usage')
          .select('*', { count: 'exact' })
          .eq('user_id', userId);

        if (!error && typeof count === 'number') {
          dbCount = count;
          history = data || [];
        }
      }
    } catch {
      // Supabase table might not exist yet; gracefully fallback
    }
  }

  // 2. Check server-side store if in Node environment
  let serverCount = 0;
  if (typeof window === 'undefined') {
    const serverData = readServerUsage(userId);
    serverCount = serverData.count;
    if (serverData.history.length > history.length) {
      history = serverData.history;
    }
  }

  // 3. Check client localStorage if in browser
  let localCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_resume_usage_${userId}`);
      if (raw) {
        localCount = parseInt(raw, 10) || 0;
      }
    } catch {}
  }

  const effectiveCount = Math.max(dbCount, serverCount, localCount);
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
  }
): Promise<{ success: boolean; newCount: number; remaining: number }> {
  if (!userId || userId === 'guest') {
    return { success: false, newCount: MAX_RESUME_ANALYSES, remaining: 0 };
  }

  // 1. Write to Supabase table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSafeSupabaseClient();
      if (supabase) {
        await supabase.from('resume_usage').insert({
          user_id: userId,
          resume_id: metadata.resumeId || `res-${Date.now()}`,
          target_role: metadata.targetRole || 'Product Manager',
          overall_score: metadata.score || null,
        });
      }
    } catch (err) {
      console.warn('Could not record usage in Supabase:', err);
    }
  }

  // 2. Write to server-side store if in Node
  let newCount = 1;
  if (typeof window === 'undefined') {
    newCount = writeServerUsage(userId, metadata);
  }

  // 3. Update client-side localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const prev = parseInt(localStorage.getItem(`pmverse_resume_usage_${userId}`) || '0', 10) || 0;
      newCount = Math.max(newCount, prev + 1);
      localStorage.setItem(`pmverse_resume_usage_${userId}`, newCount.toString());
    } catch {}
  }

  const remaining = Math.max(0, MAX_RESUME_ANALYSES - newCount);
  return { success: true, newCount, remaining };
}
