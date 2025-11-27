import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School } from '../types';
import { useAppContext } from './AppContext';
import { getCurrentUser, loginUser, logoutUser, registerUser, User as AuthUser, AuthSession } from '../services/supabaseAuthService';

type Role = 'admin' | 'school';

// Define the user type based on the backend User interface
interface User {
  id: number;
  email: string | null;
  role: Role;
  school_id: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  loggedInSchool: School | null;
  currentUser: User | null;
  setLoggedInSchool: (school: School | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, role: Role, schoolId?: number) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedInSchool, setLoggedInSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useAppContext();

  // Check for existing user session on app load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { session, error } = await getCurrentUser();
        
        if (error) {
          console.error('Error checking user session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          setIsAuthenticated(true);
          setUserRole(session.user.role || null);
          
          // Create user object compatible with existing code
          const user: User = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            school_id: session.user.school_id
          };
          
          setCurrentUser(user);
          
          // Store user data in localStorage for backward compatibility
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', session.token);
          }
        } else {
          // For HashRouter, we need to check the hash portion of the URL
          // The actual route is in location.hash, not location.pathname
          const currentRoute = location.hash.replace('#', '') || '/';
          
          // No session found, redirect to login if not already on login/register page, homepage, or portfolio
          const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/portfolio'];
          if (!publicPaths.includes(currentRoute)) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, [location.hash, navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { session, error } = await loginUser(email, password);
      
      if (error) {
        addToast(error || 'Login failed', 'error');
        return false;
      }
      
      if (session) {
        setIsAuthenticated(true);
        setUserRole(session.user.role || null);
        
        // Create user object compatible with existing code
        const user: User = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          school_id: session.user.school_id
        };
        
        setCurrentUser(user);
        
        // Store user data in localStorage for backward compatibility
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', session.token);
        }
        
        addToast('Login successful!', 'success');
        
        // Navigate based on user role
        if (session.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (session.user.role === 'school') {
          navigate('/school/dashboard');
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      addToast(error.message || 'Login failed. Please try again.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    role: Role,
    schoolId?: number
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { user, error } = await registerUser(email, password, role, schoolId);
      
      if (error) {
        addToast(error || 'Registration failed', 'error');
        return false;
      }
      
      if (user) {
        addToast('Registration successful! Please login.', 'success');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      addToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await logoutUser();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      setIsAuthenticated(false);
      setUserRole(null);
      setCurrentUser(null);
      setLoggedInSchool(null);
      
      // Remove user data from localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
      
      addToast('You have been logged out successfully.', 'success');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      addToast(error.message || 'Logout failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      loggedInSchool, 
      currentUser,
      setLoggedInSchool,
      login, 
      logout, 
      register,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};