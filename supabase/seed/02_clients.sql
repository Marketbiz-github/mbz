-- 02_clients.sql: Seeding Dummy Clients and Data

DO $$
DECLARE
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    client_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    tech_nova_id UUID := gen_random_uuid();
    green_life_id UUID := gen_random_uuid();
    launch_campaign_id UUID;
BEGIN
    -- Create Clients for Admin (Manageable by Admin)
    INSERT INTO public.clients (id, name, industry, status, owner_id)
    VALUES 
        (tech_nova_id, 'TechNova Solutions', 'Technology', 'active', admin_id),
        (green_life_id, 'GreenLife Organics', 'E-commerce', 'active', admin_id)
    ON CONFLICT DO NOTHING;

    -- Create Client for the specific Client User (Only visible to them)
    INSERT INTO public.clients (name, industry, status, owner_id)
    VALUES 
        ('My Personal Brand', 'Influencer', 'active', client_id)
    ON CONFLICT DO NOTHING;

    -- Create campaign and store its ID
    INSERT INTO public.campaigns (client_id, name, platform, status)
    VALUES (tech_nova_id, 'Launch Campaign', 'instagram', 'active')
    RETURNING id INTO launch_campaign_id;

    -- Create some performance logs for TechNova
    INSERT INTO public.performance_logs (campaign_id, log_date, reach, engagement)
    SELECT 
        launch_campaign_id,
        CURRENT_DATE - (i || ' days')::interval,
        floor(random() * 5000 + 1000)::int,
        floor(random() * 500 + 50)::int
    FROM generate_series(1, 30) i;

END $$;
