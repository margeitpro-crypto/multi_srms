import api from './api';

// Define the user type
export interface User {
  id: number;
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
}

// Define the session type
export interface AuthSession {
  token: string;
  user: User;
}

// Define response types
interface RegisterResponse {
  user: User;
  error?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  error?: string;
}

/**
 * Register a new user
 * @param email User's email
 * @param password User's password
 * @param role User's role (admin or school)
 * @param schoolId School ID (for school users)
 * @returns Promise with user data or error
 */
export async function registerUser(
  email: string,
  password: string,
  role: 'admin' | 'school',
  schoolId?: number
): Promise<{ user: User | null; error: string | null }> {
  try {
    const response = await api.post<RegisterResponse>('/users/register', {
      email,
      password,
      role,
      school_id: schoolId
    });

    // Check if response data exists
    if (!response.data) {
      return { user: null, error: 'Invalid response from server' };
    }

    return { user: response.data.user, error: null };
  } catch (error: any) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
    return { user: null, error: errorMessage };
  }
}

/**
 * Login user
 * @param email User's email
 * @param password User's password
 * @returns Promise with session data or error
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ session: AuthSession | null; error: string | null }> {
  try {
    const response = await api.post<LoginResponse>('/users/login', {
      email,
      password
    });

    // Check if response data exists
    if (!response.data) {
      return { session: null, error: 'Invalid response from server' };
    }

    // Check if token and user exist in response
    if (!response.data.token || !response.data.user) {
      return { session: null, error: response.data.error || 'Login failed' };
    }

    const session: AuthSession = {
      token: response.data.token,
      user: response.data.user
    };

    return { session, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.error || error.message || 'Login failed';
    return { session: null, error: errorMessage };
  }
}

/**
 * Logout user
 * @returns Promise with error if any
 */
export async function logoutUser(): Promise<{ error: string | null }> {
  try {
    // In a JWT-based system, logout is typically handled on the client side
    // by removing the token from storage
    return { error: null };
  } catch (error: any) {
    console.error('Logout error:', error);
    return { error: error.message || 'Logout failed' };
  }
}

/**
 * Get current user session
 * @returns Promise with session data or null if not logged in
 */
export async function getCurrentUser(): Promise<{ session: AuthSession | null; error: string | null }> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { session: null, error: null };
    }

    // In a real implementation, you might want to verify the token with the server
    // For now, we'll get user data from localStorage
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      return { session: null, error: null };
    }

    let user: User;
    try {
      user = JSON.parse(userStr);
    } catch (parseError) {
      // If parsing fails, remove invalid data
      localStorage.removeItem('currentUser');
      return { session: null, error: null };
    }

    const session: AuthSession = { token, user };

    return { session, error: null };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return { session: null, error: error.message || 'Failed to get current user' };
  }
}

/**
 * Refresh the user session
 * @returns Promise with refreshed session or error
 */
export async function refreshSession(): Promise<{ session: AuthSession | null; error: string | null }> {
  try {
    // In a JWT-based system, token refresh would typically involve
    // calling a refresh endpoint or re-authenticating
    const token = localStorage.getItem('authToken');
    if (!token) {
      return { session: null, error: null };
    }

    // For now, we'll just return the existing session
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      return { session: null, error: null };
    }

    let user: User;
    try {
      user = JSON.parse(userStr);
    } catch (parseError) {
      // If parsing fails, remove invalid data
      localStorage.removeItem('currentUser');
      return { session: null, error: null };
    }

    const session: AuthSession = { token, user };

    return { session, error: null };
  } catch (error: any) {
    console.error('Refresh session error:', error);
    return { session: null, error: error.message || 'Failed to refresh session' };
  }
}

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshSession
};