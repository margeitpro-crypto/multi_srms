import api from './services/api';

async function testCreateStudent() {
  try {
    const response = await api.post('/students', {
      student_system_id: 'S12345',
      school_id: 1,
      name: 'Test Student',
      dob: '2005-01-01',
      gender: 'Male',
      grade: '11',
      roll_no: '101',
      academic_year: 2082,
      symbol_no: '0160001A',
      alph: 'A',
      registration_id: '77035001',
      dob_bs: '2062-02-01',
      father_name: 'Test Father',
      mother_name: 'Test Mother',
      mobile_no: '9800000000'
    });
    console.log('Student created:', response.data);
  } catch (error) {
    console.error('Error creating student:', error.response?.data || error.message);
  }
}

testCreateStudent();