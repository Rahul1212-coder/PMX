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
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
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
  INSERT INTO public.profiles (id, email, full_name, role, company, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Product Manager'),
    COALESCE(NEW.raw_user_meta_data->>'company', 'Independent PM'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face')
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

CREATE POLICY "Authenticated users can create job listings"
  ON public.job_listings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

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

-- ==============================================================================
-- CLEAN RESET COMMAND (Run this in SQL editor if you want to wipe old dummy data):
-- TRUNCATE TABLE public.community_posts, public.post_upvotes, public.saved_jobs, public.quiz_results;
-- ==============================================================================
