import React from 'react';
import { Link } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';

const ForgotPasswordPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-slide-in-up">
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
                        <AcademicCapIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-center">No worries, we'll send you reset instructions.</p>
                </div>

                <form className="space-y-6">
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        required
                    />
                    
                    <Button type="submit" className="w-full" size="lg">
                        Send Reset Link
                    </Button>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        &larr; Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;