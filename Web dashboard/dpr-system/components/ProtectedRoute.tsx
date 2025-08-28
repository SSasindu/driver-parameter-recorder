'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import axios from 'axios';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated()) {
                router.push('/');
                return;
            }

            const token = localStorage.getItem('token');

            try {
                // Verify token with server
                const response = await axios.post('/api/auth/verify', { token });

                if (response.data.valid) {
                    setIsAuthorized(true);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/');
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect to login
    }

    return <>{children}</>;
};

export default ProtectedRoute;
