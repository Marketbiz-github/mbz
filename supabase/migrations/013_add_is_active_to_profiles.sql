-- 013_add_is_active_to_profiles.sql
-- Add status is_active to profiles table

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
