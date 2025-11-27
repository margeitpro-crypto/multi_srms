import { query } from './dbService';
import logger from './logger';
import bcrypt from 'bcrypt';

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
 * Get all users from the database
 * @returns Promise with array of users or null if error
 */
export async function getAllUsers() {
  try {
    const result = await query('SELECT id, email, role, school_id FROM users ORDER BY id');
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows);
  } catch (error) {
    logger.error('Error getting all users:', error);
    return null;
  }
}

/**
 * Get user by ID from the database
 * @param id User ID
 * @returns Promise with user object or null if not found or error
 */
export async function getUserById(id: number) {
  try {
    const result = await query('SELECT id, email, role, school_id, password_hash FROM users WHERE id = $1', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Get user by email from the database
 * @param email User email
 * @returns Promise with user object or null if not found or error
 */
export async function getUserByEmail(email: string) {
  try {
    const result = await query('SELECT id, email, role, school_id, password_hash FROM users WHERE email = $1', [email]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Create a new user in the database
 * @param userData User data to insert
 * @returns Promise with created user object or null if error
 */
export async function createUser(userData: any) {
  try {
    const { email, password, role, school_id } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await query(
      'INSERT INTO users (email, password_hash, role, school_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role, school_id',
      [email, passwordHash, role, school_id]
    );
    
    // Convert snake_case keys to camelCase
    return snakeToCamel(result.rows[0]);
  } catch (error) {
    logger.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update a user in the database
 * @param id User ID
 * @param userData User data to update
 * @returns Promise with updated user object or null if error
 */
export async function updateUser(id: number, userData: any) {
  try {
    const { email, role, school_id } = userData;
    
    const result = await query(
      'UPDATE users SET email = $1, role = $2, school_id = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, role, school_id',
      [email, role, school_id, id]
    );
    
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating user:', error);
    return null;
  }
}

/**
 * Update a user's password in the database
 * @param id User ID
 * @param newPassword New password to set
 * @returns Promise with updated user object or null if error
 */
export async function updateUserPassword(id: number, newPassword: string) {
  try {
    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const result = await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, role, school_id',
      [passwordHash, id]
    );
    
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error updating user password:', error);
    return null;
  }
}

/**
 * Delete a user from the database
 * @param id User ID
 * @returns Promise with deleted user object or null if error
 */
export async function deleteUser(id: number) {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, email, role, school_id', [id]);
    // Convert snake_case keys to camelCase
    return result.rows.length > 0 ? snakeToCamel(result.rows[0]) : null;
  } catch (error) {
    logger.error('Error deleting user:', error);
    return null;
  }
}

/**
 * Verify a password against a hash
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns Promise with boolean indicating if password is valid
 */
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password:', error);
    return false;
  }
}

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  verifyPassword
};