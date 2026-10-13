-- ==============================================================================
-- PMVerse Resume Intelligence — Database Migration & RLS Policies
-- ==============================================================================

-- 1. RESUME DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.resume_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  raw_text TEXT NOT NULL,
  page_count INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  is_scanned BOOLEAN DEFAULT FALSE,
  extraction_confidence INTEGER DEFAULT 90,
  detected_sections TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUME ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resume_documents(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'job_match',
  target_role TEXT NOT NULL,
  target_company TEXT,
  job_description TEXT,
  overall_score INTEGER NOT NULL,
  score_tier TEXT NOT NULL,
  category_scores JSONB NOT NULL DEFAULT '[]',
  requirement_matches JSONB NOT NULL DEFAULT '[]',
  pm_competencies JSONB NOT NULL DEFAULT '[]',
  ats_checks JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  top_strengths TEXT[] DEFAULT '{}',
  top_improvements TEXT[] DEFAULT '{}',
  score_explanation TEXT,
  structured_resume JSONB NOT NULL DEFAULT '{}',
  rubric_version TEXT DEFAULT 'rubric_v1.0',
  model_used TEXT DEFAULT 'gpt-4o-mini',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESUME VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  label TEXT NOT NULL DEFAULT 'Original',
  structured_resume JSONB NOT NULL DEFAULT '{}',
  overall_score INTEGER NOT NULL,
  score_delta INTEGER DEFAULT 0,
  applied_suggestion_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_resume_documents_user ON public.resume_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_analysis ON public.resume_versions(analysis_id);

-- Enable RLS
ALTER TABLE public.resume_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_documents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_documents' AND policyname = 'Users view own resume documents') THEN
    CREATE POLICY "Users view own resume documents" ON public.resume_documents FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_documents' AND policyname = 'Users insert own resume documents') THEN
    CREATE POLICY "Users insert own resume documents" ON public.resume_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_documents' AND policyname = 'Users delete own resume documents') THEN
    CREATE POLICY "Users delete own resume documents" ON public.resume_documents FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for resume_analyses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_analyses' AND policyname = 'Users view own resume analyses') THEN
    CREATE POLICY "Users view own resume analyses" ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_analyses' AND policyname = 'Users insert own resume analyses') THEN
    CREATE POLICY "Users insert own resume analyses" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_analyses' AND policyname = 'Users update own resume analyses') THEN
    CREATE POLICY "Users update own resume analyses" ON public.resume_analyses FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_analyses' AND policyname = 'Users delete own resume analyses') THEN
    CREATE POLICY "Users delete own resume analyses" ON public.resume_analyses FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for resume_versions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_versions' AND policyname = 'Users view own resume versions') THEN
    CREATE POLICY "Users view own resume versions" ON public.resume_versions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_versions' AND policyname = 'Users insert own resume versions') THEN
    CREATE POLICY "Users insert own resume versions" ON public.resume_versions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resume_versions' AND policyname = 'Users delete own resume versions') THEN
    CREATE POLICY "Users delete own resume versions" ON public.resume_versions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;
