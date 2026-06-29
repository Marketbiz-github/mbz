-- 015_add_active_platforms_to_projects.sql
-- Add active_platforms column to projects table to select which platforms are tracked

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS active_platforms TEXT DEFAULT 'instagram,tiktok,linkedin,facebook';
