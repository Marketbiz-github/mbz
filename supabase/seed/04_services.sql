-- Seed services
INSERT INTO public.services (name, description) VALUES 
('Email Marketing', 'Layanan pengelolaan kampanye email'),
('SEO', 'Layanan optimasi mesin pencari'),
('Social Media', 'Layanan pengelolaan media sosial')
ON CONFLICT (name) DO NOTHING;

-- Seed client_services (Relating clients to services)
-- TechNova Solutions (c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33) -> Email Marketing, SEO
-- GreenLife Organics (d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44) -> Social Media
-- My Personal Brand (e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55) -> Email Marketing, SEO, Social Media

INSERT INTO public.client_services (client_id, service_id) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', (SELECT id FROM public.services WHERE name = 'Email Marketing')),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', (SELECT id FROM public.services WHERE name = 'SEO')),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', (SELECT id FROM public.services WHERE name = 'Social Media')),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', (SELECT id FROM public.services WHERE name = 'Email Marketing')),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', (SELECT id FROM public.services WHERE name = 'SEO')),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', (SELECT id FROM public.services WHERE name = 'Social Media'))
ON CONFLICT (client_id, service_id) DO NOTHING;
