import { getSupabaseClient, isSupabaseConfigured } from './client';
import {
  CommunityPost,
  AssessmentResult,
  UserProfile,
  SavedQuizResult,
  JobListing,
  ConnectionInvitation,
  JobApplication,
  ChallengeSubmission,
  WeeklyChallenge,
  ApplicationStage,
} from '@/types';

// Community Posts
export async function getCommunityPostsFromDb(): Promise<CommunityPost[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch posts error (tables might not be created yet):', error.message);
      return null;
    }

    if (!data) return [];

    // Filter out any legacy dummy mock seed posts
    const realPosts = data.filter(
      (row: any) =>
        !['post-1', 'post-2', 'post-3', 'post-4'].includes(row.id) &&
        !['Elena Rostova', 'Marcus Chen', 'Sarah Jenkins', 'Liam Vance'].includes(row.author_name)
    );

    return realPosts.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      author: {
        name: row.author_name || 'PM Community Member',
        role: row.author_role || '',
        company: row.author_company || '',
        avatar: row.author_avatar || '',
      },
      title: row.title,
      content: row.content,
      category: row.category,
      tags: row.tags || [],
      upvotes: row.upvotes || 0,
      commentsCount: row.comments_count || 0,
      createdAt: formatTimeAgo(new Date(row.created_at)),
      pinned: row.pinned || false,
    }));
  } catch (err) {
    console.warn('Error reading from Supabase:', err);
    return null;
  }
}

export async function insertCommunityPostToDb(post: CommunityPost): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('community_posts').insert({
      id: post.id,
      user_id: post.userId || null,
      author_name: post.author.name,
      author_role: post.author.role,
      author_company: post.author.company,
      author_avatar: post.author.avatar,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags,
      upvotes: post.upvotes,
      comments_count: post.commentsCount,
      pinned: post.pinned || false,
    });

    if (error) {
      console.error('Error inserting post to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inserting post:', err);
    return false;
  }
}

export async function togglePostUpvoteInDb(postId: string, userId: string, currentlyUpvoted: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    if (currentlyUpvoted) {
      // Remove upvote
      await supabase.from('post_upvotes').delete().match({ post_id: postId, user_id: userId });
      const { error: rpcError } = await supabase.rpc('decrement_post_upvotes', { post_id_arg: postId });
      if (rpcError) {
        // Fallback standard update
        const { data } = await supabase.from('community_posts').select('upvotes').eq('id', postId).single();
        if (data) {
          await supabase.from('community_posts').update({ upvotes: Math.max(0, data.upvotes - 1) }).eq('id', postId);
        }
      }
    } else {
      // Add upvote
      await supabase.from('post_upvotes').upsert({ post_id: postId, user_id: userId });
      const { error: rpcError } = await supabase.rpc('increment_post_upvotes', { post_id_arg: postId });
      if (rpcError) {
        // Fallback standard update
        const { data } = await supabase.from('community_posts').select('upvotes').eq('id', postId).single();
        if (data) {
          await supabase.from('community_posts').update({ upvotes: data.upvotes + 1 }).eq('id', postId);
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Error toggling upvote in Supabase:', err);
    return false;
  }
}

// Job Listings from DB
export async function getJobListingsFromDb(): Promise<JobListing[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('job_listings')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch job_listings error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      company: row.company,
      logo: row.logo || '💼',
      level: row.level,
      domain: row.domain,
      location: row.location,
      type: row.type,
      salaryRange: row.salary_range,
      description: row.description,
      skills: row.skills || [],
      source: row.source || 'LinkedIn',
      minExperience: row.min_experience,
      maxExperience: row.max_experience,
      applyUrl: row.apply_url || '#',
      featured: row.featured || false,
      postedDate: formatTimeAgo(new Date(row.created_at)),
    }));
  } catch {
    return null;
  }
}

export async function insertJobListingToDb(job: JobListing): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('job_listings').insert({
      id: job.id,
      user_id: job.userId || null,
      title: job.title,
      company: job.company,
      logo: job.logo,
      level: job.level,
      domain: job.domain,
      location: job.location,
      type: job.type,
      salary_range: job.salaryRange,
      description: job.description,
      skills: job.skills,
      apply_url: job.applyUrl,
      source: job.source || 'LinkedIn',
      min_experience: job.minExperience || null,
      max_experience: job.maxExperience || null,
      featured: job.featured || false,
    });

    return !error;
  } catch {
    return false;
  }
}

// User Profile
export async function getUserProfileFromDb(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    let connectionsCount = 0;
    try {
      connectionsCount = await getUserConnectionsCountFromDb(userId);
    } catch {
      // ignore
    }

    return {
      id: data.id,
      email: data.email || '',
      fullName: data.full_name || '',
      role: data.role || '',
      company: data.company || '',
      avatarUrl: data.avatar_url || '',
      bio: data.bio || '',
      pmStage: data.pm_stage || undefined,
      previousRole: data.previous_role || '',
      yearsOfExperience: typeof data.years_of_experience === 'number' ? data.years_of_experience : undefined,
      pmFitScore: data.pm_fit_score || undefined,
      connectionsCount,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function upsertUserProfileInDb(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  // Validate if id is a valid UUID (Supabase profiles.id is a UUID referencing auth.users)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id);
  if (!isUuid) {
    // Non-UUID IDs (e.g. demo 'pm-...' or guest accounts) are persisted in localStorage
    return true;
  }

  try {
    // Base columns guaranteed to exist in public.profiles table
    const baseRecord: Record<string, any> = {
      id: profile.id,
      full_name: profile.fullName || '',
      role: profile.role || '',
      company: profile.company || '',
      avatar_url: profile.avatarUrl || '',
      bio: profile.bio || '',
      updated_at: new Date().toISOString(),
    };
    if (profile.email) {
      baseRecord.email = profile.email;
    }

    // Extended columns (in case table has them migrated)
    const extendedRecord: Record<string, any> = {
      ...baseRecord,
      pm_stage: profile.pmStage || null,
      previous_role: profile.previousRole || null,
      years_of_experience: typeof profile.yearsOfExperience === 'number' ? profile.yearsOfExperience : null,
      pm_fit_score: profile.pmFitScore || null,
    };

    // Attempt 1: Upsert with all fields
    const { error: extError } = await supabase.from('profiles').upsert(extendedRecord, { onConflict: 'id' });
    if (!extError) {
      return true;
    }

    // Attempt 2: If column error (PGRST204) or missing column in schema cache, fallback to base columns
    if (
      extError.code === 'PGRST204' ||
      extError.message?.toLowerCase().includes('schema cache') ||
      extError.message?.toLowerCase().includes('column')
    ) {
      const { error: baseError } = await supabase.from('profiles').upsert(baseRecord, { onConflict: 'id' });
      if (!baseError) {
        return true;
      }

      // Attempt 3: Try update if row already exists
      const { error: updateError } = await supabase.from('profiles').update(baseRecord).eq('id', profile.id);
      if (!updateError) {
        return true;
      }
      console.warn('Fallback base upsert/update failed:', baseError || updateError);
      return false;
    }

    // Attempt 4: Try direct update with extendedRecord if upsert failed due to RLS insert policy
    const { error: directUpdateError } = await supabase.from('profiles').update(extendedRecord).eq('id', profile.id);
    if (!directUpdateError) {
      return true;
    }

    // Attempt 5: Fallback direct update with baseRecord
    const { error: baseUpdateError } = await supabase.from('profiles').update(baseRecord).eq('id', profile.id);
    if (!baseUpdateError) {
      return true;
    }

    console.warn('Profile upsert failed:', extError || directUpdateError || baseUpdateError);
    return false;
  } catch (err) {
    console.warn('Exception in upsertUserProfileInDb:', err);
    return false;
  }
}

export async function getOtherProfilesFromDb(currentUserId?: string): Promise<UserProfile[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    let query = supabase.from('profiles').select('*').limit(30);
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }
    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      email: row.email || '',
      fullName: row.full_name || '',
      role: row.role || '',
      company: row.company || '',
      avatarUrl: row.avatar_url || '',
      bio: row.bio || '',
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

// Connections & Network Invitations
interface StoredConnectionRecord {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
}

function getLocalConnections(): StoredConnectionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pmverse_connections');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConnections(list: StoredConnectionRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('pmverse_connections', JSON.stringify(list));
  } catch {
    // ignore
  }
}

export async function getUserConnectionsCountFromDb(userId: string): Promise<number> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      if (!error && data) {
        return data.length;
      }
    } catch {
      // fallback
    }
  }

  const local = getLocalConnections();
  return local.filter(
    (c) => (c.requester_id === userId || c.receiver_id === userId) && c.status === 'accepted'
  ).length;
}

export async function getUserNetworkData(userId: string): Promise<{
  incomingInvitations: ConnectionInvitation[];
  statusMap: Record<string, 'not_connected' | 'pending' | 'received' | 'connected'>;
  connectedCount: number;
}> {
  let records: StoredConnectionRecord[] = [];
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      if (!error && data) {
        records = data;
        const local = getLocalConnections();
        const nonUserLocal = local.filter(
          (c) => c.requester_id !== userId && c.receiver_id !== userId
        );
        saveLocalConnections([...nonUserLocal, ...data]);
      } else {
        records = getLocalConnections().filter(
          (c) => c.requester_id === userId || c.receiver_id === userId
        );
      }
    } catch {
      records = getLocalConnections().filter(
        (c) => c.requester_id === userId || c.receiver_id === userId
      );
    }
  } else {
    records = getLocalConnections().filter(
      (c) => c.requester_id === userId || c.receiver_id === userId
    );
  }

  const statusMap: Record<string, 'not_connected' | 'pending' | 'received' | 'connected'> = {};
  const incomingInvitations: ConnectionInvitation[] = [];
  let connectedCount = 0;

  for (const c of records) {
    if (c.status === 'accepted') {
      const otherId = c.requester_id === userId ? c.receiver_id : c.requester_id;
      statusMap[otherId] = 'connected';
      connectedCount++;
    } else if (c.status === 'pending') {
      if (c.requester_id === userId) {
        statusMap[c.receiver_id] = 'pending';
      } else if (c.receiver_id === userId) {
        statusMap[c.requester_id] = 'received';

        let senderProfile: UserProfile | null = null;
        try {
          senderProfile = await getUserProfileFromDb(c.requester_id);
        } catch {
          // ignore
        }

        incomingInvitations.push({
          id: c.id,
          requesterId: c.requester_id,
          receiverId: c.receiver_id,
          name: senderProfile?.fullName || 'Product Manager',
          role: senderProfile?.role || 'Associate PM',
          company: senderProfile?.company || 'Tech Squad',
          avatar: senderProfile?.avatarUrl || '',
          mutual: 0,
          createdAt: formatTimeAgo(new Date(c.created_at || Date.now())),
        });
      }
    }
  }

  return { incomingInvitations, statusMap, connectedCount };
}

export async function sendConnectionRequestDb(requesterId: string, receiverId: string): Promise<boolean> {
  const newRecord: StoredConnectionRecord = {
    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    requester_id: requesterId,
    receiver_id: receiverId,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const local = getLocalConnections();
  const existingIdx = local.findIndex(
    (c) =>
      (c.requester_id === requesterId && c.receiver_id === receiverId) ||
      (c.requester_id === receiverId && c.receiver_id === requesterId)
  );
  if (existingIdx >= 0) {
    local[existingIdx].status = 'pending';
    local[existingIdx].requester_id = requesterId;
    local[existingIdx].receiver_id = receiverId;
  } else {
    local.push(newRecord);
  }
  saveLocalConnections(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('connections').upsert(
        {
          requester_id: requesterId,
          receiver_id: receiverId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'requester_id,receiver_id' }
      );
    } catch {
      // ignore
    }
  }

  return true;
}

export async function acceptConnectionRequestDb(requesterId: string, receiverId: string): Promise<boolean> {
  const local = getLocalConnections();
  const existing = local.find(
    (c) =>
      (c.requester_id === requesterId && c.receiver_id === receiverId) ||
      (c.requester_id === receiverId && c.receiver_id === requesterId)
  );
  if (existing) {
    existing.status = 'accepted';
    existing.updated_at = new Date().toISOString();
  } else {
    local.push({
      id: `conn-${Date.now()}`,
      requester_id: requesterId,
      receiver_id: receiverId,
      status: 'accepted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  saveLocalConnections(local);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .match({ requester_id: requesterId, receiver_id: receiverId });
    } catch {
      // ignore
    }
  }

  return true;
}

export async function removeOrIgnoreConnectionDb(user1Id: string, user2Id: string): Promise<boolean> {
  const local = getLocalConnections();
  const filtered = local.filter(
    (c) =>
      !(
        (c.requester_id === user1Id && c.receiver_id === user2Id) ||
        (c.requester_id === user2Id && c.receiver_id === user1Id)
      )
  );
  saveLocalConnections(filtered);

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('connections')
        .delete()
        .or(
          `and(requester_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(requester_id.eq.${user2Id},receiver_id.eq.${user1Id})`
        );
    } catch {
      // ignore
    }
  }

  return true;
}

// Saved Jobs
export async function getSavedJobIdsFromDb(userId?: string): Promise<string[]> {
  const effectiveUserId = userId || 'guest';
  let localIds: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw =
        localStorage.getItem(`pmverse_saved_jobs_${effectiveUserId}`) ||
        localStorage.getItem('pmverse_saved_jobs_guest') ||
        localStorage.getItem('pmverse_saved_jobs');
      if (raw) localIds = JSON.parse(raw);
    } catch {}
  }

  if (!isSupabaseConfigured() || !userId || effectiveUserId === 'guest') return localIds;
  const supabase = getSupabaseClient();
  if (!supabase) return localIds;

  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error || !data) return localIds;
    const dbIds = data.map((row: any) => row.job_id);
    const combined = Array.from(new Set([...localIds, ...dbIds]));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`pmverse_saved_jobs_${effectiveUserId}`, JSON.stringify(combined));
      } catch {}
    }
    return combined;
  } catch {
    return localIds;
  }
}

export async function toggleSavedJobInDb(userId: string | undefined, jobId: string, currentlySaved: boolean): Promise<boolean> {
  const effectiveUserId = userId || 'guest';
  if (typeof window !== 'undefined') {
    try {
      const key = `pmverse_saved_jobs_${effectiveUserId}`;
      const raw = localStorage.getItem(key);
      let list: string[] = raw ? JSON.parse(raw) : [];
      if (currentlySaved) {
        list = list.filter((id) => id !== jobId);
      } else if (!list.includes(jobId)) {
        list.push(jobId);
      }
      localStorage.setItem(key, JSON.stringify(list));
      localStorage.setItem('pmverse_saved_jobs', JSON.stringify(list));
    } catch {}
  }

  if (!isSupabaseConfigured() || !userId || effectiveUserId === 'guest') return true;
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    if (currentlySaved) {
      const { error } = await supabase.from('saved_jobs').delete().match({ user_id: userId, job_id: jobId });
      return !error;
    } else {
      const { error } = await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId });
      return !error;
    }
  } catch {
    return false;
  }
}

// Quiz Results
export async function saveQuizResultToDb(userId: string, result: AssessmentResult): Promise<boolean> {
  const mappedDimensionScores =
    result.categoryScores?.map((cs) => ({
      dimension: cs.category,
      score: cs.percentage, // 0-100 percentage
      percentage: cs.percentage,
      rawCorrect: cs.score,
      total: cs.total,
    })) || result.dimensionScores || [];

  // Always persist full diagnosis locally for immediate UI availability & offline resilience
  if (typeof window !== 'undefined') {
    try {
      const fullDiagnosticRecord: SavedQuizResult = {
        id: `diag-${Date.now()}`,
        userId: userId || 'guest',
        scorePercentage: result.scorePercentage,
        archetype: result.archetype,
        summary: result.summary,
        dimensionScores: mappedDimensionScores,
        categoryScores: result.categoryScores,
        strengths: result.strengths,
        growthAreas: result.growthAreas,
        recommendedRole: result.recommendedRole,
        answersReview: result.answersReview,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('pmverse_latest_diagnostic', JSON.stringify(fullDiagnosticRecord));
      localStorage.setItem('pmverse_user_diagnosis', JSON.stringify(fullDiagnosticRecord));
      if (userId && userId !== 'guest') {
        localStorage.setItem(`pmverse_diagnostic_${userId}`, JSON.stringify(fullDiagnosticRecord));
      }
    } catch {
      // ignore local storage errors
    }
  }

  if (!isSupabaseConfigured() || !userId || userId === 'guest') return true;
  const supabase = getSupabaseClient();
  if (!supabase) return true;

  try {
    const { error } = await supabase.from('quiz_results').insert({
      user_id: userId,
      score_percentage: result.scorePercentage,
      archetype: result.archetype,
      summary: result.summary,
      dimension_scores: mappedDimensionScores,
      strengths: result.strengths,
      growth_areas: result.growthAreas,
      recommended_role: result.recommendedRole,
    });

    if (error) {
      console.warn('Supabase quiz_results insert notice:', error.message);
    }
    return !error;
  } catch (err) {
    console.warn('Error saving quiz result to Supabase:', err);
    return false;
  }
}

export async function getUserQuizResultsFromDb(userId?: string): Promise<SavedQuizResult[]> {
  // Never return quiz results for unauthenticated users or guests
  if (!userId || userId === 'guest') {
    return [];
  }

  let dbResults: SavedQuizResult[] = [];

  if (isSupabaseConfigured() && userId) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          dbResults = data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            scorePercentage: row.score_percentage,
            archetype: row.archetype,
            summary: row.summary,
            dimensionScores: row.dimension_scores || [],
            categoryScores: row.dimension_scores || [],
            strengths: row.strengths || [],
            growthAreas: row.growth_areas || [],
            recommendedRole: row.recommended_role || '',
            createdAt: formatTimeAgo(new Date(row.created_at)),
          }));
        }
      } catch {
        // ignore
      }
    }
  }

  // If DB returned records, merge answersReview or categoryScores from user-keyed localStorage if available
  if (dbResults.length > 0) {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem(`pmverse_diagnostic_${userId}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed.answersReview && (!dbResults[0].answersReview || dbResults[0].answersReview.length === 0)) {
            dbResults[0].answersReview = parsed.answersReview;
          }
          if (parsed.categoryScores && (!dbResults[0].categoryScores || dbResults[0].categoryScores.length === 0)) {
            dbResults[0].categoryScores = parsed.categoryScores;
          }
        }
      } catch {}
    }
    return dbResults;
  }

  // Fallback to locally stored diagnostic ONLY for this specific authenticated user
  if (typeof window !== 'undefined' && userId) {
    try {
      const local = localStorage.getItem(`pmverse_diagnostic_${userId}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.userId === userId || !parsed.userId) {
          return [
            {
              id: parsed.id || 'diag-local',
              userId: userId,
              scorePercentage: parsed.scorePercentage,
              archetype: parsed.archetype || 'Product Strategist',
              summary: parsed.summary || 'Verified PM competency assessment',
              dimensionScores: parsed.dimensionScores || parsed.categoryScores || [],
              categoryScores: parsed.categoryScores || parsed.dimensionScores || [],
              strengths: parsed.strengths || [],
              growthAreas: parsed.growthAreas || [],
              recommendedRole: parsed.recommendedRole || 'Product Manager',
              answersReview: parsed.answersReview || [],
              createdAt: parsed.createdAt ? formatTimeAgo(new Date(parsed.createdAt)) : 'Recently',
            },
          ];
        }
      }
    } catch {
      // ignore
    }
  }

  return [];
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

// Job Applications Tracker
export async function getJobApplicationsFromDb(userId?: string): Promise<JobApplication[]> {
  // Never return applications for unauthenticated users or guests
  if (!userId || userId === 'guest') {
    return [];
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  let dbApps: JobApplication[] = [];
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase && isUuid) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbApps = data.map((r: any) => ({
          id: r.id,
          userId: r.user_id,
          jobId: r.job_id,
          jobTitle: r.job_title,
          company: r.company,
          stage: r.stage as ApplicationStage,
          location: r.location,
          salaryRange: r.salary_range,
          notes: r.notes,
          appliedDate: r.applied_date,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch {
      // fallback
    }
  }

  // Only merge local storage applications for this specific authenticated user
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pmverse_user_applications');
      if (raw) {
        const parsed: JobApplication[] = JSON.parse(raw);
        const filteredLocal = parsed.filter((a) => a.userId === userId);
        if (dbApps.length > 0) {
          const dbIds = new Set(dbApps.map((a) => a.id));
          const dbJobIds = new Set(dbApps.map((a) => a.jobId).filter(Boolean));
          const missingFromDb = filteredLocal.filter(
            (a) => !dbIds.has(a.id) && (!a.jobId || !dbJobIds.has(a.jobId))
          );
          return [...dbApps, ...missingFromDb];
        }
        return filteredLocal;
      }
    } catch {
      // ignore
    }
  }

  return dbApps;
}

export async function upsertJobApplicationInDb(app: JobApplication): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pmverse_user_applications');
      let list: JobApplication[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(
        (a) => a.id === app.id || (a.jobId && app.jobId && a.jobId === app.jobId)
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...app };
      } else {
        list = [app, ...list];
      }
      localStorage.setItem('pmverse_user_applications', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  const isUuid = app.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.userId);
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase && isUuid) {
    try {
      await supabase.from('job_applications').upsert({
        id: app.id,
        user_id: app.userId,
        job_id: app.jobId || null,
        job_title: app.jobTitle,
        company: app.company,
        stage: app.stage,
        location: app.location || null,
        salary_range: app.salaryRange || null,
        notes: app.notes || null,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export async function deleteJobApplicationInDb(appId: string, userId?: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pmverse_user_applications');
      if (raw) {
        const list: JobApplication[] = JSON.parse(raw);
        const filtered = list.filter((a) => a.id !== appId);
        localStorage.setItem('pmverse_user_applications', JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  }

  const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase && isUuid) {
    try {
      await supabase.from('job_applications').delete().match({ id: appId, user_id: userId });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

// Current Active Weekly Challenge (AI-generated every Monday)
export async function getCurrentWeeklyChallenge(force = false): Promise<WeeklyChallenge> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/challenge/current${force ? '?force=true' : ''}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) return json.data;
      }
    } catch {
      // fallback
    }
  }

  // High quality default fallback
  return {
    id: 'challenge-2026-w42',
    challengeNumber: 23,
    title: 'Enhance User Engagement in Personal Finance App',
    scenario:
      'Our personal finance app has seen a 25% drop in daily active users over the past month, primarily due to a lack of engaging features. User feedback indicates that 40% find the app\'s budgeting tools cumbersome and not user-friendly, leading to increased churn among millennials.',
    targetObjectives: [
      'Increase daily active users by 15% within the next quarter.',
      'Achieve a user satisfaction score of at least 4.5 out of 5 for the budgeting tools.',
      'Reduce the drop-off rate in the budgeting feature from 60% to 30%.',
    ],
    constraints: [
      'Limited engineering resources with only two developers available for the next quarter.',
      'Budget constraints cap new feature development at $50,000.',
      'Existing app architecture limits significant UI changes without extensive refactoring.',
    ],
    rubricWeights: {
      productSense: 30,
      feasibility: 25,
      metrics: 25,
      userValue: 20,
    },
    domain: 'Fintech',
    weekIdentifier: '2026-W42',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 7,
    isActive: true,
  };
}

// Weekly Challenge Submissions
export async function getChallengeSubmissionsFromDb(challengeId: string): Promise<ChallengeSubmission[]> {
  let dbSubmissions: ChallengeSubmission[] = [];

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbSubmissions = data.map((r: any) => ({
          id: r.id,
          challengeId: r.challenge_id,
          challengeTitle: r.challenge_title,
          userId: r.user_id,
          authorName: r.author_name,
          authorRole: r.author_role,
          authorAvatar: r.author_avatar,
          problemStatement: r.problem_statement,
          solutionProposal: r.solution_proposal,
          keyMetrics: r.key_metrics,
          upvotes: r.upvotes || 1,
          aiFeedback: r.ai_feedback,
          createdAt: formatTimeAgo(new Date(r.created_at)),
        }));
      }
    } catch {
      // fallback
    }
  }

  let localSubmissions: ChallengeSubmission[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_challenge_${challengeId}`);
      if (raw) {
        const parsed: ChallengeSubmission[] = JSON.parse(raw);
        localSubmissions = parsed.filter((s) => !s.id.startsWith('seed-sub-'));
      }
    } catch {
      // ignore
    }
  }

  // Merge DB and local submissions, deduplicating by ID
  const map = new Map<string, ChallengeSubmission>();

  // Overlay DB submissions (ignoring any legacy seed items)
  dbSubmissions.forEach((sub) => {
    if (!sub.id.startsWith('seed-sub-')) {
      map.set(sub.id, sub);
    }
  });

  // Overlay local submissions (user's real submissions)
  localSubmissions.forEach((sub) => {
    if (!sub.id.startsWith('seed-sub-')) {
      map.set(sub.id, sub);
    }
  });

  // Sort by upvotes descending, then recency
  return Array.from(map.values()).sort((a, b) => b.upvotes - a.upvotes);
}

export async function submitChallengeSolutionToDb(submission: ChallengeSubmission): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_challenge_${submission.challengeId}`);
      const list: ChallengeSubmission[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((s) => s.userId !== submission.userId && s.id !== submission.id);
      localStorage.setItem(
        `pmverse_challenge_${submission.challengeId}`,
        JSON.stringify([submission, ...filtered])
      );
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('challenge_submissions').upsert({
        id: submission.id,
        challenge_id: submission.challengeId,
        challenge_title: submission.challengeTitle,
        user_id: submission.userId,
        author_name: submission.authorName,
        author_role: submission.authorRole,
        author_avatar: submission.authorAvatar || null,
        problem_statement: submission.problemStatement,
        solution_proposal: submission.solutionProposal,
        key_metrics: submission.keyMetrics,
        upvotes: submission.upvotes || 1,
        ai_feedback: submission.aiFeedback || null,
      });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export async function upvoteChallengeSubmissionInDb(submissionId: string, challengeId: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_challenge_${challengeId}`);
      if (raw) {
        const list: ChallengeSubmission[] = JSON.parse(raw);
        const updated = list.map((s) => (s.id === submissionId ? { ...s, upvotes: s.upvotes + 1, hasUpvoted: true } : s));
        localStorage.setItem(`pmverse_challenge_${challengeId}`, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase.from('challenge_submissions').select('upvotes').eq('id', submissionId).single();
      if (data) {
        await supabase.from('challenge_submissions').update({ upvotes: (data.upvotes || 0) + 1 }).eq('id', submissionId);
      }
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

export async function deleteChallengeSubmissionFromDb(submissionId: string, challengeId: string): Promise<boolean> {
  // 1. Clean from localStorage across all challenge storage keys
  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('pmverse_challenge_'));
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list: ChallengeSubmission[] = JSON.parse(raw);
          const filtered = list.filter((s) => s.id !== submissionId);
          localStorage.setItem(k, JSON.stringify(filtered));
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Clean from Supabase if table exists
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('challenge_submissions').delete().eq('id', submissionId);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

