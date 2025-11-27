import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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

// Sample users to insert
const sampleUsers = [
  {
    id: 1,
    email: 'margeitpro@gmail.com',
    password: 'securePass123',
    role: 'admin',
    school_id: null
  },
  {
    id: 2,
    email: 'tsguideman@gmail.com',
    password: 'securePass123',
    role: 'school',
    school_id: 1
  },
  {
    id: 3,
    email: 'itmsinghyt@gmail.com',
    password: 'securePass123',
    role: 'school',
    school_id: 2
  },
  {
    id: 4,
    email: 'office@sunrise.edu.np',
    password: 'securePass123',
    role: 'school',
    school_id: 3
  },
  {
    id: 5,
    email: 'director@riverside.edu.np',
    password: 'securePass123',
    role: 'school',
    school_id: 4
  }
];

async function initSampleUsers() {
  const client = new Client(dbConfig);
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');
    
    // Hash passwords and insert users
    console.log('Inserting sample users...');
    for (const user of sampleUsers) {
      try {
        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(user.password, saltRounds);
        
        // Insert user
        await client.query(
          `INSERT INTO users (id, email, password_hash, role, school_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             school_id = EXCLUDED.school_id,
             updated_at = NOW()`,
          [user.id, user.email, passwordHash, user.role, user.school_id]
        );
        console.log(`  ✅ User ${user.email} inserted/updated`);
      } catch (error) {
        console.error(`  ❌ Error inserting user ${user.email}:`, error);
      }
    }
    
    // Verify users were inserted
    console.log('\nVerifying sample users:');
    const res = await client.query('SELECT id, email, role, school_id FROM users ORDER BY id');
    res.rows.forEach(user => {
      console.log(`  ${user.email} (${user.role}) - ID: ${user.id}`);
    });
    
    console.log('\n🎉 Sample users initialized successfully!');
    
  } catch (err) {
    console.error('Database error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

// Run the function
initSampleUsers();