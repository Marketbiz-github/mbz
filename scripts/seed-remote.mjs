import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

global.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

async function runSeed() {
  console.log('🚀 Starting remote seed...');

  const seedFiles = [
    '01_users.sql',
    '02_clients.sql'
  ];

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
