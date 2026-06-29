-- 012_system_settings.sql
-- Create system_settings table to store credentials and branding options dynamically
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_provider TEXT DEFAULT 'openai',
  ai_api_key TEXT,
  ai_base_url TEXT DEFAULT 'https://api.openai.com/v1',
  ai_model_name TEXT DEFAULT 'gpt-4o',
  google_service_account_email TEXT,
  google_private_key TEXT,
  agency_name TEXT DEFAULT 'Marketbiz Digital',
  support_email TEXT DEFAULT 'support@marketbiz.id',
  support_whatsapp TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies: only admins can select/update
DROP POLICY IF EXISTS "Admins can do everything on system_settings" ON public.system_settings;
CREATE POLICY "Admins can do everything on system_settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed initial row
INSERT INTO public.system_settings (id, agency_name, support_email, support_whatsapp)
VALUES ('00000000-0000-0000-0000-000000000001', 'Marketbiz Digital', 'support@marketbiz.id', '')
ON CONFLICT (id) DO NOTHING;
