-- 004_campaigns.sql: Campaigns Table
CREATE TABLE public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  platform text CHECK (platform IN ('instagram', 'tiktok', 'linkedin', 'facebook')),
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'paused')),
  start_date date,
  end_date date
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
