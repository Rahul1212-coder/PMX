-- ==============================================================================
-- PMVerse Platform Migration: Add Profile Attributes Columns & Ensure RLS Policies
-- Execute in Supabase SQL Editor: Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Add missing profile columns if they do not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pm_stage TEXT DEFAULT 'existing_pm';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pm_fit_score INTEGER DEFAULT NULL;

-- 2. Ensure RLS policies exist on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;
