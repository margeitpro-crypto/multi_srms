import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function checkSchools() {
  console.log('Checking schools in database...');
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if schools table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'schools'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Schools table does not exist');
      return;
    }
    
    console.log('✅ Schools table exists');
    
    // Get all schools
    const res = await client.query('SELECT * FROM schools ORDER BY id');
    console.log('Current schools:');
    console.log(res.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkSchools();