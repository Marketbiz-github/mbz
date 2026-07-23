-- 20260722_upgrade_sosmed_reports.sql
-- Upgrade sosmed service: account identity, audience breakdown, content type breakdown
-- SAFE: Only ADD COLUMN — no existing data is modified or deleted.

-- ============================================================
-- 1. PROJECTS — add profile identity per social-media project
-- ============================================================
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS profile_username TEXT,
  ADD COLUMN IF NOT EXISTS profile_url TEXT;

-- ============================================================
-- 2. SOSMED_REPORTS — add audience & content-type breakdown
-- ============================================================

-- Total followers snapshot at end of report period (for net-growth calc)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS total_followers INTEGER DEFAULT 0;

-- Reach breakdown: followers vs non-followers
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS reach_followers INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reach_non_followers INTEGER DEFAULT 0;

-- Impressions breakdown by content type
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS impressions_feed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions_reels INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impressions_stories INTEGER DEFAULT 0;

-- ============================================================
-- 3. SOSMED_POSTS — add content type label
-- ============================================================
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'post'
    CHECK (content_type IN ('post', 'reel', 'story'));
