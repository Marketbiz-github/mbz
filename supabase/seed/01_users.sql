-- 01_users.sql: Seeding Auth Users and Profiles
-- Defines Admin, Ipaymu Client, Kooperasi Client, and Opang Client.
-- Seeds correct passwords matching the UI credentials card calculations.

DO $$
DECLARE
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    client_ipaymu_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    client_kooperasi_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    client_opang_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
BEGIN
    -- 1. Create Admin User
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@marketbiz.id',
        crypt('admin123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Super Admin"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Create Ipaymu Client User (password: mbz-ipaymu-pwd)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        client_ipaymu_id,
        '00000000-0000-0000-0000-000000000000',
        'ipaymu@marketbiz.id',
        crypt('mbz-ipaymu-pwd', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Sarah Jenkins"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Create Kooperasi Client User (password: mbz-kooperasi-pwd)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        client_kooperasi_id,
        '00000000-0000-0000-0000-000000000000',
        'kooperasi@marketbiz.id',
        crypt('mbz-kooperasi-pwd', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Budi Santoso"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Create Opang Client User (password: mbz-opang-pwd)
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        client_opang_id,
        '00000000-0000-0000-0000-000000000000',
        'opang@marketbiz.id',
        crypt('mbz-opang-pwd', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Rian Wijaya"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- Update Profiles roles and emails
    UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin', email = 'admin@marketbiz.id' WHERE id = admin_id;
    UPDATE public.profiles SET role = 'client', full_name = 'Sarah Jenkins', email = 'ipaymu@marketbiz.id' WHERE id = client_ipaymu_id;
    UPDATE public.profiles SET role = 'client', full_name = 'Budi Santoso', email = 'kooperasi@marketbiz.id' WHERE id = client_kooperasi_id;
    UPDATE public.profiles SET role = 'client', full_name = 'Rian Wijaya', email = 'opang@marketbiz.id' WHERE id = client_opang_id;

END $$;
