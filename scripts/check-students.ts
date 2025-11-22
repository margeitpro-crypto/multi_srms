import { query } from '../backend/services/dbService';

async function checkStudents() {
  try {
    console.log('Checking students in database...');
    
    const result = await query('SELECT * FROM students');
    console.log(`Found ${result.rows.length} students:`);
    
    result.rows.forEach(student => {
      console.log(`- ID: ${student.id}, System ID: ${student.student_system_id}, Name: ${student.name}, School ID: ${student.school_id}`);
    });
    
  } catch (error) {
    console.error('Error checking students:', error);
  }
}

checkStudents();