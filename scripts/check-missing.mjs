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

async function checkMissingData() {
  console.log('--- Checking Staging Email Blast Reports ---');
  const { data: stagingReports } = await stagingClient.from('email_blast_reports').select('id, campaign_name, project_id');
  console.log(`Staging has ${stagingReports?.length} reports.`);

  if (stagingReports && stagingReports.length > 0) {
    // Check which projects these belong to
    const projectIds = [...new Set(stagingReports.map(r => r.project_id))];
    const { data: stagingProjects } = await stagingClient.from('projects').select('id, name, client_id, service_id').in('id', projectIds);
    console.log(`These reports belong to ${stagingProjects?.length} projects in staging.`);
    
    // Check clients
    const clientIds = [...new Set(stagingProjects?.map(p => p.client_id) || [])];
    const { data: stagingClients } = await stagingClient.from('clients').select('id, name').in('id', clientIds);
    console.log(`These projects belong to clients:`, stagingClients?.map(c => c.name));

    // Check services
    const serviceIds = [...new Set(stagingProjects?.map(p => p.service_id) || [])];
    const { data: stagingServices } = await stagingClient.from('services').select('id, name').in('id', serviceIds);
    console.log(`These projects belong to services:`, stagingServices?.map(s => s.name));
  }

  console.log('\n--- Checking Production Email Blast Reports ---');
  const { data: productionReports } = await productionClient.from('email_blast_reports').select('id, campaign_name');
  console.log(`Production has ${productionReports?.length} reports.`);
}

checkMissingData().catch(console.error);
