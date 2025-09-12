'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import axios from 'axios';

const AuthWrapper: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                // Verify token with the server
                const response = await axios.post('/api/auth/verify', { token });

                if (response.data.valid) {
                    // Token is valid, redirect to dashboard
                    router.push('/dashboard');
                } else {
                    // Invalid token, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return isLogin ? (
        <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
    ) : (
        <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
    );
};

export default AuthWrapper;
