-- 010_prd_v1_rls_policies.sql
-- Setting up RLS policies for projects, client_services, and all report tables

-- 1. PROJECTS Policies
CREATE POLICY "Admins can do everything on projects" ON public.projects 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own projects" ON public.projects 
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
  );

-- 2. CLIENT_SERVICES Policies
CREATE POLICY "Admins can do everything on client_services" ON public.client_services 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own client_services" ON public.client_services 
  FOR SELECT USING (
    client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
  );

-- 3. SOSMED_REPORTS Policies
CREATE POLICY "Admins can do everything on sosmed_reports" ON public.sosmed_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own sosmed_reports" ON public.sosmed_reports 
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
    )
  );

-- 4. EMAIL_BLAST_REPORTS Policies
CREATE POLICY "Admins can do everything on email_blast_reports" ON public.email_blast_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own email_blast_reports" ON public.email_blast_reports 
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
    )
  );

-- 5. WA_BLAST_REPORTS Policies
CREATE POLICY "Admins can do everything on wa_blast_reports" ON public.wa_blast_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own wa_blast_reports" ON public.wa_blast_reports 
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
    )
  );

-- 6. SEO_REPORTS Policies
CREATE POLICY "Admins can do everything on seo_reports" ON public.seo_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own seo_reports" ON public.seo_reports 
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
    )
  );

-- 7. WEBDEV_REPORTS Policies
CREATE POLICY "Admins can do everything on webdev_reports" ON public.webdev_reports 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can select own webdev_reports" ON public.webdev_reports 
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM public.projects 
      WHERE client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
    )
  );

-- 8. NOTIFICATIONS Policies
CREATE POLICY "Admins can do everything on notifications" ON public.notifications 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can manage own notifications" ON public.notifications 
  FOR ALL USING (
    client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid())
  );
