import { query } from '../backend/services/dbService';

async function checkSchools() {
  try {
    console.log('Checking schools in database...');
    
    const result = await query('SELECT * FROM schools');
    console.log(`Found ${result.rows.length} schools:`);
    
    result.rows.forEach(school => {
      console.log(`- ID: ${school.id}, IEMIS Code: ${school.iemis_code}, Name: ${school.name}`);
    });
    
  } catch (error) {
    console.error('Error checking schools:', error);
  }
}

checkSchools();