-- 20260813000000_add_email_programs.sql
-- Adds Program hierarchy level and classification columns for email blast campaigns

-- 1. Create email_programs table (Program = sub-group within a Project)
CREATE TABLE IF NOT EXISTS public.email_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint: no duplicate program names within the same project
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_programs_project_name 
  ON public.email_programs(project_id, name);

-- RLS
ALTER TABLE public.email_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email_programs" ON public.email_programs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Add new columns to email_blast_reports
-- program_id: links campaign to a program (nullable for backward compat)
ALTER TABLE public.email_blast_reports 
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.email_programs(id) ON DELETE SET NULL;

-- database_type: 'internal' or 'external' (nullable for existing data)
ALTER TABLE public.email_blast_reports 
  ADD COLUMN IF NOT EXISTS database_type TEXT DEFAULT NULL 
    CHECK (database_type IS NULL OR database_type IN ('internal', 'external'));

-- audience_category: 'dorman' or 'non_dorman' (only relevant when database_type = 'internal')
ALTER TABLE public.email_blast_reports 
  ADD COLUMN IF NOT EXISTS audience_category TEXT DEFAULT NULL 
    CHECK (audience_category IS NULL OR audience_category IN ('dorman', 'non_dorman'));
