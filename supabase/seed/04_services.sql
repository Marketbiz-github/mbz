-- Seed services
INSERT INTO public.services (name, description) VALUES 
('Email Marketing', 'Layanan pengelolaan kampanye email'),
('SEO', 'Layanan optimasi mesin pencari'),
('Social Media', 'Layanan pengelolaan media sosial')
ON CONFLICT (name) DO NOTHING;
