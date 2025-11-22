import { query } from '../backend/services/dbService';

async function addSchool() {
  try {
    console.log('Adding a test school to the database...');
    
    const result = await query(
      `INSERT INTO schools (
        iemis_code, name, logo_url, municipality, estd, prepared_by, checked_by,
        head_teacher_name, head_teacher_contact, email, status, subscription_plan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        'TEST123456',
        'Test School',
        'https://picsum.photos/seed/school/100',
        'Test Municipality',
        '2020 BS',
        'Test Prepared By',
        'Test Checked By',
        'Test Head Teacher',
        '9800000000',
        'test@example.com',
        'Active',
        'Basic'
      ]
    );
    
    console.log('School added successfully:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error adding school:', error);
  }
}

addSchool();