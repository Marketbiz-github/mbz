-- 005_tracking.sql: Performance Tracking Data
CREATE TABLE public.performance_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  reach integer DEFAULT 0,
  engagement integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0
);

ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
