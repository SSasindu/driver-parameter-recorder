'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getCurrentUser, isAuthenticated, logout } from '@/lib/auth';

interface User {
    id: string;
    firstName: string;
    email: string;
    deviceId: string;
    createdAt: string;
}

interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    verifyAuth: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        if (!isAuthenticated()) {
            setIsLoading(false);
            return;
        }

        const currentUser = getCurrentUser();
        const token = localStorage.getItem('token');

        if (currentUser && token) {
            try {
                // Verify token with server
                const response = await axios.post('/api/auth/verify', { token });

                if (response.data.valid && response.data.user) {
                    setUser(response.data.user);
                    setAuthenticated(true);
                } else {
                    // Invalid token
                    handleLogout();
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                handleLogout();
            }
        }

        setIsLoading(false);
    };

    const handleLogin = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setAuthenticated(false);
        router.push('/');
    };

    const verifyAuth = async (): Promise<boolean> => {
        if (!isAuthenticated()) {
            return false;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('/api/auth/verify', { token });
            return response.data.valid;
        } catch (error) {
            console.error('Auth verification failed:', error);
            return false;
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated: authenticated,
        login: handleLogin,
        logout: handleLogout,
        verifyAuth,
    };
};
