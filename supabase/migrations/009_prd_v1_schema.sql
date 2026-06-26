-- 009_prd_v1_schema.sql
-- Drop old unused tables (cascade to avoid dependency issues)
DROP TABLE IF EXISTS public.performance_logs CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.email_campaigns CASCADE;

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  ga_property_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sosmed_reports
CREATE TABLE IF NOT EXISTS public.sosmed_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  content_produced INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- email_blast_reports
CREATE TABLE IF NOT EXISTS public.email_blast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  sender TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  utcid TEXT,
  status TEXT DEFAULT 'completed',
  recipients INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  opens_excl_apple INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- wa_blast_reports
CREATE TABLE IF NOT EXISTS public.wa_blast_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  template_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'completed',
  total_sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  read INTEGER DEFAULT 0,
  replied INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ga4_api')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- seo_reports
CREATE TABLE IF NOT EXISTS public.seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  users INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,2) DEFAULT 0,
  avg_session_duration NUMERIC(10,2) DEFAULT 0,
  organic_traffic INTEGER DEFAULT 0,
  top_keywords JSONB DEFAULT '[]',
  top_pages JSONB DEFAULT '[]',
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ga4_api')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- webdev_reports
CREATE TABLE IF NOT EXISTS public.webdev_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  milestones JSONB DEFAULT '[]',
  deliverables JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold')),
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'report_update', 'new_project', 'system')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Setup
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sosmed_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_blast_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_blast_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webdev_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic Admin Policies (Admin can do everything)
-- Note: Assuming auth policies are handled consistently elsewhere, we can add basic ones or rely on existing ones.
