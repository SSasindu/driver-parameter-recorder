'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Dashboard } from '@/components/Dashboard';

const AuthWrapper: React.FC = () => {
    const { user, isLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (user) {
        return <Dashboard />;
    }

    return isLogin ? (
        <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
    ) : (
        <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
    );
};

export default AuthWrapper;
