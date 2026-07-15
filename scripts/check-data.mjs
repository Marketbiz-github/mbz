import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productionEnv = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.production')));
const stagingEnv = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.staging')));

const productionClient = createClient(
  productionEnv.NEXT_PUBLIC_SUPABASE_URL,
  productionEnv.SUPABASE_SERVICE_ROLE_KEY
);
const stagingClient = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
  // Check Clients
  const { data: clients } = await productionClient.from('clients').select('*');
  console.log('Production Clients:', clients.map(c => c.name));

  const ipaymu = clients.find(c => c.name.toLowerCase().includes('ipaymu'));
  if (ipaymu) {
    console.log('iPaymu Client ID:', ipaymu.id);
    console.log('iPaymu Owner ID:', ipaymu.owner_id);
    
    const { data: projects } = await productionClient.from('projects').select('*').eq('client_id', ipaymu.id);
    console.log('iPaymu Projects:', projects.length);
    if (projects.length > 0) {
      console.log('Projects details:', projects.map(p => ({ id: p.id, name: p.name, service_id: p.service_id, status: p.status })));
    }
  }

  // Fetch staging iPaymu client to see its owner_id
  const { data: stagingIpaymu } = await stagingClient.from('clients').select('*').ilike('name', '%ipaymu%').single();
  if (stagingIpaymu) {
    console.log('Staging iPaymu Owner ID:', stagingIpaymu.owner_id);
    // Fetch staging profile
    const { data: stagingProfile } = await stagingClient.from('profiles').select('*').eq('id', stagingIpaymu.owner_id).single();
    if (stagingProfile) {
      console.log('Staging Profile details:', stagingProfile);
    }
    
    // Check staging projects for iPaymu
    const { data: stagingProjects } = await stagingClient.from('projects').select('*').eq('client_id', stagingIpaymu.id);
    console.log('Staging iPaymu Projects count:', stagingProjects.length);
    if (stagingProjects.length > 0) {
      console.log('Staging Projects details:', stagingProjects.map(p => ({ id: p.id, name: p.name, service_id: p.service_id, status: p.status })));
    }
  }
}

checkData().catch(console.error);
