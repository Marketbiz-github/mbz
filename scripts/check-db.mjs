import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

global.WebSocket = ws;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function main() {
  const { data: users, error: uErr } = await supabase.auth.admin.listUsers();
  console.log('--- AUTH USERS ---');
  if (uErr) console.error(uErr.message);
  else users.users.forEach(u => console.log(`ID: ${u.id}, Email: ${u.email}`));

  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log('\n--- PROFILES ---');
  if (pErr) console.error(pErr.message);
  else console.log(profiles);

  const { data: clients, error: cErr } = await supabase.from('clients').select('*');
  console.log('\n--- CLIENTS ---');
  if (cErr) console.error(cErr.message);
  else console.log(clients);
}

main();
