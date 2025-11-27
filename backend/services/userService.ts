import bcrypt from 'bcrypt';
import { query } from './dbService';

// User interface
export interface User {
  id: number;
  email: string | null;
  password_hash: string;
  role: 'admin' | 'school';
  school_id: number | null;
  created_at: Date;
  updated_at: Date;
}

// Create a new user
export async function createUser(userData: { 
  email?: string; 
  password: string; 
  role: 'admin' | 'school'; 
  school_id?: number 
}): Promise<User> {
  // Hash the password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(userData.password, saltRounds);
  
  const result = await query(
    `INSERT INTO users (email, password_hash, role, school_id) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userData.email || null, password_hash, userData.role, userData.school_id || null]
  );
  
  return result.rows[0];
}

// Get user by Email
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT * FROM users 
     WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}

// Get users by school ID
export async function getUsersBySchoolId(schoolId: number): Promise<User[]> {
  const result = await query(
    `SELECT * FROM users 
     WHERE school_id = $1 
     ORDER BY id`,
    [schoolId]
  );
  return result.rows;
}

// Update user
export async function updateUser(id: number, userData: Partial<{
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
}>): Promise<User | null> {
  const fields = [];
  const values = [];
  let index = 1;
  
  if (userData.email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(userData.email);
  }
  
  if (userData.role !== undefined) {
    fields.push(`role = $${index++}`);
    values.push(userData.role);
  }
  
  if (userData.school_id !== undefined) {
    fields.push(`school_id = $${index++}`);
    values.push(userData.school_id);
  }
  
  fields.push(`updated_at = NOW()`);
  
  if (fields.length === 1) {
    // Only updated_at would be updated, so nothing to do
    return getUserById(id);
  }
  
  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    [...values, id]
  );
  
  return result.rows[0] || null;
}

// Update user password
export async function updateUserPassword(id: number, newPassword: string): Promise<User | null> {
  // Hash the new password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);
  
  const result = await query(
    `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [password_hash, id]
  );
  
  return result.rows[0] || null;
}

// Delete user
export async function deleteUser(id: number): Promise<User | null> {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0] || null;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  const result = await query('SELECT * FROM users ORDER BY id');
  return result.rows;
}

// Verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export default {
  createUser,
  getUserByEmail,
  getUserById,
  getUsersBySchoolId,
  updateUser,
  updateUserPassword,
  deleteUser,
  getAllUsers,
  verifyPassword
};