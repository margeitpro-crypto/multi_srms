import { query } from './dbService';
import logger from './logger';

/**
 * Convert snake_case keys to camelCase keys in an object
 * @param obj Object with snake_case keys
 * @returns Object with camelCase keys
 */
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  const camelObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      camelObj[camelKey] = snakeToCamel(obj[key]);
    }
  }
  return camelObj;
}

/**
 * Get all students from the database
 * @returns Promise with array of students or null if error
 */
export async function getAllStudents() {
  try {
    const result = await query('SELECT * FROM students ORDER BY id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all students:', error);
    return null;
  }
}

/**
 * Get students by school ID from the database
 * @param schoolId School ID
 * @returns Promise with array of students or null if error
 */
export async function getStudentsBySchoolId(schoolId: number) {
  try {
    const result = await query('SELECT * FROM students WHERE school_id = $1 ORDER BY id', [schoolId]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting students by school ID:', error);
    return null;
  }
}

/**
 * Get student by ID from the database
 * @param id Student ID
 * @returns Promise with student object or null if not found or error
 */
export async function getStudentById(id: number) {
  try {
    const result = await query('SELECT * FROM students WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting student by ID:', error);
    return null;
  }
}

/**
 * Get student by system ID from the database
 * @param studentSystemId Student system ID
 * @returns Promise with student object or null if not found or error
 */
export async function getStudentBySystemId(studentSystemId: string) {
  try {
    const result = await query('SELECT * FROM students WHERE student_system_id = $1', [studentSystemId]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting student by system ID:', error);
    return null;
  }
}

/**
 * Create a new student in the database
 * @param studentData Student data to insert
 * @returns Promise with created student object or null if error
 */
export async function createStudent(studentData: any) {
  try {
    const {
      student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
      year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no
    } = studentData;

    const result = await query(
      `INSERT INTO students (
        student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
        year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
        year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no
      ]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating student:', error);
    return null;
  }
}

/**
 * Update a student in the database
 * @param id Student ID
 * @param studentData Student data to update
 * @returns Promise with updated student object or null if error
 */
export async function updateStudent(id: number, studentData: any) {
  try {
    const {
      student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
      year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no
    } = studentData;

    const result = await query(
      `UPDATE students SET 
        student_system_id = $1, school_id = $2, name = $3, dob = $4, gender = $5, grade = $6,
        roll_no = $7, photo_url = $8, year = $9, symbol_no = $10, alph = $11, registration_id = $12,
        dob_bs = $13, father_name = $14, mother_name = $15, mobile_no = $16, updated_at = NOW()
      WHERE id = $17 RETURNING *`,
      [
        student_system_id, school_id, name, dob, gender, grade, roll_no, photo_url,
        year, symbol_no, alph, registration_id, dob_bs, father_name, mother_name, mobile_no, id
      ]
    );

    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating student:', error);
    return null;
  }
}

/**
 * Delete a student from the database
 * @param id Student ID
 * @returns Promise with deleted student object or null if error
 */
export async function deleteStudent(id: number) {
  try {
    const result = await query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error deleting student:', error);
    return null;
  }
}

export default {
  getAllStudents,
  getStudentsBySchoolId,
  getStudentById,
  getStudentBySystemId,
  createStudent,
  updateStudent,
  deleteStudent
};