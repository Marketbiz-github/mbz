-- 007_email_campaigns.sql: Email Campaigns Table
CREATE TABLE public.email_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  sender text NOT NULL,
  sent_at timestamp with time zone DEFAULT now(),
  utcid text,
  status text DEFAULT 'completed',
  recipients integer DEFAULT 0,
  opens integer DEFAULT 0,
  clicks integer DEFAULT 0,
  replies integer DEFAULT 0,
  unsubscribes integer DEFAULT 0,
  bounces integer DEFAULT 0,
  blocks integer DEFAULT 0,
  opens_excl_apple integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on email_campaigns" ON public.email_campaigns
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Clients can view their own email_campaigns" ON public.email_campaigns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.clients cl
    WHERE cl.id = email_campaigns.client_id
    AND cl.owner_id = auth.uid()
  )
);
