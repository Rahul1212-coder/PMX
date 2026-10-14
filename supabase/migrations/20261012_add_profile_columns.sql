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

-- 3. Trigger function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    company,
    pm_stage,
    previous_role,
    years_of_experience,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), NULLIF(NEW.raw_user_meta_data->>'name', ''), split_part(NEW.email, '@', 1)),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'Product Manager'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'company', ''), 'Tech Company'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'pm_stage', ''), 'existing_pm'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'previous_role', ''), NULL),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'years_of_experience', '')::INTEGER, 2),
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company = EXCLUDED.company,
    pm_stage = EXCLUDED.pm_stage,
    previous_role = EXCLUDED.previous_role,
    years_of_experience = EXCLUDED.years_of_experience,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

