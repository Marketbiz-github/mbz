-- 20260723_instagram_align_sosmed.sql
-- Align sosmed analytics with actual Instagram Professional Dashboard data.
-- Instagram now uses "Views" instead of "Impressions".
-- SAFE: Only ADD COLUMN — no existing data is modified or deleted.

-- ============================================================
-- 1. SOSMED_REPORTS (Account Level) — align with IG Account Insights
-- ============================================================

-- Views (replaces "impressions" conceptually)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Views breakdown: followers vs non-followers (percentage)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS views_followers_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_non_followers_pct NUMERIC(5,1) DEFAULT 0;

-- Views by content type (percentage)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS views_posts_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_stories_pct NUMERIC(5,1) DEFAULT 0;

-- Interactions breakdown: followers vs non-followers (percentage)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS interactions_followers_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_non_followers_pct NUMERIC(5,1) DEFAULT 0;

-- Interactions by content type (percentage)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS interactions_posts_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_stories_pct NUMERIC(5,1) DEFAULT 0;

-- Accounts engaged (subset of accounts_reached who interacted)
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS accounts_engaged INTEGER DEFAULT 0;

-- Profile section
ALTER TABLE public.sosmed_reports
  ADD COLUMN IF NOT EXISTS profile_visits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS external_link_taps INTEGER DEFAULT 0;


-- ============================================================
-- 2. SOSMED_POSTS (Per-Post Level) — align with IG Post Insight
-- ============================================================

-- Views
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Views breakdown
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS views_followers_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_non_followers_pct NUMERIC(5,1) DEFAULT 0;

-- Views source breakdown
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS views_from_home INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_from_profile INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_from_other INTEGER DEFAULT 0;

-- Accounts reached (per post, replaces generic "reach")
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS accounts_reached INTEGER DEFAULT 0;

-- Interactions detail
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS interactions_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_followers_pct NUMERIC(5,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interactions_non_followers_pct NUMERIC(5,1) DEFAULT 0;

-- Saves (not in current schema)
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS saves INTEGER DEFAULT 0;

-- Accounts engaged
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS accounts_engaged INTEGER DEFAULT 0;

-- Profile section (driven by this post)
ALTER TABLE public.sosmed_posts
  ADD COLUMN IF NOT EXISTS profile_activity INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_visits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS external_link_taps INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS business_address_taps INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follows_from_post INTEGER DEFAULT 0;
