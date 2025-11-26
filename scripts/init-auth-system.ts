import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function initAuthSystem() {
  console.log('Initializing authentication system...');
  
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
    
    // Create users table if it doesn't exist
    console.log('Creating users table...');
    try {
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          iemis_code VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,  -- Email is now optional
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL,
          -- A user can be associated with a specific school (e.g., a school account).
          -- ON DELETE SET NULL: If a school is deleted, the associated user account is not deleted, 
          -- but its link to the school is severed. This prevents accidental user deletion.
          school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('  ✅ Created users table');
    } catch (error: any) {
      if (error.code === '42P07') { // Duplicate table error
        console.log('  ℹ️  users table already exists');
      } else {
        throw error;
      }
    }
    
    // Create indexes if they don't exist
    console.log('Creating indexes...');
    try {
      await client.query('CREATE INDEX idx_users_school_id ON users(school_id)');
      console.log('  ✅ Created index on users.school_id');
    } catch (error: any) {
      if (error.code === '42P07') { // Duplicate table error
        console.log('  ℹ️  Index on users.school_id already exists');
      } else {
        throw error;
      }
    }
    
    // Create triggers for updated_at if they don't exist
    console.log('Creating triggers...');
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      
      await client.query(`
        CREATE OR REPLACE FUNCTION apply_updated_at_trigger(table_name TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE 'CREATE TRIGGER update_' || table_name || '_updated_at
                   BEFORE UPDATE ON ' || table_name || '
                   FOR EACH ROW
                   EXECUTE FUNCTION update_updated_at_column();';
        END;
        $$ language 'plpgsql'
      `);
      
      await client.query('SELECT apply_updated_at_trigger(\'users\')');
      console.log('  ✅ Created triggers for users table');
    } catch (error) {
      console.log('  ℹ️  Triggers may already exist');
    }
    
    // Insert sample users
    console.log('Inserting sample users...');
    const sampleUsers = [
      {
        id: 1,
        iemis_code: 'ADMIN001',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        school_id: null
      },
      {
        id: 2,
        iemis_code: 'SCHOOL001',
        email: 'school1@example.com',
        password: 'school123',
        role: 'school',
        school_id: 1
      },
      {
        id: 3,
        iemis_code: 'SCHOOL002',
        email: 'school2@example.com',
        password: 'school123',
        role: 'school',
        school_id: 2
      }
    ];
    
    for (const user of sampleUsers) {
      try {
        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(user.password, saltRounds);
        
        await client.query(
          `INSERT INTO users (id, iemis_code, email, password_hash, role, school_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT (iemis_code) DO UPDATE SET
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             school_id = EXCLUDED.school_id,
             updated_at = NOW()`,
          [user.id, user.iemis_code, user.email, password_hash, user.role, user.school_id]
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
    
    console.log('\n✅ Authentication system initialization completed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

initAuthSystem();