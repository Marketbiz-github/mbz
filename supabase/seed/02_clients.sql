-- 02_clients.sql: Seeding Dummy Clients and Data
-- Creates exactly 3 clients linked to their respective user profiles.

DO $$
DECLARE
    ipaymu_owner UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    kooperasi_owner UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    opang_owner UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

    ipaymu_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31';
    kooperasi_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32';
    opang_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
BEGIN
    -- Create Clients with Fixed IDs and unique owner references
    INSERT INTO public.clients (id, name, industry, website, status, owner_id)
    VALUES 
        (ipaymu_id, 'Ipaymu', 'Payment Gateway', 'https://ipaymu.com', 'active', ipaymu_owner),
        (kooperasi_id, 'Kooperasi', 'Finance', 'https://kooperasi.com', 'active', kooperasi_owner),
        (opang_id, 'Opang', 'Transportation', 'https://opang.id', 'active', opang_owner)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        industry = EXCLUDED.industry,
        website = EXCLUDED.website,
        status = EXCLUDED.status,
        owner_id = EXCLUDED.owner_id;

END $$;
