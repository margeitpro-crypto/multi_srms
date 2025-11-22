import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create a connection pool for the test database
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'multi_srms_test_user',
  password: process.env.DB_PASS || 'test_password_123',
  database: process.env.DB_NAME || 'multi_srms_test',
});

// Function to generate a hashed password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Function to sanitize user data
async function sanitizeUsers() {
  console.log('Sanitizing user data...');
  
  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, email, iemis_code FROM users');
    const users = usersResult.rows;
    
    // Update each user with sanitized data
    for (const user of users) {
      // Generate a fake email based on user ID
      const fakeEmail = `testuser${user.id}@example.com`;
      
      // Generate a default password hash (password: "TestPass123!")
      const defaultPasswordHash = await hashPassword('TestPass123!');
      
      // Update user record
      await pool.query(
        'UPDATE users SET email = $1, password_hash = $2 WHERE id = $3',
        [fakeEmail, defaultPasswordHash, user.id]
      );
      
      console.log(`Sanitized user ${user.id}: ${user.iemis_code} -> ${fakeEmail}`);
    }
    
    console.log(`Sanitized ${users.length} users.`);
  } catch (error) {
    console.error('Error sanitizing users:', error);
  }
}

// Function to sanitize student data
async function sanitizeStudents() {
  console.log('Sanitizing student data...');
  
  try {
    // Update student phone numbers to a test value
    const result = await pool.query(
      "UPDATE students SET mobile_no = '9800000000' WHERE mobile_no IS NOT NULL"
    );
    
    console.log(`Sanitized phone numbers for ${result.rowCount} students.`);
  } catch (error) {
    console.error('Error sanitizing students:', error);
  }
}

// Function to sanitize school data
async function sanitizeSchools() {
  console.log('Sanitizing school data...');
  
  try {
    // Update school emails and contact information
    const result = await pool.query(
      "UPDATE schools SET email = 'test@school.example.com', head_teacher_contact = '9800000000' WHERE email IS NOT NULL OR head_teacher_contact IS NOT NULL"
    );
    
    console.log(`Sanitized contact information for ${result.rowCount} schools.`);
  } catch (error) {
    console.error('Error sanitizing schools:', error);
  }
}

// Main function to run all sanitization tasks
async function sanitizeAllData() {
  console.log('Starting data sanitization process...');
  
  try {
    await sanitizeUsers();
    await sanitizeStudents();
    await sanitizeSchools();
    
    console.log('Data sanitization completed successfully!');
  } catch (error) {
    console.error('Error during sanitization:', error);
  } finally {
    await pool.end();
  }
}

// Run the sanitization
sanitizeAllData();