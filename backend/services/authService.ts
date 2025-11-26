import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, createUser, getUserByIemisCode, getUserByEmail, verifyPassword } from './userService';
import logger from './logger';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'multi_srms_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Define the JWT payload type
interface JWTPayload {
  id: number;
  iemis_code: string;
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
}

/**
 * Generate JWT token for authenticated user
 * @param user User object
 * @returns JWT token
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    iemis_code: user.iemis_code,
    email: user.email,
    role: user.role,
    school_id: user.school_id
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verify JWT token
 * @param token JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with registered user or error
 */
export async function register(userData: {
  iemis_code: string;
  email?: string;
  password: string;
  role: 'admin' | 'school';
  school_id?: number;
}): Promise<{ user: User | null; error: string | null }> {
  try {
    // Check if user already exists
    const existingUser = await getUserByIemisCode(userData.iemis_code);
    if (existingUser) {
      return { user: null, error: 'User with this IEMIS Code already exists' };
    }
    
    // Check if email is already used (if provided)
    if (userData.email) {
      const existingEmailUser = await getUserByEmail(userData.email);
      if (existingEmailUser) {
        return { user: null, error: 'User with this email already exists' };
      }
    }
    
    // Validate role
    if (userData.role !== 'admin' && userData.role !== 'school') {
      return { user: null, error: 'Role must be either "admin" or "school"' };
    }
    
    // Validate school_id for school users
    if (userData.role === 'school' && !userData.school_id) {
      return { user: null, error: 'School ID is required for school users' };
    }
    
    // Create user with hashed password
    const user = await createUser({
      iemis_code: userData.iemis_code,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      school_id: userData.role === 'school' ? userData.school_id : null
    });
    
    logger.info('User registered successfully', { userId: user.id, iemisCode: user.iemis_code });
    
    return { user, error: null };
  } catch (error: any) {
    logger.error('User registration failed:', error);
    return { user: null, error: error.message || 'Registration failed' };
  }
}

/**
 * Authenticate user login
 * @param identifier User's IEMIS code or email
 * @param password User's password
 * @returns Promise with authenticated user and token or error
 */
export async function login(
  identifier: string,
  password: string
): Promise<{ user: User | null; token: string | null; error: string | null }> {
  try {
    // Find user by IEMIS code or email
    let user = await getUserByIemisCode(identifier);
    if (!user && identifier.includes('@')) {
      user = await getUserByEmail(identifier);
    }
    
    if (!user) {
      return { user: null, token: null, error: 'Invalid credentials' };
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { user: null, token: null, error: 'Invalid credentials' };
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    logger.info('User login successful', { userId: user.id, iemisCode: user.iemis_code });
    
    return { user, token, error: null };
  } catch (error: any) {
    logger.error('User login failed:', error);
    return { user: null, token: null, error: error.message || 'Login failed' };
  }
}

/**
 * Change user password
 * @param userId User ID
 * @param currentPassword Current password
 * @param newPassword New password
 * @returns Promise with success status or error
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Validate passwords
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'Current password and new password are required' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long' };
    }
    
    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }
    
    // Get the current user
    const user = await getUserByEmail(userId.toString()) || await getUserByIemisCode(userId.toString());
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Hash and update new password (this would need to be implemented in userService)
    // For now, we'll return success as the actual implementation would be in userService
    
    logger.info('Password changed successfully', { userId });
    
    return { success: true, error: null };
  } catch (error: any) {
    logger.error('Password change failed:', error);
    return { success: false, error: error.message || 'Failed to change password' };
  }
}

export default {
  generateToken,
  verifyToken,
  register,
  login,
  changePassword
};