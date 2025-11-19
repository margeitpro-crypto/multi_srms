import { Client } from 'pg';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
dotenv.config();

async function createDatabase() {
  // Connect to PostgreSQL server (without specifying a database)
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to the default postgres database
  });

  try {
    // Connect to the PostgreSQL server
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if the database already exists
    const dbName = process.env.DB_NAME || 'multi_srms';
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheckResult.rowCount === 0) {
      // Database doesn't exist, create it
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully`);
    } else {
      console.log(`Database '${dbName}' already exists`);
    }

    // Close the connection
    await client.end();
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error.message);
    
    // Check if PostgreSQL is installed
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('PostgreSQL is installed but connection failed. Please check your PostgreSQL configuration.');
    } catch (execError) {
      console.log('PostgreSQL is not installed or not in PATH.');
      console.log('Please install PostgreSQL and ensure it is running before running this script.');
      console.log('You can download PostgreSQL from: https://www.postgresql.org/download/');
    }
    
    await client.end();
    process.exit(1);
  }
}

createDatabase();