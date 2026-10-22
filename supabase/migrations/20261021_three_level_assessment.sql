-- ==============================================================================
-- PMVerse Platform - Structured Three-Level Assessment System Migration
-- Migration: 20261021_three_level_assessment.sql
-- ==============================================================================

-- 1. ASSESSMENT LEVELS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_levels (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  question_count INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  passing_score_percent INTEGER NOT NULL DEFAULT 70,
  format_description TEXT NOT NULL,
  focus_description TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  competency_weights JSONB NOT NULL,
  prerequisite_level_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSESSMENT QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id TEXT PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES public.assessment_levels(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  scenario TEXT,
  question_text TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  competency TEXT NOT NULL,
  format TEXT NOT NULL,
  options JSONB,
  correct_option TEXT,
  accepted_criteria TEXT,
  explanation TEXT NOT NULL,
  option_explanations JSONB,
  scoring_weight NUMERIC NOT NULL DEFAULT 1,
  time_limit_seconds INTEGER,
  rubric JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_level ON public.assessment_questions(level_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_active ON public.assessment_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_order ON public.assessment_questions(level_id, order_index);

-- 3. ASSESSMENT ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level_id TEXT NOT NULL REFERENCES public.assessment_levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  score_percentage NUMERIC,
  is_passed BOOLEAN DEFAULT FALSE,
  total_correct INTEGER,
  total_questions INTEGER,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  marked_for_review TEXT[] DEFAULT '{}',
  competency_scores JSONB,
  case_evaluations JSONB,
  question_reviews JSONB,
  strengths TEXT[] DEFAULT '{}',
  growth_areas TEXT[] DEFAULT '{}',
  recommendations JSONB,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user ON public.assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_level ON public.assessment_attempts(level_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_level ON public.assessment_attempts(user_id, level_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_completed ON public.assessment_attempts(user_id, status);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.assessment_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;

-- Levels are viewable by all authenticated users
DROP POLICY IF EXISTS "Assessment levels are viewable by everyone" ON public.assessment_levels;
CREATE POLICY "Assessment levels are viewable by everyone"
  ON public.assessment_levels FOR SELECT
  USING (true);

-- Questions can be viewed by authenticated users (backend API controls answer key stripping)
DROP POLICY IF EXISTS "Assessment questions are viewable by authenticated users" ON public.assessment_questions;
CREATE POLICY "Assessment questions are viewable by authenticated users"
  ON public.assessment_questions FOR SELECT
  USING (true);

-- Attempts are privately owned by the creating user
DROP POLICY IF EXISTS "Users can view own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can view own assessment attempts"
  ON public.assessment_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can insert own assessment attempts"
  ON public.assessment_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can update own assessment attempts"
  ON public.assessment_attempts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role bypass policies for server-side trusted execution
DROP POLICY IF EXISTS "Service role has full access to assessment levels" ON public.assessment_levels;
CREATE POLICY "Service role has full access to assessment levels"
  ON public.assessment_levels FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to assessment questions" ON public.assessment_questions;
CREATE POLICY "Service role has full access to assessment questions"
  ON public.assessment_questions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role has full access to assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Service role has full access to assessment attempts"
  ON public.assessment_attempts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
