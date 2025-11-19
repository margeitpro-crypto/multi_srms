import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Testing database connection...');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'multi_srms',
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL database');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✓ Database query test successful:', result.rows[0]);
    
    await client.end();
  } catch (error) {
    console.log('✗ Database connection failed:', (error as Error).message);
    console.log('This is expected if PostgreSQL is not installed or running.');
  }
}

testConnection();