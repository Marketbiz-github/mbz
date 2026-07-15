import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productionEnv = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.production')));

const productionClient = createClient(
  productionEnv.NEXT_PUBLIC_SUPABASE_URL,
  productionEnv.SUPABASE_SERVICE_ROLE_KEY
);

async function seedProductionServices() {
  const missingServices = [
    { name: 'Sosmed', description: 'Manajemen & pelaporan social media (Instagram, TikTok, LinkedIn, Facebook)' },
    { name: 'SEO', description: 'Optimasi mesin pencari & pelacakan traffic web' },
    { name: 'Web Development', description: 'Pengembangan website & aplikasi web' },
    { name: 'WA Blast', description: 'Blast WhatsApp massal & pelacakan pengiriman' }
  ];

  console.log('Inserting missing services into Production...');
  
  for (const service of missingServices) {
    const { data, error } = await productionClient
      .from('services')
      .upsert(service, { onConflict: 'name' })
      .select();

    if (error) {
      console.error(`Error inserting ${service.name}:`, error);
    } else {
      console.log(`Successfully inserted/upserted ${service.name}:`, data);
    }
  }

  console.log('--- Current Production Services ---');
  const { data: prodServices } = await productionClient.from('services').select('*');
  console.log(prodServices);
}

seedProductionServices().catch(console.error);
