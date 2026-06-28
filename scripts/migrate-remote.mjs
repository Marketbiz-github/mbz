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
