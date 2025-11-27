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
 * Validate school data
 * @param schoolData School data to validate
 * @returns Array of validation errors or empty array if valid
 */
function validateSchoolData(schoolData: any): string[] {
  const errors: string[] = [];
  
  if (!schoolData.iemisCode || schoolData.iemisCode.trim().length < 3) {
    errors.push('IEMIS Code must be at least 3 characters long');
  }
  
  if (!schoolData.name || schoolData.name.trim().length < 3) {
    errors.push('School name must be at least 3 characters long');
  }
  
  if (!schoolData.municipality || schoolData.municipality.trim().length < 3) {
    errors.push('Municipality must be at least 3 characters long');
  }
  
  if (!schoolData.estd || schoolData.estd.trim().length < 4) {
    errors.push('Established date must be at least 4 characters long');
  }
  
  if (!schoolData.preparedBy || schoolData.preparedBy.trim().length < 2) {
    errors.push('Prepared by must be at least 2 characters long');
  }
  
  if (!schoolData.checkedBy || schoolData.checkedBy.trim().length < 2) {
    errors.push('Checked by must be at least 2 characters long');
  }
  
  if (!schoolData.headTeacherName || schoolData.headTeacherName.trim().length < 2) {
    errors.push('Head teacher name must be at least 2 characters long');
  }
  
  if (!schoolData.headTeacherContact || !/^\d{10}$/.test(schoolData.headTeacherContact)) {
    errors.push('Head teacher contact must be a 10-digit number');
  }
  
  if (schoolData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolData.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
}

/**
 * Get all schools from the database
 * @returns Promise with array of schools or null if error
 */
export async function getAllSchools() {
  try {
    const result = await query('SELECT * FROM schools ORDER BY id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all schools:', error);
    return null;
  }
}

/**
 * Get school by ID from the database
 * @param id School ID
 * @returns Promise with school object or null if not found or error
 */
export async function getSchoolById(id: number) {
  try {
    const result = await query('SELECT * FROM schools WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting school by ID:', error);
    return null;
  }
}

/**
 * Create a new school in the database
 * @param schoolData School data to insert
 * @returns Promise with created school object or null if error
 */
export async function createSchool(schoolData: any) {
  try {
    // Validate school data
    const validationErrors = validateSchoolData(schoolData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const {
      iemisCode, logoUrl, name, municipality, estd, preparedBy, checkedBy,
      headTeacherName, headTeacherContact, email, status, subscriptionPlan
    } = schoolData;

    const result = await query(
      `INSERT INTO schools (
        iemis_code, logo_url, name, municipality, estd, prepared_by, checked_by,
        head_teacher_name, head_teacher_contact, email, status, subscription_plan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        iemisCode, logoUrl, name, municipality, estd, preparedBy, checkedBy,
        headTeacherName, headTeacherContact, email, status, subscriptionPlan
      ]
    );

    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating school:', error);
    return null;
  }
}

/**
 * Update a school in the database
 * @param id School ID
 * @param schoolData School data to update
 * @returns Promise with updated school object or null if error
 */
export async function updateSchool(id: number, schoolData: any) {
  try {
    // Validate school data
    const validationErrors = validateSchoolData(schoolData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const {
      iemisCode, logoUrl, name, municipality, estd, preparedBy, checkedBy,
      headTeacherName, headTeacherContact, email, status, subscriptionPlan
    } = schoolData;

    const result = await query(
      `UPDATE schools SET 
        iemis_code = $1, logo_url = $2, name = $3, municipality = $4, estd = $5,
        prepared_by = $6, checked_by = $7, head_teacher_name = $8, head_teacher_contact = $9,
        email = $10, status = $11, subscription_plan = $12, updated_at = NOW()
      WHERE id = $13 RETURNING *`,
      [
        iemisCode, logoUrl, name, municipality, estd, preparedBy, checkedBy,
        headTeacherName, headTeacherContact, email, status, subscriptionPlan, id
      ]
    );

    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating school:', error);
    return null;
  }
}

/**
 * Delete a school from the database
 * @param id School ID
 * @returns Promise with deleted school object or null if error
 */
export async function deleteSchool(id: number) {
  try {
    // First check if the school has associated data (students, users, etc.)
    const studentCountResult = await query('SELECT COUNT(*) as count FROM students WHERE school_id = $1', [id]);
    const userCountResult = await query('SELECT COUNT(*) as count FROM users WHERE school_id = $1', [id]);
    
    const studentCount = parseInt(studentCountResult.rows[0].count);
    const userCount = parseInt(userCountResult.rows[0].count);
    
    // If school has associated data, don't delete and return error info
    if (studentCount > 0 || userCount > 0) {
      const errorInfo = {
        hasAssociatedData: true,
        studentCount,
        userCount
      };
      throw new Error(JSON.stringify(errorInfo));
    }
    
    // If no associated data, proceed with deletion
    const result = await query('DELETE FROM schools WHERE id = $1 RETURNING *', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error deleting school:', error);
    return null;
  }
}

export default {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool
};