/**
 * scripts/setup-exec-sql.mjs
 * Creates the exec_sql RPC function on the target database.
 * Must be run once per new Supabase project before migrations/seeds.
 * 
 * Usage: node scripts/setup-exec-sql.mjs --env production
 */
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { loadEnv } from './env-loader.mjs';

const { supabaseUrl, supabaseServiceKey } = loadEnv();

global.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('🔧 Setting up exec_sql function...');

  // Use the management API to run SQL directly
  // Since exec_sql doesn't exist yet, we need to use supabase.rpc won't work.
  // Instead, we'll try a workaround: use the REST API to call the SQL endpoint.
  
  const sql = `
    create or replace function exec_sql(sql_query text)
    returns void as $$
    begin
      execute sql_query;
    end;
    $$ language plpgsql security definer;
  `;

  // Try using the Supabase Management API / SQL endpoint
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  
  // Attempt via postgrest's rpc - this will fail if function doesn't exist
  // So we use the raw SQL approach via fetch to the pg-meta endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    },
    body: JSON.stringify({ sql_query: sql })
  });

  if (response.ok) {
    console.log('✅ exec_sql function already exists or was updated.');
    return;
  }

  // If exec_sql doesn't exist, we need the user to create it manually
  console.log('');
  console.log('⚠️  Cannot create exec_sql automatically (function does not exist yet).');
  console.log('');
  console.log('📋 Please run this SQL in your Supabase Dashboard SQL Editor:');
  console.log(`   Project: ${supabaseUrl}`);
  console.log('');
  console.log('   ──────────────────────────────────────────');
  console.log(sql);
  console.log('   ──────────────────────────────────────────');
  console.log('');
  console.log('   Then re-run this script to verify.');
}

main();
