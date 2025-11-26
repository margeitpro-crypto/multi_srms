import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://hxfjqeoghziymujnfjpu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Verify JWT token using Supabase Auth
 * @param token JWT token to verify
 * @returns Promise with user data or null if invalid
 */
export async function verifyToken(token: string) {
  try {
    // Set the auth token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Token verification error:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get user by ID from Supabase Auth
 * @param userId Supabase Auth user ID
 * @returns Promise with user data or null if not found
 */
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Get user by ID failed:', error);
    return null;
  }
}

export default {
  supabase,
  verifyToken,
  getUserById
};