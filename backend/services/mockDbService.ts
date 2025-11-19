// Mock database service for development purposes
// This simulates database operations without requiring a real database connection

// Mock data based on the initialData.ts file
let schools = [
  {
    id: 1, iemis_code: '720160001', logo_url: 'https://picsum.photos/seed/1/100', name: 'SHREE GANESH SECONDARY SCHOOL BHURSA',
    municipality: 'BELDANDI RURAL MUNICIPALITY - 5, KANCHANPUR', estd: '2017 BS', prepared_by: 'Man Singh Rana',
    checked_by: 'Narayan Rana', head_teacher_name: 'JANAK BAHADUR THAPA', head_teacher_contact: '9827792360',
    email: 'ganesh.secondary@email.com', status: 'Active', subscription_plan: 'Pro',
    created_at: new Date(), updated_at: new Date()
  },
  {
    id: 2, iemis_code: '720160002', logo_url: 'https://picsum.photos/seed/2/100', name: 'SHREE SIDDHANATH SECONDARY SCHOOL',
    municipality: 'BHIMDATTA MUNICIPALITY - 4, KANCHANPUR', estd: '2025 BS', prepared_by: 'Kamal Adhikari',
    checked_by: 'Bimala Shrestha', head_teacher_name: 'HARI PRASAD JOSHI', head_teacher_contact: '9848512345',
    email: 'siddhanath.school@email.com', status: 'Active', subscription_plan: 'Pro',
    created_at: new Date(), updated_at: new Date()
  },
  {
    id: 3, iemis_code: '720160003', logo_url: 'https://picsum.photos/seed/3/100', name: 'RADIANT SECONDARY SCHOOL',
    municipality: 'DHANGADHI - 5, KAILALI', estd: '2055 BS', prepared_by: 'Sunita Chaudhary',
    checked_by: 'Rajesh Singh', head_teacher_name: 'DURGA DEVI POUDEL', head_teacher_contact: '9858754321',
    email: 'radiant.school@email.com', status: 'Inactive', subscription_plan: 'Basic',
    created_at: new Date(), updated_at: new Date()
  }
];

let students = [
  {
    id: 1, student_system_id: 'S1001', school_id: 1, name: 'Bikash Thapa', dob: '2005-05-01', gender: 'Male', grade: '11',
    roll_no: '100', photo_url: 'https://picsum.photos/seed/student0/100', academic_year: 2080, symbol_no: '0160001A',
    alph: 'A', registration_id: '77035001', dob_bs: '2062-02-01', father_name: 'Suresh Thapa', mother_name: 'Anjali Thapa',
    mobile_no: '9800000000', created_at: new Date(), updated_at: new Date()
  },
  {
    id: 2, student_system_id: 'S1002', school_id: 1, name: 'Anjali Rana', dob: '2005-05-02', gender: 'Female', grade: '11',
    roll_no: '101', photo_url: 'https://picsum.photos/seed/student1/100', academic_year: 2080, symbol_no: '0160002A',
    alph: 'B', registration_id: '77035002', dob_bs: '2062-02-02', father_name: 'Bikash Rana', mother_name: 'Sabina Rana',
    mobile_no: '9800000001', created_at: new Date(), updated_at: new Date()
  }
];

let subjects = [
  {
    id: 1, name: 'Com.Nepali', grade: 11,
    theory_sub_code: '11', theory_credit: 2.25, theory_full_marks: 75, theory_pass_marks: 27,
    internal_sub_code: '12', internal_credit: 0.75, internal_full_marks: 25, internal_pass_marks: 10,
    created_at: new Date(), updated_at: new Date()
  },
  {
    id: 2, name: 'Com.English', grade: 11,
    theory_sub_code: '31', theory_credit: 3, theory_full_marks: 75, theory_pass_marks: 27,
    internal_sub_code: '32', internal_credit: 1, internal_full_marks: 25, internal_pass_marks: 10,
    created_at: new Date(), updated_at: new Date()
  }
];

// Schools service
export const schoolsService = {
  // Get all schools
  async getAllSchools() {
    return schools;
  },
  
  // Get school by ID
  async getSchoolById(id: number) {
    return schools.find(school => school.id === id);
  },
  
  // Create a new school
  async createSchool(schoolData: any) {
    const newSchool = {
      id: schools.length + 1,
      ...schoolData,
      created_at: new Date(),
      updated_at: new Date()
    };
    schools.push(newSchool);
    return newSchool;
  },
  
  // Update a school
  async updateSchool(id: number, schoolData: any) {
    const index = schools.findIndex(school => school.id === id);
    if (index === -1) return null;
    
    schools[index] = {
      ...schools[index],
      ...schoolData,
      updated_at: new Date()
    };
    
    return schools[index];
  },
  
  // Delete a school
  async deleteSchool(id: number) {
    const index = schools.findIndex(school => school.id === id);
    if (index === -1) return null;
    
    const deletedSchool = schools.splice(index, 1)[0];
    return deletedSchool;
  }
};

// Students service
export const studentsService = {
  // Get all students
  async getAllStudents() {
    return students;
  },
  
  // Get students by school ID
  async getStudentsBySchoolId(schoolId: number) {
    return students.filter(student => student.school_id === schoolId);
  },
  
  // Get student by ID
  async getStudentById(id: number) {
    return students.find(student => student.id === id);
  },
  
  // Create a new student
  async createStudent(studentData: any) {
    const newStudent = {
      id: students.length + 1,
      ...studentData,
      created_at: new Date(),
      updated_at: new Date()
    };
    students.push(newStudent);
    return newStudent;
  }
};

// Subjects service
export const subjectsService = {
  // Get all subjects
  async getAllSubjects() {
    return subjects;
  },
  
  // Get subjects by grade
  async getSubjectsByGrade(grade: number) {
    return subjects.filter(subject => subject.grade === grade);
  }
};

export default {
  schoolsService,
  studentsService,
  subjectsService
};