import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ws from 'ws';
import { loadEnv } from './env-loader.mjs';

const { supabaseUrl, supabaseServiceKey } = loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

global.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function execSql(sql, label) {
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

async function main() {
  console.log('⚙️ Running migrations directly via SQL RPC...');
  
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Executing migration: ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
      await execSql(sql, file);
      console.log(`✅ ${file} applied.`);
    } catch (err) {
      console.error(`❌ Migration ${file} failed:`, err.message);
      // We don't exit if it already exists, but let's print and continue
    }
  }
  console.log('🎉 Migrations finished!');
}

main();
