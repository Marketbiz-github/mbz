-- seed_production.sql: Production-only seed
-- Seeds ONLY admin user and services (no dummy clients/data)

-- 1. Create Admin User
DO $$
DECLARE
    admin_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
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

    -- Update Profile role and email
    UPDATE public.profiles SET role = 'admin', full_name = 'Super Admin', email = 'admin@marketbiz.id' WHERE id = admin_id;
END $$;

-- 2. Seed Services
INSERT INTO public.services (name, description) VALUES 
('Sosmed', 'Manajemen & pelaporan social media (Instagram, TikTok, LinkedIn, Facebook)'),
('Email Blast', 'Blast email massal & pelacakan performa campaign email'),
('SEO', 'Optimasi mesin pencari & pelacakan traffic web'),
('Web Development', 'Pengembangan website & aplikasi web'),
('WA Blast', 'Blast WhatsApp massal & pelacakan pengiriman')
ON CONFLICT (name) DO NOTHING;
