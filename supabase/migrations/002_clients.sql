-- 002_clients.sql: Clients Table
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  industry text,
  website text,
  logo_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'warning')),
  owner_id uuid REFERENCES public.profiles(id) -- Linking client to a specific user (admin or client user)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
