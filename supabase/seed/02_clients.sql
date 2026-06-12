-- 02_clients.sql: Seeding Dummy Clients and Data

DO $$
DECLARE
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    client_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    tech_nova_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    green_life_id UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
    personal_brand_id UUID := 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
    launch_campaign_id UUID := 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';
BEGIN
    -- Create Clients with Fixed IDs
    INSERT INTO public.clients (id, name, industry, status, owner_id)
    VALUES 
        (tech_nova_id, 'TechNova Solutions', 'Technology', 'active', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),
        (green_life_id, 'GreenLife Organics', 'E-commerce', 'active', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'),
        (personal_brand_id, 'My Personal Brand', 'Influencer', 'active', client_id)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        industry = EXCLUDED.industry,
        status = EXCLUDED.status,
        owner_id = EXCLUDED.owner_id;

    -- Create campaign with Fixed ID
    INSERT INTO public.campaigns (id, client_id, name, platform, status)
    VALUES (launch_campaign_id, tech_nova_id, 'Launch Campaign', 'instagram', 'active')
    ON CONFLICT (id) DO UPDATE SET
        client_id = EXCLUDED.client_id,
        name = EXCLUDED.name,
        platform = EXCLUDED.platform,
        status = EXCLUDED.status;

    -- For performance logs, we can clear and re-insert or use a unique key.
    -- To keep it simple for seeding, we'll delete existing logs for this campaign before re-seeding.
    DELETE FROM public.performance_logs WHERE campaign_id = launch_campaign_id;

    -- Create some performance logs for TechNova
    INSERT INTO public.performance_logs (campaign_id, log_date, reach, engagement, impressions, clicks)
    SELECT 
        launch_campaign_id,
        CURRENT_DATE - (i || ' days')::interval,
        floor(random() * 5000 + 1000)::int,
        floor(random() * 500 + 50)::int,
        floor(random() * 8000 + 2000)::int,
        floor(random() * 200 + 20)::int
    FROM generate_series(0, 30) i;

END $$;
