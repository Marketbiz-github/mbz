-- 003_contacts.sql: Contacts Table
CREATE TABLE public.contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  email text,
  phone text,
  position text
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
