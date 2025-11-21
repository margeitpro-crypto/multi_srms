// Dynamically import database configuration to avoid TypeScript errors when file is missing
let dbPool: any = null;
let poolInitialized = false;

// Function to initialize the database pool
async function initializeDbPool() {
  if (poolInitialized) return;
  
  try {
    // Try to import the database configuration dynamically
    // Using a variable for the path to avoid TypeScript static analysis errors
    const dbConfigPath = '../../config/db';
    console.log('Attempting to import database configuration from:', dbConfigPath);
    const module = await import(dbConfigPath);
    dbPool = module.default;
    poolInitialized = true;
    console.log('Database pool initialized successfully');
  } catch (error) {
    console.warn('Database configuration not found, using mock mode:', (error as Error).message);
    poolInitialized = true;
  }
}

import { QueryResult } from 'pg';

// Generic database query function
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  // Initialize the pool if not already done
  if (!poolInitialized) {
    console.log('Initializing database pool...');
    await initializeDbPool();
  }
  
  if (dbPool) {
    try {
      console.log('Executing query:', text, params || []);
      const result = await dbPool.query(text, params);
      console.log('Query executed successfully, rows returned:', result.rowCount);
      return result;
    } catch (err) {
      console.error('Database query error:', err);
      throw err;
    }
  } else {
    // Mock implementation when database is not available
    console.warn('Database not configured, returning mock response for query:', text);
    return {
      rows: [],
      rowCount: 0,
      command: '',
      oid: 0,
      fields: []
    } as unknown as QueryResult;
  }
}

// Schools service
export const schoolsService = {
  // Get all schools
  async getAllSchools() {
    const result = await query('SELECT * FROM schools ORDER BY id');
    // Map database column names to frontend property names
    return result.rows.map(school => ({
      id: school.id,
      iemisCode: school.iemis_code,
      logoUrl: school.logo_url,
      name: school.name,
      municipality: school.municipality,
      estd: school.estd,
      preparedBy: school.prepared_by,
      checkedBy: school.checked_by,
      headTeacherName: school.head_teacher_name,
      headTeacherContact: school.head_teacher_contact,
      email: school.email,
      status: school.status,
      subscriptionPlan: school.subscription_plan
    }));
  },
  
  // Get school by ID
  async getSchoolById(id: number) {
    const result = await query('SELECT * FROM schools WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    
    const school = result.rows[0];
    return {
      id: school.id,
      iemisCode: school.iemis_code,
      logoUrl: school.logo_url,
      name: school.name,
      municipality: school.municipality,
      estd: school.estd,
      preparedBy: school.prepared_by,
      checkedBy: school.checked_by,
      headTeacherName: school.head_teacher_name,
      headTeacherContact: school.head_teacher_contact,
      email: school.email,
      status: school.status,
      subscriptionPlan: school.subscription_plan
    };
  },
  
  // Create a new school
  async createSchool(schoolData: any) {
    try {
      const result = await query(
        `INSERT INTO schools (
          iemis_code, name, logo_url, municipality, estd, prepared_by, checked_by,
          head_teacher_name, head_teacher_contact, email, status, subscription_plan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          schoolData.iemisCode, schoolData.name, schoolData.logoUrl, schoolData.municipality,
          schoolData.estd, schoolData.preparedBy, schoolData.checkedBy, schoolData.headTeacherName,
          schoolData.headTeacherContact, schoolData.email, schoolData.status || 'Inactive',
          schoolData.subscriptionPlan || 'Basic'
        ]
      );
      
      const school = result.rows[0];
      return {
        id: school.id,
        iemisCode: school.iemis_code,
        logoUrl: school.logo_url,
        name: school.name,
        municipality: school.municipality,
        estd: school.estd,
        preparedBy: school.prepared_by,
        checkedBy: school.checked_by,
        headTeacherName: school.head_teacher_name,
        headTeacherContact: school.head_teacher_contact,
        email: school.email,
        status: school.status,
        subscriptionPlan: school.subscription_plan
      };
    } catch (error) {
      console.error('Database error creating school:', error);
      throw error;
    }
  },
  
  // Update a school
  async updateSchool(id: number, schoolData: any) {
    const result = await query(
      `UPDATE schools SET 
        iemis_code = $1, name = $2, logo_url = $3, municipality = $4, estd = $5,
        prepared_by = $6, checked_by = $7, head_teacher_name = $8, head_teacher_contact = $9,
        email = $10, status = $11, subscription_plan = $12, updated_at = NOW()
      WHERE id = $13 RETURNING *`,
      [
        schoolData.iemisCode, schoolData.name, schoolData.logoUrl, schoolData.municipality,
        schoolData.estd, schoolData.preparedBy, schoolData.checkedBy, schoolData.headTeacherName,
        schoolData.headTeacherContact, schoolData.email, schoolData.status, schoolData.subscriptionPlan, id
      ]
    );
    
    if (!result.rows[0]) return null;
    
    const school = result.rows[0];
    return {
      id: school.id,
      iemisCode: school.iemis_code,
      logoUrl: school.logo_url,
      name: school.name,
      municipality: school.municipality,
      estd: school.estd,
      preparedBy: school.prepared_by,
      checkedBy: school.checked_by,
      headTeacherName: school.head_teacher_name,
      headTeacherContact: school.head_teacher_contact,
      email: school.email,
      status: school.status,
      subscriptionPlan: school.subscription_plan
    };
  },
  
  // Delete a school
  async deleteSchool(id: number) {
    const result = await query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) return null;
    
    const school = result.rows[0];
    return {
      id: school.id,
      iemisCode: school.iemis_code,
      logoUrl: school.logo_url,
      name: school.name,
      municipality: school.municipality,
      estd: school.estd,
      preparedBy: school.prepared_by,
      checkedBy: school.checked_by,
      headTeacherName: school.head_teacher_name,
      headTeacherContact: school.head_teacher_contact,
      email: school.email,
      status: school.status,
      subscriptionPlan: school.subscription_plan
    };
  }
};

// Students service
export const studentsService = {
  // Get all students
  async getAllStudents() {
    const result = await query('SELECT * FROM students ORDER BY id');
    // Map database column names to frontend property names
    return result.rows.map(student => ({
      id: student.student_system_id, // Using student_system_id as the frontend id
      school_id: student.school_id,
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      grade: student.grade,
      roll_no: student.roll_no,
      photo_url: student.photo_url,
      created_at: student.created_at,
      year: student.academic_year,
      symbol_no: student.symbol_no,
      alph: student.alph,
      registration_id: student.registration_id,
      dob_bs: student.dob_bs,
      father_name: student.father_name,
      mother_name: student.mother_name,
      mobile_no: student.mobile_no
    }));
  },
  
  // Get students by school ID
  async getStudentsBySchoolId(schoolId: number) {
    const result = await query('SELECT * FROM students WHERE school_id = $1 ORDER BY id', [schoolId]);
    return result.rows.map(student => ({
      id: student.student_system_id, // Using student_system_id as the frontend id
      school_id: student.school_id,
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      grade: student.grade,
      roll_no: student.roll_no,
      photo_url: student.photo_url,
      created_at: student.created_at,
      year: student.academic_year,
      symbol_no: student.symbol_no,
      alph: student.alph,
      registration_id: student.registration_id,
      dob_bs: student.dob_bs,
      father_name: student.father_name,
      mother_name: student.mother_name,
      mobile_no: student.mobile_no
    }));
  },
  
  // Get student database ID by student system ID
  async getStudentDatabaseIdBySystemId(studentSystemId: string) {
    const result = await query('SELECT id FROM students WHERE student_system_id = $1', [studentSystemId]);
    if (!result.rows[0]) return null;
    return result.rows[0].id;
  },

  // Get student by ID
  async getStudentById(id: number) {
    const result = await query('SELECT * FROM students WHERE id = $1', [id]);
    if (!result.rows[0]) return null;
    
    const student = result.rows[0];
    return {
      id: student.student_system_id, // Using student_system_id as the frontend id
      school_id: student.school_id,
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      grade: student.grade,
      roll_no: student.roll_no,
      photo_url: student.photo_url,
      created_at: student.created_at,
      year: student.academic_year,
      symbol_no: student.symbol_no,
      alph: student.alph,
      registration_id: student.registration_id,
      dob_bs: student.dob_bs,
      father_name: student.father_name,
      mother_name: student.mother_name,
      mobile_no: student.mobile_no
    };
  },
  
  // Create a new student
  async createStudent(studentData: any) {
    try {
      const result = await query(
        `INSERT INTO students (
          student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
          academic_year, symbol_no, alph, registration_id, dob_bs, father_name,
          mother_name, mobile_no
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
        [
          studentData.id, studentData.school_id, studentData.name, studentData.dob,
          studentData.gender, studentData.grade, studentData.roll_no, studentData.photo_url,
          studentData.year, studentData.symbol_no, studentData.alph, studentData.registration_id,
          studentData.dob_bs, studentData.father_name, studentData.mother_name, studentData.mobile_no
        ]
      );
      
      const student = result.rows[0];
      return {
        id: student.student_system_id, // Using student_system_id as the frontend id
        school_id: student.school_id,
        name: student.name,
        dob: student.dob,
        gender: student.gender,
        grade: student.grade,
        roll_no: student.roll_no,
        photo_url: student.photo_url,
        created_at: student.created_at,
        year: student.academic_year,
        symbol_no: student.symbol_no,
        alph: student.alph,
        registration_id: student.registration_id,
        dob_bs: student.dob_bs,
        father_name: student.father_name,
        mother_name: student.mother_name,
        mobile_no: student.mobile_no
      };
    } catch (error) {
      console.error('Database error creating student:', error);
      throw error;
    }
  },
  
  // Update a student
  async updateStudent(id: number, studentData: any) {
    const result = await query(
      `UPDATE students SET 
        name = $1, dob = $2, gender = $3, grade = $4, roll_no = $5, photo_url = $6,
        academic_year = $7, symbol_no = $8, alph = $9, registration_id = $10, dob_bs = $11,
        father_name = $12, mother_name = $13, mobile_no = $14
       WHERE id = $15 RETURNING *`,
      [
        studentData.name, studentData.dob, studentData.gender, studentData.grade, studentData.roll_no,
        studentData.photo_url, studentData.academic_year, studentData.symbol_no, studentData.alph,
        studentData.registration_id, studentData.dob_bs, studentData.father_name, studentData.mother_name,
        studentData.mobile_no, id
      ]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const student = result.rows[0];
    return {
      id: student.student_system_id, // Using student_system_id as the frontend id
      school_id: student.school_id,
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      grade: student.grade,
      roll_no: student.roll_no,
      photo_url: student.photo_url,
      created_at: student.created_at,
      year: student.academic_year,
      symbol_no: student.symbol_no,
      alph: student.alph,
      registration_id: student.registration_id,
      dob_bs: student.dob_bs,
      father_name: student.father_name,
      mother_name: student.mother_name,
      mobile_no: student.mobile_no
    };
  },
  
  // Delete a student
  async deleteStudent(id: number) {
    const result = await query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return null;
    }
    
    const student = result.rows[0];
    return {
      id: student.student_system_id, // Using student_system_id as the frontend id
      school_id: student.school_id,
      name: student.name,
      dob: student.dob,
      gender: student.gender,
      grade: student.grade,
      roll_no: student.roll_no,
      photo_url: student.photo_url,
      created_at: student.created_at,
      year: student.academic_year,
      symbol_no: student.symbol_no,
      alph: student.alph,
      registration_id: student.registration_id,
      dob_bs: student.dob_bs,
      father_name: student.father_name,
      mother_name: student.mother_name,
      mobile_no: student.mobile_no
    };
  }
};

// Subjects service
export const subjectsService = {
  // Get all subjects
  async getAllSubjects() {
    const result = await query('SELECT * FROM subjects ORDER BY id');
    // Map database column names to frontend property names
    return result.rows.map(subject => ({
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      theory: {
        subCode: subject.theory_sub_code,
        credit: parseFloat(subject.theory_credit),
        fullMarks: subject.theory_full_marks,
        passMarks: subject.theory_pass_marks
      },
      internal: {
        subCode: subject.internal_sub_code,
        credit: parseFloat(subject.internal_credit),
        fullMarks: subject.internal_full_marks,
        passMarks: subject.internal_pass_marks
      }
    }));
  },
  
  // Get subjects by grade
  async getSubjectsByGrade(grade: number) {
    const result = await query('SELECT * FROM subjects WHERE grade = $1 ORDER BY id', [grade]);
    return result.rows.map(subject => ({
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      theory: {
        subCode: subject.theory_sub_code,
        credit: parseFloat(subject.theory_credit),
        fullMarks: subject.theory_full_marks,
        passMarks: subject.theory_pass_marks
      },
      internal: {
        subCode: subject.internal_sub_code,
        credit: parseFloat(subject.internal_credit),
        fullMarks: subject.internal_full_marks,
        passMarks: subject.internal_pass_marks
      }
    }));
  },
  
  // Create a new subject
  async createSubject(subjectData: any) {
    const result = await query(
      `INSERT INTO subjects (
        name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
        internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        subjectData.name, subjectData.grade, subjectData.theory_sub_code, subjectData.theory_credit,
        subjectData.theory_full_marks, subjectData.theory_pass_marks, subjectData.internal_sub_code,
        subjectData.internal_credit, subjectData.internal_full_marks, subjectData.internal_pass_marks
      ]
    );
    
    const subject = result.rows[0];
    return {
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      theory: {
        subCode: subject.theory_sub_code,
        credit: parseFloat(subject.theory_credit),
        fullMarks: subject.theory_full_marks,
        passMarks: subject.theory_pass_marks
      },
      internal: {
        subCode: subject.internal_sub_code,
        credit: parseFloat(subject.internal_credit),
        fullMarks: subject.internal_full_marks,
        passMarks: subject.internal_pass_marks
      }
    };
  },
  
  // Delete a subject
  async deleteSubject(id: number) {
    const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    if (!result.rows[0]) return null;
    
    const subject = result.rows[0];
    return {
      id: subject.id,
      name: subject.name,
      grade: subject.grade,
      theory: {
        subCode: subject.theory_sub_code,
        credit: parseFloat(subject.theory_credit),
        fullMarks: subject.theory_full_marks,
        passMarks: subject.theory_pass_marks
      },
      internal: {
        subCode: subject.internal_sub_code,
        credit: parseFloat(subject.internal_credit),
        fullMarks: subject.internal_full_marks,
        passMarks: subject.internal_pass_marks
      }
    };
  }
};

// Subject assignments service
export const subjectAssignmentsService = {
  // Get all subject assignments for a student in a specific academic year
  async getStudentAssignments(studentId: number, academicYear: number) {
    const result = await query(
      'SELECT subject_id FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
    return result.rows.map(row => row.subject_id);
  },
  
  // Get extra credit assignment for a student in a specific academic year
  async getStudentExtraCreditAssignment(studentId: number, academicYear: number) {
    const result = await query(
      'SELECT subject_id FROM extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
    return result.rows.length > 0 ? result.rows[0].subject_id : null;
  },
  
  // Assign subjects to a student for a specific academic year
  async assignSubjectsToStudent(studentId: number, subjectIds: number[], academicYear: number) {
    // First, remove all existing assignments for this student and year
    await query(
      'DELETE FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
    
    // Then, insert the new assignments
    if (subjectIds.length > 0) {
      const values = subjectIds.map((subjectId, index) => 
        `($1, $${index + 3}, $2)`
      ).join(', ');
      
      const params = [studentId, academicYear, ...subjectIds];
      await query(
        `INSERT INTO student_subject_assignments (student_id, subject_id, academic_year) VALUES ${values}`,
        params
      );
    }
    
    return subjectIds;
  },
  
  // Assign extra credit subject to a student for a specific academic year
  async assignExtraCreditSubjectToStudent(studentId: number, subjectId: number | null, academicYear: number) {
    // First, remove any existing extra credit assignment for this student and year
    await query(
      'DELETE FROM extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
    
    // Then, insert the new assignment if subjectId is provided
    if (subjectId !== null) {
      await query(
        'INSERT INTO extra_credit_assignments (student_id, subject_id, academic_year) VALUES ($1, $2, $3)',
        [studentId, subjectId, academicYear]
      );
    }
    
    return subjectId;
  },
  
  // Delete subject assignments for a student in a specific academic year
  async deleteStudentAssignments(studentId: number, academicYear: number) {
    await query(
      'DELETE FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
  },
  
  // Delete extra credit subject assignment for a student in a specific academic year
  async deleteStudentExtraCreditAssignment(studentId: number, academicYear: number) {
    await query(
      'DELETE FROM extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
  },
  
  // Get student database ID by student system ID
  async getStudentDatabaseIdBySystemId(studentSystemId: string) {
    const result = await query('SELECT id FROM students WHERE student_system_id = $1', [studentSystemId]);
    if (!result.rows[0]) return null;
    return result.rows[0].id;
  }
};

// Marks service
export const marksService = {
  // Get all marks for a student in a specific academic year
  async getStudentMarks(studentId: number, academicYear: number) {
    const result = await query(
      `SELECT subject_id, theory_obtained, practical_obtained, is_absent 
       FROM student_marks 
       WHERE student_id = $1 AND academic_year = $2`,
      [studentId, academicYear]
    );
    
    const marks: { [subjectId: number]: { theory: number; practical: number; isAbsent: boolean } } = {};
    result.rows.forEach(row => {
      marks[row.subject_id] = {
        theory: parseFloat(row.theory_obtained) || 0,
        practical: parseFloat(row.practical_obtained) || 0,
        isAbsent: row.is_absent || false
      };
    });
    
    return marks;
  },
  
  // Save marks for a student in a specific academic year
  async saveStudentMarks(studentId: number, academicYear: number, marks: { [subjectId: number]: { theory: number; practical: number; isAbsent: boolean } }) {
    // First, delete existing marks for this student and year
    await query(
      'DELETE FROM student_marks WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
    
    // Then, insert the new marks
    const subjectIds = Object.keys(marks).map(Number);
    if (subjectIds.length > 0) {
      // Build the values string and parameters correctly
      const valuesParts: string[] = [];
      const params: any[] = [studentId, academicYear];
      
      subjectIds.forEach((subjectId, index) => {
        const mark = marks[subjectId];
        // Add subject_id, theory_obtained, practical_obtained, is_absent
        valuesParts.push(`($1, $${index * 4 + 3}, $2, $${index * 4 + 4}, $${index * 4 + 5}, $${index * 4 + 6})`);
        params.push(
          subjectId,
          mark.theory || 0,
          mark.practical || 0,
          mark.isAbsent || false
        );
      });
      
      const values = valuesParts.join(', ');
      
      await query(
        `INSERT INTO student_marks (student_id, subject_id, academic_year, theory_obtained, practical_obtained, is_absent) 
         VALUES ${values}`,
        params
      );
    }
    
    return marks;
  },
  
  // Delete marks for a student in a specific academic year
  async deleteStudentMarks(studentId: number, academicYear: number) {
    await query(
      'DELETE FROM student_marks WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );
  },
  
  // Get student database ID by student system ID
  async getStudentDatabaseIdBySystemId(studentSystemId: string) {
    const result = await query('SELECT id FROM students WHERE student_system_id = $1', [studentSystemId]);
    if (!result.rows[0]) return null;
    return result.rows[0].id;
  }
};

export default {
  query,
  schoolsService,
  studentsService,
  subjectsService,
  subjectAssignmentsService,
  marksService
};