import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing database connection with the following configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || '5432');
console.log('Database:', process.env.DB_NAME || 'multi_srms');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password:', process.env.DB_PASSWORD || '(empty)');

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'multi_srms',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('Successfully connected to database!');
    
    console.log('Testing a simple query...');
    const result = await client.query('SELECT NOW() as now');
    console.log('Query result:', result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection();