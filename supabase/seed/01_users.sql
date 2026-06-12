-- 01_users.sql: Seeding Auth Users and Profiles

DO $$
DECLARE
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Fixed UUID for consistency in seeding
    client_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
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

    -- 2. Create Client User
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        client_id,
        '00000000-0000-0000-0000-000000000000',
        'client@marketbiz.id',
        crypt('client123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"John Client"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Create TechNova Client User
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        '00000000-0000-0000-0000-000000000000',
        'technova@marketbiz.id',
        crypt('client123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"TechNova Client"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Create GreenLife Client User
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        '00000000-0000-0000-0000-000000000000',
        'greenlife@marketbiz.id',
        crypt('client123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"GreenLife Client"}',
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (id) DO NOTHING;

    -- Update Profiles (Trigger 001 handles insertion, we update roles)
    UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin' WHERE id = admin_id;
    UPDATE public.profiles SET role = 'client', full_name = 'John Client' WHERE id = client_id;
    UPDATE public.profiles SET role = 'client', full_name = 'TechNova Client' WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    UPDATE public.profiles SET role = 'client', full_name = 'GreenLife Client' WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

END $$;
