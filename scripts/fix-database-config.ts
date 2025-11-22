import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Database Configuration Fix Script');
console.log('====================================');

// Fix .env file
const envPath = path.join(__dirname, '..', '.env');

console.log('\n1. Checking .env file...');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Current content:');
  console.log(envContent);
} else {
  console.log('.env file not found, will create a new one');
}

// Ensure we have the correct database configuration
const dbConfigLines = [
  '# Database Configuration',
  'DB_HOST=localhost',
  'DB_PORT=5432',
  'DB_NAME=multi_srms_new',
  'DB_USER=postgres',
  'DB_PASS=',  // Empty password as per project requirements
  'DB_SSL=false',
  '',
  '# API Configuration',
  'PORT=3002',
  'VITE_API_URL=http://localhost:3002'
];

// Update the .env file
const newEnvContent = dbConfigLines.join('\n');
fs.writeFileSync(envPath, newEnvContent);

console.log('\n✅ Updated .env file with correct configuration:');
console.log(newEnvContent);

// Fix config/db.ts file
const configPath = path.join(__dirname, '..', 'config', 'db.ts');

console.log('\n2. Checking database configuration file...');
if (fs.existsSync(configPath)) {
  let configContent = fs.readFileSync(configPath, 'utf8');
  console.log('Current content:');
  console.log(configContent);
} else {
  console.log('config/db.ts file not found');
}

// Ensure we're using the correct environment variable
const updatedConfigContent = `import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load the appropriate environment file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '', // Empty password as per project configuration
  database: process.env.DB_NAME || 'multi_srms_new',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export default pool;
`;

fs.writeFileSync(configPath, updatedConfigContent);

console.log('\n✅ Updated database configuration file:');
console.log(updatedConfigContent);

console.log('\n🎉 Database configuration fix completed!');
console.log('\nNext steps:');
console.log('1. Make sure PostgreSQL is installed and running on your system');
console.log('2. Create a PostgreSQL database named "multi_srms_new"');
console.log('3. Ensure the "postgres" user exists with no password');
console.log('4. Run "npm run init:db" to initialize the database schema');
console.log('5. Run "npm run test-db-connection" to verify the connection');