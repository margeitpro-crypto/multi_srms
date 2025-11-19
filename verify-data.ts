import { query } from './backend/services/dbService';

async function verifyData() {
  try {
    console.log('Verifying data in database...');
    
    // Check the school
    const schoolResult = await query('SELECT * FROM schools WHERE id = 37');
    console.log('School in database:', schoolResult.rows[0]);
    
    // Check the user
    const userResult = await query('SELECT * FROM users WHERE id = 15');
    console.log('User in database:', userResult.rows[0]);
    
    console.log('Verification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyData();