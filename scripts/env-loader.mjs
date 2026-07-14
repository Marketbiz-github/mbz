/**
 * scripts/env-loader.mjs
 * Shared helper to load the correct .env file based on --env flag.
 * 
 * Usage: node scripts/migrate-remote.mjs --env production
 * Default: loads .env.local (staging)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

export function loadEnv() {
  const args = process.argv.slice(2);
  const envFlagIndex = args.indexOf('--env');
  const envName = envFlagIndex !== -1 ? args[envFlagIndex + 1] : null;

  let envFile;
  let label;

  if (envName === 'production') {
    envFile = '.env.production';
    label = '🔴 PRODUCTION';
  } else if (envName === 'staging') {
    envFile = '.env.staging';
    label = '🟡 STAGING';
  } else {
    // Default: .env.local (staging/local dev)
    envFile = '.env.local';
    label = '🟢 LOCAL (staging)';
  }

  const envPath = path.join(rootDir, envFile);
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(`❌ Error: Missing env vars in ${envFile}`);
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`📌 Environment: ${label}`);
  console.log(`📌 Target: ${supabaseUrl}`);
  console.log('');

  return { supabaseUrl, supabaseServiceKey, envName: envName || 'local', isProduction: envName === 'production' };
}

/**
 * Prompt user for confirmation (for dangerous production operations)
 */
export async function confirmProduction(action) {
  const readline = await import('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  return new Promise((resolve) => {
    rl.question(`\n⚠️  You are about to ${action} on PRODUCTION. Type "yes" to confirm: `, (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled.');
        process.exit(0);
      }
      resolve(true);
    });
  });
}
