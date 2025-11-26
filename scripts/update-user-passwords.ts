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
        iemis_code: '9827792360',
        password: 'admin123'
      },
      {
        iemis_code: '9827792361',
        password: 'school123'
      },
      {
        iemis_code: '9827792362',
        password: 'school123'
      },
      {
        iemis_code: '9827792363',
        password: 'school123'
      },
      {
        iemis_code: '9827792364',
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
          `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE iemis_code = $2`,
          [password_hash, user.iemis_code]
        );
        console.log(`  ✅ Password updated for user ${user.iemis_code}`);
      } catch (error) {
        console.error(`  ❌ Error updating password for user ${user.iemis_code}:`, error);
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