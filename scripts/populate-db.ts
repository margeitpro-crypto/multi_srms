import { studentsService, subjectsService } from '../backend/services/dbService';

// Sample students data
const sampleStudents = [
  {
    student_system_id: 'S1001',
    school_id: 2, // Updated to match the actual school ID
    name: 'Bikash Thapa',
    dob: '2005-05-01',
    gender: 'Male',
    grade: '11',
    roll_no: '100',
    photo_url: 'https://picsum.photos/seed/student0/100',
    academic_year: 2080,
    symbol_no: '0160001A',
    alph: 'A',
    registration_id: '77035001',
    dob_bs: '2062-02-01',
    father_name: 'Suresh Thapa',
    mother_name: 'Anjali Thapa',
    mobile_no: '9800000000'
  },
  {
    student_system_id: 'S1002',
    school_id: 2, // Updated to match the actual school ID
    name: 'Anjali Rana',
    dob: '2005-05-02',
    gender: 'Female',
    grade: '11',
    roll_no: '101',
    photo_url: 'https://picsum.photos/seed/student1/100',
    academic_year: 2080,
    symbol_no: '0160002A',
    alph: 'B',
    registration_id: '77035002',
    dob_bs: '2062-02-02',
    father_name: 'Bikash Rana',
    mother_name: 'Sabina Rana',
    mobile_no: '9800000001'
  }
];

// Sample subjects data
const sampleSubjects = [
  {
    name: 'Com.Nepali',
    grade: 11,
    theory_sub_code: '11',
    theory_credit: 2.25,
    theory_full_marks: 75,
    theory_pass_marks: 27,
    internal_sub_code: '12',
    internal_credit: 0.75,
    internal_full_marks: 25,
    internal_pass_marks: 10
  },
  {
    name: 'Com.English',
    grade: 11,
    theory_sub_code: '31',
    theory_credit: 3,
    theory_full_marks: 75,
    theory_pass_marks: 27,
    internal_sub_code: '32',
    internal_credit: 1,
    internal_full_marks: 25,
    internal_pass_marks: 10
  }
];

async function populateDatabase() {
  try {
    console.log('Populating database with sample data...');
    
    // Insert students
    console.log('Inserting students...');
    for (const student of sampleStudents) {
      await studentsService.createStudent(student);
    }
    
    // Insert subjects
    console.log('Inserting subjects...');
    for (const subject of sampleSubjects) {
      await subjectsService.createSubject(subject);
    }
    
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();