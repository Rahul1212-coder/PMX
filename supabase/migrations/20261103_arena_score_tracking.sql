-- ==============================================================================
-- PMVerse Platform - Gamification Arena Score & Milestones Tracking Migration
-- Migration: 20261103_arena_score_tracking.sql
-- ==============================================================================

-- 1. ADD ARENA SCORE COLUMNS TO USER_GAMIFICATION
ALTER TABLE public.user_gamification
  ADD COLUMN IF NOT EXISTS weekly_arena_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_time_arena_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS arena_rank INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_gamification_weekly_arena ON public.user_gamification(weekly_arena_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_alltime_arena ON public.user_gamification(all_time_arena_score DESC);
