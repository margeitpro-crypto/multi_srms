import { query } from '../backend/services/dbService';

async function initializeAcademicYears() {
  try {
    console.log('Initializing academic years...');
    
    // Insert default academic years
    const defaultYears = [
      { year: 2080, is_active: true },
      { year: 2081, is_active: true },
      { year: 2082, is_active: true },
      { year: 2083, is_active: true },
      { year: 2084, is_active: true }
    ];
    
    for (const academicYear of defaultYears) {
      try {
        // Check if the year already exists
        const existingYear = await query(
          'SELECT id FROM academic_years WHERE year = $1',
          [academicYear.year]
        );
        
        if (existingYear.rows.length === 0) {
          // Insert the year if it doesn't exist
          await query(
            'INSERT INTO academic_years (year, is_active) VALUES ($1, $2)',
            [academicYear.year, academicYear.is_active]
          );
          console.log(`Inserted academic year ${academicYear.year}`);
        } else {
          console.log(`Academic year ${academicYear.year} already exists`);
        }
      } catch (error) {
        console.error(`Error inserting academic year ${academicYear.year}:`, error);
      }
    }
    
    console.log('Academic years initialization completed');
  } catch (error) {
    console.error('Error initializing academic years:', error);
  }
}

// Run the initialization
initializeAcademicYears().catch(console.error);