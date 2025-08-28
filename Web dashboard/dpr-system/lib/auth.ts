import { User } from '@/types';
import axios from 'axios';

// Create an axios instance with default configuration
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Helper function to get user data from localStorage
export const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Helper function to logout user
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

// Helper function to set auth data
export const setAuthData = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export default apiClient;
