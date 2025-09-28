'use client';

import React from 'react';
import { DrivingMetrics } from '@/types';
import { Gauge, TrendingUp, Calendar, Clock } from 'lucide-react';
import { formatSpeed, formatAcceleration } from '@/lib/utils';

interface LiveMetricsProps {
    metrics: DrivingMetrics;
}

export const LiveMetrics: React.FC<LiveMetricsProps> = ({ metrics }) => {
    const getAccelerationColor = (acceleration: number) => {
        if (acceleration > 2) return { bgColor: 'bg-red-50', iconColor: 'text-red-600' };
        if (acceleration > 1) return { bgColor: 'bg-orange-50', iconColor: 'text-orange-600' };
        if (acceleration < -2) return { bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' };
        return { bgColor: 'bg-green-50', iconColor: 'text-green-600' };
    };

    const accelerationColors = getAccelerationColor(metrics.acceleration);

    const metricItems = [
        {
            label: 'Current Speed',
            value: formatSpeed(metrics.speed),
            icon: Gauge,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            label: 'Acceleration',
            value: formatAcceleration(metrics.acceleration),
            icon: TrendingUp,
            bgColor: accelerationColors.bgColor,
            iconColor: accelerationColors.iconColor
        },
        {
            label: 'Date',
            value: metrics.date,
            icon: Calendar,
            bgColor: 'bg-gray-50',
            iconColor: 'text-gray-600'
        },
        {
            label: 'Time',
            value: metrics.time,
            icon: Clock,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        }
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Driving Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricItems.map((item, index) => (
                    <div key={index} className={`${item.bgColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                            </div>
                            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
