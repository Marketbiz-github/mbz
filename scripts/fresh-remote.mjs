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
  auth: { persistSession: false }
});

// Fixed UUIDs used in seed files
const SEED_USER_IDS = [
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // admin
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // client (John Client)
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', // technova
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', // greenlife
];

const SEED_USER_IDS_SQL = `ARRAY[
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'
]::uuid[]`;

const RESET_SQL = `
DO $$
DECLARE
  seed_user_ids uuid[] := ARRAY[
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'
  ]::uuid[];
  seed_client_ids uuid[];
  seed_campaign_ids uuid[];
BEGIN
  -- Collect all client IDs owned by seed users
  SELECT ARRAY(SELECT id FROM public.clients WHERE owner_id = ANY(seed_user_ids))
  INTO seed_client_ids;

  -- Collect all campaign IDs for those clients
  SELECT ARRAY(SELECT id FROM public.campaigns WHERE client_id = ANY(seed_client_ids))
  INTO seed_campaign_ids;

  -- Step 1: Delete email_campaigns for seed clients
  DELETE FROM public.email_campaigns WHERE client_id = ANY(seed_client_ids);

  -- Step 2: Delete performance_logs for seed campaigns
  IF array_length(seed_campaign_ids, 1) > 0 THEN
    DELETE FROM public.performance_logs WHERE campaign_id = ANY(seed_campaign_ids);
  END IF;

  -- Step 3: Delete campaigns for seed clients
  DELETE FROM public.campaigns WHERE client_id = ANY(seed_client_ids);

  -- Step 4: Delete all clients owned by seed users
  DELETE FROM public.clients WHERE owner_id = ANY(seed_user_ids);

  -- Step 5: Delete profiles
  DELETE FROM public.profiles WHERE id = ANY(seed_user_ids);

  -- Step 6: Delete auth users
  DELETE FROM auth.users WHERE id = ANY(seed_user_ids);
END $$;
`;

const SEED_FILES = [
  '01_users.sql',
  '02_clients.sql',
  '03_email_campaigns.sql',
];

async function execSql(sql, label) {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      console.error('❌ Database function "exec_sql" not found.');
      console.log('💡 Run this once in your Supabase SQL Editor:');
      console.log(`
  create or replace function exec_sql(sql_query text)
  returns void as $$
  begin
    execute sql_query;
  end;
  $$ language plpgsql security definer;
      `);
      process.exit(1);
    }
    throw new Error(`${label}: ${error.message}`);
  }
}

async function main() {
  console.log('🗑️  Resetting remote database...');

  try {
    await execSql(RESET_SQL, 'RESET');
    console.log('✅ All seed data cleared.');
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }

  console.log('\n🚀 Re-seeding database...');
  for (const fileName of SEED_FILES) {
    console.log(`📄 Executing ${fileName}...`);
    const filePath = path.join(__dirname, '../supabase/seed', fileName);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await execSql(sql, fileName);
      console.log(`✅ ${fileName} executed successfully.`);
    } catch (err) {
      console.error(`❌ Error in ${fileName}:`, err.message);
      process.exit(1);
    }
  }

  console.log('\n🎉 Remote database fresh reset completed!');
}

main();
