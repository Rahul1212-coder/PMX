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
        role: row.author_role || 'Product Manager',
        company: row.author_company || 'Tech Company',
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
      fullName: data.full_name || 'Product Manager',
      role: data.role || 'Associate PM',
      company: data.company || 'Tech Company',
      avatarUrl: data.avatar_url || '',
      bio: data.bio || '',
      connectionsCount,
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function upsertUserProfileInDb(profile: Partial<UserProfile> & { id: string }): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      role: profile.role,
      company: profile.company,
      avatar_url: profile.avatarUrl,
      bio: profile.bio,
      updated_at: new Date().toISOString(),
    });

    return !error;
  } catch {
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
      fullName: row.full_name || 'Product Manager',
      role: row.role || 'Associate PM',
      company: row.company || 'Tech Company',
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
export async function getSavedJobIdsFromDb(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((row: any) => row.job_id);
  } catch {
    return [];
  }
}

export async function toggleSavedJobInDb(userId: string, jobId: string, currentlySaved: boolean): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

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
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('quiz_results').insert({
      user_id: userId,
      score_percentage: result.scorePercentage,
      archetype: result.archetype,
      summary: result.summary,
      dimension_scores: result.categoryScores || result.dimensionScores || [],
      strengths: result.strengths,
      growth_areas: result.growthAreas,
      recommended_role: result.recommendedRole,
    });

    return !error;
  } catch {
    return false;
  }
}

export async function getUserQuizResultsFromDb(userId: string): Promise<SavedQuizResult[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      scorePercentage: row.score_percentage,
      archetype: row.archetype,
      summary: row.summary,
      dimensionScores: row.dimension_scores || [],
      createdAt: formatTimeAgo(new Date(row.created_at)),
    }));
  } catch {
    return [];
  }
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
export async function getJobApplicationsFromDb(userId: string): Promise<JobApplication[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r: any) => ({
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

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pmverse_user_applications');
      if (raw) {
        const parsed: JobApplication[] = JSON.parse(raw);
        return parsed.filter((a) => a.userId === userId || !a.userId);
      }
    } catch {
      // ignore
    }
  }
  return [];
}

export async function upsertJobApplicationInDb(app: JobApplication): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pmverse_user_applications');
      let list: JobApplication[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex((a) => a.id === app.id);
      if (idx >= 0) {
        list[idx] = app;
      } else {
        list = [app, ...list];
      }
      localStorage.setItem('pmverse_user_applications', JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
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

export async function deleteJobApplicationInDb(appId: string, userId: string): Promise<boolean> {
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

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('job_applications').delete().match({ id: appId, user_id: userId });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

// Weekly Challenge Submissions
export async function getChallengeSubmissionsFromDb(challengeId: string): Promise<ChallengeSubmission[]> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((r: any) => ({
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

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_challenge_${challengeId}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  return [];
}

export async function submitChallengeSolutionToDb(submission: ChallengeSubmission): Promise<boolean> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`pmverse_challenge_${submission.challengeId}`);
      const list: ChallengeSubmission[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(
        `pmverse_challenge_${submission.challengeId}`,
        JSON.stringify([submission, ...list])
      );
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('challenge_submissions').insert({
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
        const updated = list.map((s) => (s.id === submissionId ? { ...s, upvotes: s.upvotes + 1 } : s));
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

