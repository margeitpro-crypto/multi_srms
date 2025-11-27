import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'multi_srms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Sample admin user
const sampleAdmin = {
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

async function initAuthSystem() {
  const client = new Client(dbConfig);
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Users table does not exist. Creating it...');
      
      // Create users table without iemis_code
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role user_role NOT NULL,
          school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Users table already exists');
    }
    
    // Check if sample admin user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [sampleAdmin.email]
    );
    
    if (userCheck.rows.length === 0) {
      console.log('Sample admin user does not exist. Creating it...');
      
      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(sampleAdmin.password, saltRounds);
      
      // Insert sample admin user
      await client.query(
        `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
        [sampleAdmin.email, passwordHash, sampleAdmin.role]
      );
      
      console.log('✅ Sample admin user created successfully');
    } else {
      console.log('✅ Sample admin user already exists');
    }
    
    console.log('\n🎉 Authentication system initialized successfully!');
    console.log(`   Admin user: ${sampleAdmin.email}`);
    console.log(`   Admin password: ${sampleAdmin.password}`);
    console.log('\n⚠️  Remember to change the admin password after first login!');
    
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

// Run the function
initAuthSystem();
