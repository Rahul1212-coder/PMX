-- ==============================================================================
-- PMVerse Platform - Complete Supabase Database Schema
-- Run this in your Supabase project: Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT DEFAULT 'Product Manager',
  role TEXT DEFAULT 'Associate PM',
  company TEXT DEFAULT 'Independent PM',
  pm_stage TEXT DEFAULT 'existing_pm',
  previous_role TEXT,
  years_of_experience INTEGER DEFAULT 2,
  pm_fit_score INTEGER DEFAULT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMUNITY POSTS TABLE (Real user discussions)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'Product Manager',
  author_company TEXT NOT NULL DEFAULT 'Independent PM',
  author_avatar TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Strategy', 'Execution', 'AI & Tech', 'Career & Transition', 'Case Study')),
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 1,
  comments_count INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POST UPVOTES TABLE (Prevents duplicate upvoting)
CREATE TABLE IF NOT EXISTS public.post_upvotes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 4. REAL PM JOB LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.job_listings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  logo TEXT DEFAULT '💼',
  level TEXT NOT NULL,
  domain TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  salary_range TEXT NOT NULL,
  description TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  apply_url TEXT NOT NULL DEFAULT '#',
  source TEXT DEFAULT 'LinkedIn',
  min_experience INTEGER,
  max_experience INTEGER,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SAVED / BOOKMARKED JOBS TABLE
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- 6. PM FIT QUIZ RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score_percentage INTEGER NOT NULL,
  archetype TEXT NOT NULL,
  summary TEXT,
  dimension_scores JSONB,
  strengths TEXT[],
  growth_areas TEXT[],
  recommended_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company, pm_stage, previous_role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Product Manager'),
    COALESCE(NEW.raw_user_meta_data->>'company', 'Independent PM'),
    COALESCE(NEW.raw_user_meta_data->>'pm_stage', 'existing_pm'),
    COALESCE(NEW.raw_user_meta_data->>'previous_role', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- UPVOTE HELPER RPC FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.increment_post_upvotes(post_id_arg TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET upvotes = upvotes + 1
  WHERE id = post_id_arg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_post_upvotes(post_id_arg TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_posts
  SET upvotes = GREATEST(0, upvotes - 1)
  WHERE id = post_id_arg;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view profiles, users can update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Community Posts: Anyone can view posts; authenticated users can insert; owners can update/delete
CREATE POLICY "Posts are viewable by everyone"
  ON public.community_posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON public.community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Job Listings: Public read, authenticated create/delete
CREATE POLICY "Job listings are viewable by everyone"
  ON public.job_listings FOR SELECT USING (true);

CREATE POLICY "Anyone can insert job listings"
  ON public.job_listings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update job listings"
  ON public.job_listings FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own job listings"
  ON public.job_listings FOR DELETE USING (auth.uid() = user_id);

-- Post Upvotes: Authenticated users manage own upvotes
CREATE POLICY "Anyone can view upvotes"
  ON public.post_upvotes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own upvote"
  ON public.post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvote"
  ON public.post_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Saved Jobs: Authenticated users manage their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
  ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
  ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved jobs"
  ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Quiz Results: Users can view and insert their own results
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
  ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. PEER CONNECTIONS & INVITATIONS TABLE (LinkedIn-style Networking)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view connections they belong to"
  ON public.connections FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests"
  ON public.connections FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update connection status"
  ON public.connections FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete connections"
  ON public.connections FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 8. JOB APPLICATIONS TRACKER TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('Saved', 'Applied', 'Screening', 'Interview', 'Final Round', 'Offer')),
  location TEXT,
  salary_range TEXT,
  notes TEXT,
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job applications"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job applications"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job applications"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- 9. WEEKLY CHALLENGES TABLE (AI-generated every Monday)
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id TEXT PRIMARY KEY,
  challenge_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  target_objectives TEXT[] NOT NULL DEFAULT '{}',
  constraints TEXT[] NOT NULL DEFAULT '{}',
  rubric_weights JSONB NOT NULL DEFAULT '{"productSense": 30, "feasibility": 25, "metrics": 25, "userValue": 20}'::jsonb,
  domain TEXT DEFAULT 'Product Management',
  week_identifier TEXT UNIQUE NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Weekly challenges are viewable by everyone" ON public.weekly_challenges;
CREATE POLICY "Weekly challenges are viewable by everyone"
  ON public.weekly_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow challenge insertion and updates" ON public.weekly_challenges;
CREATE POLICY "Allow challenge insertion and updates"
  ON public.weekly_challenges FOR ALL
  USING (true)
  WITH CHECK (true);

-- 10. WEEKLY CHALLENGE SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'Product Manager',
  author_avatar TEXT,
  problem_statement TEXT NOT NULL,
  solution_proposal TEXT NOT NULL,
  key_metrics TEXT NOT NULL,
  upvotes INTEGER DEFAULT 1,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge submissions are viewable by everyone"
  ON public.challenge_submissions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create challenge submissions"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge submissions"
  ON public.challenge_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge submissions"
  ON public.challenge_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 9. CIRCLES (Private Collaboration Groups)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.circles (
  id TEXT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  description VARCHAR(300) NOT NULL,
  category TEXT NOT NULL,
  cover_icon TEXT DEFAULT '⭕',
  cover_image TEXT,
  purpose TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT NOT NULL,
  max_members INTEGER DEFAULT 20,
  allow_member_invites BOOLEAN DEFAULT TRUE,
  allow_member_posts BOOLEAN DEFAULT TRUE,
  allow_file_uploads BOOLEAN DEFAULT TRUE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Product Manager',
  company TEXT,
  avatar TEXT,
  membership_role TEXT NOT NULL CHECK (membership_role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.circle_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  UNIQUE(circle_id, invitee_id)
);

CREATE TABLE IF NOT EXISTS public.circle_posts (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Product Manager',
  author_company TEXT,
  author_avatar TEXT,
  title TEXT,
  content TEXT NOT NULL,
  template_type TEXT,
  template_data JSONB,
  is_pinned BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_post_replies (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES public.circle_posts(id) ON DELETE CASCADE NOT NULL,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Product Manager',
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_post_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT REFERENCES public.circle_posts(id) ON DELETE CASCADE NOT NULL,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS public.circle_resources (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('Links', 'Notes', 'Case Studies', 'Interview Prep', 'Documents', 'Tools')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.circle_activities (
  id TEXT PRIMARY KEY,
  circle_id TEXT REFERENCES public.circles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assignee_name TEXT,
  assignee_avatar TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  checklist JSONB DEFAULT '[]'::jsonb,
  session_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view circles" ON public.circles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = id AND cm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.circle_invitations ci WHERE ci.circle_id = id AND ci.invitee_id = auth.uid() AND ci.status = 'pending')
);
CREATE POLICY "Authenticated users can create circles" ON public.circles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners and admins can update circles" ON public.circles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin'))
);
CREATE POLICY "Owners can delete circles" ON public.circles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = id AND cm.user_id = auth.uid() AND cm.membership_role = 'owner')
);

CREATE POLICY "Members can view other circle members" ON public.circle_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Owners and admins or self-joining can insert members" ON public.circle_members FOR INSERT WITH CHECK (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin'))
);
CREATE POLICY "Owners, admins, or self can remove members" ON public.circle_members FOR DELETE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid() AND cm.membership_role IN ('owner', 'admin'))
);

CREATE POLICY "Members can view posts" ON public.circle_posts FOR SELECT USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can create posts" ON public.circle_posts FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can view replies" ON public.circle_post_replies FOR SELECT USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can create replies" ON public.circle_post_replies FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can view reactions" ON public.circle_post_reactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can manage own reactions" ON public.circle_post_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Members can view resources" ON public.circle_resources FOR SELECT USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can create resources" ON public.circle_resources FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));
CREATE POLICY "Members can view and create activities" ON public.circle_activities FOR ALL USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = circle_id AND cm.user_id = auth.uid()));

-- ==============================================================================
-- CLEAN RESET COMMAND:
-- TRUNCATE TABLE public.community_posts, public.post_upvotes, public.saved_jobs, public.quiz_results, public.connections, public.job_applications, public.challenge_submissions, public.circles, public.circle_members, public.circle_invitations, public.circle_posts, public.circle_post_replies, public.circle_post_reactions, public.circle_resources, public.circle_activities;
-- ==============================================================================


