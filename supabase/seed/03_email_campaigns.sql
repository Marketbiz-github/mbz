-- 03_email_campaigns.sql: Seeding Email Campaigns
DO $$
DECLARE
    tech_nova_id UUID;
    green_life_id UUID;
    personal_brand_id UUID;
BEGIN
    SELECT id INTO tech_nova_id FROM public.clients WHERE name = 'TechNova Solutions' LIMIT 1;
    SELECT id INTO green_life_id FROM public.clients WHERE name = 'GreenLife Organics' LIMIT 1;
    SELECT id INTO personal_brand_id FROM public.clients WHERE name = 'My Personal Brand' LIMIT 1;

    -- Insert email campaign for TechNova Solutions
    IF tech_nova_id IS NOT NULL THEN
        INSERT INTO public.email_campaigns (client_id, name, sender, sent_at, utcid, status, recipients, opens, clicks, replies, unsubscribes, bounces, blocks, opens_excl_apple)
        VALUES 
            (tech_nova_id, 'Pembeli Anda tinggal klik & bayar', 'mira@ipaymu.com', '2026-06-09 08:36:42+00', '51687784', 'completed', 1478, 53, 3, 0, 0, 91, 2, 46),
            (tech_nova_id, 'Promo Akhir Bulan Spesial', 'mira@ipaymu.com', '2026-06-01 10:00:00+00', '51687701', 'completed', 1250, 412, 98, 12, 5, 23, 1, 380)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert email campaign for GreenLife Organics
    IF green_life_id IS NOT NULL THEN
        INSERT INTO public.email_campaigns (client_id, name, sender, sent_at, utcid, status, recipients, opens, clicks, replies, unsubscribes, bounces, blocks, opens_excl_apple)
        VALUES 
            (green_life_id, 'GreenLife Weekly Newsletter #1', 'info@greenlife.com', '2026-06-10 09:00:00+00', '51687799', 'completed', 850, 410, 85, 3, 2, 12, 0, 395)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Insert email campaign for My Personal Brand (owned by client_id)
    IF personal_brand_id IS NOT NULL THEN
        INSERT INTO public.email_campaigns (client_id, name, sender, sent_at, utcid, status, recipients, opens, clicks, replies, unsubscribes, bounces, blocks, opens_excl_apple)
        VALUES 
            (personal_brand_id, 'Welcome to My Personal Brand', 'john@personalbrand.id', '2026-06-11 12:00:00+00', '51687850', 'completed', 500, 350, 150, 45, 1, 4, 0, 320)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
