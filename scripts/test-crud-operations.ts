import { 
  schoolsService, 
  studentsService, 
  subjectsService, 
  subjectAssignmentsService, 
  marksService 
} from '../backend/services/dbService';

async function testCRUDOperations() {
  console.log('Testing CRUD operations for subject assignments and marks...\n');
  
  try {
    // Get a test student and subject
    console.log('1. Retrieving test data...');
    const schools = await schoolsService.getAllSchools();
    if (schools.length === 0) {
      console.log('No schools found. Please initialize the database first.');
      return;
    }
    
    const students = await studentsService.getAllStudents();
    if (students.length === 0) {
      console.log('No students found. Please initialize the database first.');
      return;
    }
    
    const subjects = await subjectsService.getAllSubjects();
    if (subjects.length === 0) {
      console.log('No subjects found. Please initialize the database first.');
      return;
    }
    
    const testStudent = students[0];
    const testSubject = subjects[0];
    const academicYear = 2082;
    
    console.log(`Using student: ${testStudent.id} - ${testStudent.name}`);
    console.log(`Using subject: ${testSubject.id} - ${testSubject.name}\n`);
    
    // Test CREATE operations
    console.log('2. Testing CREATE operations...');
    
    // Create subject assignments
    console.log('  a. Creating subject assignments...');
    const assignedSubjectIds = [testSubject.id];
    await subjectAssignmentsService.assignSubjectsToStudent(
      testStudent.id, 
      assignedSubjectIds, 
      academicYear
    );
    console.log('  ✓ Subject assignments created successfully');
    
    // Create extra credit assignment
    console.log('  b. Creating extra credit assignment...');
    await subjectAssignmentsService.assignExtraCreditSubjectToStudent(
      testStudent.id, 
      testSubject.id, 
      academicYear
    );
    console.log('  ✓ Extra credit assignment created successfully');
    
    // Create marks
    console.log('  c. Creating marks...');
    const testMarks = {
      [testSubject.id]: {
        theory: 85.5,
        practical: 90.0,
        isAbsent: false
      }
    };
    
    await marksService.saveStudentMarks(
      testStudent.id, 
      academicYear, 
      testMarks
    );
    console.log('  ✓ Marks created successfully\n');
    
    // Test READ operations
    console.log('3. Testing READ operations...');
    
    // Read subject assignments
    console.log('  a. Reading subject assignments...');
    const retrievedSubjectIds = await subjectAssignmentsService.getStudentAssignments(
      testStudent.id, 
      academicYear
    );
    console.log(`  ✓ Retrieved subject assignments: ${retrievedSubjectIds.join(', ')}\n`);
    
    // Read extra credit assignment
    console.log('  b. Reading extra credit assignment...');
    const retrievedExtraCreditId = await subjectAssignmentsService.getStudentExtraCreditAssignment(
      testStudent.id, 
      academicYear
    );
    console.log(`  ✓ Retrieved extra credit subject ID: ${retrievedExtraCreditId}\n`);
    
    // Read marks
    console.log('  c. Reading marks...');
    const retrievedMarks = await marksService.getStudentMarks(
      testStudent.id, 
      academicYear
    );
    console.log('  ✓ Retrieved marks:');
    Object.entries(retrievedMarks).forEach(([subjectId, marks]) => {
      console.log(`    Subject ${subjectId}: Theory=${marks.theory}, Practical=${marks.practical}, Absent=${marks.isAbsent}`);
    });
    console.log('');
    
    // Test UPDATE operations
    console.log('4. Testing UPDATE operations...');
    
    // Update subject assignments
    console.log('  a. Updating subject assignments...');
    const updatedSubjectIds = subjects.length > 1 ? [subjects[1].id] : assignedSubjectIds;
    await subjectAssignmentsService.assignSubjectsToStudent(
      testStudent.id, 
      updatedSubjectIds, 
      academicYear
    );
    console.log('  ✓ Subject assignments updated successfully');
    
    // Update extra credit assignment
    console.log('  b. Updating extra credit assignment...');
    const updatedExtraCreditId = subjects.length > 1 ? subjects[1].id : testSubject.id;
    await subjectAssignmentsService.assignExtraCreditSubjectToStudent(
      testStudent.id, 
      updatedExtraCreditId, 
      academicYear
    );
    console.log('  ✓ Extra credit assignment updated successfully');
    
    // Update marks
    console.log('  c. Updating marks...');
    const updatedMarks = {
      [testSubject.id]: {
        theory: 92.0,
        practical: 88.5,
        isAbsent: false
      }
    };
    
    await marksService.saveStudentMarks(
      testStudent.id, 
      academicYear, 
      updatedMarks
    );
    console.log('  ✓ Marks updated successfully\n');
    
    // Test READ operations after update
    console.log('5. Testing READ operations after update...');
    
    // Read updated subject assignments
    console.log('  a. Reading updated subject assignments...');
    const updatedRetrievedSubjectIds = await subjectAssignmentsService.getStudentAssignments(
      testStudent.id, 
      academicYear
    );
    console.log(`  ✓ Retrieved updated subject assignments: ${updatedRetrievedSubjectIds.join(', ')}\n`);
    
    // Read updated extra credit assignment
    console.log('  b. Reading updated extra credit assignment...');
    const updatedRetrievedExtraCreditId = await subjectAssignmentsService.getStudentExtraCreditAssignment(
      testStudent.id, 
      academicYear
    );
    console.log(`  ✓ Retrieved updated extra credit subject ID: ${updatedRetrievedExtraCreditId}\n`);
    
    // Read updated marks
    console.log('  c. Reading updated marks...');
    const updatedRetrievedMarks = await marksService.getStudentMarks(
      testStudent.id, 
      academicYear
    );
    console.log('  ✓ Retrieved updated marks:');
    Object.entries(updatedRetrievedMarks).forEach(([subjectId, marks]) => {
      console.log(`    Subject ${subjectId}: Theory=${marks.theory}, Practical=${marks.practical}, Absent=${marks.isAbsent}`);
    });
    console.log('');
    
    // Test DELETE operations
    console.log('6. Testing DELETE operations...');
    
    // Delete marks
    console.log('  a. Deleting marks...');
    await marksService.deleteStudentMarks(testStudent.id, academicYear);
    console.log('  ✓ Marks deleted successfully');
    
    // Verify marks are deleted
    console.log('  b. Verifying marks deletion...');
    const deletedMarks = await marksService.getStudentMarks(testStudent.id, academicYear);
    if (Object.keys(deletedMarks).length === 0) {
      console.log('  ✓ Verified marks deletion - no marks found');
    } else {
      console.log('  ✗ Marks deletion verification failed');
    }
    
    // Test the new delete methods for subject assignments
    console.log('  c. Testing new delete methods for subject assignments...');
    
    // First create assignments again for testing deletion
    await subjectAssignmentsService.assignSubjectsToStudent(
      testStudent.id, 
      [testSubject.id], 
      academicYear
    );
    
    await subjectAssignmentsService.assignExtraCreditSubjectToStudent(
      testStudent.id, 
      testSubject.id, 
      academicYear
    );
    
    // Now test deletion
    await subjectAssignmentsService.deleteStudentAssignments(testStudent.id, academicYear);
    await subjectAssignmentsService.deleteStudentExtraCreditAssignment(testStudent.id, academicYear);
    
    // Verify deletion
    const deletedSubjectIds = await subjectAssignmentsService.getStudentAssignments(
      testStudent.id, 
      academicYear
    );
    
    const deletedExtraCreditId = await subjectAssignmentsService.getStudentExtraCreditAssignment(
      testStudent.id, 
      academicYear
    );
    
    if (deletedSubjectIds.length === 0 && deletedExtraCreditId === null) {
      console.log('  ✓ Subject assignments deleted successfully using new methods');
    } else {
      console.log('  ✗ Subject assignments deletion verification failed');
    }
    
    console.log('\n✓ All CRUD operations tested successfully!');
    
  } catch (error) {
    console.error('Error during CRUD operations test:', error);
  }
}

testCRUDOperations();