// Simple test script to verify Vercel configuration
console.log('Testing Vercel configuration...');

// Check if required environment variables are set
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('Warning: Missing environment variables:', missingEnvVars);
  console.log('Please set these environment variables in your Vercel project settings.');
} else {
  console.log('✓ All required environment variables are set');
}

// Check if we're in a Vercel environment
if (process.env.VERCEL) {
  console.log('✓ Running in Vercel environment');
} else {
  console.log('ℹ Not running in Vercel environment (this is fine for local testing)');
}

console.log('Vercel configuration test complete.');