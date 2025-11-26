import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function initSampleUsers() {
  console.log('Initializing sample users in database...');
  
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
      console.log('❌ Users table does not exist. Please run database migrations first.');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Sample users data
    const sampleUsers = [
      {
        id: 1,
        iemis_code: '9827792360',
        email: 'margeitpro@gmail.com',
        password_hash: '$2b$10$GSNEyz4rvcimZFWn1HAo/eIqeyjikyyNDlBei4vcUdkUX8aH89SyS',
        role: 'admin',
        school_id: null
      },
      {
        id: 2,
        iemis_code: '9827792361',
        email: 'tsguideman@gmail.com',
        password_hash: 'pbkdf2_sha256$260000$saltsample$hashsample1',
        role: 'school',
        school_id: 1
      },
      {
        id: 3,
        iemis_code: '9827792362',
        email: 'itmsinghyt@gmail.com',
        password_hash: 'pbkdf2_sha256$260000$saltsample$hashsample2',
        role: 'school',
        school_id: 2
      },
      {
        id: 4,
        iemis_code: '9827792363',
        email: 'office@sunrise.edu.np',
        password_hash: 'pbkdf2_sha256$260000$saltsample$hashsample3',
        role: 'school',
        school_id: 3
      },
      {
        id: 5,
        iemis_code: '9827792364',
        email: 'director@riverside.edu.np',
        password_hash: 'pbkdf2_sha256$260000$saltsample$hashsample4',
        role: 'school',
        school_id: 4
      }
    ];
    
    // Insert sample users
    console.log('Inserting sample users...');
    for (const user of sampleUsers) {
      try {
        const res = await client.query(
          `INSERT INTO users (id, iemis_code, email, password_hash, role, school_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (iemis_code) DO UPDATE SET
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             school_id = EXCLUDED.school_id,
             updated_at = NOW()`,
          [user.id, user.iemis_code, user.email, user.password_hash, user.role, user.school_id]
        );
        console.log(`  ✅ User ${user.iemis_code} inserted/updated`);
      } catch (error) {
        console.error(`  ❌ Error inserting user ${user.iemis_code}:`, error);
      }
    }
    
    // Verify users were inserted
    const res = await client.query('SELECT id, iemis_code, email, role, school_id FROM users ORDER BY id');
    console.log('\nCurrent users in database:');
    console.log(res.rows);
    
    console.log('\n✅ Sample users initialization completed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

initSampleUsers();