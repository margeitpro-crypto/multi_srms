import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function checkUsers() {
  console.log('Checking users in database...');
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Get all users
    const res = await client.query('SELECT id, iemis_code, email, role, school_id FROM users ORDER BY id');
    console.log('Current users:');
    console.log(res.rows);
    
    // Check if we have the sample users mentioned in the task
    const sampleUsers = [
      { iemis_code: '9827792360', email: 'margeitpro@gmail.com', role: 'admin' },
      { iemis_code: '9827792361', email: 'tsguideman@gmail.com', role: 'school' },
      { iemis_code: '9827792362', email: 'itmsinghyt@gmail.com', role: 'school' },
      { iemis_code: '9827792363', email: 'office@sunrise.edu.np', role: 'school' },
      { iemis_code: '9827792364', email: 'director@riverside.edu.np', role: 'school' }
    ];
    
    console.log('\nChecking for sample users:');
    for (const sampleUser of sampleUsers) {
      const userExists = res.rows.some(user => 
        user.iemis_code === sampleUser.iemis_code && 
        user.email === sampleUser.email && 
        user.role === sampleUser.role
      );
      
      console.log(`  ${sampleUser.iemis_code} (${sampleUser.email}) - ${userExists ? '✅ Found' : '❌ Not found'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkUsers();