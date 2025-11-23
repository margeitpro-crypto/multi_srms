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
    : '.env');
dotenv.config({ path: envFile });

const basePoolOptions = {
  max: parseInt(process.env.DB_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
};

const poolConfig: PoolConfig = process.env.SUPABASE_DB_URL
  ? {
      connectionString: process.env.SUPABASE_DB_URL,
      ssl: { rejectUnauthorized: false },
      ...basePoolOptions
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'root', // Default to 'root' password
      database: process.env.DB_NAME || 'multi_srms_new',
      // Enable SSL for Supabase connections when set via individual vars
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      ...basePoolOptions
    };

// Create a PostgreSQL connection pool
const pool = new Pool(poolConfig);

export default pool;
