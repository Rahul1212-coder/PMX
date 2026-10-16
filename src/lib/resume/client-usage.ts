'use client';

import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { MAX_RESUME_ANALYSES, ResumeUsageInfo } from './usage-types';

export { MAX_RESUME_ANALYSES, type ResumeUsageInfo };

/**
 * Resolves the persistent resume evaluation count for a user across all available sources:
 * 1. Supabase Auth user_metadata (tied directly to account in auth.users)
 * 2. Supabase database table `saved_jobs` with job_id pattern `resume_eval_%`
 * 3. Browser localStorage for account ID and account email
 */
export async function getClientAccountUsage(
  user: User | null,
  session?: Session | null
): Promise<ResumeUsageInfo> {
  if (!user || !user.id || user.id === 'guest') {
    return {
      usageCount: 0,
      remaining: 0,
      maxAllowed: MAX_RESUME_ANALYSES,
      hasReachedLimit: true,
      history: [],
    };
  }

  // 1. Account Metadata (Persisted in Supabase Auth auth.users)
  const meta = user.user_metadata || {};
  const metaCount = Number(
    meta.resume_eval_count ??
    meta.resume_analyses_count ??
    meta.resume_usage_count ??
    0
  );
  const metaHistory = Array.isArray(meta.resume_eval_history) ? meta.resume_eval_history : [];

  // 2. Browser LocalStorage (instant cache across reloads)
  let localCount = 0;
  if (typeof window !== 'undefined') {
    try {
      const byId = parseInt(localStorage.getItem(`pmverse_resume_usage_${user.id}`) || '0', 10);
      const byEmail = user.email
        ? parseInt(localStorage.getItem(`pmverse_resume_usage_${user.email}`) || '0', 10)
        : 0;
      localCount = Math.max(isNaN(byId) ? 0 : byId, isNaN(byEmail) ? 0 : byEmail);
    } catch {}
  }

  // 3. Supabase Database: count evaluation entries in saved_jobs table
  let dbCount = 0;
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, count, error } = await supabase
        .from('saved_jobs')
        .select('job_id', { count: 'exact' })
        .eq('user_id', user.id)
        .like('job_id', 'resume_eval_%');

      if (!error && typeof count === 'number') {
        dbCount = count;
      } else if (!error && Array.isArray(data)) {
        dbCount = data.length;
      }
    }
  } catch (err) {
    console.warn('Could not query saved_jobs for account resume usage:', err);
  }

  // Take the highest confirmed count so count NEVER drops across re-login or refresh
  const effectiveCount = Math.min(MAX_RESUME_ANALYSES, Math.max(metaCount, localCount, dbCount));
  const remaining = Math.max(0, MAX_RESUME_ANALYSES - effectiveCount);

  // Re-sync localStorage if it lagged behind account metadata or DB
  if (typeof window !== 'undefined' && effectiveCount > localCount) {
    try {
      localStorage.setItem(`pmverse_resume_usage_${user.id}`, effectiveCount.toString());
      if (user.email) {
        localStorage.setItem(`pmverse_resume_usage_${user.email}`, effectiveCount.toString());
      }
    } catch {}
  }

  return {
    usageCount: effectiveCount,
    remaining,
    maxAllowed: MAX_RESUME_ANALYSES,
    hasReachedLimit: effectiveCount >= MAX_RESUME_ANALYSES,
    history: metaHistory,
  };
}

/**
 * Records a new resume evaluation for this account across all persistence layers:
 * - Supabase Auth account metadata (user_metadata)
 * - Supabase PostgreSQL `saved_jobs` audit table
 * - Browser localStorage
 */
export async function recordClientAccountUsage(
  user: User | null,
  metadata?: {
    targetRole?: string;
    score?: number;
    resumeId?: string;
  }
): Promise<ResumeUsageInfo> {
  if (!user || !user.id || user.id === 'guest') {
    return {
      usageCount: MAX_RESUME_ANALYSES,
      remaining: 0,
      maxAllowed: MAX_RESUME_ANALYSES,
      hasReachedLimit: true,
      history: [],
    };
  }

  const current = await getClientAccountUsage(user);
  const newCount = Math.min(MAX_RESUME_ANALYSES, current.usageCount + 1);

  // 1. Update localStorage immediately (0ms latency for subsequent views)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`pmverse_resume_usage_${user.id}`, newCount.toString());
      if (user.email) {
        localStorage.setItem(`pmverse_resume_usage_${user.email}`, newCount.toString());
      }
    } catch {}
  }

  const newEntry = {
    targetRole: metadata?.targetRole || 'Product Manager',
    score: metadata?.score,
    resumeId: metadata?.resumeId,
    createdAt: new Date().toISOString(),
  };
  const updatedHistory = [...(current.history || []), newEntry];

  // 2. Persist to Supabase Auth user_metadata (tied to account forever across devices)
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Keep user_metadata compact (only scalars, no unbounded history arrays) so JWT cookie stays <1KB
      await supabase.auth.updateUser({
        data: {
          resume_eval_count: newCount,
          resume_analyses_count: newCount,
          resume_usage_count: newCount,
        },
      });
    }
  } catch (err) {
    console.warn('Could not update user_metadata in Supabase Auth:', err);
  }

  // 3. Persist to Supabase database table `saved_jobs` as an audit record
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: `resume_eval_${newCount}_${Date.now()}`,
      });
    }
  } catch (err) {
    console.warn('Could not insert resume_eval record into saved_jobs:', err);
  }

  const remaining = Math.max(0, MAX_RESUME_ANALYSES - newCount);

  return {
    usageCount: newCount,
    remaining,
    maxAllowed: MAX_RESUME_ANALYSES,
    hasReachedLimit: newCount >= MAX_RESUME_ANALYSES,
    history: updatedHistory,
  };
}
