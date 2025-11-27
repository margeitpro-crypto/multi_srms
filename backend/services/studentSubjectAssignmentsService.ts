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
 * Get all student subject assignments from the database
 * @returns Promise with array of assignments or null if error
 */
export async function getAllAssignments() {
  try {
    const result = await query('SELECT * FROM student_subject_assignments ORDER BY student_id, subject_id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all assignments:', error);
    return null;
  }
}

/**
 * Get assignments by student ID from the database
 * @param studentId Student ID
 * @returns Promise with array of assignments or null if error
 */
export async function getAssignmentsByStudentId(studentId: number) {
  try {
    const result = await query('SELECT * FROM student_subject_assignments WHERE student_id = $1 ORDER BY subject_id', [studentId]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting assignments by student ID:', error);
    return null;
  }
}

/**
 * Get assignments by subject ID from the database
 * @param subjectId Subject ID
 * @returns Promise with array of assignments or null if error
 */
export async function getAssignmentsBySubjectId(subjectId: number) {
  try {
    const result = await query('SELECT * FROM student_subject_assignments WHERE subject_id = $1 ORDER BY student_id', [subjectId]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting assignments by subject ID:', error);
    return null;
  }
}

/**
 * Create a new student subject assignment in the database
 * @param assignmentData Assignment data to insert
 * @returns Promise with created assignment object or null if error
 */
export async function createAssignment(assignmentData: any) {
  try {
    const { student_id, subject_id, academic_year } = assignmentData;

    const result = await query(
      'INSERT INTO student_subject_assignments (student_id, subject_id, academic_year) VALUES ($1, $2, $3) RETURNING *',
      [student_id, subject_id, academic_year]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating assignment:', error);
    return null;
  }
}

/**
 * Delete a student subject assignment from the database
 * @param studentId Student ID
 * @param subjectId Subject ID
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function deleteAssignment(studentId: number, subjectId: number, academicYear: number) {
  try {
    const result = await query(
      'DELETE FROM student_subject_assignments WHERE student_id = $1 AND subject_id = $2 AND academic_year = $3',
      [studentId, subjectId, academicYear]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error deleting assignment:', error);
    return null;
  }
}

/**
 * Get student assignments for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with array of subject IDs or null if error
 */
export async function getStudentAssignments(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'SELECT subject_id FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    return result.rows.map(row => row.subject_id);
  } catch (error) {
    logger.error('Error getting student assignments:', error);
    return null;
  }
}

/**
 * Get student extra credit assignment for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with subject ID or null if not found or error
 */
export async function getStudentExtraCreditAssignment(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'SELECT subject_id FROM student_extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    return result.rows.length > 0 ? result.rows[0].subject_id : null;
  } catch (error) {
    logger.error('Error getting student extra credit assignment:', error);
    return null;
  }
}

/**
 * Assign subjects to a student for a specific year
 * @param studentId Student ID
 * @param subjectIds Array of subject IDs
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function assignSubjectsToStudent(studentId: number, subjectIds: number[], academicYear: number) {
  try {
    // Remove existing assignments for this student and year
    await query(
      'DELETE FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    // Add new assignments
    for (const subjectId of subjectIds) {
      await query(
        'INSERT INTO student_subject_assignments (student_id, subject_id, academic_year) VALUES ($1, $2, $3)',
        [studentId, subjectId, academicYear]
      );
    }

    return true;
  } catch (error) {
    logger.error('Error assigning subjects to student:', error);
    return null;
  }
}

/**
 * Assign extra credit subject to a student for a specific year
 * @param studentId Student ID
 * @param subjectId Subject ID (null to remove assignment)
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function assignExtraCreditSubjectToStudent(studentId: number, subjectId: number | null, academicYear: number) {
  try {
    // Remove existing extra credit assignment for this student and year
    await query(
      'DELETE FROM student_extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    // Add new assignment if subjectId is provided
    if (subjectId !== null) {
      await query(
        'INSERT INTO student_extra_credit_assignments (student_id, subject_id, academic_year) VALUES ($1, $2, $3)',
        [studentId, subjectId, academicYear]
      );
    }

    return true;
  } catch (error) {
    logger.error('Error assigning extra credit subject to student:', error);
    return null;
  }
}

/**
 * Delete student assignments for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function deleteStudentAssignments(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'DELETE FROM student_subject_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error deleting student assignments:', error);
    return null;
  }
}

/**
 * Delete student extra credit assignment for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function deleteStudentExtraCreditAssignment(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'DELETE FROM student_extra_credit_assignments WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error deleting student extra credit assignment:', error);
    return null;
  }
}

export default {
  getAllAssignments,
  getAssignmentsByStudentId,
  getAssignmentsBySubjectId,
  createAssignment,
  deleteAssignment,
  getStudentAssignments,
  getStudentExtraCreditAssignment,
  assignSubjectsToStudent,
  assignExtraCreditSubjectToStudent,
  deleteStudentAssignments,
  deleteStudentExtraCreditAssignment
};