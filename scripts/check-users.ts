import { Client } from 'pg';
import dotenv from 'dotenv';

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

// Sample users to check/create
const sampleUsers = [
  { email: 'margeitpro@gmail.com', password: 'securePass123', role: 'admin' },
  { email: 'tsguideman@gmail.com', password: 'securePass123', role: 'school' },
  { email: 'itmsinghyt@gmail.com', password: 'securePass123', role: 'school' },
  { email: 'office@sunrise.edu.np', password: 'securePass123', role: 'school' },
  { email: 'director@riverside.edu.np', password: 'securePass123', role: 'school' }
];

async function checkUsers() {
  const client = new Client(dbConfig);
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');
    
    // Check existing users
    const res = await client.query('SELECT id, email, role, school_id FROM users ORDER BY id');
    console.log('\nExisting users:');
    res.rows.forEach(user => {
      console.log(`  ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    // Check if sample users exist
    console.log('\nChecking sample users:');
    for (const sampleUser of sampleUsers) {
      const userRes = await client.query(
        'SELECT id, email, role FROM users WHERE email = $1', 
        [sampleUser.email]
      );
      
      const userExists = userRes.rows.some(user => 
        user.email === sampleUser.email
      );
      
      console.log(`  ${sampleUser.email} (${sampleUser.role}) - ${userExists ? '✅ Found' : '❌ Not found'}`);
      
      // Create user if it doesn't exist
      if (!userExists) {
        console.log(`    Creating user...`);
        // In a real implementation, you would hash the password here
        await client.query(
          `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)`,
          [sampleUser.email, sampleUser.password, sampleUser.role]
        );
        console.log(`    ✅ User created successfully`);
      }
    }
    
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

// Run the function
checkUsers();