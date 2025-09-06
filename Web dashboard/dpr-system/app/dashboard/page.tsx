'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ScoreCard } from '@/components/dashboard/ScoreCard';
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { Charts } from '@/components/dashboard/Charts';
import { RecentRecords } from '@/components/dashboard/RecentRecords';
import ProtectedRoute from '@/components/ProtectedRoute';
// import { generateMockData } from '@/lib/utils';
import { Menu, LogOut } from 'lucide-react';
import axios from 'axios';
import { logout } from '@/lib/auth';
import { DashboardData, DrivingRecordReduced, User } from '@/types';

// interface User {
//     id: string;
//     firstName: string;
//     email: string;
//     currentPassword?: string;
//     password?: string;
//     deviceId: string;
//     createdAt: string;
// }
const user1: User = {
    id: '',
    firstName: '',
    email: '',
    currentPassword: '',
    password: '',
    deviceId: '',
    createdAt: '',
};

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User>(user1);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [userRecords, setUserRecords] = useState<DrivingRecordReduced[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateEmail, setUpdateEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [updatePassword, setUpdatePassword] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Run authentication check only once on mount
    useEffect(() => {
        const checkAuthentication = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/');
                return;
            }
            try {
                const response = await axios.post('/api/auth/verify', { token });
                if (response.data.valid && response.data.user) {
                    setUser(response.data.user);
                    setIsLoading(false);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/');
                }
            } catch (error) {
                console.error('Authentication verification failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/');
            }
        };
        checkAuthentication();
    }, [router]);

    // Load tab data when user or activeTab changes
    useEffect(() => {
        if (!user) return;
        handleTabChange(activeTab);
    }, [user, activeTab]);

    const handleTabChange = async (tab: string) => {
        setActiveTab(tab);

        if (!user) return;

        try {
            switch (tab) {
                case 'dashboard':
                    // Fetch dashboard analytics for the user's deviceId
                    try {
                        const response = await axios.get(`/api/driving-records/${user.deviceId}`);
                        setDashboardData(response.data.records || []);
                    } catch (error) {
                        console.error('Error fetching dashboard data:', error);
                    }
                    break;

                case 'records':
                    // Fetch records for the user's deviceId
                    try {
                        const response = await axios.get(`/api/driving-records/${user.deviceId}`);
                        setUserRecords(response.data.allRecords || []);
                    } catch (error) {
                        console.error('Error fetching records:', error);
                    }
                    break;

                case 'profile':
                    // Profile data is already in user state
                    break;
            }
        } catch (error) {
            console.error('Error fetching data for tab:', tab, error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError('');
        setUpdateSuccess('');
        try {
            const payload: User = user1;
            if (updateEmail) payload.email = updateEmail;
            if (currentPassword) payload.currentPassword = currentPassword;
            if (updatePassword) payload.password = updatePassword;
            if (Object.keys(payload).length === 0) {
                setUpdateError('No changes to update.');
                setUpdateLoading(false);
                return;
            }
            const response = await axios.put(`/api/config/${user.deviceId}`, payload);
            if (response.data.user) {
                setUser(response.data.user);
                setUpdateSuccess('Profile updated successfully!');
                setUpdatePassword('');
            } else {
                setUpdateError('Failed to update profile.');
            }
        } catch (err: unknown) {
            setUpdateError('Update failed.');
        }
        setUpdateLoading(false);
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                if (!dashboardData) {
                    return (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading dashboard data...</p>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="space-y-6">
                        {/* Top Section: Score Card and Live Metrics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <ScoreCard score={dashboardData.overallScore} />
                            </div>
                            <div className="lg:col-span-2">
                                <LiveMetrics metrics={dashboardData.currentMetrics} />
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                            <Charts hourlyData={dashboardData.hourlyData} />
                        </div>

                        {/* Recent Records Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Driving Records</h3>
                            <RecentRecords records={dashboardData.recentRecords || []} />
                        </div>

                        {/* Statistics Summary */}
                        {dashboardData.stats && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalRecords}</p>
                                        <p className="text-sm text-gray-600">Total Records</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{dashboardData.stats.avgSpeed} km/h</p>
                                        <p className="text-sm text-gray-600">Average Speed</p>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                        <p className="text-2xl font-bold text-yellow-600">{dashboardData.stats.maxSpeed} km/h</p>
                                        <p className="text-sm text-gray-600">Max Speed</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{dashboardData.stats.avgAcceleration} m/s²</p>
                                        <p className="text-sm text-gray-600">Avg Acceleration</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'records':
                return (
                    <div className="space-y-6">
                        {/* Header with Device Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Driving Records
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Device ID: <span className="font-medium">{user.deviceId}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total Records</p>
                                    <p className="text-xl font-bold text-blue-600">{userRecords.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Records Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            {userRecords.length > 0 ? (
                                <RecentRecords records={userRecords} />
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                                    <p className="text-gray-600">No driving records found for device {user.deviceId}. Start driving to see your data here!</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'profile':
                // Modal state for update profile
                // const [updateEmail, setUpdateEmail] = useState(user.email || '');



                return (
                    <div className="space-y-6">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold">{user.firstName.charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{user.firstName}</h2>
                                    <p className="text-blue-100">Driver Profile</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                                        <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{user.firstName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{user.email || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Device ID</label>
                                        <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg font-mono">{user.deviceId}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                                        <p className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                            <div className="space-y-3">
                                <button
                                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={() => setShowUpdateModal(true)}
                                >
                                    Update Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-0 md:ml-3"
                                >
                                    Logout Account
                                </button>
                            </div>
                        </div>

                        {/* Update Profile Modal */}
                        {showUpdateModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-4 text-gray-900">Update Profile</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800">Email Address</label>
                                            <input
                                                type="email"
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                                                value={updateEmail}
                                                onChange={e => setUpdateEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800">Current Password</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                placeholder="Leave blank to keep current password"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-800">New Password</label>
                                            <input
                                                type="password"
                                                className="mt-1 block w-full p-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:border-blue-500 focus:ring-blue-500"
                                                value={updatePassword}
                                                onChange={e => setUpdatePassword(e.target.value)}
                                                placeholder="Leave blank to keep current password"
                                            />
                                        </div>
                                        {updateError && <p className="text-red-700 text-sm font-medium">{updateError}</p>}
                                        {updateSuccess && <p className="text-green-700 text-sm font-medium">{updateSuccess}</p>}
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                                                onClick={() => { setShowUpdateModal(false); setUpdateError(''); setUpdateSuccess(''); }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                                disabled={updateLoading}
                                            >
                                                {updateLoading ? 'Updating...' : 'Update'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0`}>
                    <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
                </div>

                {/* Main content */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="ml-2 lg:ml-0">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Welcome back, {user.firstName}!
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {activeTab === 'dashboard' && 'Monitor your driving performance'}
                                        {activeTab === 'records' && 'View your driving history'}
                                        {activeTab === 'profile' && 'Manage your account settings'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs text-gray-500">Device ID</p>
                                    <p className="text-sm font-mono text-gray-700">{user.deviceId}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Page content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                        <div className="max-w-7xl mx-auto space-y-6">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}