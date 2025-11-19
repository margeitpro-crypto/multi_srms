import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School } from '../types';
import { useData } from './DataContext';
import { useAppContext } from './AppContext';

type Role = 'admin' | 'school';

// Define the user type based on the backend User interface
interface User {
  id: number;
  iemis_code: string;
  email: string | null;
  role: Role;
  school_id: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: Role | null;
  loggedInSchool: School | null;
  currentUser: User | null;
  login: (role: Role, credentials?: { iemisCode?: string; password?: string; schoolId?: number }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedInSchool, setLoggedInSchool] = useState<School | null>(null);
  const navigate = useNavigate();
  const { schools } = useData();
  const { addToast } = useAppContext();

  // Check for existing user session on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUserRole(user.role);
        setCurrentUser(user);
        
        // If it's a school user, find and set the school
        if (user.role === 'school' && user.school_id) {
          const school = schools.find(s => s.id === user.school_id);
          if (school) {
            setLoggedInSchool(school);
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, [schools]);

  const login = (role: Role, credentials?: { iemisCode?: string; password?: string; schoolId?: number }) => {
    // In a real app, you would validate the credentials with the backend
    // For now, we're trusting the role from the backend response
    setIsAuthenticated(true);
    setUserRole(role);
    
    // Set current user if provided
    if (credentials?.iemisCode) {
      const user: User = {
        id: 0, // Will be set by backend
        iemis_code: credentials.iemisCode,
        email: null,
        role: role,
        school_id: credentials.schoolId || null
      };
      setCurrentUser(user);
    }
    
    if (role === 'admin') {
      setLoggedInSchool(null);
      navigate('/admin/dashboard');
    } else if (role === 'school') {
      // Find the school by ID if provided, otherwise use mock data
      if (credentials?.schoolId) {
        const school = schools.find(s => s.id === credentials.schoolId);
        if (school) {
          setLoggedInSchool(school);
        }
      }
      
      navigate('/school/dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    setLoggedInSchool(null);
    
    // Remove user data from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, loggedInSchool, currentUser, login, logout }}>
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