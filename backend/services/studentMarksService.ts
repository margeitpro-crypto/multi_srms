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
 * Get all student marks from the database
 * @returns Promise with array of marks or null if error
 */
export async function getAllMarks() {
  try {
    const result = await query('SELECT * FROM student_marks ORDER BY id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all marks:', error);
    return null;
  }
}

/**
 * Get marks by student ID from the database
 * @param studentId Student ID
 * @returns Promise with array of marks or null if error
 */
export async function getMarksByStudentId(studentId: number) {
  try {
    const result = await query('SELECT * FROM student_marks WHERE student_id = $1 ORDER BY subject_id', [studentId]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting marks by student ID:', error);
    return null;
  }
}

/**
 * Get marks by subject ID from the database
 * @param subjectId Subject ID
 * @returns Promise with array of marks or null if error
 */
export async function getMarksBySubjectId(subjectId: number) {
  try {
    const result = await query('SELECT * FROM student_marks WHERE subject_id = $1 ORDER BY student_id', [subjectId]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting marks by subject ID:', error);
    return null;
  }
}

/**
 * Get mark by ID from the database
 * @param id Mark ID
 * @returns Promise with mark object or null if not found or error
 */
export async function getMarkById(id: number) {
  try {
    const result = await query('SELECT * FROM student_marks WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting mark by ID:', error);
    return null;
  }
}

/**
 * Create a new student mark in the database
 * @param markData Mark data to insert
 * @returns Promise with created mark object or null if error
 */
export async function createMark(markData: any) {
  try {
    const { student_id, subject_id, academic_year, theory_obtained, practical_obtained, is_absent } = markData;

    const result = await query(
      `INSERT INTO student_marks (
        student_id, subject_id, academic_year, theory_obtained, practical_obtained, is_absent
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, subject_id, academic_year, theory_obtained, practical_obtained, is_absent]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating mark:', error);
    return null;
  }
}

/**
 * Update a student mark in the database
 * @param id Mark ID
 * @param markData Mark data to update
 * @returns Promise with updated mark object or null if error
 */
export async function updateMark(id: number, markData: any) {
  try {
    const { theory_obtained, practical_obtained, is_absent } = markData;

    const result = await query(
      `UPDATE student_marks SET 
        theory_obtained = $1, practical_obtained = $2, is_absent = $3, updated_at = NOW()
      WHERE id = $4 RETURNING *`,
      [theory_obtained, practical_obtained, is_absent, id]
    );

    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating mark:', error);
    return null;
  }
}

/**
 * Delete a student mark from the database
 * @param id Mark ID
 * @returns Promise with deleted mark object or null if error
 */
export async function deleteMark(id: number) {
  try {
    const result = await query('DELETE FROM student_marks WHERE id = $1 RETURNING *', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error deleting mark:', error);
    return null;
  }
}

/**
 * Get student marks for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with array of marks or null if error
 */
export async function getStudentMarks(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'SELECT * FROM student_marks WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting student marks:', error);
    return null;
  }
}

/**
 * Save student marks for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @param marksData Array of marks data
 * @returns Promise with boolean indicating success or null if error
 */
export async function saveStudentMarks(studentId: number, academicYear: number, marksData: any[]) {
  try {
    // Delete existing marks for this student and year
    await query(
      'DELETE FROM student_marks WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    // Insert new marks
    for (const mark of marksData) {
      await query(
        `INSERT INTO student_marks (
          student_id, subject_id, academic_year, theory_obtained, practical_obtained, is_absent
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [studentId, mark.subject_id, academicYear, mark.theory_obtained, mark.practical_obtained, mark.is_absent]
      );
    }

    return true;
  } catch (error) {
    logger.error('Error saving student marks:', error);
    return null;
  }
}

/**
 * Delete student marks for a specific year
 * @param studentId Student ID
 * @param academicYear Academic year
 * @returns Promise with boolean indicating success or null if error
 */
export async function deleteStudentMarks(studentId: number, academicYear: number) {
  try {
    const result = await query(
      'DELETE FROM student_marks WHERE student_id = $1 AND academic_year = $2',
      [studentId, academicYear]
    );

    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error deleting student marks:', error);
    return null;
  }
}

export default {
  getAllMarks,
  getMarksByStudentId,
  getMarksBySubjectId,
  getMarkById,
  createMark,
  updateMark,
  deleteMark,
  getStudentMarks,
  saveStudentMarks,
  deleteStudentMarks
};