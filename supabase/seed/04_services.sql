-- Seed services
INSERT INTO public.services (name, description) VALUES 
('Sosmed', 'Manajemen & pelaporan social media (Instagram, TikTok, LinkedIn, Facebook)'),
('Email Blast', 'Blast email massal & pelacakan performa campaign email'),
('SEO', 'Optimasi mesin pencari & pelacakan traffic web'),
('Web Development', 'Pengembangan website & aplikasi web'),
('WA Blast', 'Blast WhatsApp massal & pelacakan pengiriman')
ON CONFLICT (name) DO NOTHING;

-- Note: client_services junction will be seeded in 05_prd_seed.sql 
-- after clients and services are fully initialized.
