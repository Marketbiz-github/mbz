-- 20260727000000_add_reels_to_sosmed_reports.sql
ALTER TABLE public.sosmed_reports ADD COLUMN IF NOT EXISTS views_reels_pct NUMERIC(5,1) DEFAULT 0;
ALTER TABLE public.sosmed_reports ADD COLUMN IF NOT EXISTS interactions_reels_pct NUMERIC(5,1) DEFAULT 0;
