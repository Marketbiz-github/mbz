-- 20260722_add_platform_profiles.sql
-- Store usernames and profile links per platform as JSONB
-- Example: {"instagram": {"username": "mbz.ig", "url": "https://instagram.com/mbz.ig"}, "tiktok": {...}}

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS platform_profiles JSONB DEFAULT '{}'::jsonb;
