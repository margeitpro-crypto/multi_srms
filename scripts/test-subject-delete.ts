import { subjectsService } from '../backend/services/dbService';

async function testSubjectDelete() {
  console.log('Testing subject delete functionality...\n');
  
  try {
    // Get all subjects
    console.log('1. Retrieving all subjects...');
    const subjects = await subjectsService.getAllSubjects();
    console.log(`Found ${subjects.length} subjects\n`);
    
    if (subjects.length === 0) {
      console.log('No subjects found. Please add some subjects first.');
      return;
    }
    
    // Try to delete the first subject
    const subjectToDelete = subjects[0];
    console.log(`2. Attempting to delete subject ID ${subjectToDelete.id}: ${subjectToDelete.name}`);
    
    try {
      const deletedSubject = await subjectsService.deleteSubject(subjectToDelete.id);
      if (deletedSubject) {
        console.log(`✓ Successfully deleted subject: ${deletedSubject.name}`);
      } else {
        console.log('✗ Subject not found or could not be deleted');
      }
    } catch (error: any) {
      if (error.code === '23503') {
        console.log('ℹ Subject cannot be deleted because it is referenced by student marks.');
        console.log('  To delete this subject, you must first delete all marks for this subject.');
      } else {
        console.log(`✗ Error deleting subject: ${error.message}`);
      }
    }
    
    // Verify the subject is deleted by trying to get all subjects again
    console.log('\n3. Verifying deletion...');
    const subjectsAfterDelete = await subjectsService.getAllSubjects();
    const deletedSubjectExists = subjectsAfterDelete.find(s => s.id === subjectToDelete.id);
    
    if (deletedSubjectExists) {
      console.log('✗ Subject still exists after deletion attempt');
    } else {
      console.log('✓ Subject successfully removed from database');
    }
    
    console.log('\n✓ Subject delete test completed!');
    
  } catch (error) {
    console.error('Error during subject delete test:', error);
  }
}

testSubjectDelete();