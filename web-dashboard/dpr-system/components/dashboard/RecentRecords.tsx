'use client';

import React from 'react';
import { DrivingRecordReduced } from '@/types';
import { formatDate, formatSpeed, formatAcceleration } from '@/lib/utils';

interface RecentRecordsProps {
    records: DrivingRecordReduced[];
}

export const RecentRecords: React.FC<RecentRecordsProps> = ({ records }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Driving Records</h3>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Speed
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acceleration
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {records.map((record) => {
                            const accelerationColorClass =
                                record.acceleration > 2 ? 'text-red-600 bg-red-50' :
                                    record.acceleration > 1 ? 'text-orange-600 bg-orange-50' :
                                        record.acceleration < -2 ? 'text-yellow-600 bg-yellow-50' :
                                            'text-green-600 bg-green-50';

                            return (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {record.time}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatSpeed(record.speed)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${accelerationColorClass}`}>
                                            {formatAcceleration(record.acceleration)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {records.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No driving records available</p>
                </div>
            )}
        </div>
    );
};
