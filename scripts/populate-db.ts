import { schoolsService, studentsService, subjectsService } from '../backend/services/dbService';

// Sample schools data
const sampleSchools = [
  {
    iemis_code: '720160001',
    name: 'SHREE GANESH SECONDARY SCHOOL BHURSA',
    logo_url: 'https://picsum.photos/seed/1/100',
    municipality: 'BELDANDI RURAL MUNICIPALITY - 5, KANCHANPUR',
    estd: '2017 BS',
    prepared_by: 'Man Singh Rana',
    checked_by: 'Narayan Rana',
    head_teacher_name: 'JANAK BAHADUR THAPA',
    head_teacher_contact: '9827792360',
    email: 'ganesh.secondary@email.com',
    status: 'Active',
    subscription_plan: 'Pro'
  },
  {
    iemis_code: '720160002',
    name: 'SHREE SIDDHANATH SECONDARY SCHOOL',
    logo_url: 'https://picsum.photos/seed/2/100',
    municipality: 'BHIMDATTA MUNICIPALITY - 4, KANCHANPUR',
    estd: '2025 BS',
    prepared_by: 'Kamal Adhikari',
    checked_by: 'Bimala Shrestha',
    head_teacher_name: 'HARI PRASAD JOSHI',
    head_teacher_contact: '9848512345',
    email: 'siddhanath.school@email.com',
    status: 'Active',
    subscription_plan: 'Pro'
  }
];

// Sample students data
const sampleStudents = [
  {
    student_system_id: 'S1001',
    school_id: 1,
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
    school_id: 1,
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
    
    // Insert schools
    console.log('Inserting schools...');
    for (const school of sampleSchools) {
      await schoolsService.createSchool(school);
    }
    
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