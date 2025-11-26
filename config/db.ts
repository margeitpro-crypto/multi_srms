import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load the appropriate environment file
const envMode = process.env.APP_ENV || process.env.NODE_ENV;
const envFile = process.env.ENV_FILE
  || (envMode === 'test'
    ? '.env.test'
    : envMode === 'production'
    ? '.env.production'
    : envMode === 'supabase'
    ? '.env.supabase'
    : '.env.supabase'); // Default to Supabase environment
dotenv.config({ path: envFile });

const basePoolOptions = {
  max: parseInt(process.env.DB_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
};

// Always use Supabase database connection
if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is required. Please check your .env.supabase configuration.');
}

const poolConfig: PoolConfig = {
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
  ...basePoolOptions
};

// Create a PostgreSQL connection pool (Supabase uses PostgreSQL)
const pool = new Pool(poolConfig);

export default pool;