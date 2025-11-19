import { schoolsService, studentsService, subjectsService } from '../backend/services/dbService';

async function checkDatabaseData() {
  try {
    console.log('Checking data in database...');
    
    // Check schools
    console.log('\n--- Schools ---');
    const schools = await schoolsService.getAllSchools();
    console.log(`Found ${schools.length} schools:`);
    schools.forEach(school => {
      console.log(`- ${school.id}: ${school.name} (${school.status})`);
    });
    
    // Check students
    console.log('\n--- Students ---');
    const students = await studentsService.getAllStudents();
    console.log(`Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.id}: ${student.name} (School ID: ${student.school_id}, Grade: ${student.grade})`);
    });
    
    // Check subjects
    console.log('\n--- Subjects ---');
    const subjects = await subjectsService.getAllSubjects();
    console.log(`Found ${subjects.length} subjects:`);
    subjects.forEach(subject => {
      console.log(`- ${subject.id}: ${subject.name} (Grade: ${subject.grade})`);
    });
    
  } catch (error) {
    console.error('Error checking database data:', error);
  }
}

checkDatabaseData();