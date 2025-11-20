import dataService from './services/dataService';

async function testStudentCreation() {
  try {
    console.log('Testing student creation...');
    
    // Create a test student
    const testStudent = {
      id: 'S1234567890',
      school_id: 1,
      name: 'Test Student',
      dob: '2005-04-14',
      gender: 'Male' as const,
      grade: '11',
      roll_no: '101',
      photo_url: '',
      created_at: new Date().toISOString(),
      year: 2082,
      symbol_no: 'SYM001',
      alph: 'A',
      registration_id: 'REG001',
      dob_bs: '2062-01-01',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      mobile_no: '9800000001'
    };
    
    console.log('Creating student:', testStudent);
    const result = await dataService.students.create(testStudent);
    console.log('Student created successfully:', result);
  } catch (error) {
    console.error('Error creating student:', error);
  }
}

testStudentCreation();