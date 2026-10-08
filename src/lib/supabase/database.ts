import { getSupabaseClient, isSupabaseConfigured } from './client';
import { CommunityPost, AssessmentResult, UserProfile, SavedQuizResult, JobListing } from '@/types';

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
    const realPosts = data.filter((row: any) => !['post-1', 'post-2', 'post-3'].includes(row.id));

    return realPosts.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      author: {
        name: row.author_name || 'PM Community Member',
        role: row.author_role || 'Product Manager',
        company: row.author_company || 'Tech Company',
        avatar: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
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

    return {
      id: data.id,
      email: data.email || '',
      fullName: data.full_name || 'Product Manager',
      role: data.role || 'Associate PM',
      company: data.company || 'Tech Company',
      avatarUrl: data.avatar_url || '',
      bio: data.bio || '',
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
      dimension_scores: result.dimensionScores,
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
