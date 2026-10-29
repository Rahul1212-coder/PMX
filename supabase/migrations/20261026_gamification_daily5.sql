-- ==============================================================================
-- PMVerse Platform - Gamification & Daily Engagement System Migration
-- Migration: 20261026_gamification_daily5.sql
-- ==============================================================================

-- 1. DAILY CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id TEXT PRIMARY KEY,
  challenge_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  timezone TEXT NOT NULL DEFAULT 'UTC',
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_status ON public.daily_challenges(publication_status);

-- 2. CHALLENGE QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_questions (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  scenario TEXT NOT NULL,
  question_text TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'intermediate',
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT NOT NULL,
  option_explanations JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_challenge_question_order UNIQUE (challenge_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_challenge_questions_challenge ON public.challenge_questions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_questions_order ON public.challenge_questions(challenge_id, order_index);

-- 3. USER GAMIFICATION PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_level_name TEXT NOT NULL DEFAULT 'PM Rookie',
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_qualifying_date DATE,
  streak_freezes_available INTEGER NOT NULL DEFAULT 1,
  streak_freezes_used INTEGER NOT NULL DEFAULT 0,
  preferred_league TEXT NOT NULL DEFAULT 'intermediate' CHECK (preferred_league IN ('beginner', 'intermediate', 'advanced')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON public.user_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_streak ON public.user_gamification(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_league ON public.user_gamification(preferred_league);

-- 4. CHALLENGE ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id TEXT REFERENCES public.daily_challenges(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  correct_count INTEGER DEFAULT 0 CHECK (correct_count BETWEEN 0 AND 5),
  total_questions INTEGER DEFAULT 5,
  time_taken_seconds INTEGER DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_results JSONB,
  xp_awarded INTEGER DEFAULT 0,
  streak_after_attempt INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT uq_user_challenge_date UNIQUE (user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user ON public.challenge_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_date ON public.challenge_attempts(challenge_date);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_date ON public.challenge_attempts(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_challenge_attempts_completed ON public.challenge_attempts(user_id, status);

-- 5. XP TRANSACTIONS (CENTRALIZED REWARD LEDGER)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_idempotency ON public.xp_transactions(idempotency_key);

-- 6. ACHIEVEMENT DEFINITIONS TABLE
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'Common',
  unlock_criteria JSONB NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- 8. WEEKLY QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.weekly_quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_quests_active ON public.weekly_quests(active, starts_at, ends_at);

-- 9. USER QUEST PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT REFERENCES public.weekly_quests(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  is_reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  reward_claimed_at TIMESTAMPTZ,
  CONSTRAINT uq_user_quest UNIQUE (user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON public.user_quest_progress(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;

-- 1. Challenges & Questions: Publicly viewable for published challenges
DROP POLICY IF EXISTS "Published daily challenges are viewable by everyone" ON public.daily_challenges;
CREATE POLICY "Published daily challenges are viewable by everyone"
  ON public.daily_challenges FOR SELECT
  USING (publication_status = 'published');

DROP POLICY IF EXISTS "Challenge questions are viewable by authenticated users" ON public.challenge_questions;
CREATE POLICY "Challenge questions are viewable by authenticated users"
  ON public.challenge_questions FOR SELECT
  USING (true);

-- 2. User Gamification: Public read for leaderboards, user self-update or service role
DROP POLICY IF EXISTS "Gamification profiles viewable by everyone" ON public.user_gamification;
CREATE POLICY "Gamification profiles viewable by everyone"
  ON public.user_gamification FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own gamification profile" ON public.user_gamification;
CREATE POLICY "Users can insert own gamification profile"
  ON public.user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification profile" ON public.user_gamification;
CREATE POLICY "Users can update own gamification profile"
  ON public.user_gamification FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Challenge Attempts: Private to owner
DROP POLICY IF EXISTS "Users can view own challenge attempts" ON public.challenge_attempts;
CREATE POLICY "Users can view own challenge attempts"
  ON public.challenge_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenge attempts" ON public.challenge_attempts;
CREATE POLICY "Users can insert own challenge attempts"
  ON public.challenge_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge attempts" ON public.challenge_attempts;
CREATE POLICY "Users can update own challenge attempts"
  ON public.challenge_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. XP Transactions: Private read for user
DROP POLICY IF EXISTS "Users can view own xp transactions" ON public.xp_transactions;
CREATE POLICY "Users can view own xp transactions"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Achievements & Quests: Definitions public, user progress private
DROP POLICY IF EXISTS "Achievement definitions viewable by everyone" ON public.achievement_definitions;
CREATE POLICY "Achievement definitions viewable by everyone"
  ON public.achievement_definitions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User achievements viewable by everyone" ON public.user_achievements;
CREATE POLICY "User achievements viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Weekly quests viewable by everyone" ON public.weekly_quests;
CREATE POLICY "Weekly quests viewable by everyone"
  ON public.weekly_quests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can view own quest progress" ON public.user_quest_progress;
CREATE POLICY "Users can view own quest progress"
  ON public.user_quest_progress FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Service Role Bypass Policies
CREATE POLICY "Service role full access on daily_challenges" ON public.daily_challenges FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on challenge_questions" ON public.challenge_questions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_gamification" ON public.user_gamification FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on challenge_attempts" ON public.challenge_attempts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on xp_transactions" ON public.xp_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on achievement_definitions" ON public.achievement_definitions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_achievements" ON public.user_achievements FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on weekly_quests" ON public.weekly_quests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on user_quest_progress" ON public.user_quest_progress FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role') WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
