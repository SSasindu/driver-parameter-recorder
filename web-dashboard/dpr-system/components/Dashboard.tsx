'use client';

import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { ScoreCard } from '@/components/dashboard/ScoreCard';
import { LiveMetrics } from '@/components/dashboard/LiveMetrics';
import { Charts } from '@/components/dashboard/Charts';
import { RecentRecords } from '@/components/dashboard/RecentRecords';
import { generateMockData } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { useParams } from 'next/navigation';
// import router from 'next/dist/shared/lib/router/router';

export const Dashboard: React.FC = () => {
    const params = useParams();
    const [user, setUser] = useState({
        id: '',
        firstName: '',
        email: '',
        deviceId: '',
        createdAt: ''
    });
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    // Using mock data for now - replace with API call
    const dashboardData = generateMockData();

    useEffect(() => {
        // Get userId from dynamic route parameter
        const userId = params.userId as string;
        
        if (userId) {
            // Fetch user data based on userId or get from storage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.id === userId) {
                    setUser({
                        id: userData.id,
                        firstName: userData.name || userData.firstName,
                        email: userData.email,
                        deviceId: userData.deviceId || userData.id,
                        createdAt: userData.createdAt || new Date().toISOString()
                    });
                }
            }
        }
    }, [params]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <ScoreCard score={dashboardData.overallScore} />
                            </div>
                            <div className="lg:col-span-2">
                                <LiveMetrics metrics={dashboardData.currentMetrics} />
                            </div>
                        </div>
                        <Charts hourlyData={dashboardData.hourlyData} />
                    </div>
                );
            case 'records':
                return <RecentRecords records={dashboardData.recentRecords} />;
            case 'profile':
                return (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.firstName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                                <p className="mt-1 text-sm text-gray-900">{user?.deviceId}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
                    <div className="fixed inset-y-0 left-0 z-50 w-64">
                        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 capitalize">
                                {activeTab === 'dashboard' ? 'Dashboard Overview' :
                                    activeTab === 'records' ? 'Driving Records' : 'Profile Settings'}
                            </h2>
                            <p className="text-gray-600">
                                {activeTab === 'dashboard' ? 'Monitor your real-time driving metrics' :
                                    activeTab === 'records' ? 'View your recent driving data records' :
                                        'Manage your account information'}
                            </p>
                        </div>
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};
