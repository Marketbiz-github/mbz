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

async function run() {
  const { data } = await productionClient.from('email_blast_reports').select('id, campaign_name, sent_at').order('sent_at', { ascending: false });
  console.log('Campaigns and sent_at:');
  data.forEach(c => {
    console.log(`${c.campaign_name}: ${c.sent_at}`);
  });
}
run().catch(console.error);
