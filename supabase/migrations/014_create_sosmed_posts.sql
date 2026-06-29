-- 014_create_sosmed_posts.sql
-- Create table for tracking individual social media posts under a project

CREATE TABLE IF NOT EXISTS public.sosmed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  post_url TEXT,
  post_title TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT now(),
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sosmed_posts ENABLE ROW LEVEL SECURITY;

-- Create policy for select/insert/update/delete for authenticated admin
CREATE POLICY "Admins can do everything on sosmed_posts" 
ON public.sosmed_posts 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
