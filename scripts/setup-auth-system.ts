import dotenv from 'dotenv';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function setupAuthSystem() {
  console.log('Setting up authentication system...');
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create ENUM types if they don't exist
    console.log('Creating ENUM types...');
    try {
      await client.query('CREATE TYPE user_role AS ENUM (\'admin\', \'school\')');
      console.log('  ✅ Created user_role ENUM');
    } catch (error: any) {
      if (error.code === '42710') { // Duplicate object error
        console.log('  ℹ️  user_role ENUM already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await client.query('CREATE TYPE student_gender AS ENUM (\'Male\', \'Female\', \'Other\')');
      console.log('  ✅ Created student_gender ENUM');
    } catch (error: any) {
      if (error.code === '42710') { // Duplicate object error
        console.log('  ℹ️  student_gender ENUM already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await client.query('CREATE TYPE school_status AS ENUM (\'Active\', \'Inactive\')');
      console.log('  ✅ Created school_status ENUM');
    } catch (error: any) {
      if (error.code === '42710') { // Duplicate object error
        console.log('  ℹ️  school_status ENUM already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await client.query('CREATE TYPE subscription_plan AS ENUM (\'Basic\', \'Pro\', \'Enterprise\')');
      console.log('  ✅ Created subscription_plan ENUM');
    } catch (error: any) {
      if (error.code === '42710') { // Duplicate object error
        console.log('  ℹ️  subscription_plan ENUM already exists');
      } else {
        throw error;
      }
    }
    
    // Create tables if they don't exist
    console.log('Creating tables...');
    
    // Create schools table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        iemis_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        logo_url TEXT,
        municipality VARCHAR(255) NOT NULL,
        estd VARCHAR(50),
        prepared_by VARCHAR(255),
        checked_by VARCHAR(255),
        head_teacher_name VARCHAR(255),
        head_teacher_contact VARCHAR(50),
        email VARCHAR(255) UNIQUE,
        status school_status DEFAULT 'Inactive',
        subscription_plan subscription_plan DEFAULT 'Basic',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ Created/verified schools table');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        iemis_code VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ Created/verified users table');
    
    // Create some sample schools
    console.log('Creating sample schools...');
    const sampleSchools = [
      { id: 1, iemis_code: 'SCH001', name: 'Test School 1', municipality: 'Test Municipality 1' },
      { id: 2, iemis_code: 'SCH002', name: 'Test School 2', municipality: 'Test Municipality 2' },
      { id: 3, iemis_code: 'SCH003', name: 'Sunrise Academy', municipality: 'Sunrise Municipality' },
      { id: 4, iemis_code: 'SCH004', name: 'Riverside College', municipality: 'Riverside Municipality' }
    ];
    
    for (const school of sampleSchools) {
      try {
        await client.query(
          `INSERT INTO schools (id, iemis_code, name, municipality, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             iemis_code = EXCLUDED.iemis_code,
             name = EXCLUDED.name,
             municipality = EXCLUDED.municipality,
             updated_at = NOW()`,
          [school.id, school.iemis_code, school.name, school.municipality]
        );
        console.log(`  ✅ School ${school.name} inserted/updated`);
      } catch (error) {
        console.error(`  ❌ Error inserting school ${school.name}:`, error);
      }
    }
    
    // Insert sample users
    console.log('Inserting sample users...');
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
        password_hash: '$2b$10$GSNEyz4rvcimZFWn1HAo/eIqeyjikyyNDlBei4vcUdkUX8aH89SyS',
        role: 'school',
        school_id: 1
      },
      {
        id: 3,
        iemis_code: '9827792362',
        email: 'itmsinghyt@gmail.com',
        password_hash: '$2b$10$GSNEyz4rvcimZFWn1HAo/eIqeyjikyyNDlBei4vcUdkUX8aH89SyS',
        role: 'school',
        school_id: 2
      },
      {
        id: 4,
        iemis_code: '9827792363',
        email: 'office@sunrise.edu.np',
        password_hash: '$2b$10$GSNEyz4rvcimZFWn1HAo/eIqeyjikyyNDlBei4vcUdkUX8aH89SyS',
        role: 'school',
        school_id: 3
      },
      {
        id: 5,
        iemis_code: '9827792364',
        email: 'director@riverside.edu.np',
        password_hash: '$2b$10$GSNEyz4rvcimZFWn1HAo/eIqeyjikyyNDlBei4vcUdkUX8aH89SyS',
        role: 'school',
        school_id: 4
      }
    ];
    
    for (const user of sampleUsers) {
      try {
        await client.query(
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
    
    console.log('\n✅ Authentication system setup completed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setupAuthSystem();