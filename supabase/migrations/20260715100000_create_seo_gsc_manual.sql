-- Create seo_gsc_manual table
CREATE TABLE IF NOT EXISTS public.seo_gsc_manual (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  url text NOT NULL,
  rank numeric NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.seo_gsc_manual ENABLE ROW LEVEL SECURITY;

-- Policies for seo_gsc_manual
CREATE POLICY "Enable read access for authenticated users on seo_gsc_manual"
ON public.seo_gsc_manual FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users on seo_gsc_manual"
ON public.seo_gsc_manual FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users on seo_gsc_manual"
ON public.seo_gsc_manual FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users on seo_gsc_manual"
ON public.seo_gsc_manual FOR DELETE
TO authenticated
USING (true);
