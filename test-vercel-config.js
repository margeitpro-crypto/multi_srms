// Test Vercel configuration
console.log('Testing Vercel configuration...');

// Check if we're in a Vercel environment
const isVercel = !!process.env.VERCEL;
console.log('Running in Vercel environment:', isVercel);

// Check for required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
];

console.log('Checking environment variables...');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✓ ${envVar}: Set`);
  } else {
    console.log(`✗ ${envVar}: Not set`);
  }
});

// Check if dist folder exists
import { existsSync } from 'fs';
import { join } from 'path';

const distPath = join(process.cwd(), 'dist');
const distExists = existsSync(distPath);
console.log('Dist folder exists:', distExists);

if (distExists) {
  const indexPath = join(distPath, 'index.html');
  const indexExists = existsSync(indexPath);
  console.log('index.html exists:', indexExists);
}

console.log('Vercel configuration test complete.');