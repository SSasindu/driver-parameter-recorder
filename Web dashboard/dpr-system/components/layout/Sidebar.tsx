'use client';

import React from 'react';
import { Car, BarChart3, Database, User, LogOut } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    // const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'records', label: 'Driving Records', icon: Database },
        { id: 'profile', label: 'Profile', icon: User }
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="bg-white shadow-lg h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">DPR System</h1>
                        <p className="text-sm text-gray-500">Driver Parameter Recorder</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};
