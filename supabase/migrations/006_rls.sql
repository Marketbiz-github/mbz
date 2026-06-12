-- 006_rls.sql: Security Policies
-- PROFILES: Users can see all profiles but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- CLIENTS: 
-- Admins see everything. Clients only see clients they own.
CREATE POLICY "Admins see all clients" ON public.clients 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Clients see own data" ON public.clients 
FOR SELECT USING (owner_id = auth.uid());

-- PERFORMANCE LOGS: Nested RLS
CREATE POLICY "Users see logs for their clients" ON public.performance_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    JOIN public.clients cl ON c.client_id = cl.id
    WHERE c.id = performance_logs.campaign_id
    AND (cl.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  )
);
