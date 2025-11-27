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
 * Create a new OTP in the database
 * @param email User email
 * @param otp OTP code
 * @returns Promise with success status or null if error
 */
export async function createOtp(email: string, otp: string) {
  try {
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Remove any existing OTPs for this email
    await query('DELETE FROM otp WHERE email = $1', [email]);

    // Add new OTP
    await query(
      'INSERT INTO otp (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    return true;
  } catch (error) {
    logger.error('Error creating OTP:', error);
    return null;
  }
}

/**
 * Verify an OTP from the database
 * @param email User email
 * @param otp OTP code
 * @returns Promise with verification result or null if error
 */
export async function verifyOtp(email: string, otp: string) {
  try {
    const result = await query(
      'SELECT * FROM otp WHERE email = $1 AND otp = $2',
      [email, otp]
    );

    if (result.rows.length > 0) {
      const otpRecord = snakeToCamel(result.rows[0]);
      if (new Date(otpRecord.expiresAt) > new Date()) {
        return { valid: true, message: 'OTP verified successfully' };
      } else {
        return { valid: false, message: 'OTP has expired' };
      }
    } else {
      return { valid: false, message: 'Invalid OTP' };
    }
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    return null;
  }
}

/**
 * Delete an OTP from the database
 * @param email User email
 * @param otp OTP code
 * @returns Promise with success status or null if error
 */
export async function deleteOtp(email: string, otp: string) {
  try {
    await query(
      'DELETE FROM otp WHERE email = $1 AND otp = $2',
      [email, otp]
    );

    return true;
  } catch (error) {
    logger.error('Error deleting OTP:', error);
    return null;
  }
}

export default {
  createOtp,
  verifyOtp,
  deleteOtp
};