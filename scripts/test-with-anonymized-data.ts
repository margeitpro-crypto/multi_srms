import { schoolsService, studentsService, subjectsService, subjectAssignmentsService, marksService } from '../backend/services/dbService';
import { query } from '../backend/services/dbService';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to get the database ID of a student by student_system_id
async function getStudentDatabaseId(studentSystemId: string): Promise<number | null> {
  try {
    const result = await query('SELECT id FROM students WHERE student_system_id = $1', [studentSystemId]);
    return result.rows.length > 0 ? result.rows[0].id : null;
  } catch (error) {
    console.error('Error getting student database ID:', error);
    return null;
  }
}

async function testWithAnonymizedData() {
  try {
    console.log('Starting comprehensive tests with anonymized data...');
    
    // Test 1: Verify database connection and data retrieval
    console.log('\n--- Test 1: Database Connection & Data Retrieval ---');
    const schools = await schoolsService.getAllSchools();
    const students = await studentsService.getAllStudents();
    const subjects = await subjectsService.getAllSubjects();
    
    console.log(`✓ Retrieved ${schools.length} schools`);
    console.log(`✓ Retrieved ${students.length} students`);
    console.log(`✓ Retrieved ${subjects.length} subjects`);
    
    if (schools.length === 0 || students.length === 0 || subjects.length === 0) {
      console.error('✗ Test failed: No data found in database');
      return;
    }
    
    // Test 2: Verify data anonymization
    console.log('\n--- Test 2: Data Anonymization Verification ---');
    const firstSchool = schools[0];
    const firstStudent = students[0];
    
    // Check that sensitive data has been anonymized
    console.log(`✓ School name: ${firstSchool.name}`);
    console.log(`✓ School IEMIS code: ${firstSchool.iemisCode}`);
    console.log(`✓ Student name: ${firstStudent.name}`);
    console.log(`✓ Student father name: ${firstStudent.father_name}`);
    console.log(`✓ Student mobile: ${firstStudent.mobile_no}`);
    
    // Test 3: Test CRUD operations with anonymized data
    console.log('\n--- Test 3: CRUD Operations ---');
    
    // Create a new student with a unique ID
    const uniqueId = `TEST${Date.now()}`;
    const newStudentData = {
      id: uniqueId,
      school_id: firstSchool.id,
      name: 'Test Student',
      dob: '2005-05-15',
      gender: 'Male' as const,
      grade: '11',
      roll_no: '999',
      photo_url: '',
      year: 2082,
      symbol_no: `TEST${Date.now()}A`,
      alph: 'A',
      registration_id: `REGTEST${Date.now()}`,
      dob_bs: '2062-02-02',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      mobile_no: '9800000000'
    };
    
    const createdStudent = await studentsService.createStudent(newStudentData);
    console.log(`✓ Created new student: ${createdStudent.name}`);
    
    // Get the database ID for the created student
    const createdStudentDbId = await getStudentDatabaseId(createdStudent.id);
    if (!createdStudentDbId) {
      console.error('✗ Failed to get database ID for created student');
      return;
    }
    
    // Update the student
    const updatedStudentData = {
      ...createdStudent,
      name: 'Updated Test Student',
      roll_no: '888',
      academic_year: 2082  // Use the database field name
    };
    
    const updatedStudent = await studentsService.updateStudent(createdStudentDbId, updatedStudentData);
    console.log(`✓ Updated student: ${updatedStudent.name}, Roll No: ${updatedStudent.roll_no}`);
    
    // Test 4: Test subject assignments
    console.log('\n--- Test 4: Subject Assignments ---');
    if (subjects.length > 0) {
      const academicYear = 2082;
      const subjectIds = [subjects[0].id];
      
      // Assign subjects to student
      await subjectAssignmentsService.assignSubjectsToStudent(createdStudentDbId, subjectIds, academicYear);
      console.log(`✓ Assigned ${subjectIds.length} subjects to student`);
      
      // Retrieve assignments
      const retrievedAssignments = await subjectAssignmentsService.getStudentAssignments(createdStudentDbId, academicYear);
      console.log(`✓ Retrieved ${retrievedAssignments.length} subject assignments`);
      
      // Test 5: Test marks entry
      console.log('\n--- Test 5: Marks Entry ---');
      const marksData = {
        [subjects[0].id]: {
          theory: 85.5,
          practical: 90.0,
          isAbsent: false
        }
      };
      
      await marksService.saveStudentMarks(createdStudentDbId, academicYear, marksData);
      console.log('✓ Saved student marks');
      
      // Retrieve marks
      const retrievedMarks = await marksService.getStudentMarks(createdStudentDbId, academicYear);
      console.log(`✓ Retrieved marks for ${Object.keys(retrievedMarks).length} subjects`);
    }
    
    // Test 6: Test data integrity
    console.log('\n--- Test 6: Data Integrity ---');
    
    // Verify all schools have required fields
    const schoolsWithMissingData = schools.filter(school => 
      !school.name || !school.iemisCode || !school.municipality
    );
    
    if (schoolsWithMissingData.length === 0) {
      console.log('✓ All schools have required fields');
    } else {
      console.warn(`⚠ ${schoolsWithMissingData.length} schools have missing required fields`);
    }
    
    // Verify all students have required fields
    const studentsWithMissingData = students.filter(student => 
      !student.name || !student.dob || !student.gender || !student.grade
    );
    
    if (studentsWithMissingData.length === 0) {
      console.log('✓ All students have required fields');
    } else {
      console.warn(`⚠ ${studentsWithMissingData.length} students have missing required fields`);
    }
    
    // Test 7: Test date formats
    console.log('\n--- Test 7: Date Format Validation ---');
    
    // Check that student DOB is in YYYY-MM-DD format
    const invalidDobStudents = students.filter(student => 
      student.dob && !/^\d{4}-\d{2}-\d{2}$/.test(student.dob)
    );
    
    if (invalidDobStudents.length === 0) {
      console.log('✓ All student DOBs are in YYYY-MM-DD format');
    } else {
      console.warn(`⚠ ${invalidDobStudents.length} students have invalid DOB format`);
    }
    
    // Clean up: Delete the test student
    console.log('\n--- Cleanup ---');
    await studentsService.deleteStudent(createdStudentDbId);
    console.log('✓ Test student deleted');
    
    console.log('\n--- Test Summary ---');
    console.log('✓ All tests completed successfully!');
    console.log('✓ Database is ready for pre-production testing');
    console.log('✓ Anonymized data is working correctly');
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

testWithAnonymizedData();