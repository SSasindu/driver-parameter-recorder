// 'use client';

// import React from 'react';
// import { Trip } from '@/types';
// import { formatDate, formatDistance, formatDuration, getScoreColor } from '@/lib/utils';

// interface TripHistoryProps {
//     trips: Trip[];
// }

// export const TripHistory: React.FC<TripHistoryProps> = ({ trips }) => {
//     return (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trip History</h3>

//             <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Date
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Distance
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Duration
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Score
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Events
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {trips.map((trip) => {
//                             const scoreColor = getScoreColor(trip.score);
//                             const scoreColorClass =
//                                 scoreColor === 'green' ? 'text-green-600 bg-green-50' :
//                                     scoreColor === 'yellow' ? 'text-yellow-600 bg-yellow-50' :
//                                         'text-red-600 bg-red-50';

//                             return (
//                                 <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                         {formatDate(trip.date)}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                         {formatDistance(trip.distance)}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                         {formatDuration(trip.duration)}
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap">
//                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColorClass}`}>
//                                             {trip.score}
//                                         </span>
//                                     </td>
//                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                                             {trip.events} events
//                                         </span>
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             {trips.length === 0 && (
//                 <div className="text-center py-8">
//                     <p className="text-gray-500">No trip history available</p>
//                 </div>
//             )}
//         </div>
//     );
// };
