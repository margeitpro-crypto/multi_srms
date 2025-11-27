import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const RegisterPage: React.FC = () => {
    const { register, isLoading } = useAuth();
    const { schools } = useData();
    const { addToast } = useAppContext();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'school' as 'admin' | 'school',
        schoolId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.email || !formData.password) {
            addToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (formData.password !== formData.confirmPassword) {
            addToast('Passwords do not match', 'error');
            return;
        }
        
        if (formData.password.length < 6) {
            addToast('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (formData.role === 'school' && !formData.schoolId) {
            addToast('Please select a school', 'error');
            return;
        }
        
        const schoolId = formData.schoolId ? parseInt(formData.schoolId, 10) : undefined;
        
        const success = await register(
            formData.email, 
            formData.password, 
            formData.role, 
            schoolId
        );
        
        if (success) {
            addToast('Registration successful! Please login.', 'success');
            navigate('/login');
        } else {
            addToast('Registration failed. Please try again.', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 my-8 animate-slide-in-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full mb-4">
                        <AcademicCapIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">School Records Management</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">Create a new account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <InputField
                            id="email"
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange as any}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div>
                        <InputField
                            id="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange as any}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <div>
                        <InputField
                            id="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange as any}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Role
                        </label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="school">School User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    
                    {formData.role === 'school' && (
                        <div>
                            <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                School
                            </label>
                            <select
                                id="schoolId"
                                value={formData.schoolId}
                                onChange={handleChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required={formData.role === 'school'}
                            >
                                <option value="">Select a school</option>
                                {schools.map(school => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Registering...
                                </>
                            ) : 'Register'}
                        </Button>
                    </div>
                </form>
                
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                Already have an account?
                            </span>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <Link to="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;