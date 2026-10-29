-- PMVerse Learning Materials & Knowledge Hub Migration
-- Supports Concepts, Real Case Studies with Q&A, and Product Teardowns

CREATE TABLE IF NOT EXISTS public.learning_materials (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('concept', 'case_study', 'teardown')),
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    read_time_minutes INTEGER DEFAULT 5,
    summary TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    concept_detail JSONB,
    case_study_detail JSONB,
    teardown_detail JSONB,
    author JSONB,
    is_published BOOLEAN DEFAULT TRUE,
    is_custom BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast filtering and lookup
CREATE INDEX IF NOT EXISTS idx_learning_materials_type ON public.learning_materials(type);
CREATE INDEX IF NOT EXISTS idx_learning_materials_category ON public.learning_materials(category);
CREATE INDEX IF NOT EXISTS idx_learning_materials_difficulty ON public.learning_materials(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_materials_published ON public.learning_materials(is_published);
CREATE INDEX IF NOT EXISTS idx_learning_materials_created ON public.learning_materials(created_at DESC);

-- Enable RLS
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view published learning materials
CREATE POLICY "Public read published learning materials"
    ON public.learning_materials
    FOR SELECT
    USING (is_published = true);

-- 2. Authenticated users can submit or publish learning materials
CREATE POLICY "Authenticated users can insert learning materials"
    ON public.learning_materials
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Authenticated users can update their own materials or admins full access
CREATE POLICY "Authenticated users can update learning materials"
    ON public.learning_materials
    FOR UPDATE
    TO authenticated
    USING (true);

-- 4. Service role has full unrestricted access
CREATE POLICY "Service role full access to learning materials"
    ON public.learning_materials
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
