export interface User {
    id: string;
    firstName: string;
    email: string;
    currentPassword?: string;
    password?: string;
    deviceId: string;
    createdAt: string;
    updatedAt?: string;
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

export interface userUpdateData {
    email?: string;
    password?: string;
}

export interface DrivingMetrics {
    speed: number;
    acceleration: number;
    date: string;
    time: string;
}

export interface DrivingRecord {
    id : string;
    date: string;
    time: string;
    speed: number;
    accX: number;
    accY: number;
    accZ: number;
}

export interface DrivingRecordReduced {
    id: string;
    date: string;
    time: string;
    speed: number;
    acceleration: number;
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
    recentRecords: DrivingRecordReduced[];
    hourlyData: HourlyData[];
    stats: {
        totalRecords: number;
        avgSpeed: number;
        maxSpeed: number;
        avgAcceleration: number;
    };
}

export type ScoreColor = 'green' | 'yellow' | 'red';

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
}
