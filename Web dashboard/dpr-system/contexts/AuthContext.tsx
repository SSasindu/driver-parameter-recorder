'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (userData: SignupData) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: { user: User; token: string } }
    | { type: 'CLEAR_AUTH' }
    | { type: 'SET_USER_ONLY'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isLoading: false,
            };
        case 'SET_USER_ONLY':
            return {
                ...state,
                user: action.payload,
                isLoading: false,
            };
        case 'CLEAR_AUTH':
            return {
                user: null,
                token: null,
                isLoading: false,
            };
        default:
            return state;
    }
};

const initialState: AuthState = {
    user: null,
    token: null,
    isLoading: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = async (credentials: LoginCredentials) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { user, token } = await authAPI.login(credentials);
            localStorage.setItem('token', token);
            dispatch({ type: 'SET_USER', payload: { user, token } });
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const signup = async (userData: SignupData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const { user, token } = await authAPI.signup(userData);
            localStorage.setItem('token', token);
            dispatch({ type: 'SET_USER', payload: { user, token } });
        } catch (error) {
            dispatch({ type: 'SET_LOADING', payload: false });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'CLEAR_AUTH' });
    };

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        try {
            const user = await authAPI.verifyToken();
            dispatch({ type: 'SET_USER', payload: { user, token } });
        } catch (error) {
            localStorage.removeItem('token');
            dispatch({ type: 'CLEAR_AUTH' });
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value: AuthContextType = {
        ...state,
        login,
        signup,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
