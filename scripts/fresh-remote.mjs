import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';
import { loadEnv, confirmProduction } from './env-loader.mjs';

const { supabaseUrl, supabaseServiceKey, isProduction } = loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const RESET_SQL = `
DO $$
DECLARE
  seed_user_ids uuid[] := ARRAY[
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'
  ]::uuid[];
BEGIN
  -- Step 1: Delete all clients owned by seed users (cascades to projects, reports, etc.)
  DELETE FROM public.clients WHERE owner_id = ANY(seed_user_ids);

  -- Step 2: Delete profiles
  DELETE FROM public.profiles WHERE id = ANY(seed_user_ids);

  -- Step 3: Delete auth users
  DELETE FROM auth.users WHERE id = ANY(seed_user_ids);
END $$;
`;

const SEED_FILES_STAGING = [
  '01_users.sql',
  '02_clients.sql',
  '03_email_campaigns.sql',
  '04_services.sql',
  '05_prd_seed.sql',
];

const SEED_FILES_PRODUCTION = [
  'seed_production.sql',
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
  // Safety guard for production
  if (isProduction) {
    await confirmProduction('FRESH RESET the database');
  }

  console.log('🗑️  Resetting remote database...');

  try {
    await execSql(RESET_SQL, 'RESET');
    console.log('✅ All seed data cleared.');
  } catch (err) {
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }

  const seedFiles = isProduction ? SEED_FILES_PRODUCTION : SEED_FILES_STAGING;

  console.log('\n🚀 Re-seeding database...');
  console.log(`📋 Seed files: ${seedFiles.join(', ')}\n`);

  for (const fileName of seedFiles) {
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
