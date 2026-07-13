-- 017_create_wa_blast_recipients.sql

CREATE TABLE IF NOT EXISTS public.wa_blast_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.wa_blast_reports(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  dynamic_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Setup
ALTER TABLE public.wa_blast_recipients ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and write (or adjust to your specific RLS needs)
CREATE POLICY "Enable all for authenticated users" ON public.wa_blast_recipients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
