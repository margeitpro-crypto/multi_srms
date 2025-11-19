import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Define the user type based on the backend User interface
interface User {
  id: number;
  iemis_code: string;
  email: string | null;
  role: 'admin' | 'school';
  school_id: number | null;
}

// Define the login response type
interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { addToast } = useAppContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        rememberMe: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Determine if identifier is email or IEMIS code
            const isEmail = formData.identifier.includes('@');
            
            // Prepare login data
            const loginData = {
                password: formData.password,
                ...(isEmail ? { email: formData.identifier } : { iemisCode: formData.identifier })
            };
            
            // Make API call to login
            const response = await api.post<LoginResponse>('/users/login', loginData);
            
            if (response.data.user) {
                const { user, token } = response.data;
                
                // Store user data and token in localStorage for persistence
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('authToken', token);
                }
                
                // Call login function from AuthContext
                login(user.role, { 
                    iemisCode: user.iemis_code, 
                    password: formData.password, 
                    schoolId: user.school_id 
                });
                
                addToast('Login successful!', 'success');
                
                // Navigate based on user role
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'school') {
                    navigate('/school/dashboard');
                }
            } else {
                addToast('Login failed. Please try again.', 'error');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials and try again.';
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 my-8 animate-slide-in-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                        <AcademicCapIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField 
                        id="identifier" 
                        label="Email or IEMIS Code" 
                        type="text" 
                        value={formData.identifier} 
                        onChange={handleChange} 
                        placeholder="Enter your email or IEMIS code" 
                        required 
                    />
                    
                    <InputField 
                        id="password" 
                        label="Password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Enter your password" 
                        required 
                    />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>
                        
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;