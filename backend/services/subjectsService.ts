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
 * Get all subjects from the database
 * @returns Promise with array of subjects or null if error
 */
export async function getAllSubjects() {
  try {
    const result = await query('SELECT * FROM subjects ORDER BY id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all subjects:', error);
    return null;
  }
}

/**
 * Get subject by ID from the database
 * @param id Subject ID
 * @returns Promise with subject object or null if not found or error
 */
export async function getSubjectById(id: number) {
  try {
    const result = await query('SELECT * FROM subjects WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting subject by ID:', error);
    return null;
  }
}

/**
 * Get subjects by grade from the database
 * @param grade Grade level
 * @returns Promise with array of subjects or null if error
 */
export async function getSubjectsByGrade(grade: number) {
  try {
    const result = await query('SELECT * FROM subjects WHERE grade = $1 ORDER BY id', [grade]);
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting subjects by grade:', error);
    return null;
  }
}

/**
 * Create a new subject in the database
 * @param subjectData Subject data to insert
 * @returns Promise with created subject object or null if error
 */
export async function createSubject(subjectData: any) {
  try {
    const {
      name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
      internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks
    } = subjectData;

    const result = await query(
      `INSERT INTO subjects (
        name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
        internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
        internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks
      ]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating subject:', error);
    return null;
  }
}

/**
 * Update a subject in the database
 * @param id Subject ID
 * @param subjectData Subject data to update
 * @returns Promise with updated subject object or null if error
 */
export async function updateSubject(id: number, subjectData: any) {
  try {
    const {
      name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
      internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks
    } = subjectData;

    const result = await query(
      `UPDATE subjects SET 
        name = $1, grade = $2, theory_sub_code = $3, theory_credit = $4, theory_full_marks = $5,
        theory_pass_marks = $6, internal_sub_code = $7, internal_credit = $8, 
        internal_full_marks = $9, internal_pass_marks = $10, updated_at = NOW()
      WHERE id = $11 RETURNING *`,
      [
        name, grade, theory_sub_code, theory_credit, theory_full_marks, theory_pass_marks,
        internal_sub_code, internal_credit, internal_full_marks, internal_pass_marks, id
      ]
    );

    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating subject:', error);
    return null;
  }
}

/**
 * Delete a subject from the database
 * @param id Subject ID
 * @returns Promise with deleted subject object or null if error
 */
export async function deleteSubject(id: number) {
  try {
    const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error deleting subject:', error);
    return null;
  }
}

export default {
  getAllSubjects,
  getSubjectById,
  getSubjectsByGrade,
  createSubject,
  updateSubject,
  deleteSubject
};