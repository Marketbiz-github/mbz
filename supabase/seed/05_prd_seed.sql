-- 05_prd_seed.sql
-- Assign services to clients and create projects/reports

DO $$
DECLARE
    ipaymu_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
    kooperasi_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
    opang_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

    srv_sosmed UUID;
    srv_email UUID;
    srv_wa UUID;
    srv_seo UUID;
    srv_web UUID;

    proj_ipaymu_sosmed UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10';
    proj_ipaymu_email UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    proj_ipaymu_wa UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    proj_ipaymu_seo UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    proj_ipaymu_web UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
BEGIN
    -- Get Service IDs
    SELECT id INTO srv_sosmed FROM public.services WHERE name = 'Sosmed' LIMIT 1;
    SELECT id INTO srv_email FROM public.services WHERE name = 'Email Blast' LIMIT 1;
    SELECT id INTO srv_wa FROM public.services WHERE name = 'WA Blast' LIMIT 1;
    SELECT id INTO srv_seo FROM public.services WHERE name = 'SEO' LIMIT 1;
    SELECT id INTO srv_web FROM public.services WHERE name = 'Web Development' LIMIT 1;

    -- 1. Client Services
    INSERT INTO public.client_services (client_id, service_id)
    VALUES 
        -- Ipaymu takes all services
        (ipaymu_id, srv_sosmed), (ipaymu_id, srv_email), (ipaymu_id, srv_wa), (ipaymu_id, srv_seo), (ipaymu_id, srv_web),
        -- Kooperasi takes SEO & Sosmed
        (kooperasi_id, srv_seo), (kooperasi_id, srv_sosmed),
        -- Opang takes WA Blast
        (opang_id, srv_wa)
    ON CONFLICT (client_id, service_id) DO NOTHING;

    -- 2. Projects for Ipaymu
    INSERT INTO public.projects (id, client_id, service_id, name, description, website_url, ga_property_id)
    VALUES
        (proj_ipaymu_sosmed, ipaymu_id, srv_sosmed, 'IG Brand Awareness Q3', 'Campaign Instagram Q3 Ipaymu', 'https://ipaymu.com', 'properties/123456789'),
        (proj_ipaymu_email, ipaymu_id, srv_email, 'Promo Ramadhan Blast', 'Blast promo Q3', 'https://ipaymu.com', 'properties/123456789'),
        (proj_ipaymu_wa, ipaymu_id, srv_wa, 'WA Promo Merchant', 'Follow up merchant', 'https://ipaymu.com', 'properties/123456789'),
        (proj_ipaymu_seo, ipaymu_id, srv_seo, 'Optimasi Landing Page', 'SEO Landing Page 2026', 'https://ipaymu.com', 'properties/123456789'),
        (proj_ipaymu_web, ipaymu_id, srv_web, 'Ipaymu Merchant Portal', 'Revamp merchant portal', 'https://ipaymu.com', 'properties/123456789')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Reports Data for Ipaymu

    -- Sosmed Reports
    INSERT INTO public.sosmed_reports (project_id, report_date, platform, reach, impressions, engagement, total_posts, content_produced, followers_gained)
    VALUES 
        (proj_ipaymu_sosmed, CURRENT_DATE - 2, 'instagram', 15000, 20000, 1500, 5, 2, 300),
        (proj_ipaymu_sosmed, CURRENT_DATE - 1, 'instagram', 18000, 22000, 1800, 3, 1, 400);

    -- Email Blast Reports
    INSERT INTO public.email_blast_reports (project_id, campaign_name, sender, status, recipients, opens, clicks, replies, bounces, blocks)
    VALUES 
        (proj_ipaymu_email, 'Promo Kemerdekaan', 'marketing@ipaymu.com', 'completed', 50000, 12000, 3000, 150, 200, 50),
        (proj_ipaymu_email, 'Newsletter Q3', 'newsletter@ipaymu.com', 'completed', 55000, 15000, 4500, 200, 150, 30);

    -- WA Blast Reports
    INSERT INTO public.wa_blast_reports (project_id, campaign_name, template_name, status, total_sent, delivered, read, replied, clicks, failed, source)
    VALUES 
        (proj_ipaymu_wa, 'Follow Up Leads', 'promo_v1', 'completed', 10000, 9500, 8000, 1200, 800, 500, 'ga4_api'),
        (proj_ipaymu_wa, 'Pengumuman Maintenance', 'info_v1', 'completed', 5000, 4900, 4500, 50, 0, 100, 'manual');

    -- SEO Reports
    INSERT INTO public.seo_reports (project_id, report_date, sessions, page_views, users, bounce_rate, organic_traffic, source)
    VALUES 
        (proj_ipaymu_seo, CURRENT_DATE - 2, 5000, 12000, 4500, 35.5, 3000, 'ga4_api'),
        (proj_ipaymu_seo, CURRENT_DATE - 1, 5200, 12500, 4600, 34.0, 3100, 'ga4_api');

    -- Web Dev Reports
    INSERT INTO public.webdev_reports (project_id, progress_percentage, status, milestones)
    VALUES 
        (proj_ipaymu_web, 65, 'in_progress', '[{"title": "Planning", "status": "done"}, {"title": "Design", "status": "done"}, {"title": "Development", "status": "in_progress"}]'::jsonb);

    -- 4. Notifications
    INSERT INTO public.notifications (client_id, title, message, type)
    VALUES
        (ipaymu_id, 'Laporan SEO Diperbarui', 'Laporan SEO untuk Optimasi Landing Page telah diperbarui.', 'report_update'),
        (ipaymu_id, 'Project Baru', 'Project WA Promo Merchant telah ditambahkan ke layanan WA Blast Anda.', 'new_project');

END $$;
