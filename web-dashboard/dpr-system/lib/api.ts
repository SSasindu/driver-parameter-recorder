// import axios from 'axios';
// import { LoginCredentials, SignupData, User, DashboardData } from '@/types';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// const api = axios.create({
//     baseURL: API_BASE_URL,
// });

// // Add token to requests if available
// api.interceptors.request.use((config) => {
//     if (typeof window !== 'undefined') {
//         const token = localStorage.getItem('token');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//     }
//     return config;
// });

// export const authAPI = {
//     login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
//         const response = await api.post('/auth/login', credentials);
//         return response.data;
//     },

//     signup: async (userData: SignupData): Promise<{ user: User; token: string }> => {
//         const response = await api.post('/auth/signup', userData);
//         return response.data;
//     },

//     verifyToken: async (): Promise<User> => {
//         const response = await api.get('/auth/verify');
//         return response.data.user;
//     }
// };

// export const dashboardAPI = {
//     getDashboardData: async (): Promise<DashboardData> => {
//         const response = await api.get('/dashboard');
//         return response.data;
//     }
// };

// export default api;
