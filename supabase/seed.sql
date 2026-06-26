-- Main Seed Entry Point
-- This file is executed by 'npx supabase db reset'

-- Include Users
\i supabase/seed/01_users.sql

-- Include Data
\i supabase/seed/02_clients.sql
\i supabase/seed/04_services.sql
\i supabase/seed/05_prd_seed.sql
