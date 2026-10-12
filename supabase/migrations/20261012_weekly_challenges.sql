-- ==============================================================================
-- Migration: 20261012_weekly_challenges.sql
-- Run this in your Supabase project: Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. WEEKLY CHALLENGES TABLE (AI-generated every Monday)
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

-- Index for fast lookup by week_identifier and active status
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week_id ON public.weekly_challenges(week_identifier);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active ON public.weekly_challenges(is_active);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Policies for weekly_challenges
DROP POLICY IF EXISTS "Weekly challenges are viewable by everyone" ON public.weekly_challenges;
CREATE POLICY "Weekly challenges are viewable by everyone"
  ON public.weekly_challenges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow challenge insertion and updates" ON public.weekly_challenges;
CREATE POLICY "Allow challenge insertion and updates"
  ON public.weekly_challenges FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. CHALLENGE SUBMISSIONS TABLE
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

-- Indexes for challenge_submissions
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_cid ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_uid ON public.challenge_submissions(user_id);

-- Enable RLS
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenge submissions are viewable by everyone" ON public.challenge_submissions;
CREATE POLICY "Challenge submissions are viewable by everyone"
  ON public.challenge_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create challenge submissions" ON public.challenge_submissions;
CREATE POLICY "Authenticated users can create challenge submissions"
  ON public.challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own challenge submissions" ON public.challenge_submissions;
CREATE POLICY "Users can update their own challenge submissions"
  ON public.challenge_submissions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own challenge submissions" ON public.challenge_submissions;
CREATE POLICY "Users can delete their own challenge submissions"
  ON public.challenge_submissions FOR DELETE
  USING (auth.uid() = user_id);
