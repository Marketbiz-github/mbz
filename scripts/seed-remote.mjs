import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';
import { loadEnv } from './env-loader.mjs';

const { supabaseUrl, supabaseServiceKey, isProduction } = loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function runSeed() {
  console.log('🚀 Starting remote seed...');

  // Production: only seed admin user + services
  // Staging/Local: seed all dummy data
  const seedFiles = isProduction
    ? ['seed_production.sql']
    : [
        '01_users.sql',
        '02_clients.sql',
        '03_email_campaigns.sql',
        '04_services.sql',
        '05_prd_seed.sql'
      ];

  console.log(`📋 Seed files: ${seedFiles.join(', ')}`);
  console.log('');

  for (const fileName of seedFiles) {
    console.log(`📄 Executing ${fileName}...`);
    const filePath = path.join(__dirname, '../supabase/seed', fileName);
    const sql = fs.readFileSync(filePath, 'utf8');

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.error('❌ Error: Database function "exec_sql" not found.');
        console.log('💡 Please run this SQL once in your Supabase Dashboard SQL Editor first:');
        console.log(`
          create or replace function exec_sql(sql_query text)
          returns void as $$
          begin
            execute sql_query;
          end;
          $$ language plpgsql security definer;
        `);
      } else {
        console.error(`❌ Error in ${fileName}:`, error.message);
      }
      return;
    }
    console.log(`✅ ${fileName} executed successfully.`);
  }

  console.log('🎉 Remote seeding completed!');
}

runSeed();
