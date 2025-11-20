import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '', // Empty password as per project configuration
  database: process.env.DB_NAME || 'multi_srms',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    
    // Test student insert
    console.log('Testing student insert...');
    const insertResult = await client.query(
      `INSERT INTO students (
        student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
        academic_year, symbol_no, alph, registration_id, dob_bs, father_name,
        mother_name, mobile_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        'S1234567890', 1, 'Test Student', '2005-04-14',
        'Male', '11', '101', '',
        2082, 'SYM001', 'A', 'REG001',
        '2062-01-01', 'Test Father', 'Test Mother', '9800000001'
      ]
    );
    
    console.log('Insert result:', insertResult.rows[0]);
    
    client.release();
    console.log('Database test completed successfully');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await pool.end();
  }
}

testDbConnection();