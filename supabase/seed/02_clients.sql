-- 02_clients.sql: Seeding Dummy Clients and Data

DO $$
DECLARE
    -- Admin & default user IDs (assuming they exist from 01_users.sql)
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    client_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

    -- New Clients
    ipaymu_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
    kooperasi_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
    opang_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    xepeng_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34';
    hallobali_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35';
    qwick_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36';
    yesposs_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37';
BEGIN
    -- Create Clients with Fixed IDs
    INSERT INTO public.clients (id, name, industry, website, status, owner_id)
    VALUES 
        (ipaymu_id, 'Ipaymu', 'Payment Gateway', 'https://ipaymu.com', 'active', client_id),
        (kooperasi_id, 'Kooperasi', 'Finance', 'https://kooperasi.com', 'active', client_id),
        (opang_id, 'Opang', 'Transportation', 'https://opang.id', 'active', client_id),
        (xepeng_id, 'Xepeng', 'Automotive', 'https://xepeng.com', 'active', client_id),
        (hallobali_id, 'Hallobali', 'Tourism', 'https://hallobali.com', 'active', client_id),
        (qwick_id, 'Qwick', 'Logistics', 'https://qwick.id', 'active', client_id),
        (yesposs_id, 'Yesposs', 'Technology', 'https://yesposs.com', 'active', client_id)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        industry = EXCLUDED.industry,
        website = EXCLUDED.website,
        status = EXCLUDED.status,
        owner_id = EXCLUDED.owner_id;

    -- Legacy campaigns cleanup since they are handled in 009 migration
END $$;
