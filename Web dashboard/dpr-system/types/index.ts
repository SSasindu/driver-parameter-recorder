export interface User {
    id: string;
    firstName: string;
    email: string;
    deviceId: string;
    createdAt: string;
}

export interface LoginCredentials {
    deviceId: string;
    password: string;
}

export interface SignupData {
    firstName: string;
    email: string;
    deviceId: string;
    password: string;
}

export interface DrivingMetrics {
    speed: number;
    acceleration: number;
    date: string;
    time: string;
}

export interface DrivingRecord {
    id: string;
    date: string;
    time: string;
    speed: number;
    acceleration: number;
    timestamp: string;
}

export interface HourlyData {
    hour: string;
    avgSpeed: number;
    maxSpeed: number;
    avgAcceleration: number;
}

export interface DashboardData {
    overallScore: number;
    currentMetrics: DrivingMetrics;
    recentRecords: DrivingRecord[];
    hourlyData: HourlyData[];
}

export type ScoreColor = 'green' | 'yellow' | 'red';

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}
