import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Client } from 'pg';

// Load environment variables
dotenv.config();

async function updateUserPasswords() {
  console.log('Updating user passwords...');
  
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Update passwords for existing users
    const usersToUpdate = [
      {
        email: 'margeitpro@gmail.com',
        password: 'admin123'
      },
      {
        email: 'tsguideman@gmail.com',
        password: 'school123'
      },
      {
        email: 'itmsinghyt@gmail.com',
        password: 'school123'
      },
      {
        email: 'office@sunrise.edu.np',
        password: 'school123'
      },
      {
        email: 'director@riverside.edu.np',
        password: 'school123'
      }
    ];
    
    console.log('Updating user passwords...');
    for (const user of usersToUpdate) {
      try {
        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(user.password, saltRounds);
        
        await client.query(
          `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
          [password_hash, user.email]
        );
        console.log(`  ✅ Password updated for user ${user.email}`);
      } catch (error) {
        console.error(`  ❌ Error updating password for user ${user.email}:`, error);
      }
    }
    
    console.log('\n✅ User passwords updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updateUserPasswords();