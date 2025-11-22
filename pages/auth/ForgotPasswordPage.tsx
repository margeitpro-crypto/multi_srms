import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import api from '../../services/api';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateEmail = (email: string): boolean => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validate email
        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post<{ message: string }>('/otp/send', { email });
            
            if (response.data.message) {
                setMessage(response.data.message);
                // Redirect to reset password page after successful OTP send
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            }
        } catch (err: any) {
            console.error('Error sending OTP:', err);
            const errorMessage = err.response?.data?.error || 'Failed to send OTP. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                    />
                    
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    
                    {message && (
                        <div className="text-green-500 text-sm text-center">{message}</div>
                    )}
                    
                    <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
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