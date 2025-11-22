import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { AcademicCapIcon } from '../../components/icons/AcademicCapIcon';
import api from '../../services/api';

const ResetPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Pre-fill email if passed from forgot password page
    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    const validateInputs = (): boolean => {
        if (!email) {
            setError('Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return false;
        }

        if (!newPassword) {
            setError('New password is required');
            return false;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post<{ message: string }>('/otp/reset-password', {
                email,
                otp,
                newPassword
            });

            if (response.data.message) {
                setMessage(response.data.message);
                // Redirect to login page after successful password reset
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err: any) {
            console.error('Error resetting password:', err);
            const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-center">Enter the OTP sent to your email and set a new password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <InputField
                                id="email-address"
                                label="Email Address"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                            />
                        </div>
                        <div className="mt-4">
                            <InputField
                                id="otp"
                                label="OTP"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6-digit OTP"
                                maxLength={6}
                            />
                        </div>
                        <div className="mt-4">
                            <InputField
                                id="new-password"
                                label="New Password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                            />
                        </div>
                        <div className="mt-4">
                            <InputField
                                id="confirm-password"
                                label="Confirm Password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

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
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
                
                <div className="text-center mt-6">
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                        Resend OTP
                    </Link>
                </div>
                
                <div className="text-center mt-4">
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        &larr; Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;